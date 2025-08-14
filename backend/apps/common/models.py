import uuid

from django.contrib.auth import get_user_model
from django.db import models
from django.utils.translation import gettext_lazy as _
from django_countries.fields import CountryField

User = get_user_model()


class TimeStampedModel(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class Location(models.Model):
    country = CountryField(
        verbose_name=_("country"), default="Af", blank=True, null=True
    )
    city = models.CharField(
        verbose_name=_("city"), max_length=255, default="Kabul", blank=True, null=True
    )
    state = models.CharField(
        verbose_name=_("state"), max_length=100, blank=True, null=True
    )
    address = models.CharField(
        verbose_name=_("address"), max_length=255, blank=True, null=True
    )

    class Meta:
        abstract = True


class Business(models.Model):
    BUSINESS_TYPES = [
        ("restaurant", "Restaurant"),
        ("shop", "Shop"),
        ("hospital", "Hospital"),
        ("warehouse", "Warehouse"),
        ("factory", "Factory"),
        ("transport", "Transport"),
    ]

    name = models.CharField(max_length=255)
    business_type = models.CharField(max_length=50, choices=BUSINESS_TYPES)

    class Meta:
        abstract = True


class Staff(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    business = models.ForeignKey(Business, on_delete=models.CASCADE)
    role = models.CharField(max_length=50)

    class Meta:
        abstract = True


class Role(models.Model):
    class RoleType(models.TextChoices):
        MANAGER = "manager", "Manager"
        CASHIER = "cashier", "Cashier"
        CHEF = "chef", "Chef"
        WAITER = "waiter", "Waiter"
        CLEANER = "cleaner", "Cleaner"

    role = models.CharField(max_length=50, choices=RoleType.choices)

    class Meta:
        abstract = True
