"""
Nobita Café — Authentication URLs
"""
from django.urls import path
from .views import SendOTPView, VerifyOTPView, RefreshTokenView, ProfileView

urlpatterns = [
    path('send-otp/', SendOTPView.as_view(), name='send-otp'),
    path('verify-otp/', VerifyOTPView.as_view(), name='verify-otp'),
    path('refresh/', RefreshTokenView.as_view(), name='token-refresh'),
    path('me/', ProfileView.as_view(), name='profile'),
]
