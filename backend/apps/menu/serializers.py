"""
Nobita Café — Menu Serializers
"""
<<<<<<< HEAD

from rest_framework import serializers
from .models import Category, MenuItem, Banner
=======
from rest_framework import serializers
from .models import Category, MenuItem
>>>>>>> 178d01e442bbda69ef0d6c6717f311b94abb02a9


class CategorySerializer(serializers.ModelSerializer):
    item_count = serializers.SerializerMethodField()

    class Meta:
        model = Category
<<<<<<< HEAD
        fields = ["id", "name", "icon", "sort_order", "is_active", "item_count"]
=======
        fields = ['id', 'name', 'icon', 'sort_order', 'is_active', 'item_count']
>>>>>>> 178d01e442bbda69ef0d6c6717f311b94abb02a9

    def get_item_count(self, obj):
        return obj.items.filter(is_available=True).count()


class MenuItemSerializer(serializers.ModelSerializer):
<<<<<<< HEAD
    category_name = serializers.CharField(source="category.name", read_only=True)
=======
    category_name = serializers.CharField(source='category.name', read_only=True)
>>>>>>> 178d01e442bbda69ef0d6c6717f311b94abb02a9

    class Meta:
        model = MenuItem
        fields = [
<<<<<<< HEAD
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
=======
            'id', 'category', 'category_name', 'name', 'description',
            'price', 'image', 'is_available', 'is_special', 'badge',
            'sort_order', 'created_at',
        ]
        read_only_fields = ['id', 'created_at']
>>>>>>> 178d01e442bbda69ef0d6c6717f311b94abb02a9


class MenuItemCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = MenuItem
        fields = [
<<<<<<< HEAD
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
=======
            'category', 'name', 'description', 'price', 'image',
            'is_available', 'is_special', 'badge', 'sort_order',
        ]
>>>>>>> 178d01e442bbda69ef0d6c6717f311b94abb02a9
