from django.contrib import admin

from .models import Banner, Category, MenuItem


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ["name", "icon", "sort_order", "is_active"]
    list_editable = ["sort_order", "is_active"]


@admin.register(MenuItem)
class MenuItemAdmin(admin.ModelAdmin):
    list_display = ["name", "category", "price", "is_available", "is_special", "badge"]
    list_filter = ["category", "is_available", "is_special", "badge"]
    search_fields = ["name", "description"]
    list_editable = ["is_available", "is_special"]


@admin.register(Banner)
class BannerAdmin(admin.ModelAdmin):
    list_display = ["title", "is_active", "sort_order", "created_at"]
    list_filter = ["is_active"]
    search_fields = ["title", "description"]
    list_editable = ["is_active", "sort_order"]
