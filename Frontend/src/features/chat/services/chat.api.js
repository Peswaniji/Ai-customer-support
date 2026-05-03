import ticketApiInstance from "../../api/axios";

// 1. Purani history mangwane ke liye
export const fetchMessageHistory = async (ticketId) => {
  const response = await ticketApiInstance.get(`/api/messages/${ticketId}`);
  return response.data; // Yeh messages ka array return karega
};

// 2. Naya message bhejne ke liye
export const sendMessageApi = async (ticketId, content) => {
  const response = await ticketApiInstance.post(`/api/messages/${ticketId}`, {
    content,
    isInternal: false,
  });
  return response.data;
};

// 3. AI suggestion mangwane ke liye (Optional but helpful)
export const getAiSuggestion = async (ticketId) => {
  const response = await ticketApiInstance.post("/api/ai/suggest", { ticketId });
  return response.data;
};