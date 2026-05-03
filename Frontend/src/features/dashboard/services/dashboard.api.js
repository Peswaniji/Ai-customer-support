import api from "../../../shared/services/axios.js";

const dashboardAPI = {
  getBusinessInfo: () => api.get("/business/me"),
  getOverview: () => api.get("/analytics/overview"),
  getTrends: () => api.get("/analytics/trends"),
};

export default dashboardAPI;