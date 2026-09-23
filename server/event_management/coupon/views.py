from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.permissions import IsAdministrator
from .models import Coupon
from .serializers import CouponReviewSerializer, CouponSerializer


def organizer_only(request):
    return request.user.role == request.user.Role.ORGANIZER


class OrganizerCouponsView(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request):
        return Response({"coupons": CouponSerializer(Coupon.objects.filter(organizer=request.user), many=True).data})

    def post(self, request):
        if not organizer_only(request):
            return Response({"detail": "Only approved organizers can create coupons."}, status=status.HTTP_403_FORBIDDEN)
        serializer = CouponSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        coupon = serializer.save(organizer=request.user)
        return Response({"coupon": CouponSerializer(coupon).data}, status=status.HTTP_201_CREATED)


class OrganizerCouponDetailView(APIView):
    permission_classes = (IsAuthenticated,)

    def get_object(self, request, coupon_id):
        try:
            return Coupon.objects.get(pk=coupon_id, organizer=request.user)
        except Coupon.DoesNotExist:
            return None

    def get(self, request, coupon_id):
        coupon = self.get_object(request, coupon_id)
        if not coupon:
            return Response({"detail": "Coupon not found."}, status=status.HTTP_404_NOT_FOUND)
        return Response({"coupon": CouponSerializer(coupon).data})

    def patch(self, request, coupon_id):
        coupon = self.get_object(request, coupon_id)
        if not coupon or not organizer_only(request):
            return Response({"detail": "Coupon not found."}, status=status.HTTP_404_NOT_FOUND)
        serializer = CouponSerializer(coupon, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        coupon = serializer.save(status=Coupon.Status.PENDING, rejection_reason="")
        return Response({"coupon": CouponSerializer(coupon).data})

    def delete(self, request, coupon_id):
        coupon = self.get_object(request, coupon_id)
        if not coupon or not organizer_only(request):
            return Response({"detail": "Coupon not found."}, status=status.HTTP_404_NOT_FOUND)
        coupon.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class AdminCouponsView(APIView):
    permission_classes = (IsAuthenticated, IsAdministrator)

    def get(self, request):
        coupons = Coupon.objects.select_related("organizer")
        return Response({"coupons": CouponSerializer(coupons, many=True).data})


class AdminCouponReviewView(APIView):
    permission_classes = (IsAuthenticated, IsAdministrator)

    def get(self, request, coupon_id):
        try:
            coupon = Coupon.objects.select_related("organizer").get(pk=coupon_id)
        except Coupon.DoesNotExist:
            return Response({"detail": "Coupon not found."}, status=status.HTTP_404_NOT_FOUND)
        return Response({"coupon": CouponSerializer(coupon).data})

    def patch(self, request, coupon_id):
        try:
            coupon = Coupon.objects.get(pk=coupon_id)
        except Coupon.DoesNotExist:
            return Response({"detail": "Coupon not found."}, status=status.HTTP_404_NOT_FOUND)
        serializer = CouponReviewSerializer(coupon, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        coupon = serializer.save()
        return Response({"coupon": CouponSerializer(coupon).data})
