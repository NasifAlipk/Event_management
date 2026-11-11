from decimal import Decimal

import stripe
from django.conf import settings
from django.db import transaction
from django.http import HttpResponse
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from checkout.models import CheckoutOrder
from checkout.serializers import CheckoutQuoteSerializer, calculate_quote
from event.models import Event
from coupon.models import Coupon
from wallet.models import Wallet, WalletTransaction
from .serializers import StripeSessionSerializer

stripe.api_key = settings.STRIPE_SECRET_KEY


class PaymentMethodOptionsView(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request):
        # These are display options only until payment processing is implemented.
        wallet, _ = Wallet.objects.get_or_create(user=request.user)
        return Response({"methods": [{"code": "WALLET", "name": "Wallet", "enabled": True, "balance": wallet.balance}, {"code": "STRIPE", "name": "Stripe", "enabled": bool(settings.STRIPE_SECRET_KEY)}]})


def _wallet_quote(event, quantities, coupon):
    quote = calculate_quote(event, quantities, coupon)
    eligible = max(quote["ticket_price"] - quote["coupon_discount"], Decimal("0.00"))
    wallet_discount = (eligible * Decimal("0.10")).quantize(Decimal("0.01"))
    taxable = max(quote["ticket_price"] + quote["convenience_fee"] - quote["coupon_discount"] - wallet_discount, Decimal("0.00"))
    gst = (taxable * Decimal("0.18")).quantize(Decimal("0.01"))
    return {**quote, "wallet_discount": wallet_discount, "gst": gst, "total": (taxable + gst).quantize(Decimal("0.01"))}


class WalletPaymentView(APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request):
        serializer = StripeSessionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        values = serializer.validated_data
        event = Event.objects.filter(pk=values["event_id"], status=Event.Status.APPROVED).first()
        if event is None:
            return Response({"detail": "This event is not available for checkout."}, status=404)
        if event.start_date < timezone.localdate():
            return Response({"detail": "Booking is unavailable because this event has completed."}, status=400)
        quote_serializer = CheckoutQuoteSerializer(data=values)
        quote_serializer.is_valid(raise_exception=True)
        quantities = {key: quote_serializer.validated_data.get(key, 0) for key in ("regular", "vip", "premium")}
        from checkout.views import CheckoutQuoteView
        code = quote_serializer.validated_data.get("coupon", "")
        coupon = CheckoutQuoteView.get_coupon(event, code, request.user)
        if code and coupon is None:
            return Response({"detail": "This coupon is invalid, expired, or unavailable."}, status=400)
        quote = _wallet_quote(event, quantities, coupon)
        if quote["total"] <= Decimal("0.00"):
            return Response({"detail": "Select at least one ticket before paying."}, status=400)
        if coupon and quote["ticket_price"] < coupon.minimum_purchase:
            return Response({"detail": f"This coupon requires a minimum purchase of ₹{coupon.minimum_purchase}."}, status=400)
        with transaction.atomic():
            idempotency_key = str(request.data.get("idempotency_key") or "").strip()
            reference = f"WALLET_PAYMENT:{idempotency_key}" if idempotency_key else ""
            if reference:
                previous = WalletTransaction.objects.filter(reference=reference, wallet__user=request.user).select_related("order").first()
                if previous:
                    return Response({"status": previous.order.status, "order_id": str(previous.order_id), "total": previous.amount, "wallet_balance": previous.balance_after})
            event = Event.objects.select_for_update().get(pk=event.pk)
            limits = {"regular": event.regular_quantity, "vip": event.vip_quantity, "premium": event.premium_quantity}
            if any(quantities[key] > limits[key] for key in quantities):
                return Response({"detail": "One or more selected ticket quantities are unavailable."}, status=400)
            locked_coupon = None
            if coupon:
                locked_coupon = Coupon.objects.select_for_update().get(pk=coupon.pk)
                if locked_coupon.usage_limit_total and locked_coupon.usage_count >= locked_coupon.usage_limit_total:
                    return Response({"detail": "This coupon has reached its usage limit."}, status=400)
                if locked_coupon.usage_limit_per_user and CheckoutOrder.objects.filter(coupon=locked_coupon, user=request.user, status=CheckoutOrder.Status.PAID).count() >= locked_coupon.usage_limit_per_user:
                    return Response({"detail": "You have already reached this coupon's usage limit."}, status=400)
            wallet, _ = Wallet.objects.select_for_update().get_or_create(user=request.user)
            if wallet.balance < quote["total"]:
                return Response({"detail": "Insufficient wallet balance for this purchase."}, status=400)
            order = CheckoutOrder.objects.create(user=request.user, event=event, coupon=locked_coupon,
                status=CheckoutOrder.Status.PAID, regular_quantity=quantities["regular"], vip_quantity=quantities["vip"],
                premium_quantity=quantities["premium"], ticket_price=quote["ticket_price"], convenience_fee=quote["convenience_fee"],
                gst=quote["gst"], coupon_discount=quote["coupon_discount"], wallet_discount=quote["wallet_discount"], total=quote["total"])
            for key, field in (("regular", "regular_quantity"), ("vip", "vip_quantity"), ("premium", "premium_quantity")):
                setattr(event, field, getattr(event, field) - quantities[key])
            event.save(update_fields=("regular_quantity", "vip_quantity", "premium_quantity", "updated_at"))
            wallet.balance -= quote["total"]
            wallet.save(update_fields=("balance", "updated_at"))
            WalletTransaction.objects.create(wallet=wallet, transaction_type=WalletTransaction.TransactionType.DEBIT,
                reason=WalletTransaction.Reason.TICKET_PURCHASE, amount=quote["total"], balance_after=wallet.balance,
                order=order, event=event, reference=reference or f"WALLET_PAYMENT:{order.id}")
            if locked_coupon:
                locked_coupon.usage_count += 1
                locked_coupon.save(update_fields=("usage_count", "updated_at"))
            from ticket.services import issue_tickets
            issue_tickets(order)
        return Response({"status": "PAID", "order_id": str(order.id), "total": order.total, "wallet_balance": wallet.balance})


