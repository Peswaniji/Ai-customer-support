import axios from "axios";

const API_ORIGIN =
  import.meta.env.VITE_SOCKET_URL ||
  (import.meta.env.VITE_API_URL || "https://ai-csp-backend.onrender.com/api").replace(/\/api\/?$/, "");

const widgetAPI = {
  getConfig: (businessId) => axios.get(`${API_ORIGIN}/api/widget/${businessId}/config`),
  getPanelUrl: (businessId) => `${API_ORIGIN}/api/widget/${businessId}/panel`,
  getLoaderUrl: (businessId) => `${API_ORIGIN}/api/widget/${businessId}/loader.js`,
};

export default widgetAPI;
