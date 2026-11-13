import api from "./api";

export const walletApi = {
  get: () => api.get("/wallet/"),
  pay: (payload) => api.post("/payment-methods/wallet/pay/", payload),
  orderStatus: (orderId) => api.get(`/payment-methods/wallet/order/${orderId}/`),
};
