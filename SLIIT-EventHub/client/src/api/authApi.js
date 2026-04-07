import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Axios instance for auth endpoints
const authClient = axios.create({
  baseURL: `${BASE_URL}/auth`,
  headers: { 'Content-Type': 'application/json' },
});

// Attach token to every request automatically
authClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('eh_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const authApi = {

  register: async (userData) => {
    const { data } = await authClient.post('/register', userData);
    if (data.accessToken) {
      localStorage.setItem('eh_token', data.accessToken);
      localStorage.setItem('eh_refresh', data.refreshToken);
    }
    return data;
  },

  login: async (email, password) => {
    const { data } = await authClient.post('/login', { email, password });
    if (data.accessToken) {
      localStorage.setItem('eh_token', data.accessToken);
      localStorage.setItem('eh_refresh', data.refreshToken);
    }
    return data;
  },

  googleLogin: async (idToken) => {
    const { data } = await authClient.post('/google', { idToken });
    if (data.accessToken) {
      localStorage.setItem('eh_token', data.accessToken);
      localStorage.setItem('eh_refresh', data.refreshToken);
    }
    return data;
  },

  getMe: async () => {
    const { data } = await authClient.get('/me');
    return data;
  },

  updateProfile: async (profileData) => {
    const { data } = await authClient.put('/profile', profileData);
    return data;
  },

  forgotPassword: async (email) => {
    const { data } = await authClient.post('/forgot-password', { email });
    return data;
  },

  resetPassword: async (token, password) => {
    const { data } = await authClient.post(`/reset-password/${token}`, { password });
    return data;
  },

  logout: async () => {
    await authClient.post('/logout');
    localStorage.removeItem('eh_token');
    localStorage.removeItem('eh_refresh');
    localStorage.removeItem('eh_user');
  },
};

export default authApi;
