# admin.py
from django import forms
from django.contrib import admin

from .models import Product, Sale, Stock, StockMovement, Warehouse


@admin.register(Warehouse)
class WarehouseAdmin(admin.ModelAdmin):
    list_display = ("name", "location")
    search_fields = ("name", "location")


@admin.register(Stock)
class StockAdmin(admin.ModelAdmin):
    list_display = ("product", "warehouse", "quantity")
    list_filter = ("warehouse", "product")
    search_fields = ("product__tool", "warehouse__name")


@admin.register(StockMovement)
class StockMovementAdmin(admin.ModelAdmin):
    list_display = (
        "movement_type",
        "product",
        "quantity",
        "from_warehouse",
        "to_warehouse",
        "created_at",
    )
    list_filter = ("movement_type", "from_warehouse", "to_warehouse", "product")
    search_fields = ("product__tool",)
    readonly_fields = ("created_at", "updated_at")

    def get_readonly_fields(self, request, obj=None):
        if obj:
            return self.readonly_fields + ("movement_type",)
        return self.readonly_fields


@admin.register(Sale)
class SaleAdmin(admin.ModelAdmin):
    list_display = (
        "product",
        "quantity",
        "selling_price_per_unit",
        "company_profit",
        "seller_profit",
        "created_at",
    )
    readonly_fields = ("company_profit", "seller_profit", "created_at", "updated_at")
    search_fields = ("product__tool",)
    list_filter = ("product",)

    def company_profit(self, obj):
        try:
            return f"${obj.get_company_profit():.2f}"
        except Exception:
            return "-"

    company_profit.short_description = "Company Profit"

    def seller_profit(self, obj):
        try:
            return f"${obj.get_seller_profit():.2f}"
        except Exception:
            return "-"

    seller_profit.short_description = "Seller Profit"

    def save_model(self, request, obj, form, change):
        obj.process_sale()


class ProductAdminForm(forms.ModelForm):
    class Meta:
        model = Product
        fields = "__all__"

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        # Only try to customize the tool widget if instance has a saved category
        if (
            self.instance
            and hasattr(self.instance, "category")
            and self.instance.category_id
        ):
            try:
                tools = self.instance.category.tools or []
                self.fields["tool"].widget = forms.Select(
                    choices=[(t, t) for t in tools]
                )
            except Exception:
                self.fields["tool"].widget = forms.TextInput(
                    attrs={"placeholder": "Error loading tools"}
                )
        else:
            self.fields["tool"].widget = forms.TextInput(
                attrs={"placeholder": "Select category and save first"}
            )


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    form = ProductAdminForm
    list_display = ("sku", "category", "tool")
    list_filter = ("category",)
    search_fields = ("sku",)
