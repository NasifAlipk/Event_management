from decimal import Decimal

from django.db import transaction

from .models import Wallet, WalletTransaction


@transaction.atomic
def credit_wallet(user, amount, reason, description="", order=None, event=None, reference=None):
    amount = Decimal(amount)
    if amount <= 0:
        raise ValueError("Wallet credit must be greater than zero.")
    Wallet.objects.get_or_create(user=user)
    wallet = Wallet.objects.select_for_update().get(user=user)
    if reference and WalletTransaction.objects.filter(reference=reference).exists():
        return wallet
    wallet.balance += amount
    wallet.save(update_fields=("balance", "updated_at"))
    WalletTransaction.objects.create(wallet=wallet, amount=amount, balance_after=wallet.balance,
                                     transaction_type=WalletTransaction.TransactionType.CREDIT,
                                     reason=reason, description=description, order=order, event=event, reference=reference)
    return wallet


@transaction.atomic
def debit_wallet(user, amount, reason, description="", order=None, event=None, reference=None):
    amount = Decimal(amount)
    if amount <= 0:
        raise ValueError("Wallet debit must be greater than zero.")
    Wallet.objects.get_or_create(user=user)
    wallet = Wallet.objects.select_for_update().get(user=user)
    if reference and WalletTransaction.objects.filter(reference=reference).exists():
        return wallet
    if wallet.balance < amount:
        raise ValueError("Insufficient wallet balance.")
    wallet.balance -= amount
    wallet.save(update_fields=("balance", "updated_at"))
    WalletTransaction.objects.create(wallet=wallet, amount=amount, balance_after=wallet.balance,
                                     transaction_type=WalletTransaction.TransactionType.DEBIT,
                                     reason=reason, description=description, order=order, event=event, reference=reference)
    return wallet
