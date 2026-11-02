from decimal import Decimal

from rest_framework import serializers


class CheckoutQuoteSerializer(serializers.Serializer):
    regular = serializers.IntegerField(min_value=0, required=False, default=0)
    vip = serializers.IntegerField(min_value=0, required=False, default=0)
    premium = serializers.IntegerField(min_value=0, required=False, default=0)
    coupon = serializers.CharField(required=False, allow_blank=True, max_length=40)

    def validate(self, attrs):
        return attrs


def calculate_quote(event, quantities, coupon=None):
    ticket_price = sum((
        Decimal(str(getattr(event, price))) * quantities.get(ticket, 0)
        for ticket, price in (("regular", "regular_price"), ("vip", "vip_price"), ("premium", "premium_price"))
    ), Decimal("0.00"))
    ticket_count = sum(quantities.values())
    convenience_fee = Decimal("20.00") * ticket_count
    coupon_discount = Decimal("0.00")
    if coupon:
        coupon_discount = ticket_price * coupon.discount_value / Decimal("100") if coupon.discount_type == "PERCENTAGE" else coupon.discount_value
        if coupon.max_discount is not None:
            coupon_discount = min(coupon_discount, coupon.max_discount)
        coupon_discount = min(ticket_price, coupon_discount)
    taxable_amount = max(Decimal("0.00"), ticket_price + convenience_fee - coupon_discount)
    gst = taxable_amount * Decimal("0.18")
    total = max(Decimal("0.00"), taxable_amount + gst)
    return {
        "ticket_count": ticket_count,
        "ticket_price": ticket_price,
        "convenience_fee": convenience_fee,
        "gst": gst,
        "wallet_discount": Decimal("0.00"),
        "coupon_discount": coupon_discount,
        "total": total,
    }
