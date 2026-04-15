"""
Nobita Café — Menu Views
"""
<<<<<<< HEAD

import logging
import os
import uuid
=======
import logging
>>>>>>> 178d01e442bbda69ef0d6c6717f311b94abb02a9
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
<<<<<<< HEAD
from rest_framework.views import APIView
from django.conf import settings
from django.core.files.storage import FileSystemStorage

from .models import Category, MenuItem, Banner
from .serializers import (
    CategorySerializer,
    MenuItemSerializer,
    MenuItemCreateSerializer,
    BannerSerializer,
    BannerCreateSerializer,
)
=======
import cloudinary.uploader

from .models import Category, MenuItem
from .serializers import CategorySerializer, MenuItemSerializer, MenuItemCreateSerializer
>>>>>>> 178d01e442bbda69ef0d6c6717f311b94abb02a9

logger = logging.getLogger(__name__)


class IsAdminOrReadOnly(permissions.BasePermission):
    """Allow read for everyone, write only for admin users."""
<<<<<<< HEAD

    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return (
            request.user
            and request.user.is_authenticated
            and (request.user.role == "admin" or request.user.is_staff)
=======
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user and request.user.is_authenticated and (
            request.user.role == 'admin' or request.user.is_staff
>>>>>>> 178d01e442bbda69ef0d6c6717f311b94abb02a9
        )


class CategoryViewSet(viewsets.ModelViewSet):
    """
    GET /api/menu/categories/ — List all categories (public)
<<<<<<< HEAD
    POST/PATCH/DELETE — Protected by frontend passcode
    """

    queryset = Category.objects.filter(is_active=True)
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]
=======
    POST/PATCH/DELETE — Admin only
    """
    queryset = Category.objects.filter(is_active=True)
    serializer_class = CategorySerializer
    permission_classes = [IsAdminOrReadOnly]
>>>>>>> 178d01e442bbda69ef0d6c6717f311b94abb02a9


class MenuItemViewSet(viewsets.ModelViewSet):
    """
    GET /api/menu/items/ — List all items (public, with category filter)
<<<<<<< HEAD
    GET /api/menu/items/specials/ — Today's special items
    POST/PATCH/DELETE — Protected by frontend passcode
    """

    serializer_class = MenuItemSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        queryset = MenuItem.objects.select_related("category").all()

        # Filter by category
        category = self.request.query_params.get("category")
        if category:
            queryset = queryset.filter(category__name__iexact=category)

        # Only show available items for non-admin
        if not (
            self.request.user.is_authenticated
            and (self.request.user.role == "admin" or self.request.user.is_staff)
        ):
            queryset = queryset.filter(is_available=True)

        # Search by name
        search = self.request.query_params.get("search")
        if search:
            queryset = queryset.filter(name__icontains=search)

        return queryset

    def get_serializer_class(self):
        if self.action in ("create", "update", "partial_update"):
            return MenuItemCreateSerializer
        return MenuItemSerializer

    @action(detail=False, methods=["get"], url_path="specials")
=======
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
>>>>>>> 178d01e442bbda69ef0d6c6717f311b94abb02a9
    def specials(self, request):
        """GET /api/menu/items/specials/ — Today's special items."""
        specials = MenuItem.objects.filter(
            is_special=True, is_available=True
<<<<<<< HEAD
        ).select_related("category")
=======
        ).select_related('category')
>>>>>>> 178d01e442bbda69ef0d6c6717f311b94abb02a9
        serializer = self.get_serializer(specials, many=True)
        return Response(serializer.data)


<<<<<<< HEAD
class BannerViewSet(viewsets.ModelViewSet):
    """
    GET /api/menu/banners/ — List all banners (public sees active only)
    POST/PATCH/DELETE — Protected by frontend passcode
    """

    serializer_class = BannerSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        # Admin fetches all banners, users see only active
        return Banner.objects.all().order_by("sort_order")

    def get_serializer_class(self):
        if self.action in ("create", "update", "partial_update"):
            return BannerCreateSerializer
        return BannerSerializer
=======
class ImageUploadView(permissions.BasePermission):
    """Upload menu item images to Cloudinary."""
    pass


from rest_framework.views import APIView
>>>>>>> 178d01e442bbda69ef0d6c6717f311b94abb02a9


