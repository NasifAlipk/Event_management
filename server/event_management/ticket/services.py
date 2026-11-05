import secrets

from django.db import transaction

from .models import Ticket


TICKET_TYPES = (
    ("regular", "Regular", "regular_price"),
    ("vip", "VIP", "vip_price"),
    ("premium", "Premium", "premium_price"),
)


@transaction.atomic
def issue_tickets(order):
    """Issue one opaque-token ticket per purchased seat, idempotently."""
    existing = list(order.tickets.all())
    if existing:
        return existing
    tickets = []
    for key, label, price_field in TICKET_TYPES:
        for unit_index in range(getattr(order, f"{key}_quantity")):
            tickets.append(Ticket(order=order, user=order.user, event=order.event, ticket_type=label,
                                  price=getattr(order.event, price_field), unit_index=unit_index,
                                  verification_token=secrets.token_urlsafe(32)))
    return Ticket.objects.bulk_create(tickets)
