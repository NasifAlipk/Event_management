import { Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/auth/ProtectedRoute.jsx";
import AuthLayout from "./layouts/AuthLayout.jsx";
import DashboardLayout from "./layouts/DashboardLayout.jsx";
import LoginPage from "./pages/auth/LoginPage.jsx";
import RegisterPage from "./pages/auth/RegisterPage.jsx";
import VerifyEmailPage from "./pages/auth/VerifyEmailPage.jsx";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage.jsx";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";
import Home from "./pages/home/Home.jsx";
import GlobalProfile from "./pages/home/GlobalProfile.jsx";
import PublicHome from "./pages/home/PublicHome.jsx";
import OrganizerApplication from "./pages/home/OrganizerApplication.jsx";
import AdminProtectedRoute from "./components/admin/AdminProtectedRoute.jsx";
import AdminLoginPage from "./pages/admin/Login.jsx";
import AdminHomePage from "./pages/admin/Home.jsx";
import AdminProfilePage from "./pages/admin/Profile.jsx";
import AdminCustomersPage from "./pages/admin/Customers.jsx";
import AdminForgotPassword from "./pages/admin/ForgotPassword.jsx";
import AdminResetPassword from "./pages/admin/ResetPassword.jsx";
import AdminApplicationsPage from "./pages/admin/Applications.jsx";
import AdminApplicationReviewPage from "./pages/admin/ApplicationReview.jsx";
import AdminEventsPage from "./pages/admin/Events.jsx";
import AdminEventDetailsPage from "./pages/admin/EventDetails.jsx";
import Explore from "./pages/Explore/Explore.jsx";
import AddEvent from "./pages/Event/AddEvent.jsx";
import EditEvent from "./pages/Event/EditEvent.jsx";
import EventDetails from "./pages/Event/Details.jsx";
import Coupon from "./pages/coupon/Coupon.jsx";
import AddCoupon from "./pages/coupon/AddCoupon.jsx";
import EditCoupon from "./pages/coupon/EditCoupon.jsx";
import AdminCoupons from "./pages/admin/Coupons.jsx";
import AdminCouponDetails from "./pages/admin/CouponDetails.jsx";

function App() {
  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route
          path="/reset-password/:uid/:token"
          element={<ResetPasswordPage />}
        />
      </Route>
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route path="/admin/forgot-password" element={<AdminForgotPassword />} />
      <Route
        path="/admin/reset-password/:uid/:token"
        element={<AdminResetPassword />}
      />
      <Route element={<AdminProtectedRoute />}>
        <Route path="/admin" element={<AdminHomePage />} />
        <Route path="/admin/profile" element={<AdminProfilePage />} />
        <Route path="/admin/customers" element={<AdminCustomersPage />} />
        <Route path="/admin/applications" element={<AdminApplicationsPage />} />
        <Route path="/admin/applications/:applicationId" element={<AdminApplicationReviewPage />} />
        <Route path="/admin/events" element={<AdminEventsPage />} />
        <Route path="/admin/events/:eventId" element={<AdminEventDetailsPage />} />
        <Route path="/admin/coupons" element={<AdminCoupons />} />
        <Route path="/admin/coupons/:couponId" element={<AdminCouponDetails />} />
      </Route>
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Home />} />
          <Route path="/events" element={<Explore />} />
          <Route path="/events/add" element={<AddEvent />} />
          <Route path="/events/edit/:eventId" element={<EditEvent />} />
          <Route path="/events/:eventId" element={<EventDetails />} />
          <Route path="/coupons" element={<Coupon />} />
          <Route path="/coupons/add" element={<AddCoupon />} />
          <Route path="/coupons/edit/:couponId" element={<EditCoupon />} />
          <Route path="/profile" element={<GlobalProfile />} />
          <Route path="/apply-organizer" element={<OrganizerApplication />} />
        </Route>
      </Route>
      <Route path="/" element={<PublicHome />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
