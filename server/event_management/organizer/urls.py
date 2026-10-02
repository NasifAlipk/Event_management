from django.urls import path

from .views import (
    AdminOrganizerApplicationDetailView,
    AdminOrganizerApplicationsView,
    OrganizerApplicationView,
)


urlpatterns = [
    path("applications/", OrganizerApplicationView.as_view(), name="organizer-applications"),
    path("admin/applications/", AdminOrganizerApplicationsView.as_view(), name="admin-organizer-applications"),
    path("admin/applications/<int:application_id>/", AdminOrganizerApplicationDetailView.as_view(), name="admin-organizer-application-detail"),
]
