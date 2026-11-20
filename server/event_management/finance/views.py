from datetime import timedelta
from decimal import Decimal

from django.core.paginator import Paginator
from django.db.models import Q, Sum
from django.http import FileResponse
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


def _filtered_transactions(request):
    transactions = CheckoutOrder.objects.all().select_related("event__organizer")
    query = request.query_params.get("q", "").strip()
    event_type = request.query_params.get("event_type", "").strip()
    ticket_type = request.query_params.get("ticket_type", "").strip().lower()
    period = request.query_params.get("period", "ALL").strip().upper()
    if query:
        transactions = transactions.filter(Q(event__title__icontains=query) | Q(event__organizer__username__icontains=query) | Q(event__organizer__first_name__icontains=query) | Q(event__organizer__last_name__icontains=query))
    if event_type:
        transactions = transactions.filter(event__event_type__iexact=event_type)
    if ticket_type in {"regular", "vip", "premium"}:
        transactions = transactions.filter(**{f"{ticket_type}_quantity__gt": 0})
    start, end = _period_bounds(timezone.localtime(), period)
    if start:
        transactions = transactions.filter(created_at__date__gte=start, created_at__date__lte=end)
    return transactions.order_by("-created_at", "-id")


def _transaction_row(order):
    types = [f"{label} × {getattr(order, field)}" for label, field in (("Regular", "regular_quantity"), ("VIP", "vip_quantity"), ("Premium", "premium_quantity")) if getattr(order, field)]
    status_label = {CheckoutOrder.Status.PAID: "Completed", CheckoutOrder.Status.PENDING: "Pending", CheckoutOrder.Status.FAILED: "Failed", CheckoutOrder.Status.CANCELLED: "Cancelled"}.get(order.status, order.status.title())
    return {"id": order.id, "event_name": order.event.title, "organizer": order.event.organizer.get_full_name() or order.event.organizer.username, "created_at": order.created_at, "ticket_type": ", ".join(types) or "—", "total": order.total, "status": status_label, "payment_method": "Stripe" if order.stripe_session_id else "Wallet"}


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
                    "payment_method": "Stripe" if order.stripe_session_id else "Wallet",
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


class FinanceReportView(FinanceOverviewView):
    def get(self, request):
        from io import BytesIO
        from reportlab.lib import colors
        from reportlab.lib.pagesizes import A4, landscape
        from reportlab.lib.styles import getSampleStyleSheet
        from reportlab.lib.units import mm
        from reportlab.platypus import SimpleDocTemplate, Spacer, Table, TableStyle, Paragraph

        overview = FinanceOverviewView().get(request).data["overview"]
        transactions = _filtered_transactions(request)
        buffer = BytesIO()
        document = SimpleDocTemplate(buffer, pagesize=landscape(A4), leftMargin=12 * mm, rightMargin=12 * mm, topMargin=12 * mm, bottomMargin=12 * mm)
        styles = getSampleStyleSheet()
        filter_text = ", ".join(f"{key}: {request.query_params.get(key)}" for key in ("q", "event_type", "ticket_type", "period") if request.query_params.get(key)) or "Filters: All"
        elements = [Paragraph("Eventora Finance Report", styles["Title"]), Paragraph(f"Generated {timezone.localtime().strftime('%d %b %Y, %I:%M %p')}", styles["Normal"]), Paragraph(filter_text, styles["Normal"]), Spacer(1, 8)]
        summary = [["Total Revenue", "Today's Revenue", "This Month", "Total Tickets"], [f"₹{overview['total_revenue']}", f"₹{overview['today_revenue']}", f"₹{overview['month_revenue']}", str(overview['total_tickets'])]]
        summary_table = Table(summary, colWidths=[65 * mm] * 4)
        summary_table.setStyle(TableStyle([("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#123b32")), ("TEXTCOLOR", (0, 0), (-1, 0), colors.white), ("TEXTCOLOR", (0, 1), (-1, 1), colors.HexColor("#087f5b")), ("GRID", (0, 0), (-1, -1), .4, colors.HexColor("#d1d5db")), ("ALIGN", (0, 0), (-1, -1), "CENTER"), ("PADDING", (0, 0), (-1, -1), 8)]))
        elements += [summary_table, Spacer(1, 14), Paragraph("Transaction History", styles["Heading2"])]
        rows = [["Event Name", "Organizer", "Purchase Date", "Ticket Type", "Amount", "Status", "Payment Method"]]
        for order in transactions:
            row = _transaction_row(order)
            rows.append([row["event_name"], row["organizer"], timezone.localtime(row["created_at"]).strftime("%d %b %Y"), row["ticket_type"], f"₹{row['total']}", row["status"], row["payment_method"]])
        table = Table(rows, repeatRows=1, colWidths=[45 * mm, 35 * mm, 30 * mm, 38 * mm, 25 * mm, 25 * mm, 30 * mm])
        table.setStyle(TableStyle([("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#123b32")), ("TEXTCOLOR", (0, 0), (-1, 0), colors.white), ("GRID", (0, 0), (-1, -1), .3, colors.HexColor("#d1d5db")), ("FONTSIZE", (0, 0), (-1, -1), 8), ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#f3f7f5")]), ("PADDING", (0, 0), (-1, -1), 6)]))
        elements.append(table)
        document.build(elements)
        buffer.seek(0)
        return FileResponse(buffer, as_attachment=True, filename="eventora-finance-report.pdf", content_type="application/pdf")
