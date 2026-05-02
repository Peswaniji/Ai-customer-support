import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import businessReducer from "./businessSlice";
import ticketReducer from "./ticketSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    business: businessReducer,
    tickets: ticketReducer,
  },
});
