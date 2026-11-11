import api from "./api";

export const walletApi = { get: () => api.get("/wallet/") };
