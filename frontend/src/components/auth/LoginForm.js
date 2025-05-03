// src/components/auth/LoginForm.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Logo from '../common/Logo';
import '../../styles/auth.css';

const LoginForm = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      // Here you would typically call your backend API
      // For now, we'll just simulate a successful login
      console.log('Login attempt with:', formData);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Store token in localStorage (you'll get this from your API)
      localStorage.setItem('token', 'sample-token');
      navigate('/dashboard');
    } catch (err) {
      setError('Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-form-container">
      <div className="auth-logo-container">
        <Logo width={60} height={60} />
        <h1 className="auth-title">Stray Sense</h1>
      </div>
      
      <div className="auth-form-box">
        <h2>Welcome Back</h2>
        <p className="auth-subtitle">Login to continue helping stray animals</p>
        
        {error && <div className="auth-error">{error}</div>}
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Enter your email"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Enter your password"
            />
          </div>
          
          <div className="form-action">
            <button 
              type="submit" 
              className="auth-button" 
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </div>
          
          <div className="auth-links">
            <p>
              Don't have an account? <Link to="/signup">Sign up</Link>
            </p>
            <Link to="/forgot-password" className="forgot-password">
              Forgot password?
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;