"""
Nobita Café — Menu Models (Category, MenuItem, Banner)
"""
import uuid

from django.db import models


class Category(models.Model):
    """Menu categories like Coffee, Snacks, Juice, Desserts."""

    name = models.CharField(max_length=100, unique=True)
    icon = models.CharField(max_length=10, default="☕")
    sort_order = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "categories"
        ordering = ["sort_order", "name"]
        verbose_name_plural = "Categories"

    def __str__(self):
        return f"{self.icon} {self.name}"


class MenuItem(models.Model):
    """Individual menu items."""

    BADGE_CHOICES = (
        ("", "None"),
        ("popular", "Popular"),
        ("new", "New"),
        ("chef", "Chef's Pick"),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name="items")
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True, default="")
    price = models.DecimalField(max_digits=8, decimal_places=2)
    image = models.URLField(max_length=500, blank=True, default="")
    is_available = models.BooleanField(default=True)
    is_special = models.BooleanField(default=False)
    badge = models.CharField(max_length=20, choices=BADGE_CHOICES, blank=True, default="")
    sort_order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "menu_items"
        ordering = ["sort_order", "name"]

    def __str__(self):
        return f"{self.name} — ₹{self.price}"


class Banner(models.Model):
    """Homepage promotional banners and offers."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, default="")
    image = models.URLField(max_length=500)
    is_active = models.BooleanField(default=True)
    sort_order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "banners"
        ordering = ["sort_order", "-created_at"]

    def __str__(self):
        return self.title + (" ✓" if self.is_active else " ✗")