class MenuImageUploadView(APIView):
    """
    POST /api/menu/upload-image/
<<<<<<< HEAD
    Upload image to local media storage and return URL.
    Protected by frontend passcode.
    """

    permission_classes = [permissions.AllowAny]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        image_file = request.FILES.get("image")
        if not image_file:
            return Response(
                {"error": "No image file provided."}, status=status.HTTP_400_BAD_REQUEST
            )

        # Validate file size (2MB max)
        MAX_SIZE = 2 * 1024 * 1024
        if image_file.size > MAX_SIZE:
            return Response(
                {"error": "File too large (max 2MB)."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Validate file type
        ALLOWED_TYPES = {
            "image/jpeg",
            "image/png",
            "image/gif",
            "image/webp",
            "image/jpg",
        }
        if image_file.content_type not in ALLOWED_TYPES:
            return Response(
                {"error": "Invalid image format. Allowed: JPEG, PNG, GIF, WebP."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            _, ext = os.path.splitext(image_file.name)
            ext = ext.lower() or ".jpg"
            filename = f"{uuid.uuid4().hex}{ext}"

            storage = FileSystemStorage(
                location=settings.MEDIA_ROOT, base_url=settings.MEDIA_URL
            )
            saved_path = storage.save(f"uploads/{filename}", image_file)
            image_url = storage.url(saved_path)

            logger.info(f"Image uploaded locally: {saved_path}")
            return Response({"url": image_url}, status=status.HTTP_201_CREATED)

        except Exception as e:
            logger.error(f"Image upload failed: {e}")
            return Response(
                {"error": f"Image upload failed: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


import json
from decimal import Decimal


class BulkImportFoodsView(APIView):
    """
    POST /api/menu/bulk-import/
    Bulk import food items from JSON file.
    Protected by frontend passcode.
    """

    permission_classes = [permissions.AllowAny]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):

        json_file = request.FILES.get("file")
        if not json_file:
            return Response(
                {"error": "No JSON file provided."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            # Parse JSON
            content = json_file.read().decode("utf-8")
            items = json.loads(content)

            if not isinstance(items, list):
                return Response(
                    {"error": "JSON must be an array of items."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Process items
            created = 0
            updated = 0
            skipped = 0
            errors = []

            for idx, item_data in enumerate(items):
                try:
                    # Validate required fields
                    if not item_data.get("name"):
                        errors.append(f"Row {idx + 1}: Missing 'name'")
                        skipped += 1
                        continue

                    if not item_data.get("category"):
                        errors.append(f"Row {idx + 1}: Missing 'category'")
                        skipped += 1
                        continue

                    if not item_data.get("price"):
                        errors.append(f"Row {idx + 1}: Missing 'price'")
                        skipped += 1
                        continue

                    # Get or create category
                    category_name = item_data["category"].strip()
                    category, _ = Category.objects.get_or_create(
                        name=category_name,
                        defaults={"icon": "🍽️", "is_active": True},
                    )

                    # Check if item already exists
                    item_name = item_data["name"].strip()
                    existing = MenuItem.objects.filter(
                        name__iexact=item_name, category=category
                    ).first()

                    if existing:
                        # Update existing
                        existing.price = Decimal(str(item_data["price"]))
                        existing.image = item_data.get("image", "")
                        existing.description = item_data.get("description", "")
                        existing.is_available = item_data.get("available", True)
                        existing.save()
                        updated += 1
                    else:
                        # Create new
                        MenuItem.objects.create(
                            name=item_name,
                            category=category,
                            price=Decimal(str(item_data["price"])),
                            image=item_data.get("image", ""),
                            description=item_data.get("description", ""),
                            is_available=item_data.get("available", True),
                            badge=item_data.get("badge", ""),
                            sort_order=item_data.get("sort_order", 0),
                        )
                        created += 1

                except Decimal.InvalidOperation:
                    errors.append(f"Row {idx + 1}: Invalid price")
                    skipped += 1
                except Exception as e:
                    errors.append(f"Row {idx + 1}: {str(e)}")
                    skipped += 1

            return Response(
                {
                    "success": True,
                    "created": created,
                    "updated": updated,
                    "skipped": skipped,
                    "errors": errors[:10],  # Return first 10 errors
                    "total_errors": len(errors),
                }
            )

        except json.JSONDecodeError as e:
            return Response(
                {"error": f"Invalid JSON: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        except Exception as e:
            logger.error(f"Bulk import failed: {e}")
            return Response(
                {"error": f"Import failed: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
=======
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
>>>>>>> 178d01e442bbda69ef0d6c6717f311b94abb02a9
            )
