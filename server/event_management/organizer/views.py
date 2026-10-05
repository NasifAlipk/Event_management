from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from accounts.permissions import IsAdministrator
from datetime import timedelta

from django.utils import timezone

from .models import OrganizerApplication
from .serializers import OrganizerApplicationReviewSerializer, OrganizerApplicationSerializer


class OrganizerApplicationView(APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request):
        active_application = OrganizerApplication.objects.filter(
            user=request.user,
            status__in=(OrganizerApplication.Status.PENDING, OrganizerApplication.Status.APPROVED),
        ).exists()
        if active_application:
            return Response(
                {"detail": "You already have an active organizer application."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        last_rejected = OrganizerApplication.objects.filter(
            user=request.user,
            status=OrganizerApplication.Status.REJECTED,
        ).order_by("-updated_at").first()
        if last_rejected:
            retry_at = last_rejected.updated_at + timedelta(days=3)
            if timezone.now() < retry_at:
                remaining = retry_at - timezone.now()
                hours = max(1, int(remaining.total_seconds() // 3600))
                retry_label = timezone.localtime(retry_at).strftime("%d %b %Y at %I:%M %p")
                return Response(
                    {"detail": f"Your application was rejected. You can submit a new application after {retry_label} (about {hours} hours remaining)."},
                    status=status.HTTP_429_TOO_MANY_REQUESTS,
                )
        serializer = OrganizerApplicationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        application = serializer.save(user=request.user)
        return Response(
            {"application": OrganizerApplicationSerializer(application).data},
            status=status.HTTP_201_CREATED,
        )

    def get(self, request):
        applications = OrganizerApplication.objects.filter(user=request.user)
        return Response({"applications": OrganizerApplicationSerializer(applications, many=True).data})


class AdminOrganizerApplicationsView(APIView):
    permission_classes = (IsAuthenticated, IsAdministrator)

    def get(self, request):
        applications = OrganizerApplication.objects.select_related("user").all()
        return Response({"applications": OrganizerApplicationSerializer(applications, many=True).data})


class AdminOrganizerApplicationDetailView(APIView):
    permission_classes = (IsAuthenticated, IsAdministrator)

    def get_object(self, application_id):
        return OrganizerApplication.objects.select_related("user").get(pk=application_id)

    def get(self, request, application_id):
        try:
            application = self.get_object(application_id)
        except OrganizerApplication.DoesNotExist:
            return Response({"detail": "Application not found."}, status=status.HTTP_404_NOT_FOUND)
        return Response({"application": OrganizerApplicationSerializer(application).data})

    def patch(self, request, application_id):
        try:
            application = self.get_object(application_id)
        except OrganizerApplication.DoesNotExist:
            return Response({"detail": "Application not found."}, status=status.HTTP_404_NOT_FOUND)
        serializer = OrganizerApplicationReviewSerializer(application, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        application = serializer.save()
        if application.status == OrganizerApplication.Status.APPROVED:
            application.user.role = application.user.Role.ORGANIZER
            application.user.save(update_fields=("role",))
        elif application.status == OrganizerApplication.Status.REJECTED:
            application.user.role = application.user.Role.USER
            application.user.save(update_fields=("role",))
        return Response({"application": OrganizerApplicationSerializer(application).data})
