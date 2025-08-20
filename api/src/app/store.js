import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice.jsx";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    // Add other feature reducers here as you build them
  },
});
