import { createSlice } from "@reduxjs/toolkit";

//starter state
const initialState = {
  isLoggedIn: false,
  isOrgLoggedIn: false,
  user: null,
  org: null,
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
    loginOrg: (state, payload) => {
      state.isOrgLoggedIn = true;
      state.org = payload.payload;
    },
    logoutOrg: (state) => {
      state.isOrgLoggedIn = false;
      state.org = null;
    },
    logout: (state) => {
      state.isLoggedIn = false;
      state.isOrgLoggedIn = false;
      state.user = null;
      state.org = null;
    },
  },
});

// Export actions to be used in components
export const { login, logout, loginOrg, logoutOrg } = userSlice.actions;
// Export the reducer to be added to the store
export default userSlice.reducer;
