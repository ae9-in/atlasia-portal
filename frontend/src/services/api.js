import axios from "axios";
import toast from "react-hot-toast";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "",
  withCredentials: true
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || "Request failed";
    if (error.config?.showToast !== false) {
      toast.error(message);
    }
    return Promise.reject(error);
  }
);

export default api;
