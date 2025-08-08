import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import BaseFormComponent from '../../core/BaseFormComponent';
import authService from '../../services/authService';
import '../../styles/auth.css';

/**
 * Signup Form Component - Extends BaseFormComponent
 * Handles user registration
 */
class SignupForm extends BaseFormComponent {
  constructor(props) {
    super(props);
    
    // Initialize form data
    this.state = {
      ...this.state,
      formData: {
        email: '',
        password: '',
        confirmPassword: '',
        firstName: '',
        lastName: '',
        phone: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        country: ''
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
        return { isValid: false, message: 'Password must be at least 6 characters long' };
      }
      return { isValid: true, message: '' };
    });

    this.addFieldValidator('confirmPassword', (value) => {
      const password = this.state.formData.password;
      if (!value) {
        return { isValid: false, message: 'Please confirm your password' };
      }
      if (value !== password) {
        return { isValid: false, message: 'Passwords do not match' };
      }
      return { isValid: true, message: '' };
    });

    this.addFieldValidator('firstName', (value) => {
      if (!value) {
        return { isValid: false, message: 'First name is required' };
      }
      return { isValid: true, message: '' };
    });

    this.addFieldValidator('lastName', (value) => {
      if (!value) {
        return { isValid: false, message: 'Last name is required' };
      }
      return { isValid: true, message: '' };
    });
  }

  /**
   * Process form submission
   */
  async processFormSubmission() {
    const { confirmPassword, ...userData } = this.state.formData;
    
    try {
      await authService.signup(userData);
      this.props.navigate('/login', { 
        state: { message: 'Account created successfully! Please login.' }
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Render the component
   */
  render() {
    const { formData, errors, loading } = this.state;

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
            <h2>Create Your Account</h2>
            <p className="auth-subtitle">
              Already have an account? <Link to="/login">Login</Link>
            </p>
            
            {errors.general && <div className="auth-error">{errors.general}</div>}
            
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
                  placeholder="Password"
                />
                {errors.password && <div className="field-error">{errors.password}</div>}
              </div>
              
              <div className="form-group">
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={this.handleInputChange.bind(this)}
                  required
                  placeholder="Confirm Password"
                />
                {errors.confirmPassword && <div className="field-error">{errors.confirmPassword}</div>}
              </div>
              
              <div className="form-group">
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={this.handleInputChange.bind(this)}
                  required
                  placeholder="First Name"
                />
                {errors.firstName && <div className="field-error">{errors.firstName}</div>}
              </div>
              
              <div className="form-group">
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={this.handleInputChange.bind(this)}
                  required
                  placeholder="Last Name"
                />
                {errors.lastName && <div className="field-error">{errors.lastName}</div>}
              </div>
              
              <div className="form-group">
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={this.handleInputChange.bind(this)}
                  placeholder="Phone Number (optional)"
                />
              </div>
              
              <div className="form-group">
                <input
                  type="text"
                  id="addressLine1"
                  name="addressLine1"
                  value={formData.addressLine1}
                  onChange={this.handleInputChange.bind(this)}
                  placeholder="Address Line 1 (optional)"
                />
              </div>
              
              <div className="form-group">
                <input
                  type="text"
                  id="addressLine2"
                  name="addressLine2"
                  value={formData.addressLine2}
                  onChange={this.handleInputChange.bind(this)}
                  placeholder="Address Line 2 (optional)"
                />
              </div>
              
              <div className="form-group">
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={this.handleInputChange.bind(this)}
                  placeholder="City (optional)"
                />
              </div>
              
              <div className="form-group">
                <input
                  type="text"
                  id="country"
                  name="country"
                  value={formData.country}
                  onChange={this.handleInputChange.bind(this)}
                  placeholder="Country (optional)"
                />
              </div>
              
              <div className="form-action">
                <button 
                  type="submit" 
                  className="auth-button" 
                  disabled={loading}
                >
                  {loading ? 'Creating Account...' : 'Sign Up'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }
}

/**
 * Functional wrapper to provide navigation props
 */
const SignupFormWrapper = (props) => {
  const navigate = useNavigate();
  
  return (
    <SignupForm 
      {...props} 
      navigate={navigate} 
    />
  );
};

export default SignupFormWrapper; 