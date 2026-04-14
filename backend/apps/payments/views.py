"""
Nobita Café — Payment Views (Razorpay)
"""
import hmac
import hashlib
import logging
import razorpay
from django.conf import settings
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny

from apps.orders.models import Order

logger = logging.getLogger(__name__)


def get_razorpay_client():
    """Get Razorpay client instance."""
    return razorpay.Client(
        auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET)
    )


class CreatePaymentView(APIView):
    """
    POST /api/payments/create/
    Create a Razorpay order for online payment.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        order_id = request.data.get('order_id')
        if not order_id:
            return Response({'error': 'order_id is required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            order = Order.objects.get(id=order_id, user=request.user)
        except Order.DoesNotExist:
            return Response({'error': 'Order not found.'}, status=status.HTTP_404_NOT_FOUND)

        if order.payment_type == 'CASH':
            return Response({'error': 'Cash orders do not need online payment.'}, status=status.HTTP_400_BAD_REQUEST)

        if order.payment_status == 'PAID':
            return Response({'error': 'Order is already paid.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            client = get_razorpay_client()
            amount_paise = int(order.grand_total * 100)

            razorpay_order = client.order.create({
                'amount': amount_paise,
                'currency': 'INR',
                'receipt': str(order.id),
                'notes': {
                    'order_id': str(order.id),
                    'user_phone': order.user.phone,
                }
            })

            order.razorpay_order_id = razorpay_order['id']
            order.save(update_fields=['razorpay_order_id'])

            return Response({
                'razorpay_order_id': razorpay_order['id'],
                'amount': amount_paise,
                'currency': 'INR',
                'key_id': settings.RAZORPAY_KEY_ID,
            })

        except Exception as e:
            logger.error(f"Razorpay order creation failed: {e}")
            return Response(
                {'error': 'Payment initialization failed.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class VerifyPaymentView(APIView):
    """
    POST /api/payments/verify/
    Verify Razorpay payment signature.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        razorpay_order_id = request.data.get('razorpay_order_id')
        razorpay_payment_id = request.data.get('razorpay_payment_id')
        razorpay_signature = request.data.get('razorpay_signature')

        if not all([razorpay_order_id, razorpay_payment_id, razorpay_signature]):
            return Response(
                {'error': 'All payment fields are required.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            client = get_razorpay_client()
            client.utility.verify_payment_signature({
                'razorpay_order_id': razorpay_order_id,
                'razorpay_payment_id': razorpay_payment_id,
                'razorpay_signature': razorpay_signature,
            })

            # Payment verified — update order
            order = Order.objects.get(razorpay_order_id=razorpay_order_id)
            order.razorpay_payment_id = razorpay_payment_id
            order.payment_status = 'PAID'
            order.save(update_fields=['razorpay_payment_id', 'payment_status'])

            return Response({'message': 'Payment verified successfully.'})

        except razorpay.errors.SignatureVerificationError:
            return Response(
                {'error': 'Payment verification failed.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Order.DoesNotExist:
            return Response(
                {'error': 'Order not found.'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(f"Payment verification error: {e}")
            return Response(
                {'error': 'Verification failed.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class RazorpayWebhookView(APIView):
    """
    POST /api/payments/webhook/
    Handle Razorpay webhooks for payment events.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        webhook_secret = settings.RAZORPAY_KEY_SECRET
        webhook_signature = request.headers.get('X-Razorpay-Signature', '')
        webhook_body = request.body.decode('utf-8')

        # Verify webhook signature
        expected_signature = hmac.new(
            webhook_secret.encode(),
            webhook_body.encode(),
            hashlib.sha256
        ).hexdigest()

        if not hmac.compare_digest(expected_signature, webhook_signature):
            logger.warning("Invalid webhook signature")
            return Response({'error': 'Invalid signature'}, status=status.HTTP_400_BAD_REQUEST)

        event = request.data.get('event')
        payload = request.data.get('payload', {})

        if event == 'payment.captured':
            payment = payload.get('payment', {}).get('entity', {})
            razorpay_order_id = payment.get('order_id')

            try:
                order = Order.objects.get(razorpay_order_id=razorpay_order_id)
                order.payment_status = 'PAID'
                order.razorpay_payment_id = payment.get('id', '')
                order.save(update_fields=['payment_status', 'razorpay_payment_id'])
                logger.info(f"Webhook: Payment captured for order {order.id}")
            except Order.DoesNotExist:
                logger.warning(f"Webhook: Order not found for {razorpay_order_id}")

        elif event == 'payment.failed':
            payment = payload.get('payment', {}).get('entity', {})
            razorpay_order_id = payment.get('order_id')

            try:
                order = Order.objects.get(razorpay_order_id=razorpay_order_id)
                order.payment_status = 'FAILED'
                order.save(update_fields=['payment_status'])
                logger.info(f"Webhook: Payment failed for order {order.id}")
            except Order.DoesNotExist:
                pass

        return Response({'status': 'ok'})
