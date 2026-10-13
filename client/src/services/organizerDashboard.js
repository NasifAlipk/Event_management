import api from "./api";

export const organizerDashboardApi = {
  summary: () => api.get("/organizer-dashboard/"),
};
