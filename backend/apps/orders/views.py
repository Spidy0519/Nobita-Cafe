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

from django.http import JsonResponse
from django.utils.decorators import method_decorator
from django.views import View
from django.views.decorators.csrf import csrf_exempt

from .bill import generate_bill_pdf
from .sheets import add_complaint, append_order, fetch_all_orders, update_order_status

logger = logging.getLogger(__name__)


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
        payment = data.get("payment", "Cash on Delivery").strip()
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

        valid_statuses = ["Pending", "Picked", "Completed", "Cancelled"]
        if status_val not in valid_statuses:
            return JsonResponse(
                {
                    "success": False,
                    "error": f'Invalid status. Must be one of: {", ".join(valid_statuses)}',
                },
                status=400,
            )

        try:
            update_order_status(int(row), status_val)
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
