import secrets
import os
import json
from pathlib import Path
import firebase_admin
from firebase_admin import auth as firebase_auth, credentials
from datetime import timedelta

from django.contrib.auth.hashers import check_password, make_password
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.contrib.auth.password_validation import validate_password
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes
from django.conf import settings
from django.core.mail import send_mail
from django.middleware.csrf import get_token
from django.shortcuts import get_object_or_404
from django.utils import timezone

from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from rest_framework_simplejwt.tokens import RefreshToken

from .models import EmailVerificationCode, User
from .permissions import IsAdministrator
from .serializers import (
    LoginSerializer,
    RegisterSerializer,
    ResendVerificationCodeSerializer,
    RoleUpdateSerializer,
    UserSerializer,
    VerifyEmailSerializer,
)


OTP_EXPIRY_MINUTES = 10
MAX_OTP_ATTEMPTS = 5
password_reset_token = PasswordResetTokenGenerator()


def send_verification_code(user):
    code = f'{secrets.randbelow(1_000_000):06d}'
    EmailVerificationCode.objects.filter(user=user).delete()
    EmailVerificationCode.objects.create(
        user=user,
        code_hash=make_password(code),
        expires_at=timezone.now() + timedelta(minutes=OTP_EXPIRY_MINUTES),
    )
    send_mail(
        subject='Verify your Eventora email',
        message=(
            f'Your Eventora verification code is {code}. '
            f'It expires in {OTP_EXPIRY_MINUTES} minutes.'
        ),
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[user.email],
        fail_silently=False,
    )


def set_auth_cookies(response, access, refresh=None):
    cookie_options = {
        'httponly': True,
        'secure': settings.JWT_COOKIE_SECURE,
        'samesite': settings.JWT_COOKIE_SAMESITE,
        'path': '/',
    }
    response.set_cookie(settings.JWT_ACCESS_COOKIE, str(access), max_age=int(settings.SIMPLE_JWT['ACCESS_TOKEN_LIFETIME'].total_seconds()), **cookie_options)
    if refresh:
        response.set_cookie(settings.JWT_REFRESH_COOKIE, str(refresh), max_age=int(settings.SIMPLE_JWT['REFRESH_TOKEN_LIFETIME'].total_seconds()), **cookie_options)


def clear_auth_cookies(response):
    response.delete_cookie(settings.JWT_ACCESS_COOKIE, path='/', samesite=settings.JWT_COOKIE_SAMESITE)
    response.delete_cookie(settings.JWT_REFRESH_COOKIE, path='/', samesite=settings.JWT_COOKIE_SAMESITE)


class CsrfTokenView(APIView):
    permission_classes = (AllowAny,)
    authentication_classes = ()

    def get(self, request):
        return Response({'csrfToken': get_token(request)})


class RegisterView(APIView):
    permission_classes = (AllowAny,)
    authentication_classes = ()

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        send_verification_code(user)
        return Response(
            {'detail': 'Verification code sent to your email.', 'email': user.email},
            status=status.HTTP_201_CREATED,
        )


class VerifyEmailView(APIView):
    permission_classes = (AllowAny,)
    authentication_classes = ()

    def post(self, request):
        serializer = VerifyEmailSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email']
        user = get_object_or_404(User, email__iexact=email)

        if user.is_active:
            return Response({'detail': 'This email is already verified.'}, status=status.HTTP_400_BAD_REQUEST)

        verification = EmailVerificationCode.objects.filter(user=user).first()
        if not verification or verification.expires_at <= timezone.now():
            return Response({'detail': 'This code has expired. Request a new one.'}, status=status.HTTP_400_BAD_REQUEST)
        if verification.attempts >= MAX_OTP_ATTEMPTS:
            return Response({'detail': 'Too many attempts. Request a new code.'}, status=status.HTTP_400_BAD_REQUEST)
        if not check_password(serializer.validated_data['code'], verification.code_hash):
            verification.attempts += 1
            verification.save(update_fields=['attempts'])
            return Response({'detail': 'The verification code is incorrect.'}, status=status.HTTP_400_BAD_REQUEST)

        user.is_active = True
        user.save(update_fields=['is_active'])
        verification.delete()
        refresh = RefreshToken.for_user(user)
        refresh['role'] = user.role
        response = Response({'user': UserSerializer(user).data})
        set_auth_cookies(response, refresh.access_token, refresh)
        return response


