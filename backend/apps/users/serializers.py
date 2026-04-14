"""
Nobita Café — User Serializers
"""
from rest_framework import serializers
from .models import User, Address


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'phone', 'name', 'role', 'is_active', 'created_at']
        read_only_fields = ['id', 'phone', 'role', 'is_active', 'created_at']


class UserUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['name']


class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Address
        fields = ['id', 'label', 'full_address', 'latitude', 'longitude', 'is_default', 'created_at']
        read_only_fields = ['id', 'created_at']

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)
