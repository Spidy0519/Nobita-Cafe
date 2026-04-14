from django.contrib import admin
from .models import User, Address


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ['phone', 'name', 'role', 'is_active', 'created_at']
    list_filter = ['role', 'is_active']
    search_fields = ['phone', 'name']
    readonly_fields = ['id', 'created_at']


@admin.register(Address)
class AddressAdmin(admin.ModelAdmin):
    list_display = ['user', 'label', 'full_address', 'is_default']
    list_filter = ['is_default']
    search_fields = ['full_address']
