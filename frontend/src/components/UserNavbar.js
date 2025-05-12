import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import logoImg from '../assets/logo.jpg';
import './UserNavbar.css';

const UserNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <header className="main-header">
      <div className="header-content">
        <div className="logo-title" style={{ cursor: 'pointer' }} onClick={() => navigate('/landing')}>
          <img src={logoImg} alt="StraySense Logo" className="logo" />
          <span className="title">StraySense</span>
        </div>
        <nav className="nav-links">
          <button className={`nav-link-btn${location.pathname === '/landing' ? ' active' : ''}`} onClick={() => navigate('/landing')}>Home</button>
          <button className={`nav-link-btn${location.pathname === '/adopt' ? ' active' : ''}`} onClick={() => navigate('/adopt')}>Adopt a Pet</button>
          <button className={`nav-link-btn${location.pathname === '/report' ? ' active' : ''}`} onClick={() => navigate('/report')}>Report a Stray</button>
          <button className={`nav-link-btn${location.pathname === '/vaccination-schedules' ? ' active' : ''}`} onClick={() => navigate('/vaccination-schedules')}>Vaccination Schedules</button>
          <button className="nav-link-btn logout-btn" onClick={handleLogout}>Logout</button>
        </nav>
      </div>
    </header>
  );
};

export default UserNavbar; 