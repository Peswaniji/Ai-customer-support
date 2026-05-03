import ticketApiInstance from "../../api/axios.js";

const ticketAPI = {
  // Business Admin
  getTickets: (filters) => ticketApiInstance.get("/api/tickets", { params: filters }),
  getTicketById: (ticketId) => ticketApiInstance.get(`/api/tickets/${ticketId}`),
  updateStatus: (ticketId, status) => ticketApiInstance.patch(`/api/tickets/${ticketId}/status`, { status }),
  assignTicket: (ticketId, agentId) => ticketApiInstance.patch(`/api/tickets/${ticketId}/assign`, { agentId }),
  updatePriority: (ticketId, priority) => ticketApiInstance.patch(`/api/tickets/${ticketId}/priority`, { priority }),

  // Agent
  getAssignedTickets: () => ticketApiInstance.get("/api/tickets"),
  getActiveChats: () => ticketApiInstance.get("/api/tickets", { params: { status: "open" } }),
  getInProgressTickets: () => ticketApiInstance.get("/api/tickets", { params: { status: "in_progress" } }),
  resolveTicket: (ticketId) => ticketApiInstance.patch(`/api/tickets/${ticketId}/status`, { status: "resolved" }),
};

export default ticketAPI;