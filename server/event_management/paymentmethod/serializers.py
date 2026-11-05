from rest_framework import serializers


class StripeSessionSerializer(serializers.Serializer):
    event_id = serializers.IntegerField(min_value=1)
    regular = serializers.IntegerField(min_value=0, required=False, default=0)
    vip = serializers.IntegerField(min_value=0, required=False, default=0)
    premium = serializers.IntegerField(min_value=0, required=False, default=0)
    coupon = serializers.CharField(required=False, allow_blank=True, max_length=40)

    def validate(self, attrs):
        if not any(attrs.get(ticket, 0) for ticket in ("regular", "vip", "premium")):
            raise serializers.ValidationError("Select at least one ticket.")
        return attrs
