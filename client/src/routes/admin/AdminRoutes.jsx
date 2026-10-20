import { Route } from "react-router-dom";

import AdminProtectedRoute from "../../components/admin/AdminProtectedRoute.jsx";
import AdminApplicationsPage from "../../pages/admin/Applications.jsx";
import AdminApplicationReviewPage from "../../pages/admin/ApplicationReview.jsx";
import AdminCouponDetails from "../../pages/admin/CouponDetails.jsx";
import AdminCoupons from "../../pages/admin/Coupons.jsx";
import AdminCustomersPage from "../../pages/admin/Customers.jsx";
import AdminEventDetailsPage from "../../pages/admin/EventDetails.jsx";
import AdminEventsPage from "../../pages/admin/Events.jsx";
import AdminForgotPassword from "../../pages/admin/ForgotPassword.jsx";
import AdminHomePage from "../../pages/admin/Home.jsx";
import AdminLoginPage from "../../pages/admin/Login.jsx";
import AdminProfilePage from "../../pages/admin/Profile.jsx";
import AdminResetPassword from "../../pages/admin/ResetPassword.jsx";

export const adminRoutes = [
    <Route key="admin-login" path="/admin/login" element={<AdminLoginPage />} />,
    <Route key="admin-forgot-password" path="/admin/forgot-password" element={<AdminForgotPassword />} />,
    <Route key="admin-reset-password" path="/admin/reset-password/:uid/:token" element={<AdminResetPassword />} />,
    <Route key="admin-protected" element={<AdminProtectedRoute />}>
      <Route path="/admin" element={<AdminHomePage />} />
      <Route path="/admin/profile" element={<AdminProfilePage />} />
      <Route path="/admin/customers" element={<AdminCustomersPage />} />
      <Route path="/admin/applications" element={<AdminApplicationsPage />} />
      <Route path="/admin/applications/:applicationId" element={<AdminApplicationReviewPage />} />
      <Route path="/admin/events" element={<AdminEventsPage />} />
      <Route path="/admin/events/:eventId" element={<AdminEventDetailsPage />} />
      <Route path="/admin/coupons" element={<AdminCoupons />} />
      <Route path="/admin/coupons/:couponId" element={<AdminCouponDetails />} />
    </Route>,
];
