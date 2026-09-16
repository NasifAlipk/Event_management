import api from "./api";

export const eventsApi = {
  published: () => api.get("/events/published/"),
  organizer: () => api.get("/events/organizer/"),
  create: (data) => api.post("/events/organizer/", data),
  admin: () => api.get("/events/admin/"),
  review: (id, status, rejection_reason = "") => api.patch(`/events/admin/${id}/review/`, { status, rejection_reason }),
};
