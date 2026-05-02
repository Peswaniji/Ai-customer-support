import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiClient, handleApiError } from "../api/apiClient";

const savedUser = localStorage.getItem("authUser");
const savedToken = localStorage.getItem("accessToken");

export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await apiClient.post("/auth/login", credentials);
      if (response.data.success) {
        return response.data;
      }
      return rejectWithValue(response.data.message || "Login failed");
    } catch (err) {
      return rejectWithValue(handleApiError(err));
    }
  }
);

export const registerBusiness = createAsyncThunk(
  "auth/registerBusiness",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await apiClient.post("/auth/register-business", payload);
      if (response.data.success) {
        return response.data;
      }
      return rejectWithValue(response.data.message || "Registration failed");
    } catch (err) {
      return rejectWithValue(handleApiError(err));
    }
  }
);

export const refreshSession = createAsyncThunk(
  "auth/refreshSession",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.post("/auth/refresh-token");
      if (response.data.success) {
        return response.data.accessToken;
      }
      return rejectWithValue("Session refresh failed");
    } catch (err) {
      return rejectWithValue(handleApiError(err));
    }
  }
);

export const logout = createAsyncThunk("auth/logout", async (_, { rejectWithValue }) => {
  try {
    await apiClient.post("/auth/logout");
    return true;
  } catch (err) {
    return rejectWithValue(handleApiError(err));
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: savedUser ? JSON.parse(savedUser) : null,
    accessToken: savedToken || null,
    loading: false,
    error: null,
  },
  reducers: {
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.error = null;
        localStorage.setItem("authUser", JSON.stringify(action.payload.user));
        localStorage.setItem("accessToken", action.payload.accessToken);
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Login failed";
      })
      .addCase(registerBusiness.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerBusiness.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.error = null;
        localStorage.setItem("authUser", JSON.stringify(action.payload.user));
        localStorage.setItem("accessToken", action.payload.accessToken);
      })
      .addCase(registerBusiness.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Registration failed";
      })
      .addCase(refreshSession.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(refreshSession.fulfilled, (state, action) => {
        state.loading = false;
        state.accessToken = action.payload;
        state.error = null;
        if (action.payload) {
          localStorage.setItem("accessToken", action.payload);
        }
      })
      .addCase(refreshSession.rejected, (state) => {
        state.loading = false;
        state.user = null;
        state.accessToken = null;
        state.error = null;
        localStorage.removeItem("authUser");
        localStorage.removeItem("accessToken");
      })
      .addCase(logout.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.accessToken = null;
        state.error = null;
        localStorage.removeItem("authUser");
        localStorage.removeItem("accessToken");
      })
      .addCase(logout.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Logout failed";
      });
  },
});

export const { setError } = authSlice.actions;
export default authSlice.reducer;
