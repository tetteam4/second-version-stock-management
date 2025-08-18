from django.db import models


class Business(models.Model):
    BUSINESS_TYPES = [
        ("restaurant", "Restaurant"),
        ("shop", "Shop"),
        ("hospital", "Hospital"),
        ("warehouse", "Warehouse"),
        ("factory", "Factory"),
        ("transport", "Transport"),
    ]

    name = models.CharField(max_length=255)
    business_type = models.CharField(max_length=50, choices=BUSINESS_TYPES)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # class Meta:
    #     abstract = True
