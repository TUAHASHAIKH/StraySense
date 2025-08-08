import React from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import BaseFormComponent from '../../core/BaseFormComponent';
import authService from '../../services/authService';
import logoImg from '../../assets/logo.jpg';
import '../../styles/auth.css';

/**
 * Login Form Component - Extends BaseFormComponent
 * Handles user authentication login
 */
class LoginForm extends BaseFormComponent {
  constructor(props) {
    super(props);
    
    // Initialize form data
    this.state = {
      ...this.state,
      formData: {
        email: '',
        password: ''
      }
    };

    // Setup field validators
    this.setupValidators();
  }

  /**
   * Setup form field validators
   */
  setupValidators() {
    this.addFieldValidator('email', (value) => {
      if (!value) {
        return { isValid: false, message: 'Email is required' };
      }
      if (!/\S+@\S+\.\S+/.test(value)) {
        return { isValid: false, message: 'Please enter a valid email' };
      }
      return { isValid: true, message: '' };
    });

    this.addFieldValidator('password', (value) => {
      if (!value) {
        return { isValid: false, message: 'Password is required' };
      }
      if (value.length < 6) {
        return { isValid: false, message: 'Password must be at least 6 characters' };
      }
      return { isValid: true, message: '' };
    });
  }

  /**
   * Handle component mount
   */
  onComponentMount() {
    this.checkForSuccessMessage();
  }

  /**
   * Check for success message from navigation state
   */
  checkForSuccessMessage() {
    const location = this.props.location;
    if (location?.state?.message) {
      this.setSuccess(location.state.message);
      // Clear the message from location state
      window.history.replaceState({}, document.title);
    }
  }

  /**
   * Process form submission
   */
  async processFormSubmission() {
    const { email, password } = this.state.formData;
    
    try {
      await authService.login(email, password);
      this.props.navigate('/landing');
    } catch (error) {
      throw error;
    }
  }

  /**
   * Render the component
   */
  render() {
    const { formData, errors, loading, success } = this.state;

    return (
      <div className="auth-outer-container">
        <div className="auth-left-panel">
          <img src={logoImg} alt="StraySense Logo" className="auth-brand-logo" />
          <div className="auth-tagline">
            <h2>Giving Stray Animals<br/>a Second Chance at Life</h2>
          </div>
        </div>
        <div className="auth-right-panel">
          <div className="auth-form-box auth-animate-in">
            <h2>Login</h2>
            <p className="auth-subtitle">
              Don't have an account? <Link to="/signup">Sign up</Link>
            </p>
            
            {errors.general && <div className="auth-error">{errors.general}</div>}
            {success && <div className="success-message">{success}</div>}
            
            <form onSubmit={this.handleSubmit.bind(this)} className="auth-form">
              <div className="form-group">
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={this.handleInputChange.bind(this)}
                  required
                  placeholder="Email"
                />
                {errors.email && <div className="field-error">{errors.email}</div>}
              </div>
              
              <div className="form-group">
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={this.handleInputChange.bind(this)}
                  required
                  placeholder="Enter your password"
                />
                {errors.password && <div className="field-error">{errors.password}</div>}
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
                <Link to="/forgot-password" className="forgot-password">
                  Forgot password?
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }
}

/**
 * Functional wrapper to provide navigation and location props
 */
const LoginFormWrapper = (props) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  return (
    <LoginForm 
      {...props} 
      navigate={navigate} 
      location={location} 
    />
  );
};

export default LoginFormWrapper; 