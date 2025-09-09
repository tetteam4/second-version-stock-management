from rest_framework import permissions, viewsets

from .models import Attribute, AttributeValue, Category
from .serializers import (
    AttributeSerializer,
    AttributeValueSerializer,
    CategorySerializer,
)


class VendorPermission(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        return (
            hasattr(request.user, "vendor")
            and getattr(obj, "vendor", None) == request.user.vendor
        )


class CategoryViewSet(viewsets.ModelViewSet):
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated, VendorPermission]

    def get_queryset(self):
        return Category.objects.filter(vendor=self.request.user.vendor)

    def perform_create(self, serializer):
        serializer.save(vendor=self.request.user.vendor)


class AttributeViewSet(viewsets.ModelViewSet):
    serializer_class = AttributeSerializer
    permission_classes = [permissions.IsAuthenticated, VendorPermission]

    def get_queryset(self):
        return Attribute.objects.filter(vendor=self.request.user.vendor)

    def perform_create(self, serializer):
        serializer.save(vendor=self.request.user.vendor)


class AttributeValueViewSet(viewsets.ModelViewSet):
    serializer_class = AttributeValueSerializer
    permission_classes = [permissions.IsAuthenticated, VendorPermission]

    def get_queryset(self):
        return AttributeValue.objects.filter(vendor=self.request.user.vendor)

    def perform_create(self, serializer):
        serializer.save(vendor=self.request.user.vendor)
