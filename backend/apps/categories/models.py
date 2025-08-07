from apps.common.models import TimeStampedModel
from apps.vendor.models import Vendor
from django.core.exceptions import ValidationError
from django.db import models
from django.utils.translation import gettext_lazy as _


class Category(TimeStampedModel):
    vendor = models.ForeignKey(
        Vendor,
        on_delete=models.CASCADE,
        related_name="categories",
        null=False,  # ✅ Required
        blank=False,
    )
    name = models.CharField(max_length=255)
    tools = models.JSONField(blank=True, default=list)

    class Meta:
        verbose_name = _("Category")
        verbose_name_plural = _("Categories")
        ordering = ["name"]
        unique_together = (
            "vendor",
            "name",
        )  # ✅ Optional: Prevent same category name per vendor

    def __str__(self):
        return self.name


class Attribute(models.Model):
    class AttributeChoiceType(models.TextChoices):
        DROPDOWN = "dropdown", "Dropdown"
        DATE = "date", "Date"
        CHECKBOX = "checkbox", "Checkbox"
        INPUT = "input", "Input"

    name = models.CharField(max_length=50)
    category = models.ForeignKey(
        Category, on_delete=models.CASCADE, related_name="attribute_types"
    )
    vendor = models.ForeignKey(
        Vendor, on_delete=models.CASCADE, related_name="attributes"
    )
    tool_key = models.CharField(
        max_length=100,
        help_text=_("Tool identifier from the tools array in the category."),
    )
    attribute_value = models.JSONField()
    attribute_type = models.CharField(
        max_length=10,
        choices=AttributeChoiceType.choices,
        default=AttributeChoiceType.INPUT,
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.category.name} → {self.tool_key})"

    def clean(self):
        # ✅ Ensure tool_key is valid
        if self.tool_key not in self.category.tools:
            raise ValidationError(
                f"The tool key '{self.tool_key}' does not exist in category '{self.category.name}'."
            )

        # ✅ Ensure vendor matches category.vendor
        if self.vendor != self.category.vendor:
            raise ValidationError(
                f"Vendor mismatch: Attribute vendor '{self.vendor}' must match the Category vendor '{self.category.vendor}'."
            )

        # ✅ Prevent duplicates
        existing = Attribute.objects.filter(
            name=self.name,
            category=self.category,
            tool_key=self.tool_key,
        ).exclude(pk=self.pk)

        if existing.exists():
            raise ValidationError(
                f"An attribute with the name '{self.name}' already exists for tool '{self.tool_key}' in category '{self.category.name}'."
            )

        super().clean()

    class Meta:
        unique_together = ["name", "category", "tool_key"]
        ordering = ["-category", "tool_key"]


class AttributeValue(models.Model):
    vendor = models.ForeignKey(
        Vendor, on_delete=models.CASCADE, related_name="attribute_values"
    )
    attribute = models.ForeignKey(
        Attribute,
        on_delete=models.CASCADE,
        related_name="attribute_values",
    )
    attribute_value = models.CharField(max_length=255)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        attr_name = self.attribute.name if self.attribute else "N/A"
        return f"{self.attribute_value} (for {attr_name})"

    def clean(self):
        if not self.attribute_id:
            return

        # ✅ Ensure vendor matches attribute.vendor
        if self.vendor != self.attribute.vendor:
            raise ValidationError(
                f"Vendor mismatch: AttributeValue vendor '{self.vendor}' must match the Attribute vendor '{self.attribute.vendor}'."
            )

        # ✅ Prevent duplicates
        existing = AttributeValue.objects.filter(
            attribute=self.attribute, attribute_value=self.attribute_value
        ).exclude(pk=self.pk)

        if existing.exists():
            attr_name = self.attribute.name if self.attribute else "N/A"
            raise ValidationError(
                f"An attribute value '{self.attribute_value}' already exists for the attribute '{attr_name}'."
            )

        super().clean()

    class Meta:
        unique_together = ["attribute", "attribute_value"]
        ordering = ["-attribute"]
