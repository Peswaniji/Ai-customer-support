import api from "../../../shared/services/axios.js";

const settingsAPI = {
  getBusinessInfo: () => api.get("/business/me"),
  updateBusinessInfo: (data) => api.patch("/business/me", data),
  getWidgetCode: () => api.get("/business/widget-code"),
};

export default settingsAPI;