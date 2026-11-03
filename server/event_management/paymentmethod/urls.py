from django.urls import path

from .views import PaymentMethodOptionsView

urlpatterns = [
    path("", PaymentMethodOptionsView.as_view(), name="payment-method-options"),
]
