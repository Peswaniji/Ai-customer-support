import axios from "axios";

const API_ORIGIN =
  import.meta.env.VITE_SOCKET_URL ||
  (import.meta.env.VITE_API_URL || "https://ai-csp-backend.onrender.com/api").replace(/\/api\/?$/, "");

const ticketApiInstance = axios.create({
  baseURL: API_ORIGIN,
  withCredentials: true,
});

// 🔥 ADD THIS (VERY IMPORTANT)
ticketApiInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default ticketApiInstance;
