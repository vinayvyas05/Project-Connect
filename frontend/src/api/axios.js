import axios from "axios";


const api = axios.create({
  baseURL: import.meta.env.VITE_URL,
});

// Auto-attach JWT before every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
