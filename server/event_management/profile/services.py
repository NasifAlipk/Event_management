from datetime import datetime, timedelta

from django.db import transaction
from django.utils import timezone

from event.models import Event
from ticket.models import Ticket


def event_start(event):
    return timezone.make_aware(
        datetime.combine(event.start_date, event.start_time),
        timezone.get_current_timezone(),
    )


def cancellation_allowed(event):
    return event_start(event) - timezone.localtime() > timedelta(hours=12)


@transaction.atomic
def cancel_booking(order, user):
    """Cancel every active ticket in one profile booking and restore stock."""
    from checkout.models import CheckoutOrder

    locked_order = CheckoutOrder.objects.select_for_update().select_related("event").filter(
        pk=order.pk, user=user, status=CheckoutOrder.Status.PAID,
    ).first()
    if locked_order is None:
        raise ValueError("Only a paid booking belonging to you can be cancelled.")
    if not cancellation_allowed(locked_order.event):
        raise ValueError("Tickets can only be cancelled more than 12 hours before the event starts.")

    tickets = list(Ticket.objects.select_for_update().filter(order=locked_order))
    active = [ticket for ticket in tickets if ticket.status == Ticket.Status.VALID]
    if not active:
        raise ValueError("This booking has already been cancelled.")
    if len(active) != len(tickets):
        raise ValueError("This booking contains a used or cancelled ticket and cannot be cancelled.")

    event = Event.objects.select_for_update().get(pk=locked_order.event_id)
    increments = {"Regular": "regular_quantity", "VIP": "vip_quantity", "Premium": "premium_quantity"}
    restored = {field: 0 for field in increments.values()}
    for ticket in active:
        field = increments.get(ticket.ticket_type)
        if field:
            restored[field] += 1
        ticket.status = Ticket.Status.CANCELLED
    Ticket.objects.bulk_update(active, ["status"])
    for field, amount in restored.items():
        setattr(event, field, getattr(event, field) + amount)
    event.save(update_fields=(*restored.keys(), "updated_at"))
    return locked_order
