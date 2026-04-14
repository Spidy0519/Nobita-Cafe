"""
Nobita Café — Delivery Views
"""
import logging
from django.utils import timezone
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from apps.orders.models import Order
from apps.orders.serializers import OrderSerializer, OrderStatusUpdateSerializer
from .models import DeliveryMan

logger = logging.getLogger(__name__)


class DeliveryOrderListView(APIView):
    """
    GET /api/delivery/orders/ — Delivery man's assigned orders.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        phone = request.user.phone
        try:
            delivery_man = DeliveryMan.objects.get(phone=phone, is_active=True)
        except DeliveryMan.DoesNotExist:
            return Response({'error': 'Delivery account not found.'}, status=status.HTTP_403_FORBIDDEN)

        orders = Order.objects.filter(
            delivery_man=delivery_man
        ).exclude(
            status='CANCELLED'
        ).prefetch_related('items__menu_item').select_related('user', 'address')

        # Filter active only
        active_only = request.query_params.get('active', 'false').lower() == 'true'
        if active_only:
            orders = orders.exclude(status='DELIVERED')

        serializer = OrderSerializer(orders, many=True)
        return Response(serializer.data)


class DeliveryOrderStatusView(APIView):
    """
    PATCH /api/delivery/orders/{id}/status/ — Update delivery status.
    """
    permission_classes = [IsAuthenticated]

    def patch(self, request, order_id):
        phone = request.user.phone
        try:
            delivery_man = DeliveryMan.objects.get(phone=phone, is_active=True)
        except DeliveryMan.DoesNotExist:
            return Response({'error': 'Delivery account not found.'}, status=status.HTTP_403_FORBIDDEN)

        try:
            order = Order.objects.get(id=order_id, delivery_man=delivery_man)
        except Order.DoesNotExist:
            return Response({'error': 'Order not found.'}, status=status.HTTP_404_NOT_FOUND)

        serializer = OrderStatusUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        new_status = serializer.validated_data['status']

        # Delivery can only update certain statuses
        allowed = ['OUT_FOR_DELIVERY', 'DELIVERED']
        if new_status not in allowed:
            return Response(
                {'error': f'Delivery can only update to: {", ".join(allowed)}'},
                status=status.HTTP_400_BAD_REQUEST
            )

        order.status = new_status
        if new_status == 'DELIVERED':
            order.delivered_at = timezone.now()
            if order.payment_type == 'CASH':
                # Check if cash collected
                cash_collected = request.data.get('cash_collected', False)
                if cash_collected:
                    order.payment_status = 'PAID'

        order.save()

        # WebSocket notifications
        try:
            from channels.layers import get_channel_layer
            from asgiref.sync import async_to_sync
            channel_layer = get_channel_layer()

            # Notify user
            async_to_sync(channel_layer.group_send)(
                f'order_{order.id}',
                {
                    'type': 'delivery.status_update',
                    'order_id': str(order.id),
                    'status': new_status,
                }
            )
            # Notify admin
            async_to_sync(channel_layer.group_send)(
                'admin_orders',
                {
                    'type': 'delivery.status_update',
                    'order_id': str(order.id),
                    'status': new_status,
                }
            )
        except Exception as e:
            logger.warning(f"WebSocket notification failed: {e}")

        return Response(OrderSerializer(order).data)
