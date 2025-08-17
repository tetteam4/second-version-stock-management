from django.db import models
from django.utils.functional import cached_property


class RoleType(models.TextChoices):
    MANAGER = "manager", "Manager"
    CASHIER = "cashier", "Cashier"
    CHEF = "chef", "Chef"
    WAITER = "waiter", "Waiter"
    CLEANER = "cleaner", "Cleaner"


class RoleTypeModel(models.Model):
    key = models.CharField(max_length=50, unique=True)
    label = models.CharField(max_length=50)

    def __str__(self):
        return self.label


class Role(models.Model):
    role = models.CharField(max_length=50)

    class Meta:
        abstract = True

    @classmethod
    def get_role_choices(cls):
        # Get DB choices as list of tuples (key, label)
        db_choices = list(RoleTypeModel.objects.values_list("key", "label"))

        # Combine DB choices with default RoleType choices, avoiding duplicates
        default_choices = [(choice.value, choice.label) for choice in RoleType]

        # Create dict for fast lookup
        choices_dict = {k: v for k, v in default_choices}
        # Update/append with db_choices (overriding defaults if keys match)
        for k, v in db_choices:
            choices_dict[k] = v

        # Return as list of tuples sorted or in insertion order
        return list(choices_dict.items())

    @classmethod
    def set_role_field_choices(cls):
        # Assign choices dynamically to the field
        cls._meta.get_field("role").choices = cls.get_role_choices()
