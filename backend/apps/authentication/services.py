"""
Nobita Café — MSG91 SMS Service
"""
import random
import logging
import requests
from django.conf import settings

logger = logging.getLogger(__name__)


def generate_otp(length=6) -> str:
    """Generate a random numeric OTP."""
    return ''.join([str(random.randint(0, 9)) for _ in range(length)])


def send_otp_via_msg91(phone: str, otp: str) -> bool:
    """
    Send OTP via MSG91 SMS API.
    
    In development (no MSG91_AUTH_KEY), logs OTP to console.
    In production, sends real SMS via MSG91.
    """
    auth_key = getattr(settings, 'MSG91_AUTH_KEY', '')
    template_id = getattr(settings, 'MSG91_TEMPLATE_ID', '')

    # Development mode — log OTP instead of sending SMS
    if not auth_key:
        logger.info(f"[DEV MODE] OTP for {phone}: {otp}")
        print(f"\n{'='*40}")
        print(f"  DEV OTP for {phone}: {otp}")
        print(f"{'='*40}\n")
        return True

    try:
        url = "https://control.msg91.com/api/v5/otp"
        headers = {
            "authkey": auth_key,
            "Content-Type": "application/json",
        }
        payload = {
            "template_id": template_id,
            "mobile": f"91{phone}" if not phone.startswith('91') else phone,
            "otp": otp,
        }

        response = requests.post(url, json=payload, headers=headers, timeout=10)
        response_data = response.json()

        if response.status_code == 200 and response_data.get('type') == 'success':
            logger.info(f"OTP sent successfully to {phone}")
            return True
        else:
            logger.error(f"MSG91 error: {response_data}")
            return False

    except requests.RequestException as e:
        logger.error(f"MSG91 request failed: {e}")
        return False


def verify_otp_via_msg91(phone: str, otp: str) -> bool:
    """
    Verify OTP via MSG91 API (optional — we use local verification).
    """
    auth_key = getattr(settings, 'MSG91_AUTH_KEY', '')

    if not auth_key:
        return True  # In dev, verification is handled locally

    try:
        url = "https://control.msg91.com/api/v5/otp/verify"
        headers = {"authkey": auth_key}
        params = {
            "mobile": f"91{phone}" if not phone.startswith('91') else phone,
            "otp": otp,
        }

        response = requests.get(url, params=params, headers=headers, timeout=10)
        response_data = response.json()

        return response_data.get('type') == 'success'

    except requests.RequestException as e:
        logger.error(f"MSG91 verify failed: {e}")
        return False
