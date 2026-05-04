import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import ticketApiInstance from "../api/axios.js";

export const fetchMyBusiness = createAsyncThunk(
  "dashboard/fetchMyBusiness",
  async (_, { rejectWithValue }) => {
    try {
      const res = await ticketApiInstance.get("/api/business/me");
      return res.data;
    } catch (err) {
      console.error("Fetch business error:", err);
      return rejectWithValue(err.response?.data?.message || err.message || "Failed to load business");
    }
  }
);

export const fetchDashboardOverview = createAsyncThunk(
  "dashboard/fetchOverview",
  async (_, { rejectWithValue }) => {
    try {
      const res = await ticketApiInstance.get("/api/analytics/overview");
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || "Failed to load overview");
    }
  }
);

export const fetchDashboardTrends = createAsyncThunk(
  "dashboard/fetchTrends",
  async (_, { rejectWithValue }) => {
    try {
      const res = await ticketApiInstance.get("/api/analytics/trends");
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || "Failed to load trends");
    }
  }
);

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState: {
    business: null,
    overview: null,
    trends: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyBusiness.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMyBusiness.fulfilled, (state, action) => {
        state.loading = false;
        // Handle both response formats
        state.business = action.payload?.business || action.payload?.data || action.payload;
      })
      .addCase(fetchMyBusiness.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        console.error("Failed to fetch business:", action.payload);
      })
      .addCase(fetchDashboardOverview.fulfilled, (state, action) => {
        state.overview = action.payload.data;
      })
      .addCase(fetchDashboardOverview.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(fetchDashboardTrends.fulfilled, (state, action) => {
        state.trends = (action.payload.trends || []).map((item) => ({
          date: item.date || item._id,
          count: item.count || 0,
          resolved: item.resolved || 0,
        }));
      })
      .addCase(fetchDashboardTrends.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export default dashboardSlice.reducer;
