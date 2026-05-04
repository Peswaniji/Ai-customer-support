import api from "../../../shared/services/axios.js";

const settingsAPI = {
  getBusinessInfo: () => api.get("/business/me"),
  updateBusinessInfo: (data) => api.patch("/business/me", data),
  getWidgetCode: () => api.get("/business/widget-code"),
  getUsage: () => api.get("/business/usage"),
  getPlans: () => api.get("/business/plans"),
  upgradePlan: (plan) => api.patch("/business/upgrade", { plan }),
};

export default settingsAPI;
