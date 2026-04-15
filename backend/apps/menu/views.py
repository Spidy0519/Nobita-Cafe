"""
Nobita Café — Menu Views
"""

import json
import logging
import os
import uuid
from decimal import Decimal

from django.conf import settings
from django.core.files.storage import FileSystemStorage
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Banner, Category, MenuItem
from .serializers import (
    BannerCreateSerializer,
    BannerSerializer,
    CategorySerializer,
    MenuItemCreateSerializer,
    MenuItemSerializer,
)

logger = logging.getLogger(__name__)


class IsAdminOrReadOnly(permissions.BasePermission):
    """Allow read for everyone, write only for admin users."""

    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return (
            request.user
            and request.user.is_authenticated
            and (request.user.role == "admin" or request.user.is_staff)
        )


class CategoryViewSet(viewsets.ModelViewSet):
    """
    GET /api/menu/categories/ — List all categories (public)
    POST/PATCH/DELETE — Protected by frontend passcode
    """

    queryset = Category.objects.filter(is_active=True)
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]


class MenuItemViewSet(viewsets.ModelViewSet):
    """
    GET /api/menu/items/ — List all items (public, with category filter)
    GET /api/menu/items/specials/ — Today's special items
    POST/PATCH/DELETE — Protected by frontend passcode
    """

    serializer_class = MenuItemSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        queryset = MenuItem.objects.select_related("category").all()

        category = self.request.query_params.get("category")
        if category:
            queryset = queryset.filter(category__name__iexact=category)

        if not (
            self.request.user.is_authenticated
            and (self.request.user.role == "admin" or self.request.user.is_staff)
        ):
            queryset = queryset.filter(is_available=True)

        search = self.request.query_params.get("search")
        if search:
            queryset = queryset.filter(name__icontains=search)

        return queryset

    def get_serializer_class(self):
        if self.action in ("create", "update", "partial_update"):
            return MenuItemCreateSerializer
        return MenuItemSerializer

    @action(detail=False, methods=["get"], url_path="specials")
    def specials(self, request):
        specials = MenuItem.objects.filter(
            is_special=True, is_available=True
        ).select_related("category")
        serializer = self.get_serializer(specials, many=True)
        return Response(serializer.data)


class BannerViewSet(viewsets.ModelViewSet):
    """
    GET /api/menu/banners/ — List all banners (public sees active only)
    POST/PATCH/DELETE — Protected by frontend passcode
    """

    serializer_class = BannerSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        return Banner.objects.all().order_by("sort_order")

    def get_serializer_class(self):
        if self.action in ("create", "update", "partial_update"):
            return BannerCreateSerializer
        return BannerSerializer


class MenuImageUploadView(APIView):
    """
    POST /api/menu/upload-image/
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

        max_size = 2 * 1024 * 1024
        if image_file.size > max_size:
            return Response(
                {"error": "File too large (max 2MB)."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        allowed_types = {
            "image/jpeg",
            "image/png",
            "image/gif",
            "image/webp",
            "image/jpg",
        }
        if image_file.content_type not in allowed_types:
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
        except Exception as exc:
            logger.error(f"Image upload failed: {exc}")
            return Response(
                {"error": f"Image upload failed: {str(exc)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


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
            content = json_file.read().decode("utf-8")
            items = json.loads(content)

            if not isinstance(items, list):
                return Response(
                    {"error": "JSON must be an array of items."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            created = 0
            updated = 0
            skipped = 0
            errors = []

            for idx, item_data in enumerate(items):
                try:
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

                    category_name = item_data["category"].strip()
                    category, _ = Category.objects.get_or_create(
                        name=category_name,
                        defaults={"icon": "🍽️", "is_active": True},
                    )

                    item_name = item_data["name"].strip()
                    existing = MenuItem.objects.filter(
                        name__iexact=item_name, category=category
                    ).first()

                    if existing:
                        existing.price = Decimal(str(item_data["price"]))
                        existing.image = item_data.get("image", "")
                        existing.description = item_data.get("description", "")
                        existing.is_available = item_data.get("available", True)
                        existing.save()
                        updated += 1
                    else:
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
                except Exception as exc:
                    errors.append(f"Row {idx + 1}: {str(exc)}")
                    skipped += 1

            return Response(
                {
                    "success": True,
                    "created": created,
                    "updated": updated,
                    "skipped": skipped,
                    "errors": errors[:10],
                    "total_errors": len(errors),
                }
            )
        except json.JSONDecodeError as exc:
            return Response(
                {"error": f"Invalid JSON: {str(exc)}"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        except Exception as exc:
            logger.error(f"Bulk import failed: {exc}")
            return Response(
                {"error": f"Import failed: {str(exc)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
