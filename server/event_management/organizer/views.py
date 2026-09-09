from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from accounts.permissions import IsAdministrator

from .models import OrganizerApplication
from .serializers import OrganizerApplicationReviewSerializer, OrganizerApplicationSerializer


class OrganizerApplicationView(APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request):
        if OrganizerApplication.objects.filter(
            user=request.user,
            status__in=(OrganizerApplication.Status.PENDING, OrganizerApplication.Status.APPROVED),
        ).exists():
            return Response(
                {"detail": "You already have an active organizer application."},
                status=status.HTTP_400_BAD_REQUEST,
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
