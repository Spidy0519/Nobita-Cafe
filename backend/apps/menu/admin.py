from django.contrib import admin
from .models import Category, MenuItem


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'icon', 'sort_order', 'is_active']
    list_editable = ['sort_order', 'is_active']


@admin.register(MenuItem)
class MenuItemAdmin(admin.ModelAdmin):
    list_display = ['name', 'category', 'price', 'is_available', 'is_special', 'badge']
    list_filter = ['category', 'is_available', 'is_special', 'badge']
    search_fields = ['name', 'description']
    list_editable = ['is_available', 'is_special']
