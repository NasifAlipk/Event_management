import api from "./api";

export const organizerApi = {
  submitApplication: (data) => api.post("/organizer/applications/", data),
  applications: () => api.get("/organizer/applications/"),
  adminApplications: () => api.get("/organizer/admin/applications/"),
  adminApplication: (id) => api.get(`/organizer/admin/applications/${id}/`),
  reviewApplication: (id, status) =>
    api.patch(`/organizer/admin/applications/${id}/`, { status }),
};
