import authSlice from "./slices/authSlice";
const { configureStore } = require("@reduxjs/toolkit");
import activeSettingsPage from "./slices/activeSettingsPage";
import locationReducer from "./slices/locationSlice";

export const store = configureStore({
  reducer: {
    auth: authSlice,
    activeSettingsPage,
    location: locationReducer,
  },
});