class ResendVerificationCodeView(APIView):
    permission_classes = (AllowAny,)
    authentication_classes = ()

    def post(self, request):
        serializer = ResendVerificationCodeSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = get_object_or_404(User, email__iexact=serializer.validated_data['email'])

        if user.is_active:
            return Response({'detail': 'This email is already verified.'}, status=status.HTTP_400_BAD_REQUEST)

        send_verification_code(user)
        return Response({'detail': 'A new verification code has been sent.'})


class LoginView(APIView):
    permission_classes = (AllowAny,)
    authentication_classes = ()

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        response = Response({'user': UserSerializer(serializer.user).data})
        set_auth_cookies(response, serializer.validated_data['access'], serializer.validated_data['refresh'])
        return response


class GoogleLoginView(APIView):
    permission_classes = (AllowAny,)
    authentication_classes = ()

    def post(self, request):
        id_token = request.data.get('id_token')
        if not id_token:
            return Response({'detail': 'Google identity token is required.'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            if not firebase_admin._apps:
                credentials_value = os.getenv('FIREBASE_CREDENTIALS')
                if not credentials_value:
                    return Response({'detail': 'Firebase server credentials are not configured.'}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
                if credentials_value.strip().startswith('{'):
                    firebase_admin.initialize_app(credentials.Certificate(json.loads(credentials_value)))
                else:
                    credentials_path = Path(credentials_value)
                    if not credentials_path.is_absolute():
                        credentials_path = settings.BASE_DIR / credentials_path
                    if not credentials_path.is_file():
                        return Response({'detail': 'Firebase service-account file was not found on the server.'}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
                    firebase_admin.initialize_app(credentials.Certificate(str(credentials_path)))
            decoded = firebase_auth.verify_id_token(id_token)
            email = decoded.get('email')
            if not email:
                return Response({'detail': 'Google account has no email address.'}, status=status.HTTP_400_BAD_REQUEST)
            user = User.objects.filter(email__iexact=email).first()
            if not user:
                username = email.split('@')[0]
                if User.objects.filter(username=username).exists():
                    username = f"{username}_{decoded.get('uid', secrets.token_hex(3))[:6]}"
                user = User.objects.create_user(username=username, email=email, first_name=decoded.get('name', ''), profile_picture=decoded.get('picture', ''), is_active=True)
            if not user.is_active:
                user.is_active = True
                user.save(update_fields=['is_active'])
            refresh = RefreshToken.for_user(user)
            refresh['role'] = user.role
            response = Response({'user': UserSerializer(user).data})
            set_auth_cookies(response, refresh.access_token, refresh)
            return response
        except Exception:
            return Response({'detail': 'Google authentication failed.'}, status=status.HTTP_401_UNAUTHORIZED)


class RefreshView(APIView):
    permission_classes = (AllowAny,)
    authentication_classes = ()

    def post(self, request):
        refresh_value = request.COOKIES.get(settings.JWT_REFRESH_COOKIE)
        if not refresh_value:
            return Response({'detail': 'Refresh token is missing.'}, status=status.HTTP_401_UNAUTHORIZED)
        try:
            refresh = RefreshToken(refresh_value)
            user = User.objects.get(id=refresh['user_id'], is_active=True)
            new_refresh = refresh
            if settings.SIMPLE_JWT['ROTATE_REFRESH_TOKENS']:
                refresh.blacklist()
                new_refresh = RefreshToken.for_user(user)
                new_refresh['role'] = user.role
            response = Response({'detail': 'Session refreshed.'})
            set_auth_cookies(response, new_refresh.access_token, new_refresh)
            return response
        except (TokenError, InvalidToken, User.DoesNotExist):
            response = Response({'detail': 'Invalid refresh token.'}, status=status.HTTP_401_UNAUTHORIZED)
            clear_auth_cookies(response)
            return response


class LogoutView(APIView):
    def post(self, request):
        refresh_value = request.COOKIES.get(settings.JWT_REFRESH_COOKIE)
        if refresh_value:
            try:
                RefreshToken(refresh_value).blacklist()
            except TokenError:
                pass
        response = Response(status=status.HTTP_204_NO_CONTENT)
        clear_auth_cookies(response)
        return response


class MeView(APIView):
    def get(self, request):
        return Response({'user': UserSerializer(request.user).data})


class ProfileView(APIView):
    def patch(self, request):
        user = request.user
        for field in ('username', 'first_name', 'last_name', 'profile_picture'):
            if field in request.data:
                setattr(user, field, request.data[field])
        user.save()
        return Response({'user': UserSerializer(user).data})


class UserRoleView(APIView):
    permission_classes = (IsAdministrator,)

    def patch(self, request, user_id):
        user = get_object_or_404(User, pk=user_id)
        serializer = RoleUpdateSerializer(user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({'user': UserSerializer(user).data})


class AdminForgotPasswordView(APIView):
    permission_classes = (AllowAny,)
    authentication_classes = ()

    def post(self, request):
        email = request.data.get('email', '').strip()
        user = User.objects.filter(email__iexact=email, role=User.Role.ADMIN, is_active=True).first()
        if user:
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            token = password_reset_token.make_token(user)
            reset_url = f"{settings.FRONTEND_URL}/admin/reset-password/{uid}/{token}"
            send_mail('Reset your Eventora admin password', f'Use this link to reset your password: {reset_url}', settings.DEFAULT_FROM_EMAIL, [user.email], fail_silently=False)
        return Response({'detail': 'If that administrator email exists, a reset link has been sent.'})


class AdminResetPasswordView(APIView):
    permission_classes = (AllowAny,)
    authentication_classes = ()

    def post(self, request, uid, token):
        try:
            user = User.objects.get(pk=urlsafe_base64_decode(uid).decode())
        except (User.DoesNotExist, ValueError, TypeError, OverflowError):
            return Response({'detail': 'This reset link is invalid or expired.'}, status=status.HTTP_400_BAD_REQUEST)
        if not password_reset_token.check_token(user, token) or user.role != User.Role.ADMIN:
            return Response({'detail': 'This reset link is invalid or expired.'}, status=status.HTTP_400_BAD_REQUEST)
        password = request.data.get('password', '')
        if len(password) < 8:
            return Response({'detail': 'Password must be at least 8 characters.'}, status=status.HTTP_400_BAD_REQUEST)
        validate_password(password, user)
        user.set_password(password)
        user.save(update_fields=['password'])
        return Response({'detail': 'Password changed successfully.'})


class AdminChangePasswordView(APIView):
    permission_classes = (IsAdministrator,)

    def post(self, request):
        if not request.user.check_password(request.data.get('current_password', '')):
            return Response({'detail': 'Current password is incorrect.'}, status=status.HTTP_400_BAD_REQUEST)
        password = request.data.get('new_password', '')
        if len(password) < 8:
            return Response({'detail': 'New password must be at least 8 characters.'}, status=status.HTTP_400_BAD_REQUEST)
        validate_password(password, request.user)
        request.user.set_password(password)
        request.user.save(update_fields=['password'])
        return Response({'detail': 'Password changed successfully.'})


class ForgotPasswordView(APIView):
    permission_classes = (AllowAny,)
    authentication_classes = ()

    def post(self, request):
        email = request.data.get('email', '').strip()
        user = User.objects.filter(email__iexact=email, is_active=True).first()
        if user:
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            token = password_reset_token.make_token(user)
            reset_url = f"{settings.FRONTEND_URL}/reset-password/{uid}/{token}"
            send_mail('Reset your Eventora password', f'Use this link to reset your password: {reset_url}', settings.DEFAULT_FROM_EMAIL, [user.email], fail_silently=False)
        return Response({'detail': 'If that email exists, a reset link has been sent.'})


class ResetPasswordView(AdminResetPasswordView):
    def post(self, request, uid, token):
        try:
            user = User.objects.get(pk=urlsafe_base64_decode(uid).decode())
        except (User.DoesNotExist, ValueError, TypeError, OverflowError):
            return Response({'detail': 'This reset link is invalid or expired.'}, status=status.HTTP_400_BAD_REQUEST)
        if not password_reset_token.check_token(user, token):
            return Response({'detail': 'This reset link is invalid or expired.'}, status=status.HTTP_400_BAD_REQUEST)
        password = request.data.get('password', '')
        if len(password) < 8:
            return Response({'detail': 'Password must be at least 8 characters.'}, status=status.HTTP_400_BAD_REQUEST)
        validate_password(password, user)
        user.set_password(password)
        user.save(update_fields=['password'])
        return Response({'detail': 'Password changed successfully.'})
