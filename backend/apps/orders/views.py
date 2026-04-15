"""
<<<<<<< HEAD
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
from django.views import View
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator

from .sheets import append_order, fetch_all_orders, update_order_status, add_complaint
=======
Nobita Café — Order Views (User-facing)
"""
import logging
from django.utils import timezone
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .models import Order, OrderItem
from .serializers import (
    OrderSerializer, PlaceOrderSerializer,
)
from apps.menu.models import MenuItem
from apps.users.models import Address
>>>>>>> 178d01e442bbda69ef0d6c6717f311b94abb02a9

logger = logging.getLogger(__name__)


<<<<<<< HEAD
@method_decorator(csrf_exempt, name='dispatch')
class PlaceOrderView(View):
    """POST /api/place-order/"""

    def post(self, request):
        try:
            data = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({'success': False, 'error': 'Invalid JSON body'}, status=400)

        name = data.get('name', '').strip()
        phone = data.get('phone', '').strip()
        address = data.get('address', '').strip()
        map_link = data.get('map_link', '').strip()
        payment = data.get('payment', 'Cash on Delivery').strip()
        food_items = data.get('food_items') or data.get('items', [])

        errors = []
        if not name: errors.append('Name is required')
        if not phone: errors.append('Phone is required')
        if not address: errors.append('Address is required')
        if not food_items: errors.append('Food items are required')

        if errors:
            return JsonResponse({'success': False, 'errors': errors}, status=400)

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
        except FileNotFoundError as e:
            return JsonResponse({'success': False, 'error': str(e)}, status=500)
        except Exception as e:
            logger.error(f"Google Sheets error: {e}")
            return JsonResponse({'success': False, 'error': 'Failed to save order'}, status=500)

        return JsonResponse({
            'success': True,
            'message': 'Order placed successfully',
            'data': {
                'Timestamp': timestamp, 'Name': name, 'Phone': phone,
                'Food': food_str, 'Address': address, 'Map Link': map_link,
                'Payment': payment, 'Status': 'Pending',
            }
        }, status=201)


@method_decorator(csrf_exempt, name='dispatch')
class OrderListView(View):
    """GET /api/orders/"""

    def get(self, request):
        try:
            orders = fetch_all_orders()
            return JsonResponse(orders, safe=False, status=200)
        except FileNotFoundError as e:
            return JsonResponse({'success': False, 'error': str(e)}, status=500)
        except Exception as e:
            logger.error(f"Fetch orders error: {e}")
            return JsonResponse({'success': False, 'error': 'Failed to fetch orders'}, status=500)


@method_decorator(csrf_exempt, name='dispatch')
class UpdateStatusView(View):
    """
    POST /api/update-status/
    Body: { "row": 2, "status": "Picked" }
    """

    def post(self, request):
        try:
            data = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({'success': False, 'error': 'Invalid JSON'}, status=400)

        row = data.get('row')
        status_val = data.get('status', '').strip()

        if not row or not status_val:
            return JsonResponse({'success': False, 'error': 'row and status are required'}, status=400)

        valid_statuses = ['Pending', 'Picked', 'Completed', 'Cancelled']
        if status_val not in valid_statuses:
            return JsonResponse({
                'success': False,
                'error': f'Invalid status. Must be one of: {", ".join(valid_statuses)}'
            }, status=400)

        try:
            update_order_status(int(row), status_val)
            return JsonResponse({'success': True, 'message': f'Status updated to {status_val}'})
        except Exception as e:
            logger.error(f"Update status error: {e}")
            return JsonResponse({'success': False, 'error': 'Failed to update status'}, status=500)


@method_decorator(csrf_exempt, name='dispatch')
class AddComplaintView(View):
    """
    POST /api/add-complaint/
    Body: { "row": 2, "complaint": "Food was cold" }
    """

    def post(self, request):
        try:
            data = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({'success': False, 'error': 'Invalid JSON'}, status=400)

        row = data.get('row')
        complaint = data.get('complaint', '').strip()

        if not row or not complaint:
            return JsonResponse({'success': False, 'error': 'row and complaint are required'}, status=400)

        try:
            add_complaint(int(row), complaint)
            return JsonResponse({'success': True, 'message': 'Complaint added'})
        except Exception as e:
            logger.error(f"Add complaint error: {e}")
            return JsonResponse({'success': False, 'error': 'Failed to add complaint'}, status=500)


