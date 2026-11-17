from django.urls import path

from .views import FinanceOverviewView


urlpatterns = [
    path("", FinanceOverviewView.as_view(), name="finance-overview"),
]
