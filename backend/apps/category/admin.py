from django.contrib import admin

from .models import AttributeType, AttributeValue, Category

admin.site.register(AttributeType)
admin.site.register(AttributeValue)
admin.site.register(Category)
