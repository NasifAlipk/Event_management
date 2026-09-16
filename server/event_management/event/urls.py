from django.urls import path

from .views import AdminEventReviewView, AdminEventsView, OrganizerEventsView, PublishedEventsView

urlpatterns = [
    path("published/", PublishedEventsView.as_view(), name="published-events"),
    path("organizer/", OrganizerEventsView.as_view(), name="organizer-events"),
    path("admin/", AdminEventsView.as_view(), name="admin-events"),
    path("admin/<int:event_id>/review/", AdminEventReviewView.as_view(), name="admin-event-review"),
]
