"""
Nobita Café — Payment URLs
"""
from django.urls import path
from .views import CreatePaymentView, VerifyPaymentView, RazorpayWebhookView

urlpatterns = [
    path('create/', CreatePaymentView.as_view(), name='payment-create'),
    path('verify/', VerifyPaymentView.as_view(), name='payment-verify'),
    path('webhook/', RazorpayWebhookView.as_view(), name='payment-webhook'),
]
