import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  activePage: null,
};

const pageSlice = createSlice({
  name: "activeSettingsPage",
  initialState,
  reducers: {
    setActiveSettingsPage: (state, payload) => {
      state.activePage = payload.payload;
    },
  },
});
// Export actions to be used in components
export const { setActiveSettingsPage } = pageSlice.actions;
// Export the reducer to be added to the store
export default pageSlice.reducer;
