from django.shortcuts import get_object_or_404, render

# Create your views here.
from rest_framework import generics, viewsets
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.permissions import IsAuthenticated

from .models import Category, Menu, MenuField, Order, StaffManagement
from .serializers import (
    CategorySerializer,
    MenuFieldSerializer,
    MenuSerializer,
    OrderCreateSerializer,
    OrderSerializer,
    StaffManagementSerializer,
)


class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]


# List & Create Orders
class OrderListCreateView(generics.ListCreateAPIView):
    queryset = (
        Order.objects.all().select_related("vendor").prefetch_related("items__menu")
    )

    def get_serializer_class(self):
        if self.request.method == "POST":
            return OrderCreateSerializer
        return OrderSerializer


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticated]
    parser_classes = (MultiPartParser, FormParser)

    def update(self, request, *args, **kwargs):
        return super().update(request, *args, **kwargs)


class MenuViewSet(viewsets.ModelViewSet):
    queryset = Menu.objects.all()
    serializer_class = MenuSerializer
    permission_classes = [IsAuthenticated]


class MenuFieldViewSet(viewsets.ModelViewSet):
    queryset = MenuField.objects.all()
    serializer_class = MenuFieldSerializer
    permission_classes = [IsAuthenticated]


class StaffManagementViewSet(viewsets.ModelViewSet):
    serializer_class = StaffManagementSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if hasattr(user, "vendor") and user.vendor:
            return StaffManagement.objects.filter(vendor=user.vendor)
        return StaffManagement.objects.none()

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def perform_update(self, serializer):
        serializer.save(user=self.request.user)
