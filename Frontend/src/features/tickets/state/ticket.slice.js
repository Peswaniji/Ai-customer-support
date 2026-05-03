import { createSlice } from "@reduxjs/toolkit";

const ticketSlice = createSlice({
  name: "tickets",
  initialState: {
    tickets: [],
    activeTickets: [],
    inProgressTickets: [],
    resolvedTickets: [],
    selectedTicket: null,
    messages: [],
    loading: false,
    error: null,
  },
  reducers: {
    setTickets: (state, action) => { state.tickets = action.payload; },
    setActiveTickets: (state, action) => { state.activeTickets = action.payload; },
    setInProgressTickets: (state, action) => { state.inProgressTickets = action.payload; },
    setResolvedTickets: (state, action) => { state.resolvedTickets = action.payload; },
    setSelectedTicket: (state, action) => { state.selectedTicket = action.payload; },
    setMessages: (state, action) => { state.messages = action.payload; },
    setLoading: (state, action) => { state.loading = action.payload; },
    setError: (state, action) => { state.error = action.payload; },
    clearSelectedTicket: (state) => { state.selectedTicket = null; },
  },
});

export const {
  setTickets, setActiveTickets, setInProgressTickets,
  setResolvedTickets, setSelectedTicket, setMessages,
  setLoading, setError, clearSelectedTicket,
} = ticketSlice.actions;

export default ticketSlice.reducer;