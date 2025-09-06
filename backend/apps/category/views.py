from django.shortcuts import render
from rest_framework import generics, permissions, status, viewsets
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import AttributeType, AttributeValue, Category, Menu
from .serializers import (
    AttributeTypeSerializer,
    AttributeValueSerializer,
    CategorySerializer,
    MenuSerializer,
)


# Create your views here.
class CategoryCreateView(generics.ListCreateAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [AllowAny]


class CategoryUpdateView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [AllowAny]


class CategoryDeleteView(generics.DestroyAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [AllowAny]


class AttributeValueListCreateView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        attribute_values = AttributeValue.objects.all()
        serializer = AttributeValueSerializer(attribute_values, many=True)
        return Response(serializer.data)

    def post(self, request):

        serializer = AttributeValueSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AttributeValueDetailView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, pk):

        try:
            attribute_value = AttributeValue.objects.get(pk=pk)
        except AttributeValue.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

        serializer = AttributeValueSerializer(attribute_value)
        return Response(serializer.data)

    def put(self, request, pk):

        try:
            attribute_value = AttributeValue.objects.get(pk=pk)
        except AttributeValue.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

        serializer = AttributeValueSerializer(attribute_value, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):

        try:
            attribute_value = AttributeValue.objects.get(pk=pk)
        except AttributeValue.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

        attribute_value.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class AttributeTypeListCreateView(generics.ListCreateAPIView):
    queryset = AttributeType.objects.all()
    serializer_class = AttributeTypeSerializer
    permission_classes = [AllowAny]


class AttributeTypeDetailView(generics.RetrieveUpdateDestroyAPIView):

    queryset = AttributeType.objects.all()
    serializer_class = AttributeTypeSerializer
    permission_classes = [AllowAny]


class CategoryAttributeView(generics.GenericAPIView):
    permission_classes = [AllowAny]

    def get(self, request, category_id):
        try:

            category = Category.objects.get(id=category_id)
        except Category.DoesNotExist:
            return Response(
                {"error": "Category not found"}, status=status.HTTP_404_NOT_FOUND
            )

        attribute_types = AttributeType.objects.filter(category=category)
        attribute_values = AttributeValue.objects.filter(attribute__category=category)

        attribute_type_serializer = AttributeTypeSerializer(attribute_types, many=True)
        attribute_value_serializer = AttributeValueSerializer(
            attribute_values, many=True
        )

        response_data = {
            "attribute_types": attribute_type_serializer.data,
            "attribute_values": attribute_value_serializer.data,
        }

        return Response(response_data, status=status.HTTP_200_OK)


class MenuViewSet(viewsets.ModelViewSet):
    queryset = Menu.objects.all()
    serializer_class = MenuSerializer
    # permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """
        Optionally filter menus by vendor or category from query params.
        """
        queryset = super().get_queryset()
        vendor_id = self.request.query_params.get("vendor")
        category_id = self.request.query_params.get("category")

        if vendor_id:
            queryset = queryset.filter(vendor_id=vendor_id)
        if category_id:
            queryset = queryset.filter(category_id=category_id)

        return queryset

    def perform_create(self, serializer):
        # Optionally attach the current user or vendor if needed here
        serializer.save()

    def perform_update(self, serializer):
        serializer.save()
