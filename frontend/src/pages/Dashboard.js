// src/pages/Dashboard.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { logout, getCurrentUser, getAuthHeader } from '../services/authService';
import Logo from '../components/common/Logo';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const currentUser = getCurrentUser();
        if (!currentUser) {
          navigate('/login');
          return;
        }
        setUser(currentUser);
      } catch (err) {
        setError('Failed to load user data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);
  
  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (loading) {
    return <div className="dashboard-loading">Loading...</div>;
  }

  if (error) {
    return <div className="dashboard-error">{error}</div>;
  }
  
  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="logo-container">
          <Logo width={40} height={40} />
          <h1>StraySense</h1>
        </div>
        <nav className="main-nav">
          <ul>
            <li><a href="/adopt">Adopt</a></li>
            <li><a href="/foster">Foster</a></li>
            <li><a href="/donate">Donate</a></li>
            <li><a href="/report">Report a Stray</a></li>
          </ul>
        </nav>
        <div className="user-section">
          <span className="welcome-text">Welcome, {user?.first_name}</span>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </header>
      
      <main className="dashboard-content">
        <h2>Welcome to StraySense, {user?.first_name}!</h2>
        <p>This is your personalized dashboard where you can manage your activities.</p>
        
        <div className="dashboard-actions">
          <h3>What would you like to do?</h3>
          <div className="action-buttons">
            <a href="/adopt" className="action-button primary">Find a Pet to Adopt</a>
            <a href="/foster" className="action-button secondary">Become a Foster</a>
            <a href="/report" className="action-button">Report a Stray Animal</a>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;