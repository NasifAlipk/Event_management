import { Route } from "react-router-dom";

import AuthLayout from "../../layouts/AuthLayout.jsx";
import ForgotPasswordPage from "../../pages/auth/ForgotPasswordPage.jsx";
import LoginPage from "../../pages/auth/LoginPage.jsx";
import RegisterPage from "../../pages/auth/RegisterPage.jsx";
import ResetPasswordPage from "../../pages/auth/ResetPasswordPage.jsx";
import VerifyEmailPage from "../../pages/auth/VerifyEmailPage.jsx";

export const authRoutes = [
  (
    <Route key="auth-layout" element={<AuthLayout />}>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password/:uid/:token" element={<ResetPasswordPage />} />
    </Route>
  ),
];
