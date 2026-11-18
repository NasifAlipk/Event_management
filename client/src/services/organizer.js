import api from "./api";

export const organizerApi = {
  submitApplication: (data) => api.post("/organizer/applications/", data),
  applications: () => api.get("/organizer/applications/"),
  adminApplications: (params = {}) => api.get("/organizer/admin/applications/", { params }),
  adminApplication: (id) => api.get(`/organizer/admin/applications/${id}/`),
  reviewApplication: (id, status, rejection_reason = "") =>
    api.patch(`/organizer/admin/applications/${id}/`, {
      status,
      rejection_reason,
    }),
};
