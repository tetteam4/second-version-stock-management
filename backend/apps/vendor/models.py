from django.db import models
from shortuuid.django_fields import ShortUUIDField
from django.utils.html import mark_safe
from django.utils.text import slugify

from apps.users.models import User
from .utils import user_directory_path


class Vendor(models.Model):
    user = models.OneToOneField(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name="vendor"
    )
    image = models.ImageField(
        upload_to=user_directory_path,
        default="shop-image.jpg",
        blank=True,
        null=True
    )
    name = models.CharField(
        max_length=100,
        help_text="Shop Name",
        null=True,
        blank=True
    )
    email = models.EmailField(
        max_length=100,
        help_text="Shop Email",
        null=True,
        blank=True
    )
    slug = models.SlugField(
        blank=True,
        null=True,
        db_index=True
    )
    description = models.TextField(
        null=True,
        blank=True
    )
    mobile = models.CharField(
        max_length=150,
        null=True,
        blank=True
    )
    verified = models.BooleanField(default=False)
    active = models.BooleanField(default=True)
    vid = ShortUUIDField(unique=True, length=10, max_length=20)
    date = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = "Vendors"

    def vendor_image(self):
        if self.image:
            return mark_safe(
                f'<img src="{self.image.url}" width="50" height="50" style="object-fit:cover; border-radius: 6px;" />'
            )
        return ""

    def __str__(self):
        return self.name or "Unnamed Vendor"

    def save(self, *args, **kwargs):
        if not self.slug and self.name:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def get_absolute_url(self):
        from django.urls import reverse
        return reverse("vendor_detail", kwargs={"slug": self.slug})
