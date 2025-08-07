from decimal import Decimal

from apps.categories.models import AttributeValue, Category
from django.db import transaction
from rest_framework import serializers

from .models import Product, Sale, Stock, StockMovement, Warehouse


class CategoryReadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ("id", "name")


class AttributeValueSlugSerializer(serializers.ModelSerializer):
    class Meta:
        model = AttributeValue
        fields = ("id", "attribute_value")


class ProductSerializer(serializers.ModelSerializer):
    tool = serializers.CharField(max_length=100, required=False)

    class Meta:
        model = Product
        fields = [
            "id",
            "tool",
            "sku",
            "category",
            "attributes",
            "description",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ("sku", "created_at", "updated_at")

    def validate_tool(self, value):
        """
        Ensure client-provided 'tool' exists in the intended category's tools list.
        This runs before object-level validation.
        """
        category = self.initial_data.get("category")
        if not category:
            return value
        try:
            cat_obj = Category.objects.get(id=category)
        except Category.DoesNotExist:
            raise serializers.ValidationError("Category not found.")
        if value not in cat_obj.tools:
            raise serializers.ValidationError(
                f"Tool '{value}' is not in {{cat_obj.tools}}."
            )
        return value

    def create(self, validated_data):
        # Accept client 'tool' if valid, else default to tools[0]
        category = validated_data.get("category")
        tools = getattr(category, "tools", [])
        tool = validated_data.get("tool")
        validated_data["tool"] = (
            tool if tool in tools else (tools[0] if tools else tool)
        )
        return super().create(validated_data)


class WarehouseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Warehouse
        fields = ("id", "name", "location", "created_at", "updated_at")
        read_only_fields = ("created_at", "updated_at")


class StockSerializer(serializers.ModelSerializer):
    product = serializers.PrimaryKeyRelatedField(queryset=Product.objects.all())
    warehouse = serializers.PrimaryKeyRelatedField(queryset=Warehouse.objects.all())

    class Meta:
        model = Stock
        fields = (
            "id",
            "product",
            "warehouse",
            "purchase_price_per_unit",
            "commission_percent",
            "quantity",
            "created_at",
            "updated_at",
        )
        validators = [
            serializers.UniqueTogetherValidator(
                queryset=Stock.objects.all(), fields=("product", "warehouse")
            )
        ]
        read_only_fields = ("created_at", "updated_at")


class StockMovementSerializer(serializers.ModelSerializer):
    product = serializers.PrimaryKeyRelatedField(queryset=Product.objects.all())
    from_warehouse = serializers.PrimaryKeyRelatedField(
        queryset=Warehouse.objects.all(), required=False, allow_null=True
    )
    to_warehouse = serializers.PrimaryKeyRelatedField(
        queryset=Warehouse.objects.all(), required=False, allow_null=True
    )

    class Meta:
        model = StockMovement
        fields = (
            "id",
            "product",
            "movement_type",
            "from_warehouse",
            "to_warehouse",
            "quantity",
            "remarks",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("created_at", "updated_at")

    def validate(self, data):
        mt = data.get("movement_type")
        fw, tw = data.get("from_warehouse"), data.get("to_warehouse")

        errors = {}
        if mt == StockMovement.MovementType.TRANSFER:
            if not fw or not tw:
                errors["non_field_errors"] = (
                    "Transfer requires both from_warehouse and to_warehouse"
                )
            elif fw == tw:
                errors["non_field_errors"] = "Source and destination must differ"
        elif mt == StockMovement.MovementType.IN and not tw:
            errors["to_warehouse"] = "Incoming must have to_warehouse"
        elif mt == StockMovement.MovementType.OUT and not fw:
            errors["from_warehouse"] = "Outgoing must have from_warehouse"

        if errors:
            raise serializers.ValidationError(errors)
        return data


class SaleSerializer(serializers.ModelSerializer):
    product = serializers.PrimaryKeyRelatedField(queryset=Product.objects.all())

    commission_percent = serializers.SerializerMethodField(read_only=True)
    total_revenue = serializers.SerializerMethodField(read_only=True)
    total_cost = serializers.SerializerMethodField(read_only=True)
    company_profit = serializers.SerializerMethodField(read_only=True)
    seller_profit = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Sale
        fields = (
            "id",
            "product",
            "quantity",
            "selling_price_per_unit",
            "commission_percent",
            "total_revenue",
            "total_cost",
            "seller_profit",
            "company_profit",
            "created_at",
            "updated_at",
        )
        read_only_fields = (
            "commission_percent",
            "total_revenue",
            "total_cost",
            "seller_profit",
            "company_profit",
            "created_at",
            "updated_at",
        )

    def validate(self, data):
        qty = data.get("quantity")
        spu = data.get("selling_price_per_unit")

        errors = {}
        if qty is None or qty <= 0:
            errors["quantity"] = "Quantity must be positive"
        if spu is None:
            errors["selling_price_per_unit"] = "This field is required"

        product = data.get("product")
        stock = None
        if product:
            stock = product.stock_set.first()
            if not stock:
                errors["product"] = "No stock entry found for this product"
            elif stock.quantity < qty:
                errors["quantity"] = "Not enough stock"

        if errors:
            raise serializers.ValidationError(errors)

        return data

    def get_commission_percent(self, obj):
        try:
            stock = obj.get_stock()
            return stock.commission_percent
        except Exception:
            return None

    def get_total_revenue(self, obj):
        return obj.get_total_revenue()

    def get_total_cost(self, obj):
        return obj.get_total_cost()

    def get_company_profit(self, obj):
        return obj.get_company_profit()

    def get_seller_profit(self, obj):
        return obj.get_seller_profit()

    @transaction.atomic
    def create(self, validated_data):
        sale = Sale(**validated_data)
        sale.process_sale()
        return sale
