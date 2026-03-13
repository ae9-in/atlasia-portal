import api from "./api";

export const authService = {
  async login(payload) {
    const { data } = await api.post("/api/auth/login", payload);
    return data;
  },
  async register(payload) {
    const { data } = await api.post("/api/auth/register", payload);
    return data;
  },
  async me() {
    const { data } = await api.get("/api/auth/me", { showToast: false });
    return data;
  },
  async logout() {
    const { data } = await api.post("/api/auth/logout");
    return data;
  }
};
