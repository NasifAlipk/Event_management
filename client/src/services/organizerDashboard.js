import api from "./api";

export const organizerDashboardApi = {
  summary: (params = {}) => api.get("/organizer-dashboard/", { params }),
};
