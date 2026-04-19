import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
export const API_ROOT = (import.meta.env.VITE_API_URL || 'http://localhost:4000/api').replace(/\/api$/, '');

const orderClient = axios.create({
  baseURL: `${BASE_URL}/orders`,
});

orderClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('eh_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const orderApi = {
  placeOrder: async (orderData) => {
    const { data } = await orderClient.post('/', orderData, {
      headers: orderData instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : undefined,
    });
    return data;
  },

  getOrders: async () => {
    const { data } = await orderClient.get('/');
    return data;
  },

  getMyOrders: async () => {
    const { data } = await orderClient.get('/mine');
    return data;
  },

  updateOrderStatus: async (orderId, action) => {
    const { data } = await orderClient.patch(`/${orderId}/status`, { action });
    return data;
  },
};

export default orderApi;
