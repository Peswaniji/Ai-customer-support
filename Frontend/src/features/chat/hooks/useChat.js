import { useDispatch, useSelector } from "react-redux";
import { 
  fetchMessageHistory, 
  sendMessageApi, 
  getAiSuggestion 
} from "../services/chat.api";
import { 
  setMessages, 
  appendMessage, 
  setChatLoading, 
  setChatError,
  setAiSuggestion 
} from "../state/chat.slice";

export const useChat = () => {
  const dispatch = useDispatch();
  const { messages, loading, aiSuggestion } = useSelector((state) => state.chat);

  // 1. Saare messages load karne ke liye
  const getMessages = async (ticketId) => {
    try {
      dispatch(setChatLoading(true));
      const data = await fetchMessageHistory(ticketId);
      dispatch(setMessages(data.messages || data)); // Backend response ke hisaab se
    } catch (err) {
      dispatch(setChatError(err.message));
    } finally {
      dispatch(setChatLoading(false));
    }
  };

  // 2. Message send karne ke liye
  const sendMessage = async (ticketId, content) => {
    try {
      const data = await sendMessageApi(ticketId, content);
      
      // Send hote hi local state update kar dein taaki user ko turant dikhe
      dispatch(appendMessage(data.message || data));
      return data;
    } catch (err) {
      dispatch(setChatError(err.message));
    }
  };

  // 3. AI Suggestion fetch karne ke liye
  const fetchSuggestion = async (ticketId) => {
    try {
      const data = await getAiSuggestion(ticketId);
      dispatch(setAiSuggestion(data.suggestion));
    } catch (err) {
      console.error("AI Suggestion error:", err);
    }
  };

  return {
    messages,
    loading,
    aiSuggestion,
    getMessages,
    sendMessage,
    fetchSuggestion
  };
};