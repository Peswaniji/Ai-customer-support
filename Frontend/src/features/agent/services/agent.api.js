import ticketApiInstance from "../../api/axios.js";

const agentAPI = {
  getAgents: () => ticketApiInstance.get("/api/agents"),
  updateStatus: (agentId, isActive) => ticketApiInstance.patch(`/api/agents/${agentId}/status`, { isActive }),
  inviteAgent: (data) => ticketApiInstance.post("/api/auth/invite-agent", data),
};

export default agentAPI;