// src/components/auth/LoginForm.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser } from '../../services/authService';
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
      const data = await loginUser(formData);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-outer-container">
      <div className="auth-left-panel">
        <img src="/logo.png" alt="StraySense Logo" className="auth-brand-logo" />
        <div className="auth-tagline">
          <h2>Capturing Moments,<br/>Creating Memories</h2>
        </div>
      </div>
      <div className="auth-right-panel">
        <div className="auth-form-box auth-animate-in">
          <h2>Login</h2>
          <p className="auth-subtitle">Don't have an account? <Link to="/signup">Sign up</Link></p>
          {error && <div className="auth-error">{error}</div>}
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="Email"
              />
            </div>
            <div className="form-group">
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
              <button type="submit" className="auth-button" disabled={loading}>
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </div>
            <div className="auth-links">
              <Link to="/forgot-password" className="forgot-password">
                Forgot password?
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;