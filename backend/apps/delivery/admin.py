from django.contrib import admin
from .models import DeliveryMan


@admin.register(DeliveryMan)
class DeliveryManAdmin(admin.ModelAdmin):
    list_display = ['name', 'phone', 'is_active', 'is_on_duty', 'vehicle_number']
    list_filter = ['is_active', 'is_on_duty']
    search_fields = ['name', 'phone']
    list_editable = ['is_on_duty']
