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

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState: {
    business: null,
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
        console.log("Business data loaded:", state.business);
      })
      .addCase(fetchMyBusiness.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        console.error("Failed to fetch business:", action.payload);
      });
  },
});

export default dashboardSlice.reducer;