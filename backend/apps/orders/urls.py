"""
Nobita Café — Order URLs (User-facing)
"""
from django.urls import path
from .views import PlaceOrderView, OrderListView, OrderDetailView

urlpatterns = [
    path('', PlaceOrderView.as_view(), name='place-order'),
    path('history/', OrderListView.as_view(), name='order-list'),
    path('<uuid:order_id>/', OrderDetailView.as_view(), name='order-detail'),
]
