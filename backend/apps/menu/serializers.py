"""
Nobita Café — Menu Serializers
"""

from rest_framework import serializers
from .models import Banner, Category, MenuItem


class CategorySerializer(serializers.ModelSerializer):
    item_count = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ["id", "name", "icon", "sort_order", "is_active", "item_count"]

    def get_item_count(self, obj):
        return obj.items.filter(is_available=True).count()


class MenuItemSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source="category.name", read_only=True)

    class Meta:
        model = MenuItem
        fields = [
            "id",
            "category",
            "category_name",
            "name",
            "description",
            "price",
            "image",
            "is_available",
            "is_special",
            "badge",
            "sort_order",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]


class MenuItemCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = MenuItem
        fields = [
            "category",
            "name",
            "description",
            "price",
            "image",
            "is_available",
            "is_special",
            "badge",
            "sort_order",
        ]


class BannerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Banner
        fields = [
            "id",
            "title",
            "description",
            "image",
            "is_active",
            "sort_order",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]


class BannerCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Banner
        fields = ["title", "description", "image", "is_active", "sort_order"]
