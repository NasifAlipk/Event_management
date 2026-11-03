from decimal import Decimal

import stripe
from django.conf import settings
from django.db import transaction
from django.db.models import Sum
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
from .serializers import StripeSessionSerializer

stripe.api_key = settings.STRIPE_SECRET_KEY


class PaymentMethodOptionsView(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request):
        # These are display options only until payment processing is implemented.
        return Response({"methods": [{"code": "WALLET", "name": "Wallet", "enabled": False}, {"code": "STRIPE", "name": "Stripe", "enabled": bool(settings.STRIPE_SECRET_KEY)}]})


class CreateStripeCheckoutSessionView(APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request):
        serializer = StripeSessionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        values = serializer.validated_data
        event = Event.objects.filter(pk=values["event_id"], status=Event.Status.APPROVED).select_related("organizer").first()
        if event is None:
            return Response({"detail": "This event is not available for checkout."}, status=status.HTTP_404_NOT_FOUND)
        quote_serializer = CheckoutQuoteSerializer(data=values)
        quote_serializer.is_valid(raise_exception=True)
        quantities = {key: quote_serializer.validated_data.get(key, 0) for key in ("regular", "vip", "premium")}
        for ticket, limit in (("regular", event.regular_quantity), ("vip", event.vip_quantity), ("premium", event.premium_quantity)):
            if quantities[ticket] > limit:
                return Response({"detail": f"The selected {ticket} ticket quantity is not available."}, status=status.HTTP_400_BAD_REQUEST)
        from checkout.views import CheckoutQuoteView
        code = quote_serializer.validated_data.get("coupon", "")
        coupon = CheckoutQuoteView.get_coupon(event, code)
        if code and coupon is None:
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


def _has_capacity(order):
    paid = CheckoutOrder.objects.filter(event=order.event, status=CheckoutOrder.Status.PAID).exclude(pk=order.pk).aggregate(
        regular=Sum("regular_quantity"), vip=Sum("vip_quantity"), premium=Sum("premium_quantity")
    )
    return all((paid[ticket] or 0) + getattr(order, f"{ticket}_quantity") <= getattr(order.event, f"{ticket}_quantity") for ticket in ("regular", "vip", "premium"))


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
        event_type = event["type"]
        session = event["data"]["object"]
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
                    if _has_capacity(order):
                        order.status = CheckoutOrder.Status.PAID
                        order.stripe_payment_intent = session.get("payment_intent") or ""
                    else:
                        order.status = CheckoutOrder.Status.FAILED
                    order.save(update_fields=("status", "stripe_payment_intent", "updated_at"))
            elif event_type in ("checkout.session.expired", "checkout.session.async_payment_failed") and order.status == CheckoutOrder.Status.PENDING:
                order.status = CheckoutOrder.Status.CANCELLED if event_type.endswith("expired") else CheckoutOrder.Status.FAILED
                order.save(update_fields=("status", "updated_at"))
        return HttpResponse(status=200)
