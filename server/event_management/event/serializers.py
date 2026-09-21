from datetime import datetime

from rest_framework import serializers
from django.utils import timezone

from .models import Event


class EventSerializer(serializers.ModelSerializer):
    organizer_name = serializers.CharField(source="organizer.username", read_only=True)

    class Meta:
        model = Event
        fields = "__all__"
        read_only_fields = ("id", "organizer", "status", "rejection_reason", "created_at", "updated_at", "organizer_name")

    def validate(self, attrs):
        start = datetime.combine(attrs["start_date"], attrs["start_time"])
        end = datetime.combine(attrs["end_date"], attrs["end_time"])
        now = timezone.localtime().replace(tzinfo=None)
        if start <= now:
            raise serializers.ValidationError({"start_date": "Event start must be in the future."})
        if end <= start:
            raise serializers.ValidationError({"end_date": "End date and time must be after the start date and time."})
        for field in ("title", "event_type", "category", "venue_name", "address", "city", "state", "country", "pin_code"):
            if not str(attrs.get(field, "")).strip():
                raise serializers.ValidationError({field: "This field cannot be blank."})
        if len(attrs.get("title", "").strip()) < 3:
            raise serializers.ValidationError({"title": "Event title must be at least 3 characters."})
        if len(attrs.get("description", "").strip()) < 20:
            raise serializers.ValidationError({"description": "Description must be at least 20 characters."})
        if attrs.get("max_participants", 0) < 1:
            raise serializers.ValidationError({"max_participants": "Maximum participants must be at least 1."})
        quantity_fields = ("regular_quantity", "vip_quantity", "premium_quantity")
        price_fields = ("regular_price", "vip_price", "premium_price")
        if any(attrs.get(field, 0) <= 0 for field in (*quantity_fields, *price_fields)):
            raise serializers.ValidationError({"regular_price": "Every ticket price and quantity must be greater than 0."})
        total_quantity = sum(attrs.get(field, 0) for field in quantity_fields)
        if total_quantity < 1:
            raise serializers.ValidationError({"regular_quantity": "At least one ticket must be available."})
        if total_quantity != attrs["max_participants"]:
            raise serializers.ValidationError({"max_participants": "Maximum participants must exactly match the total ticket quantities."})
        if attrs.get("main_banner"):
            self._validate_file(attrs["main_banner"], "Main banner")
        if attrs.get("promotional_image"):
            self._validate_file(attrs["promotional_image"], "Promotional image")
        return attrs

    @staticmethod
    def _validate_file(file, label):
        if file.size > 5 * 1024 * 1024:
            raise serializers.ValidationError({"main_banner": f"{label} must be smaller than 5 MB."})
        if file.content_type not in {"image/jpeg", "image/png", "image/webp"}:
            raise serializers.ValidationError({"main_banner": f"{label} must be a JPG, PNG, or WebP image."})


class EventReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = ("status", "rejection_reason")

    def validate(self, attrs):
        status_value = attrs.get("status", self.instance.status)
        reason = (attrs.get("rejection_reason", "") or "").strip()
        if status_value == Event.Status.REJECTED and len(reason) < 5:
            raise serializers.ValidationError({"rejection_reason": "Please provide a rejection reason of at least 5 characters."})
        attrs["rejection_reason"] = reason if status_value == Event.Status.REJECTED else ""
        return attrs
