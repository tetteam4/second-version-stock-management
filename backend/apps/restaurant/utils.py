from .models import Role, RoleType


def get_default_manager_role():
    """
    Get or create the default 'manager' role.
    """
    role, created = Role.objects.get_or_create(
        key=RoleType.MANAGER, defaults={"label": RoleType.MANAGER.label}
    )
    return role
