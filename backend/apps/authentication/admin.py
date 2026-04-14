from django.contrib import admin
from .models import OTPRecord


@admin.register(OTPRecord)
class OTPRecordAdmin(admin.ModelAdmin):
    list_display = ['phone', 'is_used', 'expires_at', 'attempts', 'created_at']
    list_filter = ['is_used']
    search_fields = ['phone']
    readonly_fields = ['otp_hash', 'created_at']
