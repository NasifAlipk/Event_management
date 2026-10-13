from rest_framework import serializers


class OrganizerDashboardSerializer(serializers.Serializer):
    organized_events = serializers.IntegerField()
    pending_events = serializers.IntegerField()
    total_coupons = serializers.IntegerField()
