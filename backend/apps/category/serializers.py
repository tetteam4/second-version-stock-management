from apps.restaurant.models import MultiImages
from apps.restaurant.serializers import MultiImagesSerializer
from apps.vendor.models import Vendor
from rest_framework import serializers

from .models import AttributeType, AttributeValue, Category


class CategorySerializer(serializers.ModelSerializer):
    stages = serializers.ListField(child=serializers.CharField())
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
            "stages",
            "created_at",
            "multi_images",
            "uploaded_images",
            "updated_at",
        ]
        ref_name = "GroupCategorySerializer"

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


class AttributeTypeSerializer(serializers.ModelSerializer):
    category = serializers.PrimaryKeyRelatedField(queryset=Category.objects.all())
    attribute_type = serializers.ChoiceField(
        choices=AttributeType.ATTRIBUTE_CHOICE_TYPE,
        default="select attribute type",
    )

    class Meta:
        model = AttributeType
        fields = [
            "id",
            "name",
            "category",
            "attribute_type",
            "created_at",
            "updated_at",
        ]


class AttributeValueSerializer(serializers.ModelSerializer):
    attribute = serializers.PrimaryKeyRelatedField(queryset=AttributeType.objects.all())

    class Meta:
        model = AttributeValue
        fields = [
            "id",
            "attribute",
            "attribute_value",
            "created_at",
            "updated_at",
        ]
