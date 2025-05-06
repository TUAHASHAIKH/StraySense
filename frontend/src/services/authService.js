// src/services/authService.js
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const loginUser = async (credentials) => {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(credentials),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Login failed');
    }
    
    // Store the token and session info
    if (data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('session_id', data.session_id);
      localStorage.setItem('user', JSON.stringify(data.user));
    }
    
    return data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const registerUser = async (userData) => {
  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(userData),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Registration failed');
    }
    
    return data;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

export const logout = async () => {
  try {
    const token = localStorage.getItem('token');
    if (token) {
      await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include'
      });
    }
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    // Clear local storage regardless of API call success
    localStorage.removeItem('token');
    localStorage.removeItem('session_id');
    localStorage.removeItem('user');
  }
};

export const isAuthenticated = () => {
  return localStorage.getItem('token') !== null && 
         localStorage.getItem('session_id') !== null;
};

export const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

export const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};