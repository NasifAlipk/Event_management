from django.conf import settings
from django.shortcuts import get_object_or_404
from django.middleware.csrf import get_token

from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from rest_framework_simplejwt.tokens import RefreshToken

from .models import User
from .permissions import IsAdministrator
from .serializers import LoginSerializer, RegisterSerializer, RoleUpdateSerializer, UserSerializer

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
        
        refresh = RefreshToken.for_user(user)
        refresh['role'] = user.role
        response = Response({'user': UserSerializer(user).data}, status=status.HTTP_201_CREATED)
        set_auth_cookies(response, refresh.access_token, refresh)
        return response


class LoginView(APIView):
    permission_classes = (AllowAny,)
    authentication_classes = ()

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        response = Response({'user': UserSerializer(serializer.user).data})
        set_auth_cookies(response, serializer.validated_data['access'], serializer.validated_data['refresh'])
        return response


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


class UserRoleView(APIView):
    permission_classes = (IsAdministrator,)

    def patch(self, request, user_id):
        user = get_object_or_404(User, pk=user_id)
        serializer = RoleUpdateSerializer(user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({'user': UserSerializer(user).data})
