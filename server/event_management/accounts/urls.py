from django.urls import path

from .views import CsrfTokenView, LoginView, LogoutView, MeView, RefreshView, RegisterView, UserRoleView

urlpatterns = [
    path('csrf/', CsrfTokenView.as_view(), name='csrf'),
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('refresh/', RefreshView.as_view(), name='refresh'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('me/', MeView.as_view(), name='me'),
    path('users/<int:user_id>/role/', UserRoleView.as_view(), name='user-role'),
]
