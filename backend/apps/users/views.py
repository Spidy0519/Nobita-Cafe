"""
Nobita Café — User & Address Views
"""
from rest_framework import viewsets, permissions
from .models import Address
from .serializers import AddressSerializer


class AddressViewSet(viewsets.ModelViewSet):
    """CRUD for user addresses."""
    serializer_class = AddressSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Address.objects.filter(user=self.request.user)
