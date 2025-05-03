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
import './AdoptPage.css';
import logo from './assets/logo.jpg';
import axios from 'axios';

const AdoptPage = () => {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('All');
  const [pets, setPets] = useState([]); // Will be populated from database
  const [loading, setLoading] = useState(false); // For loading state when fetching from database
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPets = async () => {
      setLoading(true);
      try {
        const response = await axios.get('http://localhost:3001/api/animals');
        // Map backend fields to frontend expected fields
        const mappedPets = response.data.map(animal => ({
          id: animal.animal_id,
          name: animal.name,
          type: animal.species,
          age: animal.age,
          image: animal.image_path || 'https://via.placeholder.com/300x200?text=Pet+Image',
          description: animal.health_status || 'No description available',
          status: animal.status
        }));
        setPets(mappedPets);
        setError(null);
      } catch (err) {
        setError('Failed to fetch animals: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPets();
  }, []);

  // Filter pets based on selected type
  const filteredPets = activeFilter === 'All' 
    ? pets 
    : pets.filter(pet => {
        // Convert both the pet type and active filter to lowercase for comparison
        const petType = pet.type.toLowerCase();
        const filterType = activeFilter.toLowerCase();
        return petType === filterType;
      });

  // Add console log for debugging
  console.log('Active Filter:', activeFilter);
  console.log('Filtered Pets:', filteredPets);

  // TODO: Implement adoption process
  const handleAdopt = async (petId) => {
    // Will be replaced with actual adoption API call
    // try {
    //   const response = await fetch(`/api/pets/${petId}/adopt`, {
    //     method: 'POST',
    //     headers: {
    //       'Content-Type': 'application/json',
    //     },
    //     body: JSON.stringify({ status: 'pending' }),
    //   });
    //   if (response.ok) {
    //     // Update local state or refetch pets
    //   }
    // } catch (error) {
    //   console.error('Error adopting pet:', error);
    // }
    alert('Adoption process coming soon!');
  };

  return (
    <div className="adopt-page">
      <header className="adopt-header">
        <div className="header-content">
          <div className="logo-title">
            <img src={logo} alt="StraySense Logo" className="logo" />
            <span className="title">StraySense</span>
          </div>
          <nav className="nav-links">
            <a href="/" className="nav-link" onClick={(e) => { e.preventDefault(); navigate('/'); }}>Home</a>
            <a href="#filters" className="nav-link active">Adopt</a>
            <a href="#" className="nav-link" onClick={(e) => { e.preventDefault(); alert('Coming soon!'); }}>Donate</a>
          </nav>
        </div>
      </header>

      <main className="adopt-content">
        <div className="filters" id="filters">
          <h3>Find Your Perfect Companion</h3>
          <div className="filter-group">
            <button 
              className={`filter-button ${activeFilter === 'All' ? 'active' : ''}`}
              onClick={() => {
                console.log('Setting filter to All');
                setActiveFilter('All');
              }}
            >
              All
            </button>
            <button 
              className={`filter-button ${activeFilter === 'Dog' ? 'active' : ''}`}
              onClick={() => {
                console.log('Setting filter to Dog');
                setActiveFilter('Dog');
              }}
            >
              Dogs
            </button>
            <button 
              className={`filter-button ${activeFilter === 'Cat' ? 'active' : ''}`}
              onClick={() => {
                console.log('Setting filter to Cat');
                setActiveFilter('Cat');
              }}
            >
              Cats
            </button>
            <button 
              className={`filter-button ${activeFilter === 'Other' ? 'active' : ''}`}
              onClick={() => {
                console.log('Setting filter to Other');
                setActiveFilter('Other');
              }}
            >
              Other
            </button>
          </div>
        </div>

        {loading ? (
          <div className="loading">Loading pets...</div>
        ) : (
          <div className="adopt-grid">
            {filteredPets.map(pet => (
              <div className="pet-card" key={pet.id}>
                <div className="pet-image-container">
                  <img src={pet.image} alt={pet.name} className="pet-image" />
                </div>
                <div className="pet-info">
                  <h3 className="pet-name">{pet.name}</h3>
                  <div className="pet-details">
                    <span>{pet.type}</span> • <span>{pet.age}</span>
                  </div>
                  <p className="pet-description">{pet.description}</p>
                  <button 
                    className="adopt-button"
                    onClick={() => handleAdopt(pet.id)}
                  >
                    Adopt {pet.name}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default AdoptPage; 