from django.urls import path

from .views import CancelBookingView

urlpatterns = [
    path("bookings/<uuid:order_id>/cancel/", CancelBookingView.as_view(), name="cancel-booking"),
]
