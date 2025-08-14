from django.apps import AppConfig
from django.utils.translation import gettext_lazy as _


class TableConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.table"
    verbose_name = _("Table")
