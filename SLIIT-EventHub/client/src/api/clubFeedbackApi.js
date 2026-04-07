import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const feedbackClient = axios.create({
  baseURL: `${BASE_URL}/feedback`,
});

// Interceptor to attach token
feedbackClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('eh_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const clubFeedbackApi = {
  // Get all feedback for a specific club
  getOrganizerReviews: async (id) => {
    const { data } = await feedbackClient.get(`/organizer/${id}`);
    return data;
  },

  // Get average rating stats for a club
  getFeedbackStats: async (id) => {
    const { data } = await feedbackClient.get(`/stats/${id}`);
    return data;
  },

  // Submit or update a review
  submitFeedback: async (feedbackData) => {
    const { data } = await feedbackClient.post('/', feedbackData);
    return data;
  }
};

export default clubFeedbackApi;
