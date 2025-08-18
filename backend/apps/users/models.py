import uuid

from apps.role.models import Role  # adjust import
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django.db import models
from django.utils import timezone
from django.utils.translation import gettext_lazy as _

from .managers import CustomUserManager


class User(AbstractBaseUser, PermissionsMixin):
    BUSINESS_TYPES = [
        ("restaurant", "Restaurant"),
        ("shop", "Shop"),
        ("hospital", "Hospital"),
        ("warehouse", "Warehouse"),
        ("factory", "Factory"),
        ("transport", "Transport"),
    ]

    pkid = models.BigAutoField(primary_key=True, editable=True)
    id = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    username = models.CharField(
        max_length=150, unique=True, blank=True, null=True, verbose_name=_("Username")
    )
    first_name = models.CharField(verbose_name=_("First Name"), max_length=255)
    last_name = models.CharField(verbose_name=_("Last Name"), max_length=255)
    email = models.EmailField(
        verbose_name=_("Email"), max_length=255, db_index=True, unique=True
    )
    business_type = models.CharField(
        max_length=50,
        choices=BUSINESS_TYPES,
        verbose_name=_("Business Type"),
        null=True,
        blank=True,
    )
    role = models.ForeignKey(Role, on_delete=models.CASCADE, null=True, blank=True)

    otp = models.CharField(max_length=1000, null=True, blank=True)
    reset_token = models.CharField(max_length=1000, null=True, blank=True)
    is_staff = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    date_joined = models.DateTimeField(default=timezone.now)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["first_name", "last_name"]

    objects = CustomUserManager()

    class Meta:
        verbose_name = _("user")
        verbose_name_plural = _("users")
        # Optional: ordering = ['-date_joined']

    def __str__(self):
        return self.get_full_name or self.email

    @property
    def get_full_name(self):
        return f"{self.first_name.title()} {self.last_name.title()}"

    @property
    def get_short_name(self):
        return self.first_name

    def save(self, *args, **kwargs):
        if not self.username:
            try:
                email_username, _ = self.email.split("@")
                self.username = email_username
            except Exception:
                # fallback or raise error as needed
                self.username = None
        super().save(*args, **kwargs)
