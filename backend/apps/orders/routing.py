"""
Nobita Café — WebSocket URL Routing
"""
from django.urls import re_path
from .consumers import OrderConsumer

websocket_urlpatterns = [
    re_path(r'ws/orders/(?P<order_id>[\w-]+)/$', OrderConsumer.as_asgi()),
]
