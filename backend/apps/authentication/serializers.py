"""
Nobita Café — Authentication Serializers
"""
from rest_framework import serializers
import re


class SendOTPSerializer(serializers.Serializer):
    phone = serializers.CharField(max_length=15)

    def validate_phone(self, value):
        # Remove any non-digit characters
        cleaned = re.sub(r'\D', '', value)
        
        # Support Indian phone numbers
        if cleaned.startswith('91') and len(cleaned) == 12:
            cleaned = cleaned[2:]
        
        if len(cleaned) != 10:
            raise serializers.ValidationError("Enter a valid 10-digit phone number.")
        
        if not cleaned.isdigit():
            raise serializers.ValidationError("Phone number must contain only digits.")
        
        return cleaned


class VerifyOTPSerializer(serializers.Serializer):
    phone = serializers.CharField(max_length=15)
    otp = serializers.CharField(max_length=6, min_length=6)
    name = serializers.CharField(max_length=150, required=False, default='')

    def validate_phone(self, value):
        cleaned = re.sub(r'\D', '', value)
        if cleaned.startswith('91') and len(cleaned) == 12:
            cleaned = cleaned[2:]
        if len(cleaned) != 10:
            raise serializers.ValidationError("Enter a valid 10-digit phone number.")
        return cleaned

    def validate_otp(self, value):
        if not value.isdigit():
            raise serializers.ValidationError("OTP must contain only digits.")
        return value
