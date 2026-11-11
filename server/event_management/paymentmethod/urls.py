from django.urls import path

from .views import CreateStripeCheckoutSessionView, PaymentMethodOptionsView, StripeSessionStatusView, StripeWebhookView, WalletPaymentView, WalletOrderStatusView

urlpatterns = [
    path("stripe/session/", CreateStripeCheckoutSessionView.as_view(), name="stripe-session"),
    path("stripe/session/<str:session_id>/", StripeSessionStatusView.as_view(), name="stripe-session-status"),
    path("stripe/webhook/", StripeWebhookView.as_view(), name="stripe-webhook"),
    path("wallet/pay/", WalletPaymentView.as_view(), name="wallet-pay"),
    path("wallet/order/<uuid:order_id>/", WalletOrderStatusView.as_view(), name="wallet-order-status"),
    path("webhook/", StripeWebhookView.as_view(), name="stripe-webhook-legacy"),
    path("", PaymentMethodOptionsView.as_view(), name="payment-method-options"),
]
