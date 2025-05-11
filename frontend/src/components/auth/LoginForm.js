import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import authService from '../../services/authService';
import logoImg from '../../assets/logo.jpg';
import '../../styles/auth.css';

const LoginForm = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Check for success message in location state
  React.useEffect(() => {
    if (location.state?.message) {
      setSuccess(location.state.message);
      // Clear the message from location state
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await authService.login(formData.email, formData.password);
      navigate('/landing'); // Redirect to landing page after successful login
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-outer-container">
      <div className="auth-left-panel">
        <img src={logoImg} alt="StraySense Logo" className="auth-brand-logo" />
        <div className="auth-tagline">
          <h2>Capturing Moments,<br/>Creating Memories</h2>
        </div>
      </div>
      <div className="auth-right-panel">
        <div className="auth-form-box auth-animate-in">
          <h2>Login</h2>
          <p className="auth-subtitle">Don't have an account? <Link to="/signup">Sign up</Link></p>
          {error && <div className="auth-error">{error}</div>}
          {success && <div className="success-message">{success}</div>}
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