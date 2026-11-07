import secrets
from collections import OrderedDict
from datetime import datetime

from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Ticket
from .permissions import IsAdministrator
from .serializers import AdminTicketSerializer, TicketSerializer


class MyTicketsView(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request):
        tickets = Ticket.objects.filter(user=request.user).select_related("event", "user", "order")
        order_id = request.query_params.get("order_id")
        if order_id:
            tickets = tickets.filter(order_id=order_id)
        return Response({"tickets": TicketSerializer(tickets, many=True, context={"request": request}).data})


class ProfileTicketsView(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request):
        tickets = Ticket.objects.filter(
            user=request.user,
            order__status="PAID",
        ).exclude(status=Ticket.Status.CANCELLED).select_related("event", "user", "order")
        grouped = OrderedDict()
        now = timezone.localtime()
        for ticket in tickets:
            key = str(ticket.order_id)
            if key not in grouped:
                start = timezone.make_aware(
                    datetime.combine(ticket.event.start_date, ticket.event.start_time),
                    timezone.get_current_timezone(),
                )
                grouped[key] = {
                    "id": key,
                    "ticket": TicketSerializer(ticket, context={"request": request}).data,
                    "ticket_count": 0,
                    "ticket_types": {},
                    "attended": start <= now,
                }
            booking = grouped[key]
            booking["ticket_count"] += 1
            booking["ticket_types"][ticket.ticket_type] = booking["ticket_types"].get(ticket.ticket_type, 0) + 1

        bookings = []
        for booking in grouped.values():
            booking["ticket_types"] = ", ".join(
                f"{label} × {count}" for label, count in booking["ticket_types"].items()
            )
            bookings.append(booking)
        attended = {item["ticket"]["event_id"] for item in bookings if item["attended"]}
        return Response({
            "bookings": bookings,
            "tickets_booked": sum(item["ticket_count"] for item in bookings),
            "events_attended": len(attended),
        })


class TicketDetailView(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request, ticket_id):
        ticket = get_object_or_404(Ticket.objects.select_related("event", "user", "order"), id=ticket_id, user=request.user)
        return Response(TicketSerializer(ticket, context={"request": request}).data)


class VerifyTicketView(APIView):
    permission_classes = (AllowAny,)

    def get(self, request, ticket_id):
        ticket = Ticket.objects.filter(id=ticket_id).select_related("event").first()
        token = request.query_params.get("token", "")
        if ticket is None or not token or not secrets.compare_digest(str(token), ticket.verification_token):
            return Response({"valid": False, "status": "INVALID", "detail": "This ticket could not be verified."}, status=404)
        return Response({"valid": ticket.status == Ticket.Status.VALID, "status": ticket.status, "ticket_id": str(ticket.id), "event_name": ticket.event.title})


class AdminTicketsView(APIView):
    permission_classes = (IsAuthenticated, IsAdministrator)

    def get(self, request):
        tickets = Ticket.objects.select_related("event", "user", "order").all()
        return Response({"tickets": AdminTicketSerializer(tickets, many=True, context={"request": request}).data})
