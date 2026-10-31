import { Route } from "react-router-dom";

import ProtectedRoute from "../../components/auth/ProtectedRoute.jsx";
import DashboardLayout from "../../layouts/DashboardLayout.jsx";
import DashboardPage from "../../pages/dashboard/DashboardPage.jsx";
import AddCoupon from "../../pages/coupon/AddCoupon.jsx";
import Coupon from "../../pages/coupon/Coupon.jsx";
import EditCoupon from "../../pages/coupon/EditCoupon.jsx";
import AddEvent from "../../pages/Event/AddEvent.jsx";
import EditEvent from "../../pages/Event/EditEvent.jsx";
import EventDetails from "../../pages/Event/Details.jsx";
import Explore from "../../pages/Explore/Explore.jsx";
import OrganizerDashboard from "../../pages/organizerdashboard/OrganizerDashboard.jsx";
import OrganizerApplication from "../../pages/home/OrganizerApplication.jsx";
import GlobalProfile from "../../pages/home/GlobalProfile.jsx";
import Home from "../../pages/home/Home.jsx";
import PublicHome from "../../pages/home/PublicHome.jsx";
import { useAuth } from "../../hooks/useAuth";

function HomeEntry() {
  const { user } = useAuth();
  return user ? <Home /> : <PublicHome />;
}

export const userRoutes = [
  <Route key="home" path="/home" element={<HomeEntry />} />,
  (
    <Route key="user-protected" element={<ProtectedRoute />}>
      <Route element={<DashboardLayout />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/events" element={<Explore />} />
        <Route path="/events/add" element={<AddEvent />} />
        <Route path="/events/edit/:eventId" element={<EditEvent />} />
        <Route path="/events/:eventId" element={<EventDetails />} />
        <Route path="/coupons" element={<Coupon />} />
        <Route path="/coupons/add" element={<AddCoupon />} />
        <Route path="/coupons/edit/:couponId" element={<EditCoupon />} />
        <Route path="/organizer-dashboard" element={<OrganizerDashboard />} />
        <Route path="/profile" element={<GlobalProfile />} />
        <Route path="/apply-organizer" element={<OrganizerApplication />} />
      </Route>
    </Route>
  ),
];
