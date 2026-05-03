import { createSlice } from "@reduxjs/toolkit";

const chatSlice = createSlice({
  name: "chat",
  initialState: {
    messages: [],
    loading: false,
    error: null,
    aiSuggestion: null,
  },
  reducers: {
    setMessages: (state, action) => {
      state.messages = action.payload;
    },
    appendMessage: (state, action) => {
      state.messages.push(action.payload);
    },
    setAiSuggestion: (state, action) => {
      state.aiSuggestion = action.payload;
    },
    setChatLoading: (state, action) => {
      state.loading = action.payload;
    },
    setChatError: (state, action) => {
      state.error = action.payload;
    },
    clearChat: (state) => {
      state.messages = [];
      state.aiSuggestion = null;
    }
  },
});

export const { 
  setMessages, 
  appendMessage, 
  setAiSuggestion, 
  setChatLoading, 
  setChatError,
  clearChat 
} = chatSlice.actions;

export default chatSlice.reducer;