import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Axios instance for event endpoints
const eventClient = axios.create({
  baseURL: `${BASE_URL}/events`,
});

// Attach JWT token to every request
eventClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('eh_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const eventApi = {

  // Get all events — with optional filters
  getAllEvents: async (params = {}) => {
    const { data } = await eventClient.get('/', { params });
    return data;
  },

  // Get calendar dots for a month
  // Returns { "2025-04-15": [{id, title, startTime...}] }
  getCalendarDots: async (month, year) => {
    const { data } = await eventClient.get('/calendar', {
      params: { month, year }
    });
    return data;
  },

  // Check if time slot has conflicts
  checkConflict: async ({ date, startTime, duration, excludeId }) => {
    const { data } = await eventClient.get('/check-conflict', {
      params: { date, startTime, duration, excludeId }
    });
    return data;
  },

  // Get single event by ID
  getEventById: async (id) => {
    const { data } = await eventClient.get(`/${id}`);
    return data;
  },

  // Create event — uses FormData for image upload
  createEvent: async (formData) => {
    const { data } = await eventClient.post('/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return data;
  },

  // Update event — uses FormData for optional image update
  updateEvent: async (id, formData) => {
    const { data } = await eventClient.put(`/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return data;
  },

  // Delete event
  deleteEvent: async (id) => {
    const { data } = await eventClient.delete(`/${id}`);
    return data;
  },

  // Admin — approve/reject/complete/cancel
  updateEventStatus: async (id, status, rejectionReason = '') => {
    const { data } = await eventClient.put(`/${id}/status`, {
      status,
      rejectionReason
    });
    return data;
  },

  // Register for event
  registerForEvent: async (id) => {
    const { data } = await eventClient.post(`/${id}/register`);
    return data;
  },

  // Cancel registration
  cancelRegistration: async (id) => {
    const { data } = await eventClient.delete(`/${id}/register`);
    return data;
  },

  // Get organizer's own events
  getMyEvents: async () => {
    const { data } = await eventClient.get('/my-events');
    return data;
  },

  // Get events user is registered for
  getMyRegistrations: async () => {
    const { data } = await eventClient.get('/my-registrations');
    return data;
  },

  // Build full image URL from filename
  getImageUrl: (filename) => {
    if (!filename) return null;
    if (filename.startsWith('http')) return filename;
    return `${import.meta.env.VITE_API_URL?.replace('/api', '') ||
      'http://localhost:5000'}/uploads/${filename}`;
  }
};

export default eventApi;
