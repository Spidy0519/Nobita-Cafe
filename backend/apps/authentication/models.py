"""
Nobita Café — Authentication Models (OTP)
"""
import hashlib
from django.db import models
from django.utils import timezone
from datetime import timedelta
from django.conf import settings


class OTPRecord(models.Model):
    """Stores hashed OTPs for phone verification."""

    phone = models.CharField(max_length=15, db_index=True)
    otp_hash = models.CharField(max_length=64)
    expires_at = models.DateTimeField()
    is_used = models.BooleanField(default=False)
    attempts = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'otp_records'
        ordering = ['-created_at']

    def __str__(self):
        return f"OTP for {self.phone}"

    @staticmethod
    def hash_otp(otp: str) -> str:
        """Hash OTP using SHA-256."""
        return hashlib.sha256(otp.encode()).hexdigest()

    @property
    def is_expired(self) -> bool:
        return timezone.now() > self.expires_at

    @property
    def is_valid(self) -> bool:
        return not self.is_used and not self.is_expired and self.attempts < 5

    @classmethod
    def create_otp(cls, phone: str, otp: str):
        """Create a new OTP record, invalidating previous ones."""
        # Mark all previous OTPs for this phone as used
        cls.objects.filter(phone=phone, is_used=False).update(is_used=True)

        expiry = timezone.now() + timedelta(seconds=getattr(settings, 'OTP_EXPIRY_SECONDS', 300))
        return cls.objects.create(
            phone=phone,
            otp_hash=cls.hash_otp(otp),
            expires_at=expiry,
        )

    @classmethod
    def verify_otp(cls, phone: str, otp: str) -> bool:
        """Verify OTP and mark as used if valid."""
        otp_hash = cls.hash_otp(otp)
        try:
            record = cls.objects.filter(
                phone=phone,
                is_used=False,
                expires_at__gt=timezone.now(),
            ).latest('created_at')
        except cls.DoesNotExist:
            return False

        record.attempts += 1

        if record.attempts >= 5:
            record.is_used = True
            record.save()
            return False

        if record.otp_hash == otp_hash:
            record.is_used = True
            record.save()
            return True

        record.save()
        return False
