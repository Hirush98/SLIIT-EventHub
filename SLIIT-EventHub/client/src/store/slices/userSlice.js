import { createSlice } from '@reduxjs/toolkit';

// Load persisted user from localStorage
const storedUser = JSON.parse(localStorage.getItem('eh_user') || 'null');

const initialState = {
  currentUser:     storedUser,
  isAuthenticated: !!storedUser,
  isLoading:       false,
  error:           null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {

    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },

    setError: (state, action) => {
      state.error     = action.payload;
      state.isLoading = false;
    },

    loginSuccess: (state, action) => {
      state.currentUser     = action.payload;
      state.isAuthenticated = true;
      state.isLoading       = false;
      state.error           = null;
      localStorage.setItem('eh_user', JSON.stringify(action.payload));
    },

    logoutUser: (state) => {
      state.currentUser     = null;
      state.isAuthenticated = false;
      state.isLoading       = false;
      state.error           = null;
      localStorage.removeItem('eh_user');
      localStorage.removeItem('eh_token');
      localStorage.removeItem('eh_refresh');
    },

    updateUser: (state, action) => {
      state.currentUser = { ...state.currentUser, ...action.payload };
      localStorage.setItem('eh_user', JSON.stringify(state.currentUser));
    },

    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  setLoading,
  setError,
  loginSuccess,
  logoutUser,
  updateUser,
  clearError,
} = userSlice.actions;

export default userSlice.reducer;
