from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from .models import Vendor
from .serializers import VendorSerializer


class VendorRegister(generics.CreateAPIView):
    serializer_class = VendorSerializer
    queryset = Vendor.objects.all()
    permission_classes = [IsAuthenticated]  # ✅ Require login

    def create(self, request, *args, **kwargs):
        user = request.user  # ✅ Always use the logged-in user

        # Check if a vendor already exists for this user
        if Vendor.objects.filter(user=user).exists():
            return Response(
                {"error": "Vendor profile already exists for this user."}, status=400
            )

        # Create vendor profile
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
            status=201,
        )
