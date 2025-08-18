from django.db import models


class RoleType(models.TextChoices):
    MANAGER = "manager", "Manager"
    USER = "user", "User"
    ADMIN = "admin", "Admin"
    CASHIER = "cashier", "Cashier"
    CHEF = "chef", "Chef"
    WAITER = "waiter", "Waiter"
    CLEANER = "cleaner", "Cleaner"


class Role(models.Model):
    key = models.CharField(max_length=50, unique=True)
    label = models.CharField(max_length=100)

    def __str__(self):
        return self.label

    @classmethod
    def get_default_role(cls):
        # Ensure default 'user' role exists and return it
        role, created = cls.objects.get_or_create(
            key=RoleType.USER,
            defaults={"label": RoleType.USER.label},
        )
        return role

    @classmethod
    def get_default_admin_role(cls):
        # Ensure default 'manager' role exists and return it
        role, created = cls.objects.get_or_create(
            key=RoleType.ADMIN,
            defaults={"label": RoleType.ADMIN.label},
        )
        return role

    @classmethod
    def get_choices(cls):
        # Return all roles as (key, label) tuples
        return list(cls.objects.values_list("key", "label"))
