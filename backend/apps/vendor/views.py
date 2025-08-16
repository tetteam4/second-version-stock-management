from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Vendor
from .serializers import VendorSerializer


class VendorSubdomainView(APIView):
    def get(self, request, *args, **kwargs):
        subdomain = getattr(request, "subdomain", None)
        if not subdomain:
            return Response(
                {"detail": "No subdomain provided."}, status=status.HTTP_400_BAD_REQUEST
            )

        try:
            vendor = Vendor.objects.get(slug=subdomain)
        except Vendor.DoesNotExist:
            return Response(
                {"detail": "Vendor not found."}, status=status.HTTP_404_NOT_FOUND
            )

        serializer = VendorSerializer(vendor)
        return Response(serializer.data)


class VendorRegister(generics.CreateAPIView):
    serializer_class = VendorSerializer
    queryset = Vendor.objects.all()
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        user = request.user

        if Vendor.objects.filter(user=user).exists():
            return Response(
                {"error": "Vendor profile already exists for this user."}, status=400
            )

        vendor = Vendor.objects.create(
            user=user,
            image=request.data.get("image"),
            name=request.data.get("name"),
            email=request.data.get("email"),
            description=request.data.get("description"),
            mobile=request.data.get("mobile"),
        )

        return Response(
            {
                "message": "Vendor account created",
                "vendor_id": vendor.id,
            },
            status=status.HTTP_201_CREATED,
        )
