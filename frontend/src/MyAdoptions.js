import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './MyAdoptions.css';
import logo from './assets/logo.jpg';
import authService from './services/authService';

const MyAdoptions = () => {
  const navigate = useNavigate();
  const [adoptions, setAdoptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAdoptions();
  }, []);

  const fetchAdoptions = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:3001/api/user/adoptions', {
        headers: { Authorization: `Bearer ${authService.getToken()}` }
      });
      setAdoptions(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch adoptions: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  return (
    <div className="my-adoptions">
      <header className="adopt-header">
        <div className="header-content">
          <div className="logo-title">
            <img src={logo} alt="StraySense Logo" className="logo" />
            <span className="title">StraySense</span>
          </div>
          <nav className="nav-links">
            <a href="/adopt" className="nav-link">Adopt</a>
            <a href="/my-adoptions" className="nav-link active">My Adoptions</a>
            <button onClick={handleLogout} className="logout-button">Logout</button>
          </nav>
        </div>
      </header>

      <main className="adopt-content">
        <h1>My Adoptions</h1>
        
        {loading && <div className="loading">Loading adoptions...</div>}
        
        {error && <div className="error">{error}</div>}
        
        {!loading && !error && adoptions.length === 0 && (
          <div className="no-adoptions">
            <p>No adoptions found.</p>
          </div>
        )}

        <div className="adoptions-grid">
          {adoptions.map(adoption => (
            <div key={adoption.adoption_id} className="adoption-card">
              <div className="adoption-info">
                <h3>{adoption.animal_name}</h3>
                <p className="species">{adoption.species}</p>
                <p className="breed">{adoption.breed}</p>
                <p className="status">Status: <span className={`status-${adoption.status}`}>{adoption.status}</span></p>
                <p className="date">Applied: {new Date(adoption.application_date).toLocaleDateString()}</p>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default MyAdoptions; 