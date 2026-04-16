"""
Nobita Café — Order URLs
"""

from django.urls import path

from .views import (
    AddComplaintView,
    AdminOrderListView,
    AdminOrderStatusView,
    GenerateBillView,
    OrderListView,
    PlaceOrderView,
    UpdateStatusView,
)

urlpatterns = [
    path("place-order/", PlaceOrderView.as_view(), name="place-order"),
    path("orders/", OrderListView.as_view(), name="order-list"),
    path("admin/orders/", AdminOrderListView.as_view(), name="admin-order-list"),
    path(
        "admin/orders/<int:row_id>/status/",
        AdminOrderStatusView.as_view(),
        name="admin-order-status",
    ),
    path("update-status/", UpdateStatusView.as_view(), name="update-status"),
    path("add-complaint/", AddComplaintView.as_view(), name="add-complaint"),
    path(
        "generate-bill/<int:row_index>/",
        GenerateBillView.as_view(),
        name="generate-bill",
    ),
]
