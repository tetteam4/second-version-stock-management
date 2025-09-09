from rest_framework import serializers

from .models import Attribute, AttributeValue, Category


class AttributeValueSerializer(serializers.ModelSerializer):
    class Meta:
        model = AttributeValue
        fields = ["id", "attribute", "attribute_value", "created_at", "updated_at"]
        read_only_fields = ["id", "created_at", "updated_at"]

    def validate(self, data):
        request = self.context["request"]
        vendor = request.user.vendor

        attribute = data.get("attribute")
        if attribute.vendor != vendor:
            raise serializers.ValidationError(
                "You can only assign values to your own attributes."
            )
        return data

    def create(self, validated_data):
        validated_data["vendor"] = self.context["request"].user.vendor
        return super().create(validated_data)


class AttributeSerializer(serializers.ModelSerializer):

    class Meta:
        model = Attribute
        fields = [
            "id",
            "name",
            "tool_key",
            "attribute_type",
            "attribute_value",
            "category",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def validate(self, data):
        request = self.context["request"]
        vendor = request.user.vendor

        category = data.get("category")
        if category.vendor != vendor:
            raise serializers.ValidationError(
                "You can only assign attributes to your own categories."
            )
        return data

    def create(self, validated_data):
        validated_data["vendor"] = self.context["request"].user.vendor
        return super().create(validated_data)


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["id", "name", "tools", "created_at", "updated_at"]
        read_only_fields = ["id", "created_at", "updated_at"]

    def create(self, validated_data):
        validated_data["vendor"] = self.context["request"].user.vendor
        return super().create(validated_data)
