"""
Nobita Café — Order Models (Order, OrderItem)
"""
import uuid
from django.db import models
from django.conf import settings


class Order(models.Model):
    """Customer orders."""

    STATUS_CHOICES = (
        ('PLACED', 'Placed'),
        ('CONFIRMED', 'Confirmed'),
        ('PREPARING', 'Preparing'),
        ('OUT_FOR_DELIVERY', 'Out for Delivery'),
        ('DELIVERED', 'Delivered'),
        ('CANCELLED', 'Cancelled'),
    )

    PAYMENT_TYPE_CHOICES = (
        ('UPI', 'UPI'),
        ('CARD', 'Card'),
        ('CASH', 'Cash on Delivery'),
    )

    PAYMENT_STATUS_CHOICES = (
        ('PENDING', 'Pending'),
        ('PAID', 'Paid'),
        ('FAILED', 'Failed'),
        ('REFUNDED', 'Refunded'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='orders'
    )
    address = models.ForeignKey(
        'users.Address', on_delete=models.SET_NULL, null=True, blank=True, related_name='orders'
    )
    total = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    delivery_fee = models.DecimalField(max_digits=6, decimal_places=2, default=30.00)
    payment_type = models.CharField(max_length=10, choices=PAYMENT_TYPE_CHOICES, default='CASH')
    payment_status = models.CharField(max_length=10, choices=PAYMENT_STATUS_CHOICES, default='PENDING')
    razorpay_order_id = models.CharField(max_length=100, blank=True, default='')
    razorpay_payment_id = models.CharField(max_length=100, blank=True, default='')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PLACED')
    delivery_man = models.ForeignKey(
        'delivery.DeliveryMan', on_delete=models.SET_NULL,
        null=True, blank=True, related_name='orders'
    )
    notes = models.TextField(blank=True, default='')
    placed_at = models.DateTimeField(auto_now_add=True)
    confirmed_at = models.DateTimeField(null=True, blank=True)
    delivered_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'orders'
        ordering = ['-placed_at']

    def __str__(self):
        return f"Order {self.id} — {self.status}"

    @property
    def grand_total(self):
        return self.total + self.delivery_fee

    @property
    def item_count(self):
        return self.items.aggregate(total=models.Sum('quantity'))['total'] or 0


class OrderItem(models.Model):
    """Items within an order."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    menu_item = models.ForeignKey(
        'menu.MenuItem', on_delete=models.SET_NULL, null=True, related_name='order_items'
    )
    item_name = models.CharField(max_length=200, default='')  # Snapshot of item name
    quantity = models.PositiveIntegerField(default=1)
    unit_price = models.DecimalField(max_digits=8, decimal_places=2)

    class Meta:
        db_table = 'order_items'

    def __str__(self):
        return f"{self.quantity}x {self.item_name} @ ₹{self.unit_price}"

    @property
    def subtotal(self):
        return self.quantity * self.unit_price
