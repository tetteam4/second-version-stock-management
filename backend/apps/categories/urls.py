from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import AttributeValueViewSet, AttributeViewSet, CategoryViewSet

router = DefaultRouter()
router.register("categories", CategoryViewSet, basename="category")
router.register("attributes", AttributeViewSet, basename="attribute")
router.register("attribute-values", AttributeValueViewSet, basename="attribute-value")

urlpatterns = [
    path("", include(router.urls)),
]
