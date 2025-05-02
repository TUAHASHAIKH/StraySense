// AdoptPage.js - Displays animals available for adoption
// Fetches data from backend API and displays in a card layout

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import AnimalFooterIllustration from './AnimalFooterIllustration';
import './AdoptPage.css'; // We'll create this for custom styles

const AdoptPage = () => {
  const [animals, setAnimals] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch animal data from backend API
  useEffect(() => {
    // In the future, this will fetch from a real database
    axios.get('http://localhost:5000/api/animals')
      .then(response => {
        setAnimals(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching animals:', error);
        setLoading(false);
      });
  }, []);

  return (
    <div className="adopt-bg">
      <div className="adopt-card">
        <header className="adopt-header">
          <span className="logo" role="img" aria-label="dog">🐶</span>
          <span className="title">Stray Sense</span>
        </header>
        <main>
          <button className="back-btn" onClick={() => navigate('/')}>← Back</button>
          <h2>Animals Available for Adoption</h2>
          {loading ? (
            <p>Loading animals...</p>
          ) : (
            <div className="animal-grid">
              {animals.map(animal => (
                <div className="animal-card" key={animal.id}>
                  <img src={animal.image} alt={animal.name} className="animal-card-img" />
                  <h3>{animal.name}</h3>
                  <p>Type: {animal.type}</p>
                  <p>Breed: {animal.breed}</p>
                  <p>Age: {animal.age} years</p>
                  <button className="adopt-btn" onClick={() => alert('Adoption process coming soon!')}>Adopt</button>
                </div>
              ))}
            </div>
          )}
        </main>
        <AnimalFooterIllustration />
      </div>
    </div>
  );
};

export default AdoptPage; 