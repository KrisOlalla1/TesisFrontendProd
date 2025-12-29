import axios from 'axios';

// Base URL from env or default to local API
const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const baseURL = `${API_BASE}/api`;

const api = axios.create({ baseURL });

// Attach token on each request from localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error?.response?.status === 401) {
      try {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } catch { }
      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
