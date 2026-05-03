import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import analyticsAPI from "./services/analytics.api.js";

export const fetchOverview = createAsyncThunk(
  "analytics/fetchOverview",
  async (_, { rejectWithValue }) => {
    try {
      const res = await analyticsAPI.getOverview();
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed");
    }
  }
);

export const fetchTrends = createAsyncThunk(
  "analytics/fetchTrends",
  async (_, { rejectWithValue }) => {
    try {
      const res = await analyticsAPI.getTrends();
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed");
    }
  }
);

export const fetchAgentStats = createAsyncThunk(
  "analytics/fetchAgentStats",
  async (_, { rejectWithValue }) => {
    try {
      const res = await analyticsAPI.getAgentStats();
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed");
    }
  }
);

const analyticsSlice = createSlice({
  name: "analytics",
  initialState: {
    overview: null,
    trends: [],
    agentStats: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchOverview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOverview.fulfilled, (state, action) => {
        state.loading = false;
        state.overview = action.payload.data;
      })
      .addCase(fetchOverview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchTrends.fulfilled, (state, action) => {
        state.trends = action.payload.trends;
      })
      .addCase(fetchAgentStats.fulfilled, (state, action) => {
        state.agentStats = action.payload.agents;
      });
  },
});

export default analyticsSlice.reducer;