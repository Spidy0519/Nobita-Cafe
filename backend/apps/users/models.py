"""
Nobita Café — User Models (Custom User + Address)
"""
import uuid
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models


class UserManager(BaseUserManager):
    """Custom manager for phone-based authentication."""

    def create_user(self, phone, name='', password=None, **extra_fields):
        if not phone:
            raise ValueError('Phone number is required')
        user = self.model(phone=phone, name=name, **extra_fields)
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()
        user.save(using=self._db)
        return user

    def create_superuser(self, phone, name='Admin', password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)
        extra_fields.setdefault('role', 'admin')
        return self.create_user(phone, name, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    """Custom User model using phone number for authentication."""

    ROLE_CHOICES = (
        ('customer', 'Customer'),
        ('admin', 'Admin'),
        ('delivery', 'Delivery'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    phone = models.CharField(max_length=15, unique=True, db_index=True)
    name = models.CharField(max_length=150, blank=True, default='')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='customer')
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = UserManager()

    USERNAME_FIELD = 'phone'
    REQUIRED_FIELDS = ['name']

    class Meta:
        db_table = 'users'
        ordering = ['-created_at']
        verbose_name = 'User'
        verbose_name_plural = 'Users'

    def __str__(self):
        return f"{self.name} ({self.phone})"


class Address(models.Model):
    """User delivery addresses."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='addresses')
    label = models.CharField(max_length=50, default='Home')  # Home, Work, Other
    full_address = models.TextField()
    latitude = models.DecimalField(max_digits=10, decimal_places=7, null=True, blank=True)
    longitude = models.DecimalField(max_digits=10, decimal_places=7, null=True, blank=True)
    is_default = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'addresses'
        ordering = ['-is_default', '-created_at']
        verbose_name_plural = 'Addresses'

    def __str__(self):
        return f"{self.label}: {self.full_address[:50]}"

    def save(self, *args, **kwargs):
        # If this address is set as default, unset other defaults
        if self.is_default:
            Address.objects.filter(user=self.user, is_default=True).update(is_default=False)
        super().save(*args, **kwargs)
