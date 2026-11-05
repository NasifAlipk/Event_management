import secrets

from django.shortcuts import get_object_or_404
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
