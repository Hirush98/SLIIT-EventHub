import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const adminClient = axios.create({
  baseURL: `${BASE_URL}/admin`,
  headers: { 'Content-Type': 'application/json' }
});

adminClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('eh_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const adminApi = {
  getAllUsers:       async (params = {}) => (await adminClient.get('/users', { params })).data,
  getPlatformStats:     async ()             => (await adminClient.get('/stats')).data,
  getRiskAnalysis:      async ()             => (await adminClient.get('/risk-analysis')).data,
  getParticipantRisk:   async ()             => (await adminClient.get('/participant-risk')).data,
  changeUserRole:       async (id, role)     => (await adminClient.put(`/users/${id}/role`, { role })).data,
  toggleUserStatus: async (id, isActive) => (await adminClient.put(`/users/${id}/status`, { isActive })).data,
};

export default adminApi;
