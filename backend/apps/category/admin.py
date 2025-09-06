from django.contrib import admin

from .models import AttributeType, AttributeValue, Category, Menu

admin.site.register(AttributeType)
admin.site.register(AttributeValue)
admin.site.register(Category)
admin.site.register(Menu)
