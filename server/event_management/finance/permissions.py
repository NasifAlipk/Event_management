from rest_framework.permissions import BasePermission


class IsAdministrator(BasePermission):
    message = "Administrator access is required."

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and (
            request.user.is_staff or getattr(request.user, "role", "") == "ADMIN"
        ))
