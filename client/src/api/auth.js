import api, { initialiseCsrf } from "./client";

export const authApi = {
  initialise: initialiseCsrf,
  me: () => api.get("/auth/me/"),
  login: (credentials) => api.post("/auth/login/", credentials),
  register: (details) => api.post("/auth/register/", details),
  verifyEmail: (details) => api.post("/auth/verify-email/", details),
  resendVerificationCode: (email) =>
    api.post("/auth/resend-verification-code/", { email }),
  logout: () => api.post("/auth/logout/"),
  adminForgotPassword: (email) =>
    api.post("/auth/admin/forgot-password/", { email }),
  adminResetPassword: (uid, token, password) =>
    api.post(`/auth/admin/reset-password/${uid}/${token}/`, { password }),
  adminChangePassword: (current_password, new_password) =>
    api.post("/auth/admin/change-password/", {
      current_password,
      new_password,
    }),
  adminProfile: (data) => api.patch("/admin/profile/", data),
  forgotPassword: (email) => api.post("/auth/forgot-password/", { email }),
  resetPassword: (uid, token, password) =>
    api.post(`/auth/reset-password/${uid}/${token}/`, { password }),
};
