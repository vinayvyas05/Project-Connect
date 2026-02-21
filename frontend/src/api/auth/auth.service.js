import api from "../axios";

export const authService = {
  register: (name, email, password) =>
    api.post("/auth/register", { name, email, password }),

  login: (email, password) => api.post("/auth/login", { email, password }),

  getProfile: () => api.get("/auth/profile"),
};
