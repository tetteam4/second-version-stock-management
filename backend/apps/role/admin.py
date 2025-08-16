from django.contrib import admin

from .models import Role, RoleTypeModel

# Register your models here.


class RoleAdmin(admin.ModelAdmin):
    def formfield_for_choice_field(self, db_field, request, **kwargs):
        if db_field.name == "role":
            kwargs["choices"] = [(r.key, r.label) for r in RoleTypeModel.objects.all()]
        return super().formfield_for_choice_field(db_field, request, **kwargs)


admin.site.register(RoleTypeModel)
# admin.site.register(Role, RoleAdmin)
