import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiClient, handleApiError } from "../api/apiClient";
import { logout } from "./authSlice";

export const fetchBusiness = createAsyncThunk(
  "business/fetchBusiness",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get("/business/me");
      if (response.data.success) {
        return response.data.business;
      }
      return rejectWithValue(response.data.message || "Unable to load business");
    } catch (err) {
      return rejectWithValue(handleApiError(err));
    }
  }
);

export const updateBusiness = createAsyncThunk(
  "business/updateBusiness",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await apiClient.patch("/business/me", payload);
      if (response.data.success) {
        return response.data.business;
      }
      return rejectWithValue(response.data.message || "Unable to update business");
    } catch (err) {
      return rejectWithValue(handleApiError(err));
    }
  }
);

const businessSlice = createSlice({
  name: "business",
  initialState: {
    business: null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchBusiness.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBusiness.fulfilled, (state, action) => {
        state.loading = false;
        state.business = action.payload;
        state.error = null;
      })
      .addCase(fetchBusiness.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to load business";
      })
      .addCase(updateBusiness.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateBusiness.fulfilled, (state, action) => {
        state.loading = false;
        state.business = action.payload;
        state.error = null;
      })
      .addCase(updateBusiness.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to update business";
      })
      .addCase(logout.fulfilled, (state) => {
        state.business = null;
        state.loading = false;
        state.error = null;
      });
  },
});

export default businessSlice.reducer;
