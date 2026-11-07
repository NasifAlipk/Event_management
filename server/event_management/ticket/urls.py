from django.urls import path

from .views import AdminTicketsView, MyTicketsView, ProfileTicketsView, TicketDetailView, VerifyTicketView

urlpatterns = [
    path("my/", MyTicketsView.as_view(), name="my-tickets"),
    path("profile/", ProfileTicketsView.as_view(), name="profile-tickets"),
    path("admin/", AdminTicketsView.as_view(), name="admin-tickets"),
    path("<uuid:ticket_id>/", TicketDetailView.as_view(), name="ticket-detail"),
    path("<uuid:ticket_id>/verify/", VerifyTicketView.as_view(), name="ticket-verify"),
]
