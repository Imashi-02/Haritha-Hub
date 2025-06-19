import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  currentUser: null,
  error: null,
  token: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    signInStart: (state) => {
      state.error = null; // Just clear error, no loading state
    },
    signInSuccess: (state, action) => {
      state.currentUser = action.payload.user;
      state.token = action.payload.token;
      state.error = null;
    },
    signInFailure: (state, action) => {
      state.error = action.payload;
    },
    updateStart: (state) => {
      state.error = null;
    },
    updateSuccess: (state, action) => {
      state.currentUser = action.payload;
      state.error = null;
    },
    updateFailure: (state, action) => {
      state.error = action.payload;
    },
    deleteUserStart: (state) => {
      state.error = null;
    },
    deleteUserSuccess: (state) => {
      state.currentUser = null;
      state.token = null;
      state.error = null;
    },
    deleteUserFailure: (state, action) => {
      state.error = action.payload;
    },
    signoutSuccess: (state) => {
      state.currentUser = null;
      state.token = null;
      state.error = null;
    },
  },
});

export const {
  signInStart,
  signInSuccess,
  signInFailure,
  updateStart,
  updateSuccess,
  updateFailure,
  deleteUserStart,
  deleteUserSuccess,
  deleteUserFailure,
  signoutSuccess,
} = userSlice.actions;

export default userSlice.reducer;