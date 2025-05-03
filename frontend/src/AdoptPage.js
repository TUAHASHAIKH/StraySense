// AdoptPage.js - Displays animals available for adoption
// Fetches data from backend API and displays in a card layout

import React from 'react';
import { useNavigate } from 'react-router-dom';
import './AdoptPage.css';
import logo from './assets/logo.jpg';

const AdoptPage = () => {
  const navigate = useNavigate();

  const pets = [
    {
      id: 1,
      name: "Luna",
      type: "Cat",
      age: "2 years",
      image: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=600&q=80",
      description: "A playful and affectionate cat who loves to cuddle and play with toys."
    },
    {
      id: 2,
      name: "Max",
      type: "Dog",
      age: "3 years",
      image: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=600&q=80",
      description: "A friendly and energetic dog who loves long walks and playing fetch."
    },
    // Add more pets as needed
  ];

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
            <button className="filter-button active">All</button>
            <button className="filter-button">Dogs</button>
            <button className="filter-button">Cats</button>
            <button className="filter-button">Other</button>
          </div>
        </div>

        <div className="adopt-grid">
          {pets.map(pet => (
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
                <button className="adopt-button">Adopt {pet.name}</button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default AdoptPage; 