from django.urls import path
from .views import AdminCouponReviewView, AdminCouponsView, AvailableCouponView, OrganizerCouponDetailView, OrganizerCouponsView

urlpatterns = [
    path("available/", AvailableCouponView.as_view(), name="available-coupon"),
    path("organizer/", OrganizerCouponsView.as_view(), name="organizer-coupons"),
    path("organizer/<int:coupon_id>/", OrganizerCouponDetailView.as_view(), name="organizer-coupon-detail"),
    path("admin/", AdminCouponsView.as_view(), name="admin-coupons"),
    path("admin/<int:coupon_id>/review/", AdminCouponReviewView.as_view(), name="admin-coupon-review"),
]
