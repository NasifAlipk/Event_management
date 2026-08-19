from django.conf import settings
from django.middleware.csrf import CsrfViewMiddleware
from rest_framework import exceptions
from rest_framework_simplejwt.authentication import JWTAuthentication


class CSRFCheck(CsrfViewMiddleware):
    def _reject(self, request, reason):
        return reason


class CookieJWTAuthentication(JWTAuthentication):
    """Authenticate access JWTs from an HttpOnly cookie and protect writes with CSRF."""

    def enforce_csrf(self, request):
        check = CSRFCheck(lambda request: None)
        reason = check.process_view(request, None, (), {})
        if reason:
            raise exceptions.PermissionDenied(f'CSRF Failed: {reason}')

    def authenticate(self, request):
        raw_token = request.COOKIES.get(settings.JWT_ACCESS_COOKIE)
        if raw_token is None:
            return None
        validated_token = self.get_validated_token(raw_token)
        if request.method not in ('GET', 'HEAD', 'OPTIONS', 'TRACE'):
            self.enforce_csrf(request)
        return self.get_user(validated_token), validated_token
