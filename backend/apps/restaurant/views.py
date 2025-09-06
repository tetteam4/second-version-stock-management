from django.shortcuts import get_object_or_404, render

# Create your views here.
from rest_framework import generics, viewsets
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.permissions import IsAuthenticated

from .models import StaffManagement
from .serializers import StaffManagementSerializer


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
