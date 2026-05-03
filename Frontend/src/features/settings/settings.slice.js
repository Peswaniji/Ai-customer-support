import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import settingsAPI from "./services/settings.api.js";

export const fetchBusinessInfo = createAsyncThunk(
  "settings/fetchBusinessInfo",
  async (_, { rejectWithValue }) => {
    try {
      const res = await settingsAPI.getBusinessInfo();
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed");
    }
  }
);

export const updateBusinessInfo = createAsyncThunk(
  "settings/updateBusinessInfo",
  async (data, { rejectWithValue }) => {
    try {
      const res = await settingsAPI.updateBusinessInfo(data);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed");
    }
  }
);

export const fetchWidgetCode = createAsyncThunk(
  "settings/fetchWidgetCode",
  async (_, { rejectWithValue }) => {
    try {
      const res = await settingsAPI.getWidgetCode();
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed");
    }
  }
);

const settingsSlice = createSlice({
  name: "settings",
  initialState: {
    business: null,
    widgetCode: null,
    loading: false,
    updateLoading: false,
    updateSuccess: false,
    error: null,
  },
  reducers: {
    resetUpdateSuccess: (state) => {
      state.updateSuccess = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBusinessInfo.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBusinessInfo.fulfilled, (state, action) => {
        state.loading = false;
        state.business = action.payload.business;
      })
      .addCase(fetchBusinessInfo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateBusinessInfo.pending, (state) => {
        state.updateLoading = true;
        state.updateSuccess = false;
        state.error = null;
      })
      .addCase(updateBusinessInfo.fulfilled, (state, action) => {
        state.updateLoading = false;
        state.updateSuccess = true;
        state.business = action.payload.business;
      })
      .addCase(updateBusinessInfo.rejected, (state, action) => {
        state.updateLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchWidgetCode.fulfilled, (state, action) => {
        state.widgetCode = action.payload.snippet;
      });
  },
});

export const { resetUpdateSuccess } = settingsSlice.actions;
export default settingsSlice.reducer;