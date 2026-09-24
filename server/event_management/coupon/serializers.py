from datetime import date
from decimal import Decimal
from rest_framework import serializers
from .models import Coupon


class CouponSerializer(serializers.ModelSerializer):
    organizer_name = serializers.CharField(source="organizer.username", read_only=True)
    max_discount = serializers.DecimalField(max_digits=10, decimal_places=2, allow_null=True, required=False)

    class Meta:
        model = Coupon
        fields = "__all__"
        read_only_fields = ("id", "organizer", "status", "rejection_reason", "created_at", "updated_at", "organizer_name")

    def validate(self, attrs):
        values = {field.name: getattr(self.instance, field.name) for field in Coupon._meta.fields} if self.instance else {}
        values.update(attrs)
        code = str(values.get("code", "")).strip().upper()
        if not code or not code.replace("-", "").isalnum():
            raise serializers.ValidationError({"code": "Coupon code may contain only letters, numbers, and hyphens."})
        if len(code) < 3:
            raise serializers.ValidationError({"code": "Coupon code must be at least 3 characters."})
        duplicate = Coupon.objects.filter(code=code)
        if self.instance is not None:
            duplicate = duplicate.exclude(pk=self.instance.pk)
        if duplicate.exists():
            raise serializers.ValidationError({"code": "This coupon code is already in use. Choose a different code."})
        if values.get("start_date") > values.get("end_date"):
            raise serializers.ValidationError({"end_date": "End date must be on or after the start date."})
        value = Decimal(values.get("discount_value", 0))
        if value <= 0:
            raise serializers.ValidationError({"discount_value": "Discount value must be greater than 0."})
        if values.get("discount_type") == Coupon.DiscountType.PERCENTAGE and value > 100:
            raise serializers.ValidationError({"discount_value": "Percentage discount cannot exceed 100."})
        max_discount = values.get("max_discount")
        if max_discount is not None and max_discount != "" and Decimal(max_discount) < 0:
            raise serializers.ValidationError({"max_discount": "Maximum discount cannot be negative."})
        if Decimal(values.get("minimum_purchase", 0)) < 0 or any(int(values.get(key, 0)) < 0 for key in ("usage_limit_total", "usage_limit_per_user")):
            raise serializers.ValidationError({"minimum_purchase": "Amounts and usage limits cannot be negative."})
        if values.get("usage_limit_per_user", 0) and values.get("usage_limit_total", 0) and values["usage_limit_per_user"] > values["usage_limit_total"]:
            raise serializers.ValidationError({"usage_limit_per_user": "Per-user limit cannot exceed the total usage limit."})
        attrs["code"] = code
        return attrs


class CouponReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Coupon
        fields = ("status", "rejection_reason")

    def validate(self, attrs):
        selected = attrs.get("status", self.instance.status)
        reason = (attrs.get("rejection_reason") or "").strip()
        if selected == Coupon.Status.REJECTED and len(reason) < 5:
            raise serializers.ValidationError({"rejection_reason": "Please provide a rejection reason of at least 5 characters."})
        attrs["rejection_reason"] = reason if selected == Coupon.Status.REJECTED else ""
        return attrs
