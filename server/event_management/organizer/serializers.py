from rest_framework import serializers
import re

from .models import OrganizerApplication


class OrganizerApplicationSerializer(serializers.ModelSerializer):
    applicant_email = serializers.EmailField(source="user.email", read_only=True)
    applicant_username = serializers.CharField(source="user.username", read_only=True)
    class Meta:
        model = OrganizerApplication
        fields = (
            "id",
            "full_name",
            "phone_number",
            "organizer_type",
            "organization_name",
            "short_description",
            "address",
            "city",
            "state",
            "country",
            "identity_document_type",
            "identity_document_name",
            "identity_document_image",
            "information_accurate",
            "terms_accepted",
            "status",
            "rejection_reason",
            "created_at",
            "applicant_email",
            "applicant_username",
        )
        read_only_fields = ("id", "status", "created_at")

    def validate(self, attrs):
        required_fields = (
            "full_name", "phone_number", "organizer_type", "organization_name",
            "short_description", "address", "city", "state", "country",
            "identity_document_type", "identity_document_name", "identity_document_image",
        )
        for field in required_fields:
            value = attrs.get(field)
            if value is None or (isinstance(value, str) and not value.strip()):
                raise serializers.ValidationError({field: "This field is required and cannot be blank."})
        if not re.fullmatch(r"\+?[0-9][0-9\s().-]{6,28}", attrs["phone_number"].strip()):
            raise serializers.ValidationError({"phone_number": "Enter a valid phone number with 7-30 digits."})
        if len(attrs["full_name"].strip()) < 3:
            raise serializers.ValidationError({"full_name": "Full name must be at least 3 characters."})
        if len(attrs["organization_name"].strip()) < 2:
            raise serializers.ValidationError({"organization_name": "Organizer or business name must be at least 2 characters."})
        if len(attrs["short_description"].strip()) < 20:
            raise serializers.ValidationError({"short_description": "Description must be at least 20 characters."})
        if len(attrs["identity_document_name"].strip()) < 2:
            raise serializers.ValidationError({"identity_document_name": "Enter a valid identity document name or number."})
        if not attrs.get("information_accurate"):
            raise serializers.ValidationError(
                {"information_accurate": "Please confirm that your information is accurate."}
            )
        if not attrs.get("terms_accepted"):
            raise serializers.ValidationError(
                {"terms_accepted": "Please accept the platform terms and conditions."}
            )
        document = attrs.get("identity_document_image")
        if document:
            if document.size > 5 * 1024 * 1024:
                raise serializers.ValidationError(
                    {"identity_document_image": "The document must be smaller than 5 MB."}
                )
            if document.content_type not in {"image/jpeg", "image/png", "application/pdf"}:
                raise serializers.ValidationError(
                    {"identity_document_image": "Upload a JPG, PNG, or PDF document."}
                )
        return attrs


class OrganizerApplicationReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrganizerApplication
        fields = ("status", "rejection_reason")

    def validate_status(self, value):
        if value not in {
            OrganizerApplication.Status.APPROVED,
            OrganizerApplication.Status.REJECTED,
            OrganizerApplication.Status.PENDING,
        }:
            raise serializers.ValidationError("Invalid application status.")
        return value

    def validate(self, attrs):
        status_value = attrs.get("status", self.instance.status)
        reason = (attrs.get("rejection_reason", self.instance.rejection_reason) or "").strip()
        if status_value == OrganizerApplication.Status.REJECTED and not reason:
            raise serializers.ValidationError(
                {"rejection_reason": "Please provide a reason for rejecting this application."}
            )
        attrs["rejection_reason"] = reason if status_value == OrganizerApplication.Status.REJECTED else ""
        return attrs
