"""
Nobita Café — Admin Order Views
"""
import logging
from django.utils import timezone
from django.db.models import Sum, Count, Q
from django.db.models.functions import TruncDate
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .models import Order
from .serializers import OrderSerializer, OrderStatusUpdateSerializer, AssignDeliverySerializer
from apps.delivery.models import DeliveryMan

logger = logging.getLogger(__name__)


class IsAdmin(IsAuthenticated):
    """Admin-only permission."""
    def has_permission(self, request, view):
        if not super().has_permission(request, view):
            return False
        return request.user.role == 'admin' or request.user.is_staff


class AdminOrderListView(APIView):
    """
    GET /api/admin/orders/ — All orders (live, for admin).
    """
    permission_classes = [IsAdmin]

    def get(self, request):
        queryset = Order.objects.all().prefetch_related('items__menu_item').select_related('user', 'address', 'delivery_man')

        # Filter by status
        status_filter = request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)

        # Filter by payment type
        payment_filter = request.query_params.get('payment_type')
        if payment_filter:
            queryset = queryset.filter(payment_type=payment_filter)

        # Filter by payment status
        payment_status = request.query_params.get('payment_status')
        if payment_status:
            queryset = queryset.filter(payment_status=payment_status)

        serializer = OrderSerializer(queryset[:100], many=True)
        return Response(serializer.data)


class AdminOrderStatusView(APIView):
    """
    PATCH /api/admin/orders/{id}/status/ — Update order status.
    """
    permission_classes = [IsAdmin]

    def patch(self, request, order_id):
        try:
            order = Order.objects.get(id=order_id)
        except Order.DoesNotExist:
            return Response({'error': 'Order not found.'}, status=status.HTTP_404_NOT_FOUND)

        serializer = OrderStatusUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        new_status = serializer.validated_data['status']
        order.status = new_status

        if new_status == 'CONFIRMED':
            order.confirmed_at = timezone.now()
        elif new_status == 'DELIVERED':
            order.delivered_at = timezone.now()
            if order.payment_type == 'CASH':
                order.payment_status = 'PAID'

        order.save()

        # WebSocket: notify user
        try:
            from channels.layers import get_channel_layer
            from asgiref.sync import async_to_sync
            channel_layer = get_channel_layer()
            async_to_sync(channel_layer.group_send)(
                f'order_{order.id}',
                {
                    'type': 'order.status_update',
                    'order_id': str(order.id),
                    'status': new_status,
                }
            )
        except Exception as e:
            logger.warning(f"WebSocket notification failed: {e}")

        return Response(OrderSerializer(order).data)


class AdminAssignDeliveryView(APIView):
    """
    POST /api/admin/orders/{id}/assign/ — Assign delivery man.
    """
    permission_classes = [IsAdmin]

    def post(self, request, order_id):
        try:
            order = Order.objects.get(id=order_id)
        except Order.DoesNotExist:
            return Response({'error': 'Order not found.'}, status=status.HTTP_404_NOT_FOUND)

        serializer = AssignDeliverySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            delivery_man = DeliveryMan.objects.get(
                id=serializer.validated_data['delivery_man_id'],
                is_active=True,
            )
        except DeliveryMan.DoesNotExist:
            return Response({'error': 'Delivery staff not found.'}, status=status.HTTP_404_NOT_FOUND)

        order.delivery_man = delivery_man
        order.save(update_fields=['delivery_man'])

        # WebSocket: notify delivery man
        try:
            from channels.layers import get_channel_layer
            from asgiref.sync import async_to_sync
            channel_layer = get_channel_layer()
            async_to_sync(channel_layer.group_send)(
                f'delivery_{delivery_man.id}',
                {
                    'type': 'order.assigned',
                    'order': OrderSerializer(order).data,
                }
            )
        except Exception as e:
            logger.warning(f"WebSocket notification failed: {e}")

        return Response(OrderSerializer(order).data)


class AdminAnalyticsTodayView(APIView):
    """
    GET /api/admin/analytics/today/ — Today's stats.
    """
    permission_classes = [IsAdmin]

    def get(self, request):
        today = timezone.now().date()
        today_orders = Order.objects.filter(placed_at__date=today)

        total_orders = today_orders.count()
        total_revenue = today_orders.filter(
            payment_status='PAID'
        ).aggregate(total=Sum('total'))['total'] or 0

        delivered = today_orders.filter(status='DELIVERED').count()
        cancelled = today_orders.filter(status='CANCELLED').count()
        pending = today_orders.filter(status__in=['PLACED', 'CONFIRMED', 'PREPARING']).count()

        # Payment breakdown
        upi_total = today_orders.filter(payment_type='UPI', payment_status='PAID').aggregate(t=Sum('total'))['t'] or 0
        cash_total = today_orders.filter(payment_type='CASH', payment_status='PAID').aggregate(t=Sum('total'))['t'] or 0
        card_total = today_orders.filter(payment_type='CARD', payment_status='PAID').aggregate(t=Sum('total'))['t'] or 0

        return Response({
            'total_orders': total_orders,
            'total_revenue': float(total_revenue),
            'delivered': delivered,
            'cancelled': cancelled,
            'pending': pending,
            'payment_breakdown': {
                'upi': float(upi_total),
                'cash': float(cash_total),
                'card': float(card_total),
            }
        })


class AdminAnalyticsWeeklyView(APIView):
    """
    GET /api/admin/analytics/weekly/ — Weekly chart data.
    """
    permission_classes = [IsAdmin]

    def get(self, request):
        from datetime import timedelta
        today = timezone.now().date()
        week_ago = today - timedelta(days=7)

        daily_data = (
            Order.objects.filter(placed_at__date__gte=week_ago, payment_status='PAID')
            .annotate(date=TruncDate('placed_at'))
            .values('date')
            .annotate(
                revenue=Sum('total'),
                orders=Count('id'),
            )
            .order_by('date')
        )

        # Top 5 items
        from apps.orders.models import OrderItem
        top_items = (
            OrderItem.objects.filter(order__placed_at__date__gte=week_ago)
            .values('item_name')
            .annotate(total_qty=Sum('quantity'))
            .order_by('-total_qty')[:5]
        )

        return Response({
            'daily': [
                {
                    'date': str(d['date']),
                    'revenue': float(d['revenue']),
                    'orders': d['orders'],
                }
                for d in daily_data
            ],
            'top_items': list(top_items),
        })


class AdminDeliveryManListView(APIView):
    """
    GET/POST /api/admin/delivery-men/
    """
    permission_classes = [IsAdmin]

    def get(self, request):
        from apps.delivery.serializers import DeliveryManSerializer
        delivery_men = DeliveryMan.objects.all()
        return Response(DeliveryManSerializer(delivery_men, many=True).data)

    def post(self, request):
        from apps.delivery.serializers import DeliveryManSerializer
        serializer = DeliveryManSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class AdminDeliveryManDetailView(APIView):
    """
    PATCH /api/admin/delivery-men/{id}/
    """
    permission_classes = [IsAdmin]

    def patch(self, request, dm_id):
        from apps.delivery.serializers import DeliveryManSerializer
        try:
            dm = DeliveryMan.objects.get(id=dm_id)
        except DeliveryMan.DoesNotExist:
            return Response({'error': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)

        serializer = DeliveryManSerializer(dm, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)
