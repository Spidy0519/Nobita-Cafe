"""
Nobita Café — Menu URLs
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CategoryViewSet,
    MenuItemViewSet,
    BannerViewSet,
    MenuImageUploadView,
    BulkImportFoodsView,
)

router = DefaultRouter()
router.register("categories", CategoryViewSet, basename="category")
router.register("items", MenuItemViewSet, basename="menuitem")
router.register("banners", BannerViewSet, basename="banner")

urlpatterns = [
    path("", include(router.urls)),
    path("upload-image/", MenuImageUploadView.as_view(), name="menu-upload-image"),
    path("bulk-import/", BulkImportFoodsView.as_view(), name="bulk-import-foods"),
]
