from datetime import datetime, timedelta
from decimal import Decimal

from django.db.models import Count, Q, Sum
from django.db.models.functions import TruncDay, TruncMonth
from django.utils import timezone
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from coupon.models import Coupon
from event.models import Event
from checkout.models import CheckoutOrder
from ticket.models import Ticket


class OrganizerDashboardView(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request):
        events = Event.objects.filter(organizer=request.user)
        now = timezone.localtime()
        period = request.query_params.get("period", "month").lower()
        if period == "week":
            start = now - timedelta(days=6)
            trunc = TruncDay("created_at", tzinfo=timezone.get_current_timezone())
            points = 7
        elif period == "year":
            start = now.replace(month=1, day=1, hour=0, minute=0, second=0, microsecond=0)
            trunc = TruncMonth("created_at", tzinfo=timezone.get_current_timezone())
            points = 12
        else:
            start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
            trunc = TruncDay("created_at", tzinfo=timezone.get_current_timezone())
            points = (now.date() - start.date()).days + 1
            period = "month"
        paid_orders = CheckoutOrder.objects.filter(status=CheckoutOrder.Status.PAID, event__organizer=request.user)
        chart_rows = paid_orders.filter(created_at__gte=start).annotate(bucket=trunc).values("bucket").annotate(amount=Sum("total")).order_by("bucket")
        chart = [{"label": row["bucket"].strftime("%d %b" if period != "year" else "%b"), "amount": row["amount"]} for row in chart_rows]
        current_earnings = sum((row["amount"] for row in chart_rows), Decimal("0.00"))
        previous_start = start - (timedelta(days=points) if period != "year" else timedelta(days=365))
        previous_earnings = paid_orders.filter(created_at__gte=previous_start, created_at__lt=start).aggregate(total=Sum("total"))["total"] or Decimal("0.00")
        growth = None if previous_earnings == 0 else ((current_earnings - previous_earnings) / previous_earnings * 100).quantize(Decimal("0.1"))
        sold_tickets = Ticket.objects.filter(user__isnull=False, event__organizer=request.user, order__status=CheckoutOrder.Status.PAID, status__in=(Ticket.Status.VALID, Ticket.Status.USED))
        ticket_counts = {label: sold_tickets.filter(ticket_type=label).count() for label in ("Regular", "VIP", "Premium")}
        event_rows = []
        for event in events.order_by("-created_at"):
            start_at = timezone.make_aware(datetime.combine(event.start_date, event.start_time), timezone.get_current_timezone())
            if event.status == Event.Status.CANCELLED:
                display_status = "Cancelled"
            elif event.status != Event.Status.APPROVED:
                display_status = event.status.title()
            elif start_at <= now:
                display_status = "Completed"
            else:
                display_status = "Upcoming"
            event_orders = paid_orders.filter(event=event)
            sold = Ticket.objects.filter(event=event, order__status=CheckoutOrder.Status.PAID, status__in=(Ticket.Status.VALID, Ticket.Status.USED)).count()
            revenue = event_orders.aggregate(total=Sum("total"))["total"] or Decimal("0.00")
            event_rows.append({"id": event.id, "title": event.title, "main_banner": request.build_absolute_uri(event.main_banner.url) if event.main_banner else "", "status": display_status, "event_status": event.status, "start_date": event.start_date, "start_time": event.start_time, "sold_tickets": sold, "total_tickets": event.max_participants, "revenue": revenue})
        top_event = max(event_rows, key=lambda item: item["revenue"], default=None)
        payload = {"profile": {"name": request.user.get_full_name() or request.user.username, "email": request.user.email, "phone": getattr(request.user, "phone_number", ""), "profile_picture": request.user.profile_picture or "", "date_joined": request.user.date_joined}, "organized_events": events.count(), "pending_events": events.filter(status=Event.Status.PENDING).count(), "cancelled_events": events.filter(status=Event.Status.CANCELLED).count(), "total_coupons": Coupon.objects.filter(organizer=request.user).count(), "total_attendees": sold_tickets.count(), "total_revenue": paid_orders.aggregate(total=Sum("total"))["total"] or Decimal("0.00"), "completed_events": sum(item["status"] == "Completed" for item in event_rows), "earnings": {"total": current_earnings, "growth": growth, "period": period, "chart": chart}, "events": event_rows, "top_event": top_event, "ticket_counts": ticket_counts}
        return Response(payload)
