import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiClient, handleApiError } from "../api/apiClient";
import { logout } from "./authSlice";

export const fetchTickets = createAsyncThunk(
  "tickets/fetchTickets",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await apiClient.get("/tickets", { params });
      if (response.data.success) {
        return response.data.tickets || [];
      }
      return rejectWithValue(response.data.message || "Unable to load tickets");
    } catch (err) {
      return rejectWithValue(handleApiError(err));
    }
  }
);

const ticketSlice = createSlice({
  name: "tickets",
  initialState: {
    tickets: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTickets.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTickets.fulfilled, (state, action) => {
        state.loading = false;
        state.tickets = action.payload;
        state.error = null;
      })
      .addCase(fetchTickets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to load tickets";
      })
      .addCase(logout.fulfilled, (state) => {
        state.tickets = [];
        state.loading = false;
        state.error = null;
      });
  },
});

export default ticketSlice.reducer;
