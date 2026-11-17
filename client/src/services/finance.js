import api from "./api";

export const financeApi = {
  overview: (params = {}) => api.get("/finance/", { params }),
};
