import axios from "axios";
import toast from "react-hot-toast";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "",
  withCredentials: true
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("atlasia_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || "Request failed";
    
    // If unauthorized, clear the token
    if (error.response?.status === 401) {
      localStorage.removeItem("atlasia_token");
    }

    if (error.config?.showToast !== false) {
      toast.error(message);
    }
    return Promise.reject(error);
  }
);

export default api;
