from django.utils import timezone
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from coupon.models import Coupon
from coupon.serializers import CouponSerializer
from event.models import Event
from event.serializers import EventSerializer
from .serializers import CheckoutQuoteSerializer, calculate_quote


class CheckoutQuoteView(APIView):
    permission_classes = (IsAuthenticated,)

    def get_event(self, event_id):
        return Event.objects.filter(pk=event_id, status=Event.Status.APPROVED).select_related("organizer").first()

    @staticmethod
    def get_coupon(event, code):
        return Coupon.objects.filter(
            code=(code or "").strip().upper(),
            organizer=event.organizer,
            status=Coupon.Status.APPROVED,
            start_date__lte=timezone.localdate(),
            end_date__gte=timezone.localdate(),
        ).first()

    @staticmethod
    def available_coupons(event):
        coupons = Coupon.objects.filter(
            organizer=event.organizer,
            status=Coupon.Status.APPROVED,
            start_date__lte=timezone.localdate(),
            end_date__gte=timezone.localdate(),
        )
        return CouponSerializer(coupons, many=True).data

    def build_response(self, request, event_id, values):
        event = self.get_event(event_id)
        if event is None:
            return Response({"detail": "This event is not available for checkout."}, status=status.HTTP_404_NOT_FOUND)
        quantities = {ticket: values.get(ticket, 0) for ticket in ("regular", "vip", "premium")}
        limits = {"regular": event.regular_quantity, "vip": event.vip_quantity, "premium": event.premium_quantity}
        for ticket, quantity in quantities.items():
            if quantity > limits[ticket]:
                return Response({"detail": f"The selected {ticket} ticket quantity is not available."}, status=status.HTTP_400_BAD_REQUEST)
        code = (values.get("coupon") or "").strip().upper()
        coupon = self.get_coupon(event, code)
        if code and coupon is None:
            return Response({"detail": "This coupon is invalid, expired, or unavailable for this event organizer."}, status=status.HTTP_400_BAD_REQUEST)
        if coupon and coupon.minimum_purchase > 0:
            ticket_total = sum((getattr(event, field) * quantities[ticket] for ticket, field in (("regular", "regular_price"), ("vip", "vip_price"), ("premium", "premium_price"))), 0)
            if ticket_total < coupon.minimum_purchase:
                return Response({"detail": f"This coupon requires a minimum purchase of ₹{coupon.minimum_purchase}."}, status=status.HTTP_400_BAD_REQUEST)
        return Response({
            "event": EventSerializer(event, context={"request": request}).data,
            "quantities": quantities,
            "pricing": calculate_quote(event, quantities, coupon),
            "coupon": CouponSerializer(coupon).data if coupon else None,
            "coupons": self.available_coupons(event),
        })

    def get(self, request, event_id):
        serializer = CheckoutQuoteSerializer(data=request.query_params)
        serializer.is_valid(raise_exception=True)
        return self.build_response(request, event_id, serializer.validated_data)

    def post(self, request, event_id):
        serializer = CheckoutQuoteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        return self.build_response(request, event_id, serializer.validated_data)


class CheckoutCouponsView(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request, event_id):
        event = Event.objects.filter(pk=event_id, status=Event.Status.APPROVED).first()
        if event is None:
            return Response({"detail": "This event is not available for checkout."}, status=status.HTTP_404_NOT_FOUND)
        return Response({"coupons": CheckoutQuoteView.available_coupons(event)})
