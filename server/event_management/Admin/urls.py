from django.urls import path
from .views import AdminCustomersView, AdminOverviewView, AdminProfileView, AdminUsersView

urlpatterns = [
    path("profile/", AdminProfileView.as_view()),
    path("overview/", AdminOverviewView.as_view()),
    path("users/", AdminUsersView.as_view()),
    path("customers/", AdminCustomersView.as_view()),
]
