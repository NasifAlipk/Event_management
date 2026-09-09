from rest_framework import serializers

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
            "created_at",
            "applicant_email",
            "applicant_username",
        )
        read_only_fields = ("id", "status", "created_at")

    def validate(self, attrs):
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
        fields = ("status",)

    def validate_status(self, value):
        if value not in {
            OrganizerApplication.Status.APPROVED,
            OrganizerApplication.Status.REJECTED,
            OrganizerApplication.Status.PENDING,
        }:
            raise serializers.ValidationError("Invalid application status.")
        return value
