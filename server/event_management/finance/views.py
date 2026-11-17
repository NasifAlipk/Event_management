from datetime import timedelta
from decimal import Decimal

from django.core.paginator import Paginator
from django.db.models import Q, Sum
from django.utils import timezone
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from checkout.models import CheckoutOrder
from .permissions import IsAdministrator
from .serializers import FinanceTransactionSerializer


PAGE_SIZE = 8


def _period_bounds(now, period):
    today = now.date()
    if period == "7":
        return today - timedelta(days=6), today
    if period == "30":
        return today - timedelta(days=29), today
    if period == "90":
        return today - timedelta(days=89), today
    return None, None


def _percentage(current, previous):
    if previous == 0:
        return None
    return (
        (current - previous) / previous * Decimal("100")
    ).quantize(Decimal("0.1"))


def _paid_orders():
    return CheckoutOrder.objects.filter(
        status=CheckoutOrder.Status.PAID
    ).select_related("event__organizer")


def _ticket_count(queryset):
    quantities = queryset.aggregate(
        regular=Sum("regular_quantity"),
        vip=Sum("vip_quantity"),
        premium=Sum("premium_quantity"),
    )
    return sum(
        (quantities.get(field) or 0)
        for field in ("regular", "vip", "premium")
    )


class FinanceOverviewView(APIView):
    permission_classes = (IsAuthenticated, IsAdministrator)

    def get(self, request):
        now = timezone.localtime()
        today = now.date()
        month_start = today.replace(day=1)
        previous_month_end = month_start - timedelta(days=1)
        previous_month_start = previous_month_end.replace(day=1)
        yesterday = today - timedelta(days=1)

        paid = _paid_orders()

        total_revenue = (
            paid.aggregate(value=Sum("total"))["value"] or Decimal("0.00")
        )
        today_revenue = (
            paid.filter(created_at__date=today).aggregate(value=Sum("total"))["value"]
            or Decimal("0.00")
        )
        month_revenue = (
            paid.filter(created_at__date__gte=month_start).aggregate(value=Sum("total"))["value"]
            or Decimal("0.00")
        )
        yesterday_revenue = (
            paid.filter(created_at__date=yesterday).aggregate(value=Sum("total"))["value"]
            or Decimal("0.00")
        )
        previous_month_revenue = (
            paid.filter(
                created_at__date__gte=previous_month_start,
                created_at__date__lte=previous_month_end,
            ).aggregate(value=Sum("total"))["value"]
            or Decimal("0.00")
        )

        # Use database aggregates here. Calling .only() on `paid` would defer
        # the event field required by its select_related("event__organizer").
        total_tickets = _ticket_count(paid)
        previous_month_tickets = _ticket_count(
            paid.filter(
                created_at__date__gte=previous_month_start,
                created_at__date__lte=previous_month_end,
            )
        )

        transactions = CheckoutOrder.objects.all().select_related("event__organizer")

        query = request.query_params.get("q", "").strip()
        event_type = request.query_params.get("event_type", "").strip()
        ticket_type = request.query_params.get("ticket_type", "").strip().lower()
        period = request.query_params.get("period", "ALL").strip().upper()

        if query:
            transactions = transactions.filter(
                Q(event__title__icontains=query)
                | Q(event__organizer__username__icontains=query)
                | Q(event__organizer__first_name__icontains=query)
                | Q(event__organizer__last_name__icontains=query)
            )

        if event_type:
            transactions = transactions.filter(event__event_type__iexact=event_type)

        if ticket_type in {"regular", "vip", "premium"}:
            transactions = transactions.filter(**{f"{ticket_type}_quantity__gt": 0})

        start, end = _period_bounds(now, period)
        if start:
            transactions = transactions.filter(
                created_at__date__gte=start,
                created_at__date__lte=end,
            )

        paginator = Paginator(transactions.order_by("-created_at", "-id"), PAGE_SIZE)
        page = paginator.get_page(
            max(1, int(request.query_params.get("page", 1) or 1))
        )

        result = []
        for order in page.object_list:
            types = [
                f"{label} × {getattr(order, field)}"
                for label, field in (
                    ("Regular", "regular_quantity"),
                    ("VIP", "vip_quantity"),
                    ("Premium", "premium_quantity"),
                )
                if getattr(order, field)
            ]
            status_label = {
                CheckoutOrder.Status.PAID: "Completed",
                CheckoutOrder.Status.PENDING: "Pending",
                CheckoutOrder.Status.FAILED: "Failed",
                CheckoutOrder.Status.CANCELLED: "Cancelled",
            }.get(order.status, order.status.title())

            result.append(
                {
                    "id": order.id,
                    "event_name": order.event.title,
                    "organizer": (
                        order.event.organizer.get_full_name()
                        or order.event.organizer.username
                    ),
                    "created_at": order.created_at,
                    "ticket_type": ", ".join(types) or "—",
                    "total": order.total,
                    "status": status_label,
                }
            )

        event_types = list(
            CheckoutOrder.objects.values_list("event__event_type", flat=True)
            .distinct()
            .order_by("event__event_type")
        )

        return Response(
            {
                "overview": {
                    "total_revenue": total_revenue,
                    "today_revenue": today_revenue,
                    "month_revenue": month_revenue,
                    "total_tickets": total_tickets,
                    "total_revenue_change": _percentage(
                        total_revenue, previous_month_revenue
                    ),
                    "today_revenue_change": _percentage(
                        today_revenue, yesterday_revenue
                    ),
                    "month_revenue_change": _percentage(
                        month_revenue, previous_month_revenue
                    ),
                    "total_tickets_change": _percentage(
                        Decimal(total_tickets), Decimal(previous_month_tickets)
                    ),
                },
                "transactions": FinanceTransactionSerializer(result, many=True).data,
                "total": paginator.count,
                "page": page.number,
                "page_size": PAGE_SIZE,
                "page_count": paginator.num_pages,
                "event_types": event_types,
            }
        )