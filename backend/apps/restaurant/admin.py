from django.contrib import admin

from .models import MultiImages, Order, OrderItem, RestaurantRole, StaffManagement

admin.site.register(MultiImages)


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


@admin.register(StaffManagement)
class StaffManagementAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "user",
        "vendor",
        "role",
        "salary",
        "start_day",
        "end_day",
        "status",
    )
    list_filter = ("vendor", "role", "status")
    search_fields = (
        "user__username",
        "user__email",
        "user__first_name",
        "user__last_name",
    )
    ordering = ("-start_day",)


admin.site.register(RestaurantRole)
