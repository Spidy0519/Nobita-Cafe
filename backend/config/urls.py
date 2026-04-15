"""
Nobita Café — URL Configuration
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
<<<<<<< HEAD

    # ── Core API ──
    path('api/', include('apps.orders.urls')),      # /api/place-order/  and  /api/orders/
    path('api/menu/', include('apps.menu.urls')),    # Menu items (kept for frontend)
=======
    
    # API endpoints
    path('api/auth/', include('apps.authentication.urls')),
    path('api/menu/', include('apps.menu.urls')),
    path('api/orders/', include('apps.orders.urls')),
    path('api/payments/', include('apps.payments.urls')),
    path('api/addresses/', include('apps.users.urls')),
    path('api/admin/', include('apps.orders.admin_urls')),
    path('api/delivery/', include('apps.delivery.urls')),
>>>>>>> 178d01e442bbda69ef0d6c6717f311b94abb02a9
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
