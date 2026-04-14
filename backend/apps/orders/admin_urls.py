"""
Nobita Café — Admin URLs
"""
from django.urls import path
from .admin_views import (
    AdminOrderListView, AdminOrderStatusView, AdminAssignDeliveryView,
    AdminAnalyticsTodayView, AdminAnalyticsWeeklyView,
    AdminDeliveryManListView, AdminDeliveryManDetailView,
)

urlpatterns = [
    path('orders/', AdminOrderListView.as_view(), name='admin-orders'),
    path('orders/<uuid:order_id>/status/', AdminOrderStatusView.as_view(), name='admin-order-status'),
    path('orders/<uuid:order_id>/assign/', AdminAssignDeliveryView.as_view(), name='admin-assign-delivery'),
    path('analytics/today/', AdminAnalyticsTodayView.as_view(), name='analytics-today'),
    path('analytics/weekly/', AdminAnalyticsWeeklyView.as_view(), name='analytics-weekly'),
    path('delivery-men/', AdminDeliveryManListView.as_view(), name='admin-delivery-men'),
    path('delivery-men/<uuid:dm_id>/', AdminDeliveryManDetailView.as_view(), name='admin-delivery-man-detail'),
]
