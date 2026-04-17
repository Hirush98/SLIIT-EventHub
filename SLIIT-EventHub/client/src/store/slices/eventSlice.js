import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  // Event list (browse page)
  events:      [],
  totalEvents: 0,
  currentPage: 1,
  totalPages:  1,

  // Currently viewed event
  activeEvent: null,

  // Organizer's own events
  myEvents: [],

  // Events user registered for
  myRegistrations: [],

  // Calendar data: { "2025-04-15": [{...}] }
  calendarData: {},

  // Loading + error states
  isLoading: false,
  error:     null,

  // Filters currently applied
  filters: {
    search:   '',
    category: '',
    date:     ''
  }
};

const eventSlice = createSlice({
  name: 'events',
  initialState,
  reducers: {

    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },

    setError: (state, action) => {
      state.error     = action.payload;
      state.isLoading = false;
    },

    clearError: (state) => {
      state.error = null;
    },

    // Set events list from API response
    setEvents: (state, action) => {
      const { data, total, page, pages } = action.payload;
      state.events      = data;
      state.totalEvents = total;
      state.currentPage = page;
      state.totalPages  = pages;
      state.isLoading   = false;
    },

    // Set single active event
    setActiveEvent: (state, action) => {
      state.activeEvent = action.payload;
      state.isLoading   = false;
    },

    // Set organizer's events
    setMyEvents: (state, action) => {
      state.myEvents  = action.payload;
      state.isLoading = false;
    },

    // Set user's registrations
    setMyRegistrations: (state, action) => {
      state.myRegistrations = action.payload;
      state.isLoading       = false;
    },

    // Set calendar dots data
    setCalendarData: (state, action) => {
      state.calendarData = action.payload;
    },

    // Update filters
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },

    clearFilters: (state) => {
      state.filters = { search: '', category: '', date: '' };
    },

    // Update a single event in the list after edit
    updateEventInList: (state, action) => {
      const updated = action.payload;
      const index   = state.events.findIndex((e) => e.id === updated.id);
      if (index !== -1) state.events[index] = updated;
      if (state.activeEvent?.id === updated.id) state.activeEvent = updated;
    },

    // Remove event from list after delete
    removeEventFromList: (state, action) => {
      const id       = action.payload;
      state.events   = state.events.filter((e) => e.id !== id);
      state.myEvents = state.myEvents.filter((e) => e.id !== id);
    }
  }
});

export const {
  setLoading,
  setError,
  clearError,
  setEvents,
  setActiveEvent,
  setMyEvents,
  setMyRegistrations,
  setCalendarData,
  setFilters,
  clearFilters,
  updateEventInList,
  removeEventFromList
} = eventSlice.actions;

export default eventSlice.reducer;
