from django.urls import include, path
from rest_framework.routers import DefaultRouter

from . import views

router = DefaultRouter()
router.register("menus", views.MenuViewSet)
router.register("menu-fields", views.MenuFieldViewSet)
router.register("orders", views.OrderViewSet)
router.register("staff", views.StaffManagementViewSet, basename="staffmanagement")
urlpatterns = [
    path("", include(router.urls)),
    # path("orders/", views.OrderListCreateView.as_view(), name="order-list-create"),
    # path("orders/", views.OrderViewSet.as_view(), name="order-list-create"),
]
