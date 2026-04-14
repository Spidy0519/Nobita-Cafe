"""
Nobita Café — Delivery Serializers
"""
from rest_framework import serializers
from .models import DeliveryMan


class DeliveryManSerializer(serializers.ModelSerializer):
    active_orders_count = serializers.SerializerMethodField()

    class Meta:
        model = DeliveryMan
        fields = ['id', 'phone', 'name', 'is_active', 'is_on_duty', 'vehicle_number', 'active_orders_count', 'created_at']
        read_only_fields = ['id', 'created_at']

    def get_active_orders_count(self, obj):
        return obj.orders.exclude(status__in=['DELIVERED', 'CANCELLED']).count()
