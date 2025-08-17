import uuid

from apps.role.models import Role
from django.contrib.auth import get_user_model
from django.db import models
from django.utils.functional import cached_property
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
    role = models.ForeignKey(Role, on_delete=models.CASCADE)
    salary = models.DecimalField(max_digits=10, decimal_places=2)
    start_day = models.DateField()
    end_day = models.DateField(null=True, blank=True)
    agreement = models.FileField(upload_to="agreements/", blank=True, null=True)
    attribute = models.JSONField()

    class Meta:
        abstract = True
