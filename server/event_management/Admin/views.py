from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from accounts.models import User
from accounts.permissions import IsAdministrator
from accounts.serializers import UserSerializer

class AdminProfileView(APIView):
    permission_classes = (IsAuthenticated, IsAdministrator)
    def get(self, request):
        return Response({"user": UserSerializer(request.user).data})

class AdminOverviewView(APIView):
    permission_classes = (IsAuthenticated, IsAdministrator)
    def get(self, request):
        return Response({"users": User.objects.count(), "organizers": User.objects.filter(role=User.Role.ORGANIZER).count(), "admins": User.objects.filter(role=User.Role.ADMIN).count()})


class AdminUsersView(APIView):
    permission_classes = (IsAuthenticated, IsAdministrator)

    def get(self, request):
        users = User.objects.order_by("-last_login", "-date_joined")
        return Response({"users": UserSerializer(users, many=True).data})
