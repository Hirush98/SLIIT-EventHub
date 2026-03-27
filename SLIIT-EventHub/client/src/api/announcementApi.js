import axios from 'axios';
import { io } from 'socket.io-client';

const NOTIF_URL = import.meta.env.VITE_NOTIF_URL || 'http://localhost:5001';

const annClient = axios.create({
  baseURL: `${NOTIF_URL}/api/announcements`,
  headers: { 'Content-Type': 'application/json' }
});

annClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('eh_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Socket.IO singleton ────────────────────────────────────
let socket = null;

const getSocket = () => {
  if (!socket) {
    socket = io(NOTIF_URL, { transports: ['websocket', 'polling'] });
  }
  return socket;
};

const announcementApi = {

  getAll: async (params = {}) => {
    const { data } = await annClient.get('/', { params });
    return data;
  },

  getLatest: async () => {
    const { data } = await annClient.get('/latest');
    return data;
  },

  getById: async (id) => {
    const { data } = await annClient.get(`/${id}`);
    return data;
  },

  create: async (payload) => {
    const { data } = await annClient.post('/', payload);
    return data;
  },

  update: async (id, payload) => {
    const { data } = await annClient.put(`/${id}`, payload);
    return data;
  },

  delete: async (id) => {
    const { data } = await annClient.delete(`/${id}`);
    return data;
  },

  // Subscribe to real-time announcements
  // callback is called when a new announcement is broadcast
  subscribeToAnnouncements: (callback) => {
    const s = getSocket();
    s.on('new_announcement', callback);
    return () => s.off('new_announcement', callback);
  },

  disconnectSocket: () => {
    if (socket) { socket.disconnect(); socket = null; }
  }
};

export default announcementApi;
