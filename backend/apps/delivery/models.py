"""
Nobita Café — Delivery Models
"""
import uuid
from django.db import models


class DeliveryMan(models.Model):
    """Delivery staff."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    phone = models.CharField(max_length=15, unique=True)
    name = models.CharField(max_length=150)
    is_active = models.BooleanField(default=True)
    is_on_duty = models.BooleanField(default=False)
    vehicle_number = models.CharField(max_length=20, blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'delivery_men'
        ordering = ['-is_on_duty', 'name']
        verbose_name = 'Delivery Man'
        verbose_name_plural = 'Delivery Men'

    def __str__(self):
        return f"{self.name} ({self.phone})"
