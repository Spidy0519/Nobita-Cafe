"""
Nobita Café — Menu Views
"""
import logging
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
import cloudinary.uploader

from .models import Category, MenuItem
from .serializers import CategorySerializer, MenuItemSerializer, MenuItemCreateSerializer

logger = logging.getLogger(__name__)


class IsAdminOrReadOnly(permissions.BasePermission):
    """Allow read for everyone, write only for admin users."""
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user and request.user.is_authenticated and (
            request.user.role == 'admin' or request.user.is_staff
        )


class CategoryViewSet(viewsets.ModelViewSet):
    """
    GET /api/menu/categories/ — List all categories (public)
    POST/PATCH/DELETE — Admin only
    """
    queryset = Category.objects.filter(is_active=True)
    serializer_class = CategorySerializer
    permission_classes = [IsAdminOrReadOnly]


class MenuItemViewSet(viewsets.ModelViewSet):
    """
    GET /api/menu/items/ — List all items (public, with category filter)
    GET /api/menu/specials/ — Today's special items
    POST/PATCH/DELETE — Admin only
    """
    serializer_class = MenuItemSerializer
    permission_classes = [IsAdminOrReadOnly]

    def get_queryset(self):
        queryset = MenuItem.objects.select_related('category').all()
        
        # Filter by category
        category = self.request.query_params.get('category')
        if category:
            queryset = queryset.filter(category__name__iexact=category)
        
        # Only show available items for non-admin
        if not (self.request.user.is_authenticated and 
                (self.request.user.role == 'admin' or self.request.user.is_staff)):
            queryset = queryset.filter(is_available=True)

        # Search by name
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(name__icontains=search)
        
        return queryset

    def get_serializer_class(self):
        if self.action in ('create', 'update', 'partial_update'):
            return MenuItemCreateSerializer
        return MenuItemSerializer

    @action(detail=False, methods=['get'], url_path='specials')
    def specials(self, request):
        """GET /api/menu/items/specials/ — Today's special items."""
        specials = MenuItem.objects.filter(
            is_special=True, is_available=True
        ).select_related('category')
        serializer = self.get_serializer(specials, many=True)
        return Response(serializer.data)


class ImageUploadView(permissions.BasePermission):
    """Upload menu item images to Cloudinary."""
    pass


from rest_framework.views import APIView


class MenuImageUploadView(APIView):
    """
    POST /api/menu/upload-image/
    Upload image to Cloudinary and return URL.
    Admin only.
    """
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        if request.user.role != 'admin' and not request.user.is_staff:
            return Response(
                {'error': 'Admin access required.'},
                status=status.HTTP_403_FORBIDDEN
            )

        image_file = request.FILES.get('image')
        if not image_file:
            return Response(
                {'error': 'No image file provided.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            result = cloudinary.uploader.upload(
                image_file,
                folder='nobita-cafe/menu',
                transformation=[
                    {'width': 800, 'height': 600, 'crop': 'fill', 'quality': 'auto'}
                ]
            )
            return Response({
                'url': result['secure_url'],
                'public_id': result['public_id'],
            })
        except Exception as e:
            logger.error(f"Cloudinary upload failed: {e}")
            return Response(
                {'error': 'Image upload failed.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
