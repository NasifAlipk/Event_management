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
};
