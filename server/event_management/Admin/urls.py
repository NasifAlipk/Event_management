from django.urls import path
from .views import AdminOverviewView, AdminProfileView, AdminUsersView

urlpatterns = [
    path("profile/", AdminProfileView.as_view()),
    path("overview/", AdminOverviewView.as_view()),
    path("users/", AdminUsersView.as_view()),
]
