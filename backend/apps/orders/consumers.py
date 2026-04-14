"""
Nobita Café — WebSocket Consumers
"""
import json
import logging
from channels.generic.websocket import AsyncWebsocketConsumer

logger = logging.getLogger(__name__)


class OrderConsumer(AsyncWebsocketConsumer):
    """
    WebSocket consumer for order updates.
    
    Channels:
      - admin_orders: Admin receives all new orders
      - order_{id}: User tracks specific order
      - delivery_{id}: Delivery man receives assignments
    """

    async def connect(self):
        self.order_id = self.scope['url_route']['kwargs'].get('order_id')
        self.user = self.scope.get('user')

        if self.order_id == 'admin':
            # Admin channel — all order updates
            self.group_name = 'admin_orders'
        elif self.order_id and self.order_id.startswith('delivery_'):
            # Delivery man channel
            self.group_name = f'delivery_{self.order_id.replace("delivery_", "")}'
        else:
            # Per-order tracking
            self.group_name = f'order_{self.order_id}'

        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name
        )
        await self.accept()

        logger.info(f"WebSocket connected: {self.group_name}")

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.group_name,
            self.channel_name
        )
        logger.info(f"WebSocket disconnected: {self.group_name}")

    async def receive(self, text_data):
        """Handle incoming messages (ping/pong, etc.)"""
        try:
            data = json.loads(text_data)
            if data.get('type') == 'ping':
                await self.send(text_data=json.dumps({'type': 'pong'}))
        except json.JSONDecodeError:
            pass

    # ── Event Handlers ──

    async def order_new(self, event):
        """New order placed — sent to admin_orders group."""
        await self.send(text_data=json.dumps({
            'type': 'order.new',
            'order': event.get('order'),
        }))

    async def order_status_update(self, event):
        """Order status changed — sent to order_{id} group."""
        await self.send(text_data=json.dumps({
            'type': 'order.status_update',
            'order_id': event.get('order_id'),
            'status': event.get('status'),
        }))

    async def order_assigned(self, event):
        """Order assigned to delivery man — sent to delivery_{id} group."""
        await self.send(text_data=json.dumps({
            'type': 'order.assigned',
            'order': event.get('order'),
        }))

    async def delivery_status_update(self, event):
        """Delivery status update — sent to order_{id} and admin_orders."""
        await self.send(text_data=json.dumps({
            'type': 'delivery.status_update',
            'order_id': event.get('order_id'),
            'status': event.get('status'),
        }))
