from django.urls import path

from . import views

urlpatterns = [path("", views.VendorRegister.as_view(), name="vendor-register")]