@method_decorator(csrf_exempt, name='dispatch')
class GenerateBillView(View):
    """
    GET /api/generate-bill/<row_index>/
    Returns a PDF bill for the requested order row.
    """

    def get(self, request, row_index):
        from django.http import HttpResponse
        from .bill import generate_bill_pdf

        try:
            row_index = int(row_index)
            orders = fetch_all_orders()
            
            # Find the matching order by row ID
            order_data = next((o for o in orders if o.get('_row') == row_index), None)
            
            if not order_data:
                return JsonResponse({'success': False, 'error': 'Order not found'}, status=404)
                
            pdf_buffer, order_id = generate_bill_pdf(order_data)
            
            response = HttpResponse(pdf_buffer.getvalue(), content_type='application/pdf')
            response['Content-Disposition'] = f'attachment; filename="Nobita-Cafe-Bill-{order_id}.pdf"'
            
            return response

        except ValueError:
            return JsonResponse({'success': False, 'error': 'Invalid row index'}, status=400)
        except Exception as e:
            logger.error(f"Generate bill error: {e}")
            return JsonResponse({'success': False, 'error': 'Failed to generate bill'}, status=500)
=======
class PlaceOrderView(APIView):
    """
    POST /api/orders/ — Place a new order.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = PlaceOrderSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        # Resolve address
        address = None
        address_id = data.get('address_id')
        if address_id:
            try:
                address = Address.objects.get(id=address_id, user=request.user)
            except Address.DoesNotExist:
                return Response(
                    {'error': 'Address not found.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        elif data.get('address_text'):
            address = Address.objects.create(
                user=request.user,
                label='Delivery',
                full_address=data['address_text'],
                latitude=data.get('latitude'),
                longitude=data.get('longitude'),
            )

        # Validate and calculate items
        order_items_data = []
        total = 0

        for item_data in data['items']:
            try:
                menu_item = MenuItem.objects.get(
                    id=item_data['menu_item_id'],
                    is_available=True
                )
            except MenuItem.DoesNotExist:
                return Response(
                    {'error': f'Menu item {item_data["menu_item_id"]} is not available.'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            subtotal = menu_item.price * item_data['quantity']
            total += subtotal
            order_items_data.append({
                'menu_item': menu_item,
                'item_name': menu_item.name,
                'quantity': item_data['quantity'],
                'unit_price': menu_item.price,
            })

        # Create order
        order = Order.objects.create(
            user=request.user,
            address=address,
            total=total,
            delivery_fee=30.00,
            payment_type=data['payment_type'],
            payment_status='PENDING' if data['payment_type'] != 'CASH' else 'PENDING',
            notes=data.get('notes', ''),
        )

        # Create order items
        for item_data in order_items_data:
            OrderItem.objects.create(order=order, **item_data)

        # Send WebSocket notification to admin
        try:
            from channels.layers import get_channel_layer
            from asgiref.sync import async_to_sync
            channel_layer = get_channel_layer()
            async_to_sync(channel_layer.group_send)(
                'admin_orders',
                {
                    'type': 'order.new',
                    'order': OrderSerializer(order).data,
                }
            )
        except Exception as e:
            logger.warning(f"WebSocket notification failed: {e}")

        return Response(
            OrderSerializer(order).data,
            status=status.HTTP_201_CREATED
        )


class OrderListView(APIView):
    """
    GET /api/orders/ — User's order history.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        orders = Order.objects.filter(user=request.user).prefetch_related('items__menu_item')
        serializer = OrderSerializer(orders, many=True)
        return Response(serializer.data)


class OrderDetailView(APIView):
    """
    GET /api/orders/{id}/ — Order detail with status.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, order_id):
        try:
            order = Order.objects.prefetch_related('items__menu_item').get(
                id=order_id, user=request.user
            )
        except Order.DoesNotExist:
            return Response(
                {'error': 'Order not found.'},
                status=status.HTTP_404_NOT_FOUND
            )
        return Response(OrderSerializer(order).data)
>>>>>>> 178d01e442bbda69ef0d6c6717f311b94abb02a9
