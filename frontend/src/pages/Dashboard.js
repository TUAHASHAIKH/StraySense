// src/pages/Dashboard.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/common/Logo';

const Dashboard = () => {
  const navigate = useNavigate();
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };
  
  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="logo-container">
          <Logo width={40} height={40} />
          <h1>Stray Sense</h1>
        </div>
        <nav className="main-nav">
          <ul>
            <li><a href="/adopt">Adopt</a></li>
            <li><a href="/foster">Foster</a></li>
            <li><a href="/donate">Donate</a></li>
            <li><a href="/report">Report a Stray</a></li>
          </ul>
        </nav>
        <button onClick={handleLogout} className="logout-btn">Logout</button>
      </header>
      
      <main className="dashboard-content">
        <h2>Welcome to StraySense</h2>
        <p>You have successfully logged in. This is your dashboard.</p>
        
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