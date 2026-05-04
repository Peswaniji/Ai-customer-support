import api from "../../../shared/services/axios.js";

export const register = async ({ businessName, email, password, industry }) => {
  const response = await api.post("/auth/register-business", {
    businessName,
    email,
    password,
    industry,
  });

  return response.data;
};

export const login = async ({ email, password }) => {
  const response = await api.post("/auth/login", { email, password });
  return response.data;
};

export const logout = async () => {
  const response = await api.post("/auth/logout");
  return response.data;
};

export const refreshToken = async () => {
  const response = await api.post("/auth/refresh-token");
  return response.data;
};

export const customerSession = async ({ name, email, businessId }) => {
  const response = await api.post("/auth/customer-session", { name, email, businessId });
  return response.data;
};

export const setPassword = async ({ token, password }) => {
  const response = await api.post("/auth/set-password", { token, password });
  return response.data;
};

export const getMe = async () => {
  const response = await api.get("/auth/me");
  return response.data;
};
