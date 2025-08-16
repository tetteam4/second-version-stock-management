from django.db import models


# Create your models here.
class RoleTypeModel(models.Model):
    key = models.CharField(max_length=50, unique=True)
    label = models.CharField(max_length=50)

    def __str__(self):
        return self.label


class Role(models.Model):
    role = models.CharField(max_length=50)

    def get_role_choices():
        return [(role.key, role.label) for role in RoleTypeModel.objects.all()]

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._meta.get_field("role").choices = self.get_role_choices()

    class Meta:
        abstract = True
