import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const notificationClient = axios.create({
  baseURL: `${BASE_URL}/notifications`,
});

notificationClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('eh_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const notificationApi = {
  getMyNotifications: async () => {
    const { data } = await notificationClient.get('/mine');
    return data;
  },

  markAllRead: async () => {
    const { data } = await notificationClient.patch('/mine/read');
    return data;
  },
};

export default notificationApi;
