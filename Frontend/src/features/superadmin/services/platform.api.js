import api from "../../../shared/services/axios.js";

const platformAPI = {
  getPlatformStats: () => api.get("/analytics/all"),
  getBusinesses: () => api.get("/business/all"),
};

export default platformAPI;
