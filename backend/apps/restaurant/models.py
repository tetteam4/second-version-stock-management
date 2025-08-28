from apps.category.models import AttributeType, Category
from apps.common.models import Staff, TimeStampedModel
from apps.vendor.models import Vendor
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.db import models
from django.db.models import F, FloatField, Sum
from django.utils.translation import gettext_lazy as _

User = get_user_model()


class Menu(TimeStampedModel):
    class MenuChoiceType(models.TextChoices):
        DROPDOWN = "dropdown", "Dropdown"
        CHECKBOX = "checkbox", "Checkbox"
        INPUT = "input", "Input"

    vendor = models.ForeignKey(
        Vendor,
        on_delete=models.CASCADE,
        related_name="menus",
    )
    category = models.ForeignKey(
        Category,
        on_delete=models.CASCADE,
        related_name="menus",
    )
    name = models.CharField(max_length=255)
    choice_type = models.CharField(
        max_length=20,
        choices=MenuChoiceType.choices,
        default=MenuChoiceType.DROPDOWN,
    )
    attributes = models.ManyToManyField(
        AttributeType,
        related_name="menus",
        blank=True,
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.vendor})"

    class Meta:
        unique_together = ("vendor", "name")


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
    price = models.DecimalField(max_digits=10, decimal_places=2)

    def clean(self):
        if self.quantity < 1:
            raise ValidationError("Quantity must be at least 1.")
        if self.price <= 0:
            raise ValidationError("Price must be positive.")

    def __str__(self):
        return f"{self.quantity}x {self.menu.name}"

    class Meta:
        unique_together = ("order", "menu")


class RoleType(models.TextChoices):
    MANAGER = "manager", "Manager"
    CASHIER = "cashier", "Cashier"
    CHEF = "chef", "Chef"
    WAITER = "waiter", "Waiter"
    CLEANER = "cleaner", "Cleaner"


class RestaurantRole(models.Model):
    key = models.CharField(max_length=50, unique=True)
    label = models.CharField(max_length=100)

    def __str__(self):
        return self.label

    @classmethod
    def get_choices(cls):
        # Return all roles as (key, label) tuples
        return list(cls.objects.values_list("key", "label"))


class StaffManagement(Staff):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    vendor = models.ForeignKey(Vendor, on_delete=models.CASCADE, related_name="staff")
    role = models.ForeignKey(
        RestaurantRole, on_delete=models.CASCADE, related_name="role"
    )

    def __str__(self):
        user_name = (
            self.user.get_full_name()
            if callable(self.user.get_full_name)
            else self.user.get_full_name
        )
        role_label = self.role.label() if callable(self.role.label) else self.role.label
        return f"{user_name} - {role_label}"


class MultiImages(models.Model):
    category = models.ForeignKey(
        Category, on_delete=models.CASCADE, related_name="multi_images"
    )
    image = models.ImageField(upload_to="category/", null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.category.name } - {self.image.url}"


class MenuImage(TimeStampedModel):
    menu = models.ForeignKey(Menu, on_delete=models.CASCADE, related_name="images")
    image = models.ImageField(upload_to="menu/")
