from django.urls import path

from .views import FinanceOverviewView, FinanceReportView


urlpatterns = [
    path("", FinanceOverviewView.as_view(), name="finance-overview"),
    path("report/", FinanceReportView.as_view(), name="finance-report"),
]
