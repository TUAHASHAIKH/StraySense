// LandingPage.js - Main landing page for Stray Sense
// This page matches the provided design, minus the "Foster" option.

import React from 'react';
import { useNavigate } from 'react-router-dom';
import AnimalFooterIllustration from './AnimalFooterIllustration';
import './LandingPage.css'; // We'll create this for custom styles

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="landing-bg">
      <div className="landing-card">
        <div className="logo-title">
          <span className="logo" role="img" aria-label="dog">🐶</span>
          <span className="title">Stray Sense</span>
        </div>
        <h1>
          Better the Lives of <span className="highlight">Stray Animals</span>
        </h1>
        <p>
          Stray Sense is dedicated to enhancing the well-being of stray animals through adoption, donations, and other initiatives.
        </p>
        <div className="landing-actions">
          <button className="main-btn adopt-btn" onClick={() => navigate('/adopt')}>Adopt</button>
          <button className="main-btn donate-btn" onClick={() => alert('Coming soon!')}>Donate</button>
        </div>
        <AnimalFooterIllustration />
      </div>
    </div>
  );
};

export default LandingPage; 