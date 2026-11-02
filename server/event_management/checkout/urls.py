from django.urls import path

from .views import CheckoutCouponsView, CheckoutQuoteView

urlpatterns = [
    path("<int:event_id>/coupons/", CheckoutCouponsView.as_view(), name="checkout-coupons"),
    path("<int:event_id>/quote/", CheckoutQuoteView.as_view(), name="checkout-quote"),
]
