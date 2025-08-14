from django.contrib import admin

from .models import Category, Menu, MenuField


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "vendor")
    search_fields = ("name", "vendor__name")
    ordering = ("name",)


class MenuFieldInline(admin.TabularInline):
    model = MenuField
    extra = 1


@admin.register(Menu)
class MenuAdmin(admin.ModelAdmin):
    list_display = ("name", "category", "vendor", "menu_type", "created_at")
    search_fields = ("name", "category__name", "vendor__name")
    list_filter = ("menu_type", "vendor", "category")
    ordering = ("-created_at",)

    readonly_fields = ("created_at", "updated_at")

    inlines = [MenuFieldInline]

    fieldsets = (
        (None, {"fields": ("vendor", "category", "name", "menu_type", "menu_value")}),
        (
            "Timestamps",
            {
                "fields": ("created_at", "updated_at"),
                "classes": ("collapse",),
            },
        ),
    )
