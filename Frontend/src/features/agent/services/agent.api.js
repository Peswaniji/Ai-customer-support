import ticketApiInstance from "../../api/axios.js";

const agentAPI = {
  getAgents: () => ticketApiInstance.get("/api/agents"),
  updateAvailability: (availabilityStatus) =>
    ticketApiInstance.patch("/api/agents/availability", { availabilityStatus }),
  updateStatus: (agentId, isActive) => ticketApiInstance.patch(`/api/agents/${agentId}/status`, { isActive }),
  inviteAgent: (data) => ticketApiInstance.post("/api/auth/invite-agent", data),
};

export default agentAPI;
