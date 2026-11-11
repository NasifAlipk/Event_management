from rest_framework import serializers

from .models import WalletTransaction


class WalletTransactionSerializer(serializers.ModelSerializer):
    event_name = serializers.CharField(source="event.title", read_only=True, allow_null=True)
    event_image = serializers.ImageField(source="event.main_banner", read_only=True, allow_null=True)
    class Meta:
        model = WalletTransaction
        fields = ("id", "amount", "balance_after", "transaction_type", "reason", "description", "event_name", "event_image", "created_at", "order")
