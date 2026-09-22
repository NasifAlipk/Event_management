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


class PublishedEventDetailView(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request, event_id):
        try:
            event = Event.objects.get(pk=event_id, status=Event.Status.APPROVED, visibility=Event.Visibility.PUBLIC)
        except Event.DoesNotExist:
            return Response({"detail": "Event not found."}, status=status.HTTP_404_NOT_FOUND)
        return Response({"event": EventSerializer(event, context={"request": request}).data})


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


class OrganizerEventDetailView(APIView):
    permission_classes = (IsAuthenticated,)

    def get_object(self, request, event_id):
        try:
            return Event.objects.get(pk=event_id, organizer=request.user)
        except Event.DoesNotExist:
            return None

    def get(self, request, event_id):
        event = self.get_object(request, event_id)
        if event is None:
            return Response({"detail": "Event not found."}, status=status.HTTP_404_NOT_FOUND)
        return Response({"event": EventSerializer(event, context={"request": request}).data})

    def patch(self, request, event_id):
        event = self.get_object(request, event_id)
        if event is None:
            return Response({"detail": "Event not found."}, status=status.HTTP_404_NOT_FOUND)
        if request.user.role != request.user.Role.ORGANIZER:
            return Response({"detail": "Only organizers can edit events."}, status=status.HTTP_403_FORBIDDEN)
        serializer = EventSerializer(event, data=request.data, partial=True, context={"request": request})
        serializer.is_valid(raise_exception=True)
        # Any edit returns the event to review so changed details are checked.
        event = serializer.save(status=Event.Status.PENDING, rejection_reason="")
        return Response({"event": EventSerializer(event, context={"request": request}).data})

    def delete(self, request, event_id):
        event = self.get_object(request, event_id)
        if event is None:
            return Response({"detail": "Event not found."}, status=status.HTTP_404_NOT_FOUND)
        if request.user.role != request.user.Role.ORGANIZER:
            return Response({"detail": "Only organizers can delete events."}, status=status.HTTP_403_FORBIDDEN)
        event.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class AdminEventsView(APIView):
    permission_classes = (IsAuthenticated, IsAdministrator)

    def get(self, request):
        events = Event.objects.select_related("organizer").all()
        return Response({"events": EventSerializer(events, many=True, context={"request": request}).data})


class AdminEventReviewView(APIView):
    permission_classes = (IsAuthenticated, IsAdministrator)

    def get(self, request, event_id):
        try:
            event = Event.objects.select_related("organizer").get(pk=event_id)
        except Event.DoesNotExist:
            return Response({"detail": "Event not found."}, status=status.HTTP_404_NOT_FOUND)
        return Response({"event": EventSerializer(event, context={"request": request}).data})

    def patch(self, request, event_id):
        try:
            event = Event.objects.get(pk=event_id)
        except Event.DoesNotExist:
            return Response({"detail": "Event not found."}, status=status.HTTP_404_NOT_FOUND)
        serializer = EventReviewSerializer(event, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        event = serializer.save()
        return Response({"event": EventSerializer(event, context={"request": request}).data})
