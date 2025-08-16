from django.apps import AppConfig
from django.utils.translation import gettext_lazy as _


class RoleConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.role"
    verbose_name = _("Role")
