import { useDispatch } from "react-redux";
import {
  setTickets,           // assigned
  setActiveTickets,     // active chats
  setResolvedTickets,   // resolved
  setLoading,
  setError,
} from "../state/ticket.slice";

import {
  assignAgentTicket,
  activeChatsForAgent,
  progressTicketsForAgent,
} from "../services/tickets.api";

export const useTickets = () => {
  const dispatch = useDispatch();

  const ensureAccessToken = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Access token missing. Please login again.");
    }
  };

  // 🔵 Assigned Tickets
  async function getAssignedTickets() {
    try {
      dispatch(setLoading(true));
      ensureAccessToken();

      const data = await assignAgentTicket();
      dispatch(setTickets(data.tickets));

      return data;
    } catch (err) {
      dispatch(setError(err.message));
    } finally {
      dispatch(setLoading(false));
    }
  }

  // 🟢 Active Chats
  async function getActiveChats() {
    try {
      dispatch(setLoading(true));
      ensureAccessToken();

      const data = await activeChatsForAgent();
      dispatch(setActiveTickets(data.tickets));

      return data;
    } catch (err) {
      dispatch(setError(err.message));
    } finally {
      dispatch(setLoading(false));
    }
  }

  // 🟡 In Progress Tickets
  // 🟡 In Progress Tickets Hook Fix
async function getInProgressTickets() {
  try {
    dispatch(setLoading(true));
    const data = await progressTicketsForAgent();

    // DASHBOARD FIX: Dashboard 'tickets' array se status filter kar raha hai, 
    // isliye data isi action mein jaana chahiye.
    dispatch(setTickets(data.tickets)); 

    return data;
  } catch (err) {
    dispatch(setError(err.message));
  } finally {
    dispatch(setLoading(false));
  }
}

  return {
    getAssignedTickets,
    getActiveChats,
    getInProgressTickets,
  };
};