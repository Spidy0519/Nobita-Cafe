"""
Nobita Café — Order Views

POST /api/place-order/      → Place new order
GET  /api/orders/           → Fetch all orders
POST /api/update-status/    → Update order status
POST /api/add-complaint/    → Add complaint to order
"""

import json
import logging
from datetime import datetime
from urllib.parse import quote_plus

from django.http import JsonResponse
from django.utils.decorators import method_decorator
from django.views import View
from django.views.decorators.csrf import csrf_exempt

from .bill import generate_bill_pdf
from .sheets import add_complaint, append_order, fetch_all_orders, update_order_status

logger = logging.getLogger(__name__)


SHEET_TO_ADMIN_STATUS = {
    "pending": "PLACED",
    "confirmed": "CONFIRMED",
    "preparing": "PREPARING",
    "picked": "OUT_FOR_DELIVERY",
    "out_for_delivery": "OUT_FOR_DELIVERY",
    "completed": "DELIVERED",
    "delivered": "DELIVERED",
    "cancelled": "CANCELLED",
}

ADMIN_TO_SHEET_STATUS = {
    "PLACED": "Pending",
    "CONFIRMED": "Confirmed",
    "PREPARING": "Preparing",
    "OUT_FOR_DELIVERY": "Picked",
    "DELIVERED": "Completed",
    "CANCELLED": "Cancelled",
}


def _map_sheet_status_to_admin(status_value):
    key = (status_value or "Pending").strip().lower().replace(" ", "_")
    return SHEET_TO_ADMIN_STATUS.get(key, "PLACED")


def _map_admin_status_to_sheet(status_value):
    status = (status_value or "").strip().upper()
    return ADMIN_TO_SHEET_STATUS.get(status, status_value)


def _parse_item_count(food_value):
    if not food_value:
        return 0
    return food_value.count("(x") if "(x" in food_value else len(food_value.split(","))


def _payment_type(value):
    text = (value or "").strip().lower()
    if "cash" in text:
        return "CASH"
    if "upi" in text:
        return "UPI"
    if "card" in text:
        return "CARD"
    return "CASH"


def _to_admin_order(sheet_order):
    status = _map_sheet_status_to_admin(sheet_order.get("Status", "Pending"))
    payment_type = _payment_type(sheet_order.get("Payment", "Cash on Delivery"))
    return {
        "id": str(sheet_order.get("_row")),
        "status": status,
        "payment_type": payment_type,
        "payment_status": "PENDING" if payment_type == "CASH" else "PAID",
        "item_count": _parse_item_count(sheet_order.get("Food", "")),
        "total": 0,
        "grand_total": 0,
        "customer_name": sheet_order.get("Name", ""),
        "phone": sheet_order.get("Phone", ""),
        "address": sheet_order.get("Address", ""),
        "map_link": sheet_order.get("Map Link", ""),
        "food": sheet_order.get("Food", ""),
        "created_at": sheet_order.get("Timestamp", ""),
        "_row": sheet_order.get("_row"),
    }


@method_decorator(csrf_exempt, name="dispatch")
class PlaceOrderView(View):
    """POST /api/place-order/"""

    def post(self, request):
        try:
            data = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse(
                {"success": False, "error": "Invalid JSON body"}, status=400
            )

        name = data.get("name", "").strip()
        phone = data.get("phone", "").strip()
        address = data.get("address", "").strip()
        map_link = data.get("map_link", "").strip()
        payment = "Cash on Delivery"
        food_items = data.get("food_items") or data.get("items", [])

        errors = []
        if not name:
            errors.append("Name is required")
        if not phone:
            errors.append("Phone is required")
        if not address:
            errors.append("Address is required")
        if not food_items:
            errors.append("Food items are required")

        if errors:
            return JsonResponse({"success": False, "errors": errors}, status=400)

        if isinstance(food_items, list):
            food_str = ", ".join(
                f"{item.get('name', 'Item')} (x{item.get('quantity', 1)})"
                for item in food_items
            )
        else:
            food_str = str(food_items)

        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        if not map_link and address:
            map_link = (
                "https://www.google.com/maps/search/?api=1&query="
                f"{quote_plus(address)}"
            )

        try:
            append_order(timestamp, name, phone, food_str, address, map_link, payment)
        except FileNotFoundError as exc:
            return JsonResponse({"success": False, "error": str(exc)}, status=500)
        except Exception as exc:
            logger.error(f"Google Sheets error: {exc}")
            return JsonResponse(
                {"success": False, "error": "Failed to save order"}, status=500
            )

        return JsonResponse(
            {
                "success": True,
                "message": "Order placed successfully",
                "data": {
                    "Timestamp": timestamp,
                    "Name": name,
                    "Phone": phone,
                    "Food": food_str,
                    "Address": address,
                    "Map Link": map_link,
                    "Payment": payment,
                    "Status": "Pending",
                },
            },
            status=201,
        )


@method_decorator(csrf_exempt, name="dispatch")
class OrderListView(View):
    """GET /api/orders/"""

    def get(self, request):
        try:
            orders = fetch_all_orders()
            return JsonResponse(orders, safe=False, status=200)
        except FileNotFoundError as exc:
            return JsonResponse({"success": False, "error": str(exc)}, status=500)
        except Exception as exc:
            logger.error(f"Fetch orders error: {exc}")
            return JsonResponse(
                {"success": False, "error": "Failed to fetch orders"}, status=500
            )


