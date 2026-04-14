"""
Nobita Café — Authentication Views (OTP Send, Verify, Profile)
"""
import logging
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken

from apps.users.models import User
from apps.users.serializers import UserSerializer, UserUpdateSerializer
from .models import OTPRecord
from .serializers import SendOTPSerializer, VerifyOTPSerializer
from .services import generate_otp, send_otp_via_msg91

logger = logging.getLogger(__name__)


class SendOTPView(APIView):
    """
    POST /api/auth/send-otp/
    Send OTP to the provided phone number.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = SendOTPSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        phone = serializer.validated_data['phone']

        # Rate limiting: max 5 OTPs per phone per hour
        from django.utils import timezone
        from datetime import timedelta
        recent_count = OTPRecord.objects.filter(
            phone=phone,
            created_at__gte=timezone.now() - timedelta(hours=1)
        ).count()
        
        if recent_count >= 5:
            return Response(
                {'error': 'Too many OTP requests. Please try after some time.'},
                status=status.HTTP_429_TOO_MANY_REQUESTS
            )

        # Generate and send OTP
        otp = generate_otp()
        OTPRecord.create_otp(phone, otp)
        
        sent = send_otp_via_msg91(phone, otp)
        
        if sent:
            return Response({
                'message': 'OTP sent successfully.',
                'phone': phone,
            }, status=status.HTTP_200_OK)
        else:
            return Response(
                {'error': 'Failed to send OTP. Please try again.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class VerifyOTPView(APIView):
    """
    POST /api/auth/verify-otp/
    Verify OTP and return JWT tokens.
    Creates user if first time login.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = VerifyOTPSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        phone = serializer.validated_data['phone']
        otp = serializer.validated_data['otp']
        name = serializer.validated_data.get('name', '')

        # Verify OTP
        is_valid = OTPRecord.verify_otp(phone, otp)
        
        if not is_valid:
            return Response(
                {'error': 'Invalid or expired OTP.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Get or create user
        user, created = User.objects.get_or_create(
            phone=phone,
            defaults={'name': name or 'User'}
        )

        # Update name if provided and user exists
        if not created and name:
            user.name = name
            user.save(update_fields=['name'])

        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        
        # Add custom claims
        refresh['phone'] = user.phone
        refresh['name'] = user.name
        refresh['role'] = user.role

        return Response({
            'message': 'Login successful.',
            'is_new_user': created,
            'user': UserSerializer(user).data,
            'tokens': {
                'access': str(refresh.access_token),
                'refresh': str(refresh),
            }
        }, status=status.HTTP_200_OK)


class RefreshTokenView(APIView):
    """
    POST /api/auth/refresh/
    Refresh access token.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        refresh_token = request.data.get('refresh')
        if not refresh_token:
            return Response(
                {'error': 'Refresh token is required.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        try:
            refresh = RefreshToken(refresh_token)
            return Response({
                'access': str(refresh.access_token),
                'refresh': str(refresh),
            })
        except Exception as e:
            return Response(
                {'error': 'Invalid refresh token.'},
                status=status.HTTP_401_UNAUTHORIZED
            )


class ProfileView(APIView):
    """
    GET/PATCH /api/auth/me/
    Get or update current user profile.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

    def patch(self, request):
        serializer = UserUpdateSerializer(request.user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(UserSerializer(request.user).data)
