import base64
import io

import qrcode
from rest_framework import serializers

from .models import Ticket


class TicketSerializer(serializers.ModelSerializer):
    event_name = serializers.CharField(source="event.title", read_only=True)
    event_image = serializers.ImageField(source="event.main_banner", read_only=True)
    event_date = serializers.DateField(source="event.start_date", read_only=True)
    event_time = serializers.TimeField(source="event.start_time", read_only=True)
    location = serializers.SerializerMethodField()
    customer_name = serializers.SerializerMethodField()
    qr_payload = serializers.SerializerMethodField()
    qr_code = serializers.SerializerMethodField()

    class Meta:
        model = Ticket
        fields = ("id", "event_name", "event_image", "event_date", "event_time", "location", "ticket_type", "price", "status", "created_at", "customer_name", "qr_payload", "qr_code")

    def get_location(self, obj):
        return ", ".join(filter(None, (obj.event.venue_name, obj.event.city, obj.event.state, obj.event.country)))

    def get_customer_name(self, obj):
        return obj.user.get_full_name() or obj.user.username

    def get_qr_payload(self, obj):
        return f"/api/tickets/{obj.id}/verify/?token={obj.verification_token}"

    def get_qr_code(self, obj):
        image = qrcode.make(self.get_qr_payload(obj))
        output = io.BytesIO()
        image.save(output, format="PNG")
        return f"data:image/png;base64,{base64.b64encode(output.getvalue()).decode('ascii')}"


class AdminTicketSerializer(TicketSerializer):
    purchased_date = serializers.DateTimeField(source="created_at", read_only=True)
    total_ticket_price = serializers.DecimalField(source="order.total", max_digits=12, decimal_places=2, read_only=True)

    class Meta(TicketSerializer.Meta):
        fields = TicketSerializer.Meta.fields + ("purchased_date", "total_ticket_price")