class WalletOrderStatusView(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request, order_id):
        order = CheckoutOrder.objects.filter(id=order_id, user=request.user).first()
        if not order:
            return Response({"detail": "Order not found."}, status=404)
        return Response({"status": order.status, "order_id": str(order.id), "total": order.total})


class CreateStripeCheckoutSessionView(APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request):
        serializer = StripeSessionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        values = serializer.validated_data
        event = Event.objects.filter(pk=values["event_id"], status=Event.Status.APPROVED).select_related("organizer").first()
        if event is None:
            return Response({"detail": "This event is not available for checkout."}, status=status.HTTP_404_NOT_FOUND)
        if event.start_date < timezone.localdate():
            return Response({"detail": "Booking is unavailable because this event has completed."}, status=status.HTTP_400_BAD_REQUEST)
        quote_serializer = CheckoutQuoteSerializer(data=values)
        quote_serializer.is_valid(raise_exception=True)
        quantities = {key: quote_serializer.validated_data.get(key, 0) for key in ("regular", "vip", "premium")}
        for ticket, limit in (("regular", event.regular_quantity), ("vip", event.vip_quantity), ("premium", event.premium_quantity)):
            if quantities[ticket] > limit:
                return Response({"detail": f"The selected {ticket} ticket quantity is not available."}, status=status.HTTP_400_BAD_REQUEST)
        from checkout.views import CheckoutQuoteView
        code = quote_serializer.validated_data.get("coupon", "")
        coupon = CheckoutQuoteView.get_coupon(event, code, request.user)
        if code and coupon is None:
            exhausted = Coupon.objects.filter(code=code, organizer=event.organizer).first()
            if exhausted and exhausted.usage_limit_total and exhausted.usage_count >= exhausted.usage_limit_total:
                return Response({"detail": "This coupon has reached its usage limit."}, status=status.HTTP_400_BAD_REQUEST)
            return Response({"detail": "This coupon is invalid, expired, or unavailable for this event organizer."}, status=status.HTTP_400_BAD_REQUEST)
        quote = calculate_quote(event, quantities, coupon)
        if coupon and quote["ticket_price"] < coupon.minimum_purchase:
            return Response({"detail": f"This coupon requires a minimum purchase of ₹{coupon.minimum_purchase}."}, status=status.HTTP_400_BAD_REQUEST)
        if quote["total"] <= Decimal("0.00"):
            return Response({"detail": "The checkout total must be greater than zero."}, status=status.HTTP_400_BAD_REQUEST)
        order = CheckoutOrder.objects.create(
            user=request.user, event=event, coupon=coupon,
            regular_quantity=quantities["regular"], vip_quantity=quantities["vip"], premium_quantity=quantities["premium"],
            ticket_price=quote["ticket_price"], convenience_fee=quote["convenience_fee"], gst=quote["gst"],
            coupon_discount=quote["coupon_discount"], total=quote["total"],
        )
        try:
            session = stripe.checkout.Session.create(
                mode="payment",
                line_items=[{"price_data": {"currency": "inr", "product_data": {"name": f"{event.title} tickets"}, "unit_amount": int(quote["total"] * 100)}, "quantity": 1}],
                customer_email=request.user.email,
                success_url=f"{settings.FRONTEND_URL.rstrip('/')}/booking/payment/success?session_id={{CHECKOUT_SESSION_ID}}",
                cancel_url=f"{settings.FRONTEND_URL.rstrip('/')}/booking/payment/cancelled",
                metadata={"order_id": str(order.id), "event_id": str(event.id), "user_id": str(request.user.id)},
            )
        except stripe.error.StripeError as error:
            order.status = CheckoutOrder.Status.FAILED
            order.save(update_fields=("status", "updated_at"))
            return Response({"detail": str(error)}, status=status.HTTP_502_BAD_GATEWAY)
        order.stripe_session_id = session.id
        order.save(update_fields=("stripe_session_id", "updated_at"))
        return Response({"checkout_url": session.url, "session_id": session.id})


