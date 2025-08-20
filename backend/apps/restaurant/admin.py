from django.contrib import admin

from .models import Category, Menu, MenuField, Order, OrderItem,Staff,StaffManagement


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


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 1  # how many empty forms to show
    readonly_fields = []  # if you want to make some fields readonly


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ["id", "customer", "vendor", "status", "created_at", "updated_at"]
    list_filter = ["status", "vendor"]
    search_fields = ["customer", "vendor__name"]
    readonly_fields = ["created_at", "updated_at"]
    inlines = [OrderItemInline]


@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = ["order", "menu", "quantity"]
    search_fields = ["order__customer", "menu__name"]
# admin.site.register(Staff)
admin.site.register(StaffManagement)