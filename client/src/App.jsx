import { Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/auth/ProtectedRoute.jsx";
import AuthLayout from "./layouts/AuthLayout.jsx";
import DashboardLayout from "./layouts/DashboardLayout.jsx";
import LoginPage from "./pages/auth/LoginPage.jsx";
import RegisterPage from "./pages/auth/RegisterPage.jsx";
import VerifyEmailPage from "./pages/auth/VerifyEmailPage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";
import Home from "./pages/home/Home.jsx";
import GlobalProfile from "./pages/home/GlobalProfile.jsx";
import PublicHome from "./pages/home/PublicHome.jsx";
import AdminProtectedRoute from "./components/admin/AdminProtectedRoute.jsx";
import AdminLoginPage from "./pages/admin/Login.jsx";
import AdminHomePage from "./pages/admin/Home.jsx";
import AdminProfilePage from "./pages/admin/Profile.jsx";
import AdminForgotPassword from "./pages/admin/ForgotPassword.jsx";
import AdminResetPassword from "./pages/admin/ResetPassword.jsx";

function App() {
  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage/>} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
      </Route>
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route path="/admin/forgot-password" element={<AdminForgotPassword />} />
      <Route path="/admin/reset-password/:uid/:token" element={<AdminResetPassword />} />
      <Route element={<AdminProtectedRoute />}>
        <Route path="/admin" element={<AdminHomePage />} />
        <Route path="/admin/profile" element={<AdminProfilePage />} />
      </Route>
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Home />} />
          <Route path="/events" element={<Home />} />
          <Route path="/profile" element={<GlobalProfile />} />
        </Route>
      </Route>
      <Route path="/" element={<PublicHome />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
