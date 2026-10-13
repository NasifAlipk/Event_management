from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from coupon.models import Coupon
from event.models import Event
from .serializers import OrganizerDashboardSerializer


class OrganizerDashboardView(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request):
        events = Event.objects.filter(organizer=request.user)
        payload = {
            "organized_events": events.count(),
            "pending_events": events.filter(status=Event.Status.PENDING).count(),
            "total_coupons": Coupon.objects.filter(organizer=request.user).count(),
        }
        return Response(OrganizerDashboardSerializer(payload).data)
