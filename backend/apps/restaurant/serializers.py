from apps.category.models import AttributeType
from apps.users.serializers import UserSerializer
from apps.vendor.models import Vendor
from apps.vendor.serializers import VendorSerializer
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from rest_framework import serializers

from .models import MultiImages, Order, OrderItem, RestaurantRole, StaffManagement

User = get_user_model()


class MultiImagesSerializer(serializers.ModelSerializer):
    class Meta:
        model = MultiImages
        fields = ["id", "category", "image", "created_at", "updated_at"]


class StaffManagementSerializer(serializers.ModelSerializer):
    role = serializers.CharField()  # role key from input

    class Meta:
        model = StaffManagement
        exclude = ["user"]  # user is set automatically, exclude from client input

    def create(self, validated_data):
        role_key = validated_data.pop("role")
        role = RestaurantRole.objects.get(key=role_key)
        validated_data["role"] = role
        # user will be set in view, not here
        return StaffManagement.objects.create(**validated_data)

    def update(self, instance, validated_data):
        if "role" in validated_data:
            role_key = validated_data.pop("role")
            role = RestaurantRole.objects.get(key=role_key)
            validated_data["role"] = role
        return super().update(instance, validated_data)
