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

function App() {
  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
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
