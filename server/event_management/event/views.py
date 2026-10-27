from datetime import datetime, timedelta
from django.utils import timezone
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Q
from django.db.models.functions import Least
from django.core.paginator import Paginator
from accounts.permissions import IsAdministrator
from .models import Event
from .serializers import EventReviewSerializer, EventSerializer


def event_cancellation_error(event):
    start_at = timezone.make_aware(
        datetime.combine(event.start_date, event.start_time),
        timezone.get_current_timezone(),
    )
    remaining = start_at - timezone.now()
    if remaining <= timedelta(0):
        return "Events that are running or have already started cannot be cancelled."
    if remaining < timedelta(hours=12):
        return "Events can only be cancelled at least 12 hours before their start time."
    return None


#Explorer page
class PublishedEventsView(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request):
        queryset = Event.objects.filter(status=Event.Status.APPROVED)
        query = request.query_params.get("q", "").strip()
        category = request.query_params.get("category", "").strip()
        event_type = request.query_params.get("type", "").strip()
        event_date = request.query_params.get("date", "").strip()
        sort = request.query_params.get("sort", "").strip()
        if query:
            queryset = queryset.filter(Q(title__icontains=query) | Q(description__icontains=query))
        if category:
            queryset = queryset.filter(category__iexact=category)
        if event_type:
            queryset = queryset.filter(event_type__iexact=event_type)
        if event_date:
            queryset = queryset.filter(start_date=event_date)
        if sort == "TITLE_AZ":
            queryset = queryset.order_by("title", "id")
        elif sort == "TITLE_ZA":
            queryset = queryset.order_by("-title", "-id")
        elif sort == "PRICE_LOW":
            queryset = queryset.annotate(min_ticket_price=Least("regular_price", "vip_price", "premium_price")).order_by("min_ticket_price", "id")
        elif sort == "PRICE_HIGH":
            queryset = queryset.annotate(min_ticket_price=Least("regular_price", "vip_price", "premium_price")).order_by("-min_ticket_price", "-id")
        page_number = max(1, int(request.query_params.get("page", 1) or 1))
        page_size = min(50, max(1, int(request.query_params.get("page_size", 8) or 8)))
        paginator = Paginator(queryset, page_size)
        page = paginator.get_page(page_number)
        categories = list(Event.objects.filter(status=Event.Status.APPROVED).values_list("category", flat=True).distinct().order_by("category"))
        types = list(Event.objects.filter(status=Event.Status.APPROVED).values_list("event_type", flat=True).distinct().order_by("event_type"))
        return Response({"events": EventSerializer(page.object_list, many=True, context={"request": request}).data, "total": paginator.count, "page": page.number, "page_size": page_size, "page_count": paginator.num_pages, "categories": categories, "types": types})


class PublishedEventDetailView(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request, event_id):
        try:
            event = Event.objects.get(pk=event_id, status=Event.Status.APPROVED)
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
        if request.data.get("status") == Event.Status.CANCELLED:
            if event.status == Event.Status.CANCELLED:
                return Response({"detail": "This event is already cancelled."}, status=status.HTTP_400_BAD_REQUEST)
            cancellation_error = event_cancellation_error(event)
            if cancellation_error:
                return Response({"detail": cancellation_error}, status=status.HTTP_400_BAD_REQUEST)
            event.status = Event.Status.CANCELLED
            event.rejection_reason = ""
            event.save(update_fields=("status", "rejection_reason", "updated_at"))
            return Response({"event": EventSerializer(event, context={"request": request}).data})
        if event.status == Event.Status.CANCELLED:
            return Response({"detail": "Cancelled events cannot be edited."}, status=status.HTTP_400_BAD_REQUEST)
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
        cancellation_error = event_cancellation_error(event)
        if cancellation_error:
            return Response({"detail": cancellation_error}, status=status.HTTP_400_BAD_REQUEST)
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
