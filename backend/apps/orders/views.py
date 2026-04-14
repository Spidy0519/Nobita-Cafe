"""
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

logger = logging.getLogger(__name__)


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
