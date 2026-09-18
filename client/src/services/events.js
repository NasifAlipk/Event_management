import api from "./api";

export const eventsApi = {
  published: () => api.get("/events/published/"),
  publishedEvent: (id) => api.get(`/events/published/${id}/`),
  organizer: () => api.get("/events/organizer/"),
  create: (data) => api.post("/events/organizer/", data),
  admin: () => api.get("/events/admin/"),
  adminEvent: (id) => api.get(`/events/admin/${id}/review/`),
  review: (id, status, rejection_reason = "") => api.patch(`/events/admin/${id}/review/`, { status, rejection_reason }),
};
