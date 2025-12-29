// src/api/auth.js
import axios from 'axios';

const API_URL = 'https://tesis-backend-170896327116.us-central1.run.app/api/auth';
const DOCTOR_API_URL = 'https://tesis-backend-170896327116.us-central1.run.app/api/doctores';

const authAxios = axios.create();

authAxios.interceptors.response.use(
  response => response,
  error => {
    const errorMessage = error.response?.data?.error ||
      error.response?.data?.message ||
      'Error de conexión';
    return Promise.reject(new Error(errorMessage));
  }
);

export const authService = {
  async login(credentials) {
    try {
      const { data } = await authAxios.post(`${API_URL}/login`, credentials);
      return {
        success: true,
        token: data.token,
        user: data.user,
        redirectTo: data.redirectTo || '/dashboard'
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async registerDoctor(doctorData) {
    try {
      const { data } = await authAxios.post(`${DOCTOR_API_URL}/register`, doctorData);
      return {
        success: true,
        token: data.token,
        user: data.user,
        redirectTo: data.redirectTo || '/login'
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async loginDoctor(credentials) {
    return this.login({ ...credentials, role: 'doctor' });
  },

  async checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) return { isAuthenticated: false };

    try {
      const { data } = await authAxios.get(`${API_URL}/check-token`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return { isAuthenticated: true, user: data.user };
    } catch (error) {
      this.clearAuth();
      return { isAuthenticated: false, error: error.message };
    }
  },

  clearAuth() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
  },

  setAuthHeaders(token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }
};
