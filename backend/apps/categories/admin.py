from django.contrib import admin

from .models import Attribute, AttributeValue, Category


# Inline admin for AttributeValue (attached to Attribute only)
class AttributeValueInline(admin.TabularInline):  # You can use StackedInline too
    model = AttributeValue
    extra = 1
    classes = ["tabler-card"]
    min_num = 1
    verbose_name = "Attribute Value"
    verbose_name_plural = "Attribute Values"


# Category admin (optional customization)
@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("name",)
    search_fields = ("name",)
    ordering = ("name",)


# Attribute admin with inline AttributeValue management
@admin.register(Attribute)
class AttributeAdmin(admin.ModelAdmin):
    list_display = ("name", "tool_key", "category", "attribute_type", "created_at")
    list_filter = ("category", "attribute_type")
    search_fields = ("name", "tool_key", "category__name")
    ordering = ("-created_at",)
    inlines = [AttributeValueInline]


# IMPORTANT: Don't register AttributeValue separately
# That prevents it from appearing independently in admin
try:
    admin.site.unregister(AttributeValue)
except admin.sites.NotRegistered:
    pass
