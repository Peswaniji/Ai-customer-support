import ticketApiInstance from "../../api/axios";

// 🔵 Assigned tickets
export const assignAgentTicket = async () => {
  const response = await ticketApiInstance.get(
    "/api/tickets"
  );
  return response.data;
};

// 🟢 Active chats
export const activeChatsForAgent = async () => {
  const response = await ticketApiInstance.get(
    "/api/tickets?status=open"
  );
  return response.data;
};


// 🟡 In progress
export const progressTicketsForAgent = async () => {
  const response = await ticketApiInstance.get(
    "/api/tickets?status=in_progress"
  );
  return response.data;
};


// 🔴 Resolve ticket (CORRECT WAY)
export const resolveTicket = async (ticketId) => {
  const response = await ticketApiInstance.patch(
    `/api/tickets/${ticketId}/status`,
    {
      status: "resolved",
    }
  );

  return response.data;
};