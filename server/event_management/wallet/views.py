from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Wallet, WalletTransaction
from .serializers import WalletTransactionSerializer


class WalletView(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request):
        wallet, _ = Wallet.objects.get_or_create(user=request.user)
        transactions = WalletTransaction.objects.filter(wallet=wallet).select_related("event", "order")
        return Response({"balance": wallet.balance, "transactions": WalletTransactionSerializer(transactions, many=True, context={"request": request}).data})
