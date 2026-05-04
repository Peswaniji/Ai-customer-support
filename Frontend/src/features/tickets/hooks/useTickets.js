import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import {
  setTickets,
  setActiveTickets,
  setInProgressTickets,
  setResolvedTickets,
  setSelectedTicket,
  setTicketMeta,
  setLoading,
  setError,
  clearSelectedTicket,
} from "../state/ticket.slice.js";
import ticketAPI from "../services/tickets.api.js";

const useTickets = (autoFetch = false) => {
  const dispatch = useDispatch();
  const {
    tickets, activeTickets, inProgressTickets,
    resolvedTickets, selectedTicket,
    total, page, pages, loading, error,
  } = useSelector((state) => state.ticket);

  const [filters, setFilters] = useState({ status: "", priority: "", page: 1, limit: 10 });

  const cleanFilters = (values = {}) =>
    Object.fromEntries(
      Object.entries(values).filter(([, value]) => value !== "" && value !== null && value !== undefined)
    );

  // All tickets
  const getTickets = async (f = filters) => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));
      const res = await ticketAPI.getTickets(cleanFilters(f));
      dispatch(setTickets(res.data.tickets));
      dispatch(setTicketMeta({ total: res.data.total, page: res.data.page, pages: res.data.pages }));
    } catch (err) {
      dispatch(setError(err.response?.data?.message || "Failed"));
    } finally {
      dispatch(setLoading(false));
    }
  };

  // Active chats
  const getActiveChats = async () => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));
      const res = await ticketAPI.getActiveChats();
      dispatch(setActiveTickets(res.data.tickets));
    } catch (err) {
      dispatch(setError(err.response?.data?.message || "Failed"));
    } finally {
      dispatch(setLoading(false));
    }
  };

  // In progress
  const getInProgressTickets = async () => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));
      const res = await ticketAPI.getInProgressTickets();
      dispatch(setInProgressTickets(res.data.tickets));
    } catch (err) {
      dispatch(setError(err.response?.data?.message || "Failed"));
    } finally {
      dispatch(setLoading(false));
    }
  };

  // Ticket by ID
  const getTicketById = async (ticketId) => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));
      const res = await ticketAPI.getTicketById(ticketId);
      dispatch(setSelectedTicket(res.data.ticket));
    } catch (err) {
      dispatch(setError(err.response?.data?.message || "Failed"));
    } finally {
      dispatch(setLoading(false));
    }
  };

  // Update status
  const changeStatus = async (ticketId, status) => {
    try {
      const res = await ticketAPI.updateStatus(ticketId, status);
      dispatch(setSelectedTicket(res.data.ticket));
    } catch (err) {
      dispatch(setError(err.response?.data?.message || "Failed"));
    }
  };

  // Resolve
  const resolve = async (ticketId) => {
    try {
      const res = await ticketAPI.resolveTicket(ticketId);
      dispatch(setSelectedTicket(res.data.ticket));
    } catch (err) {
      dispatch(setError(err.response?.data?.message || "Failed"));
    }
  };

  // Assign agent
  const assign = async (ticketId, agentId) => {
    try {
      const res = await ticketAPI.assignTicket(ticketId, agentId);
      dispatch(setSelectedTicket(res.data.ticket));
    } catch (err) {
      dispatch(setError(err.response?.data?.message || "Failed"));
    }
  };

  // Change priority
  const changePriority = async (ticketId, priority) => {
    try {
      const res = await ticketAPI.updatePriority(ticketId, priority);
      dispatch(setSelectedTicket(res.data.ticket));
    } catch (err) {
      dispatch(setError(err.response?.data?.message || "Failed"));
    }
  };

  const createTicket = async ({ subject, description }) => {
    try {
      const res = await ticketAPI.createTicket({ subject, description });
      return res.data.ticket;
    } catch (err) {
      dispatch(setError(err.response?.data?.message || "Failed"));
      throw err;
    }
  };

  const getAssignedTickets = async () => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));
      const res = await ticketAPI.getAssignedTickets();
      dispatch(setTickets(res.data.tickets));
      dispatch(setTicketMeta({ total: res.data.total, page: res.data.page, pages: res.data.pages }));
    } catch (err) {
      dispatch(setError(err.response?.data?.message || "Failed"));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const rateTicket = async (ticketId, rating) => {
    try {
      return await ticketAPI.rateTicket(ticketId, rating);
    } catch (err) {
      dispatch(setError(err.response?.data?.message || "Failed"));
      throw err;
    }
  };

  // Filters
  const applyFilters = (newFilters) => {
    const updated = { ...filters, ...newFilters, page: 1 };
    setFilters(updated);
    getTickets(updated);
  };

  const changePage = (newPage) => {
    const updated = { ...filters, page: newPage };
    setFilters(updated);
    getTickets(updated);
  };

  useEffect(() => {
    if (autoFetch) getTickets();
  }, [autoFetch]);

  return {
    tickets, activeTickets, inProgressTickets,
    resolvedTickets, selectedTicket,
    total, page, pages, loading, error, filters,
    getTickets, getAssignedTickets, getActiveChats, getInProgressTickets,
    getTicketById, changeStatus, resolve,
    assign, changePriority, createTicket, rateTicket, clearSelectedTicket,
    applyFilters, changePage,
  };
};

export default useTickets;
