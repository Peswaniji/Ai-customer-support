import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import agentAPI from "./services/agent.api.js";

export const fetchAgents = createAsyncThunk(
  "agents/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await agentAPI.getAgents();
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed");
    }
  }
);

export const inviteAgent = createAsyncThunk(
  "agents/invite",
  async (agentData, { rejectWithValue }) => {
    try {
      const res = await agentAPI.inviteAgent(agentData);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed");
    }
  }
);

export const updateAgentStatus = createAsyncThunk(
  "agents/updateStatus",
  async ({ agentId, isActive }, { rejectWithValue }) => {
    try {
      const res = await agentAPI.updateStatus(agentId, isActive);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed");
    }
  }
);

const agentSlice = createSlice({
  name: "agents",
  initialState: {
    agents: [],
    loading: false,
    error: null,
    inviteSuccess: false,
  },
  reducers: {
    resetInviteSuccess: (state) => {
      state.inviteSuccess = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAgents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAgents.fulfilled, (state, action) => {
        state.loading = false;
        state.agents = action.payload.agents;
      })
      .addCase(fetchAgents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(inviteAgent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(inviteAgent.fulfilled, (state) => {
        state.loading = false;
        state.inviteSuccess = true;
      })
      .addCase(inviteAgent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateAgentStatus.fulfilled, (state, action) => {
        const updated = action.payload.agent;
        const index = state.agents.findIndex((a) => a._id === updated._id);
        if (index !== -1) state.agents[index] = updated;
      });
  },
});

export const { resetInviteSuccess } = agentSlice.actions;
export default agentSlice.reducer;