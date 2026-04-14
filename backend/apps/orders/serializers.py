"""
Nobita Café — Order Serializers
"""
from rest_framework import serializers
from .models import Order, OrderItem
from apps.menu.serializers import MenuItemSerializer
from apps.users.serializers import AddressSerializer


class OrderItemSerializer(serializers.ModelSerializer):
    menu_item_detail = MenuItemSerializer(source='menu_item', read_only=True)

    class Meta:
        model = OrderItem
        fields = ['id', 'menu_item', 'menu_item_detail', 'item_name', 'quantity', 'unit_price', 'subtotal']
        read_only_fields = ['id', 'item_name', 'unit_price', 'subtotal']


class OrderItemCreateSerializer(serializers.Serializer):
    menu_item_id = serializers.UUIDField()
    quantity = serializers.IntegerField(min_value=1, max_value=50)


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    address_detail = AddressSerializer(source='address', read_only=True)
    grand_total = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    item_count = serializers.IntegerField(read_only=True)
    delivery_man_name = serializers.CharField(source='delivery_man.name', read_only=True, default=None)
    delivery_man_phone = serializers.CharField(source='delivery_man.phone', read_only=True, default=None)

    class Meta:
        model = Order
        fields = [
            'id', 'user', 'address', 'address_detail', 'total', 'delivery_fee',
            'grand_total', 'payment_type', 'payment_status', 'razorpay_order_id',
            'status', 'delivery_man', 'delivery_man_name', 'delivery_man_phone',
            'notes', 'item_count', 'items', 'placed_at', 'confirmed_at', 'delivered_at',
        ]
        read_only_fields = [
            'id', 'user', 'total', 'delivery_fee', 'payment_status',
            'razorpay_order_id', 'status', 'delivery_man', 'placed_at',
            'confirmed_at', 'delivered_at',
        ]


class PlaceOrderSerializer(serializers.Serializer):
    address_id = serializers.UUIDField(required=False, allow_null=True)
    address_text = serializers.CharField(required=False, allow_blank=True, default='')
    latitude = serializers.DecimalField(max_digits=10, decimal_places=7, required=False, allow_null=True)
    longitude = serializers.DecimalField(max_digits=10, decimal_places=7, required=False, allow_null=True)
    payment_type = serializers.ChoiceField(choices=['UPI', 'CARD', 'CASH'])
    notes = serializers.CharField(required=False, allow_blank=True, default='')
    items = OrderItemCreateSerializer(many=True)

    def validate_items(self, value):
        if not value:
            raise serializers.ValidationError("Order must have at least one item.")
        return value


class OrderStatusUpdateSerializer(serializers.Serializer):
    status = serializers.ChoiceField(
        choices=['CONFIRMED', 'PREPARING', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED']
    )


class AssignDeliverySerializer(serializers.Serializer):
    delivery_man_id = serializers.UUIDField()
