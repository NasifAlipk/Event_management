import api from "./api";

export const ticketsApi = {
  mine: (orderId) => api.get("/tickets/my/", { params: orderId ? { order_id: orderId } : {} }),
  admin: () => api.get("/tickets/admin/"),
};
