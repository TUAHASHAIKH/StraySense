// AdoptPage.js - Displays animals available for adoption
// TODO: Replace dummy data with SQL database integration
// Database schema should include:
// - id (primary key)
// - name
// - type (enum: 'Dog', 'Cat', 'Other')
// - age
// - image_url
// - description
// - status (available, adopted, pending)
// - created_at
// - updated_at

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './AdoptPage.css';
import logo from './assets/logo.jpg';
import authService from './services/authService';

const AdoptPage = () => {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('All');
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userAdoptions, setUserAdoptions] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch both pets and user adoptions in parallel
        const [petsResponse, adoptionsResponse] = await Promise.all([
          axios.get('http://localhost:3001/api/animals'),
          authService.getUserAdoptions()
        ]);
        
        setPets(petsResponse.data);
        setUserAdoptions(adoptionsResponse);
        setError(null);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (authService.isAuthenticated()) {
      fetchData();
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const handleAdopt = async (animalId) => {
    try {
      const user = authService.getCurrentUser();
      console.log('Current user:', user);
      console.log('Attempting to adopt animal:', animalId);
      
      if (!user || !user.user_id) {
        console.error('No user found or missing user_id');
        alert('Please log in to adopt an animal');
        return;
      }

      const requestData = {
        userId: user.user_id,
        animalId: parseInt(animalId)
      };
      console.log('Sending adoption request with data:', requestData);
      
      const response = await axios.post('http://localhost:3001/api/adopt', requestData, {
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authService.getToken()}`
        }
      });
      
      console.log('Adoption response:', response.data);
      
      if (response.data.message === 'Adoption request submitted successfully') {
        // Refresh the adoptions list
        const adoptions = await authService.getUserAdoptions();
        setUserAdoptions(adoptions);
        alert('Adoption request submitted successfully!');
      }
    } catch (err) {
      console.error('Error submitting adoption request:', err);
      console.error('Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      alert(err.response?.data?.error || 'Failed to submit adoption request');
    }
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const filteredPets = activeFilter === 'All' 
    ? pets 
    : pets.filter(pet => pet.species.toLowerCase() === activeFilter.toLowerCase());

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="adopt-page">
      <header className="adopt-header">
        <div className="header-content">
          <div className="logo-title">
            <img src={logo} alt="StraySense Logo" className="logo" />
            <span className="title">StraySense</span>
          </div>
          <nav className="nav-links">
            <a href="/adopt" className="nav-link active">Adopt</a>
            <a href="/my-adoptions" className="nav-link">My Adoptions</a>
            <button onClick={handleLogout} className="logout-button">Logout</button>
          </nav>
        </div>
      </header>

      <main className="adopt-content">
        <div className="filters" id="filters">
          <h3>Find Your Perfect Companion</h3>
          <div className="filter-group">
            <button 
              className={`filter-button ${activeFilter === 'All' ? 'active' : ''}`}
              onClick={() => setActiveFilter('All')}
            >
              All
            </button>
            <button 
              className={`filter-button ${activeFilter === 'dog' ? 'active' : ''}`}
              onClick={() => setActiveFilter('dog')}
            >
              Dogs
            </button>
            <button 
              className={`filter-button ${activeFilter === 'cat' ? 'active' : ''}`}
              onClick={() => setActiveFilter('cat')}
            >
              Cats
            </button>
            <button 
              className={`filter-button ${activeFilter === 'other' ? 'active' : ''}`}
              onClick={() => setActiveFilter('other')}
            >
              Other
            </button>
          </div>
        </div>

        <div className="adopt-grid">
          {filteredPets.map(pet => (
            <div className="pet-card" key={pet.animal_id}>
              <div className="pet-image-container">
                <img src={pet.image_url || 'default-pet.jpg'} alt={pet.name} className="pet-image" />
              </div>
              <div className="pet-info">
                <h3 className="pet-name">{pet.name}</h3>
                <div className="pet-details">
                  <span>{pet.species}</span> • <span>{pet.age} years old</span>
                </div>
                <p className="pet-description">{pet.description}</p>
                <button 
                  className="adopt-button"
                  onClick={() => handleAdopt(pet.animal_id)}
                  disabled={pet.status !== 'available' || userAdoptions.some(a => a.animal_id === pet.animal_id)}
                >
                  {pet.status !== 'available' ? 'Not Available' : 
                   userAdoptions.some(a => a.animal_id === pet.animal_id) ? 'Already Requested' :
                   `Adopt ${pet.name}`}
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default AdoptPage; 