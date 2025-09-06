from apps.vendor.models import Vendor
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.db import models

User = get_user_model()


class Category(models.Model):
    vendor = models.ForeignKey(
        Vendor,
        on_delete=models.CASCADE,
        related_name="vendor_categories",
        null=False,
        blank=False,
    )
    name = models.CharField(max_length=255)
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name="categories")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = "Category"
        verbose_name_plural = "Categories"
        unique_together = ("vendor", "name")


class AttributeType(models.Model):
    ATTRIBUTE_CHOICE_TYPE = (
        ("dropdown", "dropdown"),
        ("checkbox", "checkbox"),
        ("input", "input"),
    )
    name = models.CharField(max_length=50)
    category = models.ForeignKey(
        Category, on_delete=models.CASCADE, default=1, related_name="attribute_types"
    )
    attribute_type = models.CharField(
        max_length=100, choices=ATTRIBUTE_CHOICE_TYPE, default="select attribute type"
    )
    vendor = models.ForeignKey(
        Vendor,
        on_delete=models.CASCADE,
        related_name="vendor_attribute",
        null=False,
        blank=False,
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

    def clean(self):
        if AttributeType.objects.filter(
            name=self.name, category=self.category
        ).exists():
            raise ValidationError(
                f"An attribute with the name '{self.name}' already exists in this category."
            )

    class Meta:
        unique_together = ["name", "category"]


class AttributeValue(models.Model):
    attribute = models.ForeignKey(
        AttributeType,
        on_delete=models.CASCADE,
        default=1,
        related_name="attribute_values",
    )
    attribute_value = models.CharField(max_length=255)
    vendor = models.ForeignKey(
        Vendor,
        on_delete=models.CASCADE,
        related_name="vendor_attribute_value",
        null=False,
        blank=False,
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.attribute_value

    def clean(self):
        if AttributeValue.objects.filter(
            attribute=self.attribute, attribute_value=self.attribute_value
        ).exists():
            raise ValidationError(
                f"An attribute value '{self.attribute_value}' already exists for this attribute."
            )

    class Meta:
        unique_together = ["attribute", "attribute_value"]


class Menu(models.Model):
    category = models.ForeignKey(
        Category, on_delete=models.CASCADE, related_name="menu_items"
    )
    vendor = models.ForeignKey(
        Vendor, on_delete=models.CASCADE, related_name="menu_items"
    )
    attributes = models.JSONField(default=dict)
    is_available = models.BooleanField(default=True)
    image = models.ImageField(upload_to="menu_images/", blank=True, null=True)

    def __str__(self):
        return self.category.name
