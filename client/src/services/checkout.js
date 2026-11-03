import api from "./api";

export const checkoutApi = {
  coupons: (eventId) => api.get(`/checkout/${eventId}/coupons/`),
  quote: (eventId, data) => api.post(`/checkout/${eventId}/quote/`, data),
};
