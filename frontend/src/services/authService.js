import axios from 'axios';

const API_URL = 'http://localhost:3001/api';

const authService = {
  async login(email, password) {
    const response = await axios.post(`${API_URL}/auth/login`, { email, password });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  async signup(userData) {
    const response = await axios.post(`${API_URL}/auth/signup`, userData);
    return response.data;
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser() {
    return JSON.parse(localStorage.getItem('user'));
  },

  getToken() {
    return localStorage.getItem('token');
  },

  isAuthenticated() {
    return !!this.getToken();
  },

  async getUserProfile() {
    const token = this.getToken();
    const response = await axios.get(`${API_URL}/user/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  async getUserAdoptions() {
    const token = this.getToken();
    const response = await axios.get(`${API_URL}/user/adoptions`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }
};

export default authService; 