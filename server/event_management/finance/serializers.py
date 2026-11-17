from rest_framework import serializers


class FinanceTransactionSerializer(serializers.Serializer):
    id = serializers.UUIDField()
    event_name = serializers.CharField()
    organizer = serializers.CharField()
    date = serializers.DateTimeField(source="created_at")
    ticket_type = serializers.CharField()
    amount = serializers.DecimalField(max_digits=12, decimal_places=2, source="total")
    status = serializers.CharField()