@method_decorator(csrf_exempt, name="dispatch")
class AdminOrderListView(View):
    """GET /api/admin/orders/ compatible response for admin dashboard."""

    def get(self, request):
        try:
            orders = fetch_all_orders()
            admin_orders = [_to_admin_order(order) for order in orders]
            admin_orders.reverse()  # Show newest first
            return JsonResponse(admin_orders, safe=False, status=200)
        except FileNotFoundError as exc:
            return JsonResponse({"success": False, "error": str(exc)}, status=500)
        except Exception as exc:
            logger.error(f"Admin fetch orders error: {exc}")
            return JsonResponse(
                {"success": False, "error": "Failed to fetch admin orders"},
                status=500,
            )


@method_decorator(csrf_exempt, name="dispatch")
class AdminOrderStatusView(View):
    """PATCH /api/admin/orders/<row_id>/status/"""

    def patch(self, request, row_id):
        try:
            data = json.loads(request.body or "{}")
        except json.JSONDecodeError:
            return JsonResponse({"success": False, "error": "Invalid JSON"}, status=400)

        requested_status = data.get("status", "").strip()
        if not requested_status:
            return JsonResponse(
                {"success": False, "error": "status is required"}, status=400
            )

        sheet_status = _map_admin_status_to_sheet(requested_status)

        try:
            update_order_status(int(row_id), sheet_status)
            return JsonResponse(
                {
                    "success": True,
                    "message": f"Order updated to {requested_status}",
                    "order_id": str(row_id),
                    "status": requested_status,
                }
            )
        except Exception as exc:
            logger.error(f"Admin update status error: {exc}")
            return JsonResponse(
                {"success": False, "error": "Failed to update status"}, status=500
            )


@method_decorator(csrf_exempt, name="dispatch")
class UpdateStatusView(View):
    """
    POST /api/update-status/
    Body: { "row": 2, "status": "Picked" }
    """

    def post(self, request):
        try:
            data = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({"success": False, "error": "Invalid JSON"}, status=400)

        row = data.get("row")
        status_val = data.get("status", "").strip()

        if not row or not status_val:
            return JsonResponse(
                {"success": False, "error": "row and status are required"}, status=400
            )

        valid_statuses = [
            "Pending",
            "Confirmed",
            "Preparing",
            "Picked",
            "Completed",
            "Cancelled",
            "PLACED",
            "CONFIRMED",
            "PREPARING",
            "OUT_FOR_DELIVERY",
            "DELIVERED",
            "CANCELLED",
        ]
        if status_val not in valid_statuses:
            return JsonResponse(
                {
                    "success": False,
                    "error": f'Invalid status. Must be one of: {", ".join(valid_statuses)}',
                },
                status=400,
            )

        try:
            update_order_status(int(row), _map_admin_status_to_sheet(status_val))
            return JsonResponse(
                {"success": True, "message": f"Status updated to {status_val}"}
            )
        except Exception as exc:
            logger.error(f"Update status error: {exc}")
            return JsonResponse(
                {"success": False, "error": "Failed to update status"}, status=500
            )


@method_decorator(csrf_exempt, name="dispatch")
class AddComplaintView(View):
    """
    POST /api/add-complaint/
    Body: { "row": 2, "complaint": "Food was cold" }
    """

    def post(self, request):
        try:
            data = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({"success": False, "error": "Invalid JSON"}, status=400)

        row = data.get("row")
        complaint = data.get("complaint", "").strip()

        if not row or not complaint:
            return JsonResponse(
                {"success": False, "error": "row and complaint are required"},
                status=400,
            )

        try:
            add_complaint(int(row), complaint)
            return JsonResponse({"success": True, "message": "Complaint added"})
        except Exception as exc:
            logger.error(f"Add complaint error: {exc}")
            return JsonResponse(
                {"success": False, "error": "Failed to add complaint"}, status=500
            )


@method_decorator(csrf_exempt, name="dispatch")
class GenerateBillView(View):
    """
    GET /api/generate-bill/<row_index>/
    Returns a PDF bill for the requested order row.
    """

    def get(self, request, row_index):
        from django.http import HttpResponse

        try:
            row_index = int(row_index)
            orders = fetch_all_orders()

            order_data = next((o for o in orders if o.get("_row") == row_index), None)

            if not order_data:
                return JsonResponse(
                    {"success": False, "error": "Order not found"}, status=404
                )

            pdf_buffer, order_id = generate_bill_pdf(order_data)

            response = HttpResponse(
                pdf_buffer.getvalue(), content_type="application/pdf"
            )
            response["Content-Disposition"] = (
                f'attachment; filename="Nobita-Cafe-Bill-{order_id}.pdf"'
            )

            return response

        except ValueError:
            return JsonResponse(
                {"success": False, "error": "Invalid row index"}, status=400
            )
        except Exception as exc:
            logger.error(f"Generate bill error: {exc}")
            return JsonResponse(
                {"success": False, "error": "Failed to generate bill"}, status=500
            )
