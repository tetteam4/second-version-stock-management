from django.db import models


class Table(models.Model):
    field_name = models.CharField(max_length=255)

    class Meta:
        abstract = True
