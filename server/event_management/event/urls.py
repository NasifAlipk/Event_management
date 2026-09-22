from django.urls import path

from .views import AdminEventReviewView, AdminEventsView, OrganizerEventDetailView, OrganizerEventsView, PublishedEventDetailView, PublishedEventsView

urlpatterns = [
    path("published/", PublishedEventsView.as_view(), name="published-events"),
    path("published/<int:event_id>/", PublishedEventDetailView.as_view(), name="published-event-detail"),
    path("organizer/", OrganizerEventsView.as_view(), name="organizer-events"),
    path("organizer/<int:event_id>/", OrganizerEventDetailView.as_view(), name="organizer-event-detail"),
    path("admin/", AdminEventsView.as_view(), name="admin-events"),
    path("admin/<int:event_id>/review/", AdminEventReviewView.as_view(), name="admin-event-review"),
]
