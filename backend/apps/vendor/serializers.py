from apps.users.serializers import UserSerializer
from rest_framework import serializers

from .models import Vendor


class VendorSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = Vendor
        fields = [
            "id",
            "user",
            "image",
            "name",
            "email",
            "slug",
            "description",
            "mobile",
            "verified",
            "active",
            "vid",
            "date",
        ]

    def create(self, validated_data):
        user = validated_data.pop("user_id")
        vendor = Vendor.objects.create(user=user, **validated_data)
        return vendor

    # def __init__(self, *args, **kwargs):
    #     super(VendorSerializer, self).__init__(*args, **kwargs)
    #     request = self.context.get("request")
    #     if request and request.method == "POST":
    #         self.Meta.depth = 0
    #     else:
    #         self.Meta.depth = 3
