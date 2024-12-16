import authSlice from "./slices/authSlice";
const { configureStore } = require("@reduxjs/toolkit");
import activeSettingsPage from "./slices/activeSettingsPage";
export const store = configureStore({
  reducer: {
    auth: authSlice,
    activeSettingsPage,
  },
});
