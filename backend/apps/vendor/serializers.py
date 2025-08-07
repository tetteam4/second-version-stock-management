from apps.users.serializers import UserSerializer
from django.contrib.auth import get_user_model
from rest_framework import serializers

from .models import Vendor

User = get_user_model()


class VendorSerializer(serializers.ModelSerializer):

    user = UserSerializer(read_only=True)

    class Meta:
        model = Vendor
        fields = "__all__"

    def create(self, validated_data):
        user = validated_data.pop("user_id")
        vendor = Vendor.objects.create(user=user, **validated_data)
        return vendor
