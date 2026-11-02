from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView


class PaymentMethodOptionsView(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request):
        # These are display options only until payment processing is implemented.
        return Response({"methods": [{"code": "WALLET", "name": "Wallet", "enabled": False}, {"code": "STRIPE", "name": "Stripe", "enabled": False}]})
