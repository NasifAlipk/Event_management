from django.urls import path

from .views import (
    CsrfTokenView,
    LoginView,
    LogoutView,
    MeView,
    ProfileView,
    RefreshView,
    RegisterView,
    ResendVerificationCodeView,
    UserRoleView,
    VerifyEmailView,
    AdminForgotPasswordView,
    AdminResetPasswordView,
    AdminChangePasswordView,
    ForgotPasswordView,
    ResetPasswordView,
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
    path('profile/', ProfileView.as_view(), name='profile'),
    path('users/<int:user_id>/role/', UserRoleView.as_view(), name='user-role'),
    path('admin/forgot-password/', AdminForgotPasswordView.as_view(), name='admin-forgot-password'),
    path('admin/reset-password/<uid>/<token>/', AdminResetPasswordView.as_view(), name='admin-reset-password'),
    path('admin/change-password/', AdminChangePasswordView.as_view(), name='admin-change-password'),
    path('forgot-password/', ForgotPasswordView.as_view(), name='forgot-password'),
    path('reset-password/<uid>/<token>/', ResetPasswordView.as_view(), name='reset-password'),
]
