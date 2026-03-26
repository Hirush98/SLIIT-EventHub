import { configureStore } from '@reduxjs/toolkit';
import userReducer  from './slices/userSlice';
import eventReducer from './slices/eventSlice';

const store = configureStore({
  reducer: {
    user:   userReducer,
    events: eventReducer,
  },
});

export default store;
