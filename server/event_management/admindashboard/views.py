from datetime import datetime, timedelta
from decimal import Decimal

from django.db.models import Count, Sum
from django.db.models.functions import TruncDate
from django.utils import timezone
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.models import User
from accounts.permissions import IsAdministrator
from checkout.models import CheckoutOrder
from event.models import Event
from ticket.models import Ticket
from wallet.models import WalletTransaction


class AdminDashboardView(APIView):
    permission_classes = (IsAuthenticated, IsAdministrator)

    def get(self, request):
        now = timezone.localtime()
        period = request.query_params.get("period", "month").lower()

        if period == "week":
            start, points, label_format = now - timedelta(days=6), 7, "%d %b"
        elif period == "year":
            start, points, label_format = (
                now.replace(month=1, day=1, hour=0, minute=0, second=0, microsecond=0),
                12,
                "%b",
            )
        else:
            period = "month"
            start, points, label_format = (
                now.replace(day=1, hour=0, minute=0, second=0, microsecond=0),
                (now.date() - now.replace(day=1).date()).days + 1,
                "%d %b",
            )

        paid = CheckoutOrder.objects.filter(status=CheckoutOrder.Status.PAID)
        sold = Ticket.objects.filter(
            order__status=CheckoutOrder.Status.PAID,
            status__in=(Ticket.Status.VALID, Ticket.Status.USED),
        )
        current = (
            paid.filter(created_at__gte=start).aggregate(value=Sum("total"))["value"]
            or Decimal("0")
        )
        previous_start = start - (
            timedelta(days=points) if period != "year" else timedelta(days=365)
        )
        previous = (
            paid.filter(created_at__gte=previous_start, created_at__lt=start).aggregate(
                value=Sum("total")
            )["value"]
            or Decimal("0")
        )

        def growth(value, old):
            return None if not old else round(float((value - old) / old * 100), 1)

        previous_end = start
        current_customers = User.objects.filter(
            role=User.Role.USER, date_joined__gte=start
        ).count()
        previous_customers = User.objects.filter(
            role=User.Role.USER,
            date_joined__gte=previous_start,
            date_joined__lt=previous_end,
        ).count()
        current_events = Event.objects.filter(
            status=Event.Status.APPROVED, created_at__gte=start
        ).count()
        previous_events = Event.objects.filter(
            status=Event.Status.APPROVED,
            created_at__gte=previous_start,
            created_at__lt=previous_end,
        ).count()
        current_tickets = sold.filter(created_at__gte=start).count()
        previous_tickets = sold.filter(
            created_at__gte=previous_start,
            created_at__lt=previous_end,
        ).count()

        rows = (
            paid.filter(created_at__gte=start)
            .annotate(day=TruncDate("created_at"))
            .values("day")
            .annotate(amount=Sum("total"))
            .order_by("day")
        )
        earnings = [
            {"label": row["day"].strftime(label_format), "amount": row["amount"]}
            for row in rows
        ]

        events = Event.objects.filter(status=Event.Status.APPROVED).order_by(
            "start_date", "start_time"
        )
        upcoming = []
        for event in events:
            start_at = timezone.make_aware(
                datetime.combine(event.start_date, event.start_time),
                timezone.get_current_timezone(),
            )
            if start_at <= now:
                continue
            upcoming.append(
                {
                    "id": event.id,
                    "title": event.title,
                    "date": event.start_date,
                    "time": event.start_time,
                    "image": (
                        request.build_absolute_uri(event.main_banner.url)
                        if event.main_banner
                        else ""
                    ),
                    "tickets_sold": sold.filter(event=event).count(),
                }
            )
            if len(upcoming) == 4:
                break

        reductions = (
            WalletTransaction.objects.filter(
                transaction_type=WalletTransaction.TransactionType.CREDIT,
                reason=WalletTransaction.Reason.EVENT_CANCELLED,
            ).aggregate(value=Sum("amount"))["value"]
            or Decimal("0")
        )
        cancelled = (
            Ticket.objects.filter(status=Ticket.Status.CANCELLED)
            .annotate(day=TruncDate("created_at"))
            .values("day")
            .annotate(count=Count("id"))
        )
        sold_rows = (
            sold.filter(created_at__gte=start)
            .annotate(day=TruncDate("created_at"))
            .values("day")
            .annotate(count=Count("id"))
        )
        ticket_days = {
            row["day"]: {"sold": row["count"], "cancelled": 0} for row in sold_rows
        }
        for row in cancelled.filter(day__gte=start.date()):
            ticket_days.setdefault(row["day"], {"sold": 0, "cancelled": 0})[
                "cancelled"
            ] = row["count"]

        return Response(
            {
                "stats": {
                    "customers": User.objects.filter(role=User.Role.USER).count(),
                    "active_events": sum(
                        1 for event in events if event.start_date >= now.date()
                    ),
                    "revenue": paid.aggregate(value=Sum("total"))["value"]
                    or Decimal("0"),
                    "tickets_sold": sold.count(),
                    "customer_growth": growth(current_customers, previous_customers),
                    "events_growth": growth(current_events, previous_events),
                    "revenue_growth": growth(current, previous),
                    "tickets_growth": growth(current_tickets, previous_tickets),
                },
                "earnings": {
                    "period": period,
                    "chart": earnings,
                    "total": current,
                    "growth": growth(current, previous),
                },
                "transactions": {
                    "income": paid.aggregate(value=Sum("total"))["value"]
                    or Decimal("0"),
                    "reduction": reductions,
                },
                "upcoming_events": upcoming,
                "subscriptions": [
                    {"name": name, "users": 0, "progress": 0}
                    for name in ("Gold Plan", "Premium Plan", "Basic Plan")
                ],
                "ticket_statistics": [
                    {"label": day.strftime(label_format), **values}
                    for day, values in sorted(ticket_days.items())
                ],
            }
        )