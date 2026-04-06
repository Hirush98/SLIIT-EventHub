import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Axios instance for feedback endpoints
const feedbackClient = axios.create({
    baseURL: `${BASE_URL}/feedback`,
});

// Attach JWT token to every request
feedbackClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('eh_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

const feedbackApi = {

    // Submit feedback for an event
    submitFeedback: async (eventId, feedbackData) => {
        const { data } = await feedbackClient.post(`/${eventId}`, feedbackData);
        return data;
    },

    // Get all feedback for an event (organizer/admin)
    getEventFeedback: async (eventId) => {
        const { data } = await feedbackClient.get(`/${eventId}`);
        return data;
    },

    // Generate QR code for feedback form (organizer only)
    generateFeedbackQR: async (eventId) => {
        const { data } = await feedbackClient.get(`/qr/${eventId}`);
        return data;
    },

    // Get single feedback by ID (organizer/admin)
    getFeedbackById: async (id) => {
        const { data } = await feedbackClient.get(`/single/${id}`);
        return data;
    },

    // AI summary
    getFeedbackSummary: async (eventId) => {
        const { data } = await feedbackClient.get(`/${eventId}/feedback-summary`);
        return data;
    },

    // ✅ START feedback
    startFeedback: async (eventId) => {
        const { data } = await feedbackClient.patch(`/start/${eventId}`);
        return data;
    },

    // ✅ STOP feedback
    stopFeedback: async (eventId) => {
        const { data } = await feedbackClient.patch(`/stop/${eventId}`);
        return data;
    },

    // ✅ CHECK feedback status
    checkFeedbackStatus: async (eventId) => {
        const { data } = await feedbackClient.get(`/${eventId}/status`);
        return data;
    },

    // ✅ CHECK if current user already submitted feedback
    checkUserFeedbackStatus: async (eventId) => {
        const { data } = await feedbackClient.get(`/${eventId}/user-status`);
        return data;
    },

    // ✅ GET feedback stats (avg rating, count - public view)
    getFeedbackStats: async (eventId) => {
        const { data } = await feedbackClient.get(`/${eventId}/stats`);
        return data;
    }

};

export default feedbackApi;