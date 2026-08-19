from rest_framework.permissions import BasePermission

from .models import User


class HasRole(BasePermission):
    allowed_roles = ()

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role in self.allowed_roles)


class IsOrganizer(HasRole):
    allowed_roles = (User.Role.ORGANIZER, User.Role.ADMIN)


class IsAdministrator(HasRole):
    allowed_roles = (User.Role.ADMIN,)
