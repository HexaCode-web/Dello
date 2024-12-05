import authSlice from "./slices/authSlice";
const { configureStore } = require("@reduxjs/toolkit");

export const store = configureStore({
  reducer: {
    auth: authSlice,
  },
});
