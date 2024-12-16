import { createSlice } from "@reduxjs/toolkit";

//starter state
const initialState = {
  isLoggedIn: false,
  user: null,
  error: null,
};

//configure the slice
//name
//initial state
//reducer(actions)
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
    logout: (state) => {
      state.isLoggedIn = false;
      state.user = null;
    },
  },
});

// Export actions to be used in components
export const { login, logout, updateUserData } = userSlice.actions;
// Export the reducer to be added to the store
export default userSlice.reducer;
