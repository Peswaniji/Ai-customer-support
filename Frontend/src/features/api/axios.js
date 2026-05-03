import axios from "axios";

const ticketApiInstance = axios.create({
  baseURL: "http://localhost:8001",
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