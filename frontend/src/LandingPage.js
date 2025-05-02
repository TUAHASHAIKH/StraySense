// LandingPage.js - Main landing page for Stray Sense
// This page matches the provided design, minus the "Foster" option.

import React from 'react';
import { useNavigate } from 'react-router-dom';
import AnimalFooterIllustration from './AnimalFooterIllustration';
import './LandingPage.css'; // We'll create this for custom styles

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="fullpage-bg">
      <header className="main-header">
        <div className="header-content">
          <span className="logo" role="img" aria-label="dog">🐶</span>
          <span className="title">Stray Sense</span>
        </div>
      </header>
      <main className="hero-section">
        <div className="hero-content">
          <h1>
            Better the Lives of <span className="highlight">Stray Animals</span>
          </h1>
          <p>
            Stray Sense is dedicated to enhancing the well-being of stray animals through adoption, donations, and other initiatives.
          </p>
          <div className="hero-img-container">
            <img
              src="https://images.unsplash.com/photo-1518717758536-85ae29035b6d?auto=format&fit=crop&w=600&q=80"
              alt="Happy dog and cat"
              className="hero-img"
            />
          </div>
          <div className="landing-actions">
            <button className="main-btn adopt-btn" onClick={() => navigate('/adopt')}>Adopt</button>
            <button className="main-btn donate-btn" onClick={() => alert('Coming soon!')}>Donate</button>
          </div>
        </div>
      </main>
      <AnimalFooterIllustration />
      <footer className="main-footer">
        <span>© {new Date().getFullYear()} Stray Sense. All rights reserved.</span>
      </footer>
    </div>
  );
};

export default LandingPage; 