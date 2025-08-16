from django.urls import path

from . import views

urlpatterns = [
    path("", views.VendorRegister.as_view(), name="vendor-register"),
    path(
        "vendor-subdomain/",
        views.VendorSubdomainView.as_view(),
        name="vendor-subdomain",
    ),
]
