"""
Nobita Café — Delivery URLs
"""
from django.urls import path
from .views import DeliveryOrderListView, DeliveryOrderStatusView

urlpatterns = [
    path('orders/', DeliveryOrderListView.as_view(), name='delivery-orders'),
    path('orders/<uuid:order_id>/status/', DeliveryOrderStatusView.as_view(), name='delivery-order-status'),
]
