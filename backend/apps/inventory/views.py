from apps.categories.models import Category
from rest_framework import status, viewsets
from rest_framework.decorators import action, api_view
from rest_framework.response import Response

from .models import Product, Sale, Stock, StockMovement, Warehouse
from .serializers import (
    ProductSerializer,
    SaleSerializer,
    StockMovementSerializer,
    StockSerializer,
    WarehouseSerializer,
)


@api_view(["POST"])
def create_product_for_category(request, category_id):
    try:
        category = Category.objects.get(id=category_id)
    except Category.DoesNotExist:
        return Response(
            {"detail": "Category not found."}, status=status.HTTP_404_NOT_FOUND
        )

    if not category.tools:
        return Response(
            {"detail": "Category has no tools defined."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    data = request.data.copy()
    data["category"] = str(category.id)

    # If client provided "tool", use it; otherwise default to first tool
    incoming_tool = data.get("tool")
    if incoming_tool in category.tools:
        data["tool"] = incoming_tool
    else:
        data["tool"] = category.tools[0]

    serializer = ProductSerializer(data=data, context={"request": request})
    serializer.is_valid(raise_exception=True)
    serializer.save()
    return Response(serializer.data, status=status.HTTP_201_CREATED)


class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer

    @action(detail=True, methods=["get"])
    def tools(self, request, pk=None):
        product = self.get_object()
        tools = product.category.tools
        return Response(tools, status=status.HTTP_200_OK)

    def perform_create(self, serializer):
        vendor = self.request.user.vendor  # or however your user relates to vendor
        serializer.save(vendor=vendor)


class SaleViewSet(viewsets.ModelViewSet):
    queryset = Sale.objects.all()
    serializer_class = SaleSerializer

    @action(detail=True, methods=["post"])
    def process_sale(self, request, pk=None):
        sale = self.get_object()
        sale.process_sale()
        return Response({"status": "sale processed"}, status=status.HTTP_200_OK)

    def perform_create(self, serializer):
        vendor = self.request.user.vendor  # or however your user relates to vendor
        serializer.save(vendor=vendor)


class StockViewSet(viewsets.ModelViewSet):
    queryset = Stock.objects.all()
    serializer_class = StockSerializer

    def perform_create(self, serializer):
        vendor = self.request.user.vendor  # or however your user relates to vendor
        serializer.save(vendor=vendor)


class StockMovementViewSet(viewsets.ModelViewSet):
    queryset = StockMovement.objects.all()
    serializer_class = StockMovementSerializer

    def perform_create(self, serializer):
        vendor = self.request.user.vendor  # or however your user relates to vendor
        serializer.save(vendor=vendor)


class WarehouseViewSet(viewsets.ModelViewSet):
    queryset = Warehouse.objects.all()
    serializer_class = WarehouseSerializer

    def perform_create(self, serializer):
        vendor = self.request.user.vendor  # or however your user relates to vendor
        serializer.save(vendor=vendor)
