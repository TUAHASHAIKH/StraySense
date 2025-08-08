import axios from 'axios';

/**
 * Base Service Class - Implements OOP principles for API communication
 * Provides common HTTP methods and error handling
 */
class BaseService {
  constructor(baseURL = 'http://localhost:5000/api') {
    this.baseURL = baseURL;
    this.axiosInstance = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Request interceptor
    this.axiosInstance.interceptors.request.use(
      this.handleRequest.bind(this),
      this.handleRequestError.bind(this)
    );

    // Response interceptor
    this.axiosInstance.interceptors.response.use(
      this.handleResponse.bind(this),
      this.handleResponseError.bind(this)
    );
  }

  // Request handling
  handleRequest(config) {
    const token = this.getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  }

  handleRequestError(error) {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }

  // Response handling
  handleResponse(response) {
    return response;
  }

  handleResponseError(error) {
    console.error('Response Error:', error);
    if (error.response?.status === 401) {
      this.handleUnauthorized();
    }
    return Promise.reject(error);
  }

  // Authentication methods
  getAuthToken() {
    return localStorage.getItem('token');
  }

  setAuthToken(token) {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }

  handleUnauthorized() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  }

  // HTTP methods
  async get(endpoint, config = {}) {
    try {
      const response = await this.axiosInstance.get(endpoint, config);
      return response.data;
    } catch (error) {
      throw this.processError(error);
    }
  }

  async post(endpoint, data = {}, config = {}) {
    try {
      const response = await this.axiosInstance.post(endpoint, data, config);
      return response.data;
    } catch (error) {
      throw this.processError(error);
    }
  }

  async put(endpoint, data = {}, config = {}) {
    try {
      const response = await this.axiosInstance.put(endpoint, data, config);
      return response.data;
    } catch (error) {
      throw this.processError(error);
    }
  }

  async delete(endpoint, config = {}) {
    try {
      const response = await this.axiosInstance.delete(endpoint, config);
      return response.data;
    } catch (error) {
      throw this.processError(error);
    }
  }

  async patch(endpoint, data = {}, config = {}) {
    try {
      const response = await this.axiosInstance.patch(endpoint, data, config);
      return response.data;
    } catch (error) {
      throw this.processError(error);
    }
  }

  // Error processing
  processError(error) {
    if (error.response) {
      return new Error(error.response.data?.message || error.response.data?.error || 'Request failed');
    } else if (error.request) {
      return new Error('Network error - no response received');
    } else {
      return new Error(error.message || 'An unexpected error occurred');
    }
  }

  // Utility methods
  isAuthenticated() {
    return !!this.getAuthToken();
  }

  getCurrentUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  setCurrentUser(user) {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }

  logout() {
    this.setAuthToken(null);
    this.setCurrentUser(null);
  }
}

export default BaseService; 