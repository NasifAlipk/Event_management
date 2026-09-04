from django.urls import path

from .views import (
    CsrfTokenView,
    LoginView,
    LogoutView,
    MeView,
    RefreshView,
    RegisterView,
    ResendVerificationCodeView,
    UserRoleView,
    VerifyEmailView,
    AdminForgotPasswordView,
    AdminResetPasswordView,
    AdminChangePasswordView,
)

urlpatterns = [
    path('csrf/', CsrfTokenView.as_view(), name='csrf'),
    path('register/', RegisterView.as_view(), name='register'),
    path('verify-email/', VerifyEmailView.as_view(), name='verify-email'),
    path('resend-verification-code/', ResendVerificationCodeView.as_view(), name='resend-verification-code'),
    path('login/', LoginView.as_view(), name='login'),
    path('refresh/', RefreshView.as_view(), name='refresh'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('me/', MeView.as_view(), name='me'),
    path('users/<int:user_id>/role/', UserRoleView.as_view(), name='user-role'),
    path('admin/forgot-password/', AdminForgotPasswordView.as_view(), name='admin-forgot-password'),
    path('admin/reset-password/<uid>/<token>/', AdminResetPasswordView.as_view(), name='admin-reset-password'),
    path('admin/change-password/', AdminChangePasswordView.as_view(), name='admin-change-password'),
]
