"""
Nobita Café — Order URLs
"""

from django.urls import path

from .views import (
    AddComplaintView,
    GenerateBillView,
    OrderListView,
    PlaceOrderView,
    UpdateStatusView,
)

urlpatterns = [
    path("place-order/", PlaceOrderView.as_view(), name="place-order"),
    path("orders/", OrderListView.as_view(), name="order-list"),
    path("update-status/", UpdateStatusView.as_view(), name="update-status"),
    path("add-complaint/", AddComplaintView.as_view(), name="add-complaint"),
    path(
        "generate-bill/<int:row_index>/",
        GenerateBillView.as_view(),
        name="generate-bill",
    ),
]
