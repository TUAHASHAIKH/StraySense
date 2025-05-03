// src/components/auth/SignupForm.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../../styles/auth.css';

const SignupForm = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    country: '',
    role: 'adopter'
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

  const validateStep1 = () => {
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }
    return true;
  };

  const handleNextStep = () => {
    if (validateStep1()) {
      setError('');
      setStep(2);
    }
  };

  const handlePrevStep = () => {
    setStep(1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          addressLine1: formData.addressLine1,
          addressLine2: formData.addressLine2,
          city: formData.city,
          country: formData.country,
          role: formData.role
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Signup failed');
      navigate('/login', { state: { message: 'Account created successfully! Please login.' } });
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
          <h2>Create an account</h2>
          <p className="auth-subtitle">Already have an account? <Link to="/login">Log in</Link></p>
          {error && <div className="auth-error">{error}</div>}
          <form onSubmit={handleSubmit} className="auth-form">
            {step === 1 ? (
              <>
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
                    placeholder="Create a password"
                  />
                </div>
                <div className="form-group">
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    placeholder="Confirm your password"
                  />
                </div>
                <div className="form-action">
                  <button type="button" className="auth-button" onClick={handleNextStep}>
                    Next
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="form-group">
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    placeholder="First name"
                  />
                </div>
                <div className="form-group">
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    placeholder="Last name"
                  />
                </div>
                <div className="form-group">
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Phone (optional)"
                  />
                </div>
                <div className="form-group">
                  <input
                    type="text"
                    id="addressLine1"
                    name="addressLine1"
                    value={formData.addressLine1}
                    onChange={handleChange}
                    placeholder="Address (optional)"
                  />
                </div>
                <div className="form-group">
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="City (optional)"
                  />
                </div>
                <div className="form-action">
                  <button type="button" className="auth-button-secondary" onClick={handlePrevStep}>
                    Back
                  </button>
                  <button type="submit" className="auth-button" disabled={loading}>
                    {loading ? 'Signing up...' : 'Create account'}
                  </button>
                </div>
              </>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignupForm;