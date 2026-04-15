"""
<<<<<<< HEAD
Nobita Café — Order URLs
"""
from django.urls import path
from .views import PlaceOrderView, OrderListView, UpdateStatusView, AddComplaintView, GenerateBillView

urlpatterns = [
    path('place-order/', PlaceOrderView.as_view(), name='place-order'),
    path('orders/', OrderListView.as_view(), name='order-list'),
    path('update-status/', UpdateStatusView.as_view(), name='update-status'),
    path('add-complaint/', AddComplaintView.as_view(), name='add-complaint'),
    path('generate-bill/<int:row_index>/', GenerateBillView.as_view(), name='generate-bill'),
=======
Nobita Café — Order URLs (User-facing)
"""
from django.urls import path
from .views import PlaceOrderView, OrderListView, OrderDetailView

urlpatterns = [
    path('', PlaceOrderView.as_view(), name='place-order'),
    path('history/', OrderListView.as_view(), name='order-list'),
    path('<uuid:order_id>/', OrderDetailView.as_view(), name='order-detail'),
>>>>>>> 178d01e442bbda69ef0d6c6717f311b94abb02a9
]
