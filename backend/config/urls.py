from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularRedocView,
    SpectacularSwaggerView,
)

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path("", SpectacularSwaggerView.as_view(url_name="schema"), name="swagger-ui"),
    path(
        "api/schema/redoc/",
        SpectacularRedocView.as_view(url_name="schema"),
        name="redoc",
    ),
    path("api/v1/categories/", include("apps.categories.urls"), name="categories"),
    path("api/v1/auth/", include("apps.users.urls"), name="auth"),
    path("api/v1/inventory/", include("apps.inventory.urls"), name="inventory"),
    path("api/v1/vendor/", include("apps.vendor.urls"), name="vendor"),
    path("api/v1/profiles/", include("apps.profiles.urls"), name="profiles"),
] + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

admin.site.site_header = "Stock management system  Admin"
admin.site.site_title = "Stock management Admin Portal"
admin.site.index_title = "Welcome to Stock management Center API Portal"

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
