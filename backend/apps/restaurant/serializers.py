from apps.users.serializers import UserSerializer
from apps.vendor.models import Vendor
from apps.vendor.serializers import VendorSerializer
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from rest_framework import serializers

from .models import Category, Menu, MenuField, Order, OrderItem, Role, StaffManagement
from .utils import get_default_manager_role

User = get_user_model()


class CategorySerializer(serializers.ModelSerializer):
    vendor = VendorSerializer(read_only=True)  
    vendor_id = serializers.PrimaryKeyRelatedField(
        queryset=Vendor.objects.all(), 
        source="vendor",   # tells DRF that this field maps to the 'vendor' foreign key
        write_only=True    # only used for input, not output
    )

    class Meta:
        model = Category
        fields = ["id", "name", "vendor", "vendor_id"]

    

class MenuFieldSerializer(serializers.ModelSerializer):
    class Meta:
        model = MenuField
        fields = ["id", "menu", "field_name"]


class MenuSerializer(serializers.ModelSerializer):
    custom_fields = MenuFieldSerializer(many=True, read_only=True)

    class Meta:
        model = Menu
        fields = [
            "id",
            "name",
            "category",
            "vendor",
            "menu_value",
            "menu_type",
            "custom_fields",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["created_at", "updated_at"]

    def validate(self, data):

        instance = Menu(**data)
        try:
            instance.clean()
        except ValidationError as e:
            raise serializers.ValidationError(e.message_dict)
        return data

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
        role = Role.objects.get(key=role_key)
        validated_data["role"] = role
        # user will be set in view, not here
        return StaffManagement.objects.create(**validated_data)

    def update(self, instance, validated_data):
        if "role" in validated_data:
            role_key = validated_data.pop("role")
            role = Role.objects.get(key=role_key)
            validated_data["role"] = role
        return super().update(instance, validated_data)
