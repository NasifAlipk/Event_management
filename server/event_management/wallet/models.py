from django.conf import settings
from django.db import models

from checkout.models import CheckoutOrder
from event.models import Event


class Wallet(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="wallet")
    balance = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    updated_at = models.DateTimeField(auto_now=True)


class WalletTransaction(models.Model):
    class TransactionType(models.TextChoices):
        CREDIT = "CREDIT", "Credit"
        DEBIT = "DEBIT", "Debit"

    class Reason(models.TextChoices):
        TICKET_PURCHASE = "TICKET_PURCHASE", "Ticket Purchase"
        EVENT_CANCELLED = "EVENT_CANCELLED", "Event Cancelled"
        WALLET_RECHARGE = "WALLET_RECHARGE", "Wallet Recharge"

    wallet = models.ForeignKey(Wallet, on_delete=models.CASCADE, related_name="transactions")
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    balance_after = models.DecimalField(max_digits=12, decimal_places=2)
    transaction_type = models.CharField(max_length=8, choices=TransactionType.choices)
    reason = models.CharField(max_length=24, choices=Reason.choices)
    description = models.CharField(max_length=255, blank=True, default="")
    order = models.ForeignKey(CheckoutOrder, null=True, blank=True, on_delete=models.SET_NULL, related_name="wallet_transactions")
    event = models.ForeignKey(Event, null=True, blank=True, on_delete=models.SET_NULL, related_name="wallet_transactions")
    reference = models.CharField(max_length=120, unique=True, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ("-created_at",)
