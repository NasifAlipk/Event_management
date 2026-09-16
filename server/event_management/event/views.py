from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.permissions import IsAdministrator
from .models import Event
from .serializers import EventReviewSerializer, EventSerializer


class PublishedEventsView(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request):
        events = Event.objects.filter(status=Event.Status.APPROVED, visibility=Event.Visibility.PUBLIC)
        return Response({"events": EventSerializer(events, many=True, context={"request": request}).data})


class OrganizerEventsView(APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request):
        if request.user.role != request.user.Role.ORGANIZER:
            return Response({"detail": "Only approved organizers can publish events."}, status=status.HTTP_403_FORBIDDEN)
        serializer = EventSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        event = serializer.save(organizer=request.user)
        return Response({"event": EventSerializer(event, context={"request": request}).data}, status=status.HTTP_201_CREATED)

    def get(self, request):
        events = Event.objects.filter(organizer=request.user)
        return Response({"events": EventSerializer(events, many=True, context={"request": request}).data})


class AdminEventsView(APIView):
    permission_classes = (IsAuthenticated, IsAdministrator)

    def get(self, request):
        events = Event.objects.select_related("organizer").all()
        return Response({"events": EventSerializer(events, many=True, context={"request": request}).data})


class AdminEventReviewView(APIView):
    permission_classes = (IsAuthenticated, IsAdministrator)

    def patch(self, request, event_id):
        try:
            event = Event.objects.get(pk=event_id)
        except Event.DoesNotExist:
            return Response({"detail": "Event not found."}, status=status.HTTP_404_NOT_FOUND)
        serializer = EventReviewSerializer(event, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        event = serializer.save()
        return Response({"event": EventSerializer(event, context={"request": request}).data})
