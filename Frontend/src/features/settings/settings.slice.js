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
      const widgetRes = await settingsAPI.getWidgetCode();
      return {
        ...res.data,
        snippet: widgetRes.data.snippet,
      };
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

export const fetchUsage = createAsyncThunk(
  "settings/fetchUsage",
  async (_, { rejectWithValue }) => {
    try {
      const res = await settingsAPI.getUsage();
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed");
    }
  }
);

export const fetchPlans = createAsyncThunk(
  "settings/fetchPlans",
  async (_, { rejectWithValue }) => {
    try {
      const res = await settingsAPI.getPlans();
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed");
    }
  }
);

export const upgradePlan = createAsyncThunk(
  "settings/upgradePlan",
  async (plan, { rejectWithValue }) => {
    try {
      const res = await settingsAPI.upgradePlan(plan);
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
    usage: null,
    plans: [],
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
        if (action.payload.snippet) {
          state.widgetCode = action.payload.snippet;
        }
      })
      .addCase(updateBusinessInfo.rejected, (state, action) => {
        state.updateLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchWidgetCode.fulfilled, (state, action) => {
        state.widgetCode = action.payload.snippet;
      })
      .addCase(fetchUsage.fulfilled, (state, action) => {
        state.usage = action.payload.usage;
      })
      .addCase(fetchPlans.fulfilled, (state, action) => {
        state.plans = action.payload.plans;
      })
      .addCase(upgradePlan.fulfilled, (state, action) => {
        state.business = {
          ...(state.business || {}),
          ...action.payload.business,
        };
        state.updateSuccess = true;
      });
  },
});

export const { resetUpdateSuccess } = settingsSlice.actions;
export default settingsSlice.reducer;
