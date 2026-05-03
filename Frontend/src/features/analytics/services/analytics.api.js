import ticketApiInstance from "../../api/axios.js";

const analyticsAPI = {
  getOverview: () => ticketApiInstance.get("/api/analytics/overview"),
  getTrends: () => ticketApiInstance.get("/api/analytics/trends"),
  getAgentStats: () => ticketApiInstance.get("/api/analytics/agents"),
};

export default analyticsAPI;