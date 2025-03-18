import { createSlice } from "@reduxjs/toolkit";

//starter state
const initialState = {
  isLoggedIn: false,
  user: null,
  error: null,
  notificationsCount: 0,
};

export const userSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login: (state, payload) => {
      state.isLoggedIn = true;
      state.user = payload.payload;
    },

    updateUserData: (state, payload) => {
      state.user = { Token: state.user.Token, user: payload.payload };
    },
    updateNotificationsCount: (state, payload) => {
      state.notificationsCount = payload.payload;
    },
    logout: (state) => {
      state.isLoggedIn = false;
      state.user = null;
    },
  },
});

// Export actions to be used in components
export const { login, logout, updateUserData, updateNotificationsCount } =
  userSlice.actions;
// Export the reducer to be added to the store
export default userSlice.reducer;
