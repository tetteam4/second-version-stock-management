from django.urls import include, path
from rest_framework.routers import DefaultRouter

from . import views
from .views import (
    ProductViewSet,
    SaleViewSet,
    StockMovementViewSet,
    StockViewSet,
    WarehouseViewSet,
)

router = DefaultRouter()
router.register('products', ProductViewSet)
router.register('sales', SaleViewSet)
router.register('stocks', StockViewSet)
router.register('stock-movements', StockMovementViewSet)
router.register('warehouses', WarehouseViewSet)

urlpatterns = [
    path('categories/<uuid:category_id>/products/', views.create_product_for_category, name='create_product_for_category'),
    path('', include(router.urls)),
]
