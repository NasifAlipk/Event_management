import api, { initialiseCsrf } from "./api";

export const authApi = {
  initialise: initialiseCsrf,
  me: () => api.get("/auth/me/"),
  profile: (data) => api.patch("/auth/profile/", data),
  login: (credentials) => api.post("/auth/login/", credentials),
  adminLogin: (credentials) => api.post("/auth/admin/login/", credentials),
  googleLogin: (idToken) => api.post("/auth/google/", { id_token: idToken }),
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