class StripeSessionStatusView(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request, session_id):
        order = CheckoutOrder.objects.filter(stripe_session_id=session_id, user=request.user).first()
        if order is None:
            return Response({"detail": "Checkout session not found."}, status=status.HTTP_404_NOT_FOUND)
        return Response({"status": order.status, "order_id": str(order.id), "total": order.total})


def _reserve_capacity(order):
    """Atomically consume the purchased quantities from the event stock."""
    event = Event.objects.select_for_update().get(pk=order.event_id)
    quantities = {
        "regular_quantity": order.regular_quantity,
        "vip_quantity": order.vip_quantity,
        "premium_quantity": order.premium_quantity,
    }
    if any(getattr(event, field) < quantity for field, quantity in quantities.items()):
        return None
    for field, quantity in quantities.items():
        setattr(event, field, getattr(event, field) - quantity)
    event.save(update_fields=(*quantities.keys(), "updated_at"))
    order.event = event
    return event


def _lock_coupon_for_redemption(order):
    """Lock a coupon and validate it without changing usage yet."""
    if not order.coupon_id:
        return None
    coupon = Coupon.objects.select_for_update().get(pk=order.coupon_id)
    today = timezone.localdate()
    if coupon.status != Coupon.Status.APPROVED or coupon.start_date > today or coupon.end_date < today:
        return False
    if coupon.usage_limit_total and coupon.usage_count >= coupon.usage_limit_total:
        return False
    if coupon.usage_limit_per_user:
        redeemed = CheckoutOrder.objects.filter(coupon=coupon, user=order.user, status=CheckoutOrder.Status.PAID).count()
        if redeemed >= coupon.usage_limit_per_user:
            return False
    return coupon


def _stripe_data(value):
    """Return Stripe SDK objects as plain dictionaries before reading nested data."""
    if hasattr(value, "to_dict"):
        return value.to_dict()
    if isinstance(value, dict):
        return value
    return {}


@method_decorator(csrf_exempt, name="dispatch")
class StripeWebhookView(APIView):
    authentication_classes = ()
    permission_classes = ()

    def post(self, request):
        signature = request.META.get("HTTP_STRIPE_SIGNATURE", "")
        try:
            event = stripe.Webhook.construct_event(request.body, signature, settings.STRIPE_WEBHOOK_SECRET)
        except (ValueError, stripe.error.SignatureVerificationError):
            return HttpResponse("Invalid webhook", status=400)
        payload = _stripe_data(event)
        event_type = payload.get("type")
        # Only Checkout Session lifecycle events can change a CheckoutOrder.
        # Other Stripe events (for example charge.succeeded) are acknowledged.
        handled_events = {
            "checkout.session.completed",
            "checkout.session.expired",
            "checkout.session.async_payment_failed",
        }
        if event_type not in handled_events:
            return HttpResponse(status=200)

        session = _stripe_data((payload.get("data") or {}).get("object"))
        order_id = (session.get("metadata") or {}).get("order_id")
        if not order_id:
            return HttpResponse(status=200)
        with transaction.atomic():
            try:
                order = CheckoutOrder.objects.select_for_update().select_related("event").get(pk=order_id)
            except CheckoutOrder.DoesNotExist:
                return HttpResponse(status=200)
            if event_type == "checkout.session.completed":
                if order.status != CheckoutOrder.Status.PAID:
                    coupon = _lock_coupon_for_redemption(order)
                    if coupon is not False and _reserve_capacity(order) is not None:
                        if coupon is not None:
                            coupon.usage_count += 1
                            coupon.save(update_fields=("usage_count", "updated_at"))
                        order.status = CheckoutOrder.Status.PAID
                        order.stripe_payment_intent = session.get("payment_intent") or ""
                        from ticket.services import issue_tickets
                        issue_tickets(order)
                    else:
                        order.status = CheckoutOrder.Status.FAILED
                    order.save(update_fields=("status", "stripe_payment_intent", "updated_at"))
            elif event_type in ("checkout.session.expired", "checkout.session.async_payment_failed") and order.status == CheckoutOrder.Status.PENDING:
                order.status = CheckoutOrder.Status.CANCELLED if event_type.endswith("expired") else CheckoutOrder.Status.FAILED
                order.save(update_fields=("status", "updated_at"))
        return HttpResponse(status=200)
