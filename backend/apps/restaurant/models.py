from apps.common.models import Location, Staff, TimeStampedModel
from apps.role.models import Role
from apps.table.models import Table
from apps.vendor.models import Vendor
from django.core.exceptions import ValidationError
from django.db import models
from django.db.models import F, FloatField, Sum
from django.utils.timezone import now
from django.utils.translation import gettext_lazy as _


class Category(TimeStampedModel):
    vendor = models.ForeignKey(
        Vendor,
        on_delete=models.CASCADE,
        related_name="vendor_categories",
        null=False,
        blank=False,
    )
    name = models.CharField(max_length=255)

    class Meta:
        verbose_name = _("Category")
        verbose_name_plural = _("Categories")
        ordering = ["name"]
        unique_together = ("vendor", "name")

    def __str__(self):
        return self.name


class Menu(TimeStampedModel):
    class MenuChoiceType(models.TextChoices):
        DROPDOWN = "dropdown", "Dropdown"
        CHECKBOX = "checkbox", "Checkbox"
        INPUT = "input", "Input"

    name = models.CharField(max_length=50)
    category = models.ForeignKey(
        Category, on_delete=models.CASCADE, related_name="menu_types"
    )
    vendor = models.ForeignKey(Vendor, on_delete=models.CASCADE, related_name="menus")
    menu_value = models.JSONField()
    menu_type = models.CharField(
        max_length=10,
        choices=MenuChoiceType.choices,
        default=MenuChoiceType.INPUT,
    )

    def __str__(self):
        return f"{self.name} ({self.category.name})"

    def clean(self):
        # Skip validation if vendor or category.vendor is not yet assigned (e.g. during admin form save)
        if not self.vendor or not self.category or not self.category.vendor:
            super().clean()
            return

        if self.vendor != self.category.vendor:
            raise ValidationError(
                {
                    "vendor": f"Vendor mismatch: Menu vendor '{self.vendor}' must match category vendor '{self.category.vendor}'."
                }
            )

        existing = Menu.objects.filter(
            name=self.name,
            category=self.category,
        ).exclude(pk=self.pk)

        if existing.exists():
            raise ValidationError(
                {
                    "name": f"A menu named '{self.name}' already exists in category '{self.category.name}'."
                }
            )

        if self.menu_type == self.MenuChoiceType.DROPDOWN:
            if not isinstance(self.menu_value, list):
                raise ValidationError(
                    {"menu_value": "For 'dropdown' type, menu_value must be a list."}
                )
        elif self.menu_type == self.MenuChoiceType.CHECKBOX:
            if not isinstance(self.menu_value, bool):
                raise ValidationError(
                    {"menu_value": "For 'checkbox' type, menu_value must be a boolean."}
                )
        elif self.menu_type == self.MenuChoiceType.INPUT:
            if not isinstance(self.menu_value, str):
                raise ValidationError(
                    {"menu_value": "For 'input' type, menu_value must be a string."}
                )

        super().clean()

    class Meta:
        unique_together = ["name", "category"]
        ordering = ["-category"]


class MenuField(models.Model):
    menu = models.ForeignKey(
        Menu, related_name="custom_fields", on_delete=models.CASCADE
    )
    field_name = models.CharField(max_length=255)

    def __str__(self):
        return f"{self.field_name}"

    class Meta:

        verbose_name = "Menu Custom Field"
        verbose_name_plural = "Menu Custom Fields"


class Order(TimeStampedModel):
    class OrderStatus(models.TextChoices):
        PENDING = "pending", _("Pending")
        ACCEPTED = "accepted", _("Accepted")
        REJECTED = "rejected", _("Rejected")
        DELIVERED = "delivered", _("Delivered")
        CANCELLED = "cancelled", _("Cancelled")

    customer = models.CharField(max_length=300)
    vendor = models.ForeignKey(Vendor, on_delete=models.CASCADE, related_name="orders")
    status = models.CharField(
        max_length=20,
        choices=OrderStatus.choices,
        default=OrderStatus.PENDING,
    )
    notes = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"Order #{self.id} by {self.customer}"

    def total_price(self):
        return (
            self.items.aggregate(
                total=Sum(F("price") * F("quantity"), output_field=FloatField())
            )["total"]
            or 0
        )


class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="items")
    menu = models.ForeignKey(Menu, on_delete=models.CASCADE, related_name="order_items")
    quantity = models.PositiveIntegerField(default=1)
    selected_option = models.JSONField(blank=True, null=True)
    price = models.DecimalField(
        max_digits=10, decimal_places=2
    )  # Price per single item

    def clean(self):
        if self.quantity < 1:
            raise ValidationError("Quantity must be at least 1.")
        if self.price <= 0:
            raise ValidationError("Price must be positive.")

    def __str__(self):
        return f"{self.quantity}x {self.menu.name}"

    class Meta:
        unique_together = ("order", "menu")


from django.db import models
from django.utils.timezone import now

# import your User, Business, Role, Staff etc.


class StaffAttribute(models.Model):
    staff = models.ForeignKey(
        "restaurant.StaffManager",
        on_delete=models.CASCADE,
        related_name="custom_attributes",
    )
    field_name = models.CharField(max_length=255)
    value = models.JSONField()

    class Meta:
        unique_together = ("staff", "field_name")

    def __str__(self):
        return f"{self.field_name} for {self.staff.user.username}"


class StaffManager(Staff):  # assuming Staff is concrete or imported properly
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.user.username} - Manager at {self.business}"

    def clean(self):
        from django.core.exceptions import ValidationError

        salary = self.get_attribute("salary")
        if salary is not None and salary <= 0:
            raise ValidationError("Salary must be positive.")
        if self.end_day and self.end_day < self.start_day:
            raise ValidationError("End day cannot be before start day.")

    def is_current(self):
        today = now().date()
        return (
            self.is_active
            and self.start_day <= today
            and (not self.end_day or self.end_day >= today)
        )

    def get_attribute(self, field_name):
        if field_name in self.attribute:
            return self.attribute[field_name]

        attr = self.custom_attributes.filter(field_name=field_name).first()
        return attr.value if attr else None

    def set_attribute(self, field_name, value):
        self.attribute[field_name] = value
        self.save()

        StaffAttribute.objects.update_or_create(
            staff=self,
            field_name=field_name,
            defaults={"value": value},
        )
