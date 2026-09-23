import api from "./api";

export const couponsApi = {
  organizer: () => api.get("/coupons/organizer/"),
  organizerCoupon: (id) => api.get(`/coupons/organizer/${id}/`),
  create: (data) => api.post("/coupons/organizer/", data),
  update: (id, data) => api.patch(`/coupons/organizer/${id}/`, data),
  remove: (id) => api.delete(`/coupons/organizer/${id}/`),
  admin: () => api.get("/coupons/admin/"),
  adminCoupon: (id) => api.get(`/coupons/admin/${id}/review/`),
  review: (id, status, rejection_reason = "") => api.patch(`/coupons/admin/${id}/review/`, { status, rejection_reason }),
};
