import api from "./api";

export const financeApi = {
  overview: (params = {}) => api.get("/finance/", { params }),
  report: (params = {}) => api.get("/finance/report/", { params, responseType: "blob" }),
};
