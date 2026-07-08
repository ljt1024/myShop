import axios from 'axios';

export const http = axios.create({
  baseURL: '/api/mall',
  timeout: 12000
});

http.interceptors.request.use((config) => {
  const token = localStorage.getItem('mall_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

http.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.message || error.message || '网络异常';
    return Promise.reject(new Error(message));
  }
);
