<<<<<<< HEAD
"""
Nobita Café — Orders Admin

No models to register. Orders live in Google Sheets.
"""
from django.contrib import admin
=======
from django.contrib import admin
from .models import Order, OrderItem


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ['menu_item', 'item_name', 'quantity', 'unit_price']


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'status', 'total', 'payment_type', 'payment_status', 'placed_at']
    list_filter = ['status', 'payment_type', 'payment_status']
    search_fields = ['id', 'user__phone', 'user__name']
    readonly_fields = ['id', 'placed_at', 'confirmed_at', 'delivered_at']
    inlines = [OrderItemInline]
>>>>>>> 178d01e442bbda69ef0d6c6717f311b94abb02a9
