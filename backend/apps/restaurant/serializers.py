from apps.users.serializers import UserSerializer
from apps.vendor.models import Vendor
from apps.vendor.serializers import VendorSerializer
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from rest_framework import serializers

from .models import (
    Category,
    Menu,
    MenuField,
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


class CategorySerializer(serializers.ModelSerializer):
    vendor_id = serializers.PrimaryKeyRelatedField(
        queryset=Vendor.objects.all(), source="vendor", write_only=True
    )

    multi_images = MultiImagesSerializer(many=True, read_only=True)

    uploaded_images = serializers.ListField(
        child=serializers.ImageField(
            max_length=100000, allow_empty_file=False, use_url=False
        ),
        write_only=True,
        required=False,
    )

    class Meta:
        model = Category
        fields = [
            "id",
            "vendor_id",
            "name",
            "multi_images",
            "uploaded_images",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["created_at", "updated_at"]

    def create(self, validated_data):
        uploaded_images = validated_data.pop("uploaded_images", [])
        category = Category.objects.create(**validated_data)

        for img in uploaded_images:
            MultiImages.objects.create(category=category, image=img)

        return category

    def update(self, instance, validated_data):
        uploaded_images = validated_data.pop("uploaded_images", [])
        instance = super().update(instance, validated_data)

        # Get existing image IDs
        existing_ids = [img.id for img in instance.multi_images.all()]

        # Get kept_image_ids from request (not validated_data)
        kept_ids_raw = self.context["request"].data.get("kept_image_ids", "")
        if isinstance(kept_ids_raw, str):
            kept_ids = list(map(int, filter(None, kept_ids_raw.split(","))))
        elif isinstance(kept_ids_raw, list):
            kept_ids = list(map(int, kept_ids_raw))
        else:
            kept_ids = []

        # Save new uploaded images
        for img in uploaded_images:
            MultiImages.objects.create(category=instance, image=img)

        # Delete images not in kept_ids
        to_remove = set(existing_ids) - set(kept_ids)
        if to_remove:
            MultiImages.objects.filter(category=instance, id__in=to_remove).delete()

        return instance


class MenuFieldSerializer(serializers.ModelSerializer):
    class Meta:
        model = MenuField
        fields = ["id", "menu", "field_name"]


class MenuSerializer(serializers.ModelSerializer):
    custom_fields = MenuFieldSerializer(many=True, read_only=True)
    images = MenuImageSerializer(many=True, read_only=True)
    uploaded_images = serializers.ListField(
        child=serializers.ImageField(
            max_length=100000, allow_empty_file=False, use_url=False
        ),
        write_only=True,
        required=False,
    )

    class Meta:
        model = Menu
        fields = [
            "id",
            "name",
            "category",
            "vendor",
            "menu_value",
            "menu_type",
            "images",
            "uploaded_images",
            "custom_fields",
            "created_at",
            "updated_at",
        ]

    read_only_fields = ["created_at", "updated_at"]

    def validate(self, data):
        data_copy = data.copy()
        data_copy.pop("uploaded_images", None)

        instance = Menu(**data_copy)
        try:
            instance.clean()
        except ValidationError as e:
            raise serializers.ValidationError(e.message_dict)
        return data

    def create(self, validated_data):
        images = validated_data.pop("uploaded_images", [])
        menu = Menu.objects.create(**validated_data)
        for image in images:
            MenuImage.objects.create(menu=menu, image=image)
        return menu

    def update(self, instance, validated_data):
        uploaded_images = validated_data.pop("uploaded_images", [])
        instance = super().update(instance, validated_data)

        # Get existing image IDs
        existing_ids = [img.id for img in instance.images.all()]

        # Get kept_image_ids from request (not validated_data)
        kept_ids_raw = self.context["request"].data.get("kept_image_ids", "")
        if isinstance(kept_ids_raw, str):
            kept_ids = list(map(int, filter(None, kept_ids_raw.split(","))))
        elif isinstance(kept_ids_raw, list):
            kept_ids = list(map(int, kept_ids_raw))
        else:
            kept_ids = []

        # Save new uploaded images
        for img in uploaded_images:
            MenuImage.objects.create(menu=instance, image=img)

        # Delete images not in kept_ids
        to_remove = set(existing_ids) - set(kept_ids)
        if to_remove:
            MenuImage.objects.filter(menu=instance, id__in=to_remove).delete()

        return instance

    def __init__(self, *args, **kwargs):
        super(MenuSerializer, self).__init__(*args, **kwargs)
        request = self.context.get("request")
        if request and request.method == "POST":
            self.Meta.depth = 0
        else:
            self.Meta.depth = 1


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
