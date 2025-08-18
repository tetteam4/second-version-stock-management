from apps.common.models import Business
from apps.role.models import Role
from django.contrib.auth import get_user_model
from django_countries.serializer_fields import CountryField
from phonenumber_field.serializerfields import PhoneNumberField
from rest_framework import serializers

User = get_user_model()


class BusinessSerializer(serializers.ModelSerializer):
    class Meta:
        model = Business
        fields = ["id", "name", "business_type", "created_at", "updated_at"]


class UserSerializer(serializers.ModelSerializer):
    gender = serializers.CharField(source="profile.gender")
    phone_number = PhoneNumberField(source="profile.phone_number")
    profile_photo = serializers.ReadOnlyField(source="profile.profile_photo")
    country = CountryField(source="profile.country")
    city = serializers.CharField(source="profile.city")

    profile_photo = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "first_name",
            "last_name",
            "gender",
            "business_type",
            "phone_number",
            "profile_photo",
            "country",
            "city",
        ]

    def get_profile_photo(self, obj):
        try:
            if obj.profile.profile_photo and hasattr(obj.profile.profile_photo, "url"):
                return obj.profile.profile_photo.url
        except Exception:
            pass
        return None

    def to_representation(self, instance):
        representation = super(UserSerializer, self).to_representation(instance)
        if instance.is_superuser:
            representation["admin"] = True
        return representation


class CustomRegisterSerializer(serializers.ModelSerializer):
    username = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    first_name = serializers.CharField(required=True)
    last_name = serializers.CharField(required=True)
    email = serializers.EmailField(required=True)
    business_type = serializers.ChoiceField(
        choices=User.BUSINESS_TYPES, required=False, allow_null=True
    )
    password1 = serializers.CharField(write_only=True)
    password2 = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = [
            "username",
            "first_name",
            "last_name",
            "email",
            "business_type",
            "password1",
            "password2",
        ]

    def validate(self, attrs):
        if attrs.get("password1") != attrs.get("password2"):
            raise serializers.ValidationError({"password": "Passwords must match."})
        return attrs

    def create(self, validated_data):
        # Remove password2 from validated_data since we don't need it after validation
        validated_data.pop("password2", None)
        password = validated_data.pop("password1")

        # Handle optional username; default to email username if not provided
        username = validated_data.get("username")
        if not username:
            username = validated_data["email"].split("@")[0]

        # Assign default role, e.g., "user"
        default_role = Role.get_default_role()

        user = User.objects.create(
            username=username,
            email=validated_data["email"],
            first_name=validated_data["first_name"],
            last_name=validated_data["last_name"],
            business_type=validated_data.get("business_type"),
            role=default_role,
            is_active=True,
        )
        user.set_password(password)
        user.save()
        return user
