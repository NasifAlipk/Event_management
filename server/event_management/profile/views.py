from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from checkout.models import CheckoutOrder
from .services import cancel_booking


class CancelBookingView(APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request, order_id):
        order = CheckoutOrder.objects.filter(pk=order_id, user=request.user).first()
        if order is None:
            return Response({"detail": "Booking not found."}, status=status.HTTP_404_NOT_FOUND)
        try:
            cancel_booking(order, request.user)
        except ValueError as error:
            return Response({"detail": str(error)}, status=status.HTTP_400_BAD_REQUEST)
        return Response({"detail": "Ticket booking cancelled successfully."})
