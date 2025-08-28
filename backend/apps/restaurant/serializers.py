from apps.category.models import AttributeType
from apps.users.serializers import UserSerializer
from apps.vendor.models import Vendor
from apps.vendor.serializers import VendorSerializer
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from rest_framework import serializers

from .models import (
    Menu,
    MenuImage,
    MultiImages,
    Order,
    OrderItem,
    RestaurantRole,
    StaffManagement,
)

User = get_user_model()


class MenuImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = MenuImage
        fields = ["id", "image", "menu", "created_at", "updated_at"]


class MultiImagesSerializer(serializers.ModelSerializer):
    class Meta:
        model = MultiImages
        fields = ["id", "category", "image", "created_at", "updated_at"]


class MenuSerializer(serializers.ModelSerializer):
    attributes = serializers.PrimaryKeyRelatedField(
        queryset=AttributeType.objects.all(), many=True
    )

    class Meta:
        model = Menu
        fields = [
            "id",
            "vendor",
            "category",
            "name",
            "choice_type",
            "attributes",
            "created_at",
            "updated_at",
        ]


class OrderItemSerializer(serializers.ModelSerializer):
    menu_name = serializers.ReadOnlyField(source="menu.name")

    class Meta:
        model = OrderItem
        fields = ["id", "menu", "menu_name", "quantity", "selected_option", "price"]

    def validate(self, data):
        if data["quantity"] < 1:
            raise serializers.ValidationError("Quantity must be at least 1.")
        if data["price"] <= 0:
            raise serializers.ValidationError("Price must be positive.")
        return data


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True)
    status_display = serializers.CharField(source="get_status_display", read_only=True)

    class Meta:
        model = Order
        fields = [
            "id",
            "customer",
            "vendor",
            "status",
            "status_display",
            "notes",
            "items",
            "total_price",
        ]
        read_only_fields = ["total_price"]

    def validate_items(self, value):
        seen_menus = set()
        for item in value:
            menu_id = item["menu"]
            if menu_id in seen_menus:
                raise serializers.ValidationError(
                    "Duplicate menu items detected in order."
                )
            seen_menus.add(menu_id)
        return value

    def create(self, validated_data):
        items_data = validated_data.pop("items")
        order = Order.objects.create(**validated_data)
        total_price = 0

        for item_data in items_data:
            OrderItem.objects.create(order=order, **item_data)
            total_price += item_data["quantity"] * item_data["price"]

        order.total_price = total_price
        order.save()
        return order

    def update(self, instance, validated_data):
        items_data = validated_data.pop("items", None)

        instance.customer = validated_data.get("customer", instance.customer)
        instance.vendor = validated_data.get("vendor", instance.vendor)
        instance.status = validated_data.get("status", instance.status)
        instance.notes = validated_data.get("notes", instance.notes)
        instance.save()

        if items_data is not None:

            instance.items.all().delete()
            total_price = 0
            for item_data in items_data:
                OrderItem.objects.create(order=instance, **item_data)
                total_price += item_data["quantity"] * item_data["price"]
            instance.total_price = total_price
            instance.save()

        return instance


class OrderCreateSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True)

    class Meta:
        model = Order
        fields = ["customer", "vendor", "status", "notes", "items"]

    def create(self, validated_data):
        items_data = validated_data.pop("items")
        order = Order.objects.create(**validated_data)
        for item_data in items_data:
            OrderItem.objects.create(order=order, **item_data)
        return order


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
