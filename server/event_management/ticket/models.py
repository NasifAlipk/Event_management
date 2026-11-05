import uuid

from django.conf import settings
from django.db import models

from checkout.models import CheckoutOrder
from event.models import Event


class Ticket(models.Model):
    class Status(models.TextChoices):
        VALID = "VALID", "Valid"
        USED = "USED", "Used"
        CANCELLED = "CANCELLED", "Cancelled"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order = models.ForeignKey(CheckoutOrder, on_delete=models.PROTECT, related_name="tickets")
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name="tickets")
    event = models.ForeignKey(Event, on_delete=models.PROTECT, related_name="tickets")
    ticket_type = models.CharField(max_length=20)
    price = models.DecimalField(max_digits=12, decimal_places=2)
    unit_index = models.PositiveIntegerField()
    verification_token = models.CharField(max_length=64, unique=True, editable=False)
    status = models.CharField(max_length=12, choices=Status.choices, default=Status.VALID)
    created_at = models.DateTimeField(auto_now_add=True)
    used_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ("-created_at",)
        constraints = [models.UniqueConstraint(fields=("order", "ticket_type", "unit_index"), name="unique_ticket_unit_per_order")]
