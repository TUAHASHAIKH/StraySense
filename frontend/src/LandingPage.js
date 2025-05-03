// LandingPage.js - Main landing page for Stray Sense
// This page matches the provided design, minus the "Foster" option.

import React from 'react';
import { useNavigate } from 'react-router-dom';
import AnimalFooterIllustration from './AnimalFooterIllustration';
import './LandingPage.css'; // We'll create this for custom styles
import logo from './assets/logo.jpg';
import catDogImage from './assets/Bottom_image_catdog.jpg';

const features = [
  {
    icon: "❤️",
    title: "Compassionate Care",
    desc: "We provide love, food, and medical care to every stray animal we rescue."
  },
  {
    icon: "🏡",
    title: "Safe Adoptions",
    desc: "Our adoption process ensures every animal finds a loving, responsible home."
  },
  {
    icon: "🤝",
    title: "Community Driven",
    desc: "We work with volunteers and donors to make a real difference together."
  }
];

const testimonials = [
  {
    quote: "Adopting from Stray Sense was the best decision ever. Our new family member brings us so much joy!",
    name: "Sarah & Max"
  },
  {
    quote: "I love how easy it was to help. The team truly cares about every animal.",
    name: "Ali R."
  }
];

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="fullpage-bg">
      <header className="main-header">
        <div className="header-content">
          <div className="ss-logo-title">
            <img src={logo} alt="StraySense Logo" className="ss-logo" />
            <span className="ss-title">StraySense</span>
          </div>
          <nav className="nav-links">
            <a href="#" className="nav-link active" onClick={(e) => { e.preventDefault(); window.scrollTo({top: 0, behavior: 'smooth'}); }}>Home</a>
            <a href="#features" className="nav-link" onClick={(e) => { e.preventDefault(); document.getElementById('features').scrollIntoView({behavior: 'smooth'}); }}>Features</a>
            <a href="#testimonials" className="nav-link" onClick={(e) => { e.preventDefault(); document.getElementById('testimonials').scrollIntoView({behavior: 'smooth'}); }}>Testimonials</a>
            <a href="#donate" className="nav-link" onClick={(e) => { e.preventDefault(); document.getElementById('donate').scrollIntoView({behavior: 'smooth'}); }}>Donate</a>
            <a href="#" className="nav-link" onClick={(e) => { e.preventDefault(); alert('Contact coming soon!'); }}>Contact</a>
          </nav>
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
          <div className="ss-hero-animals">
            <img src={catDogImage} alt="Cat and Dog" className="ss-animal-img" />
          </div>
          <div className="landing-actions">
            <button className="main-btn adopt-btn" onClick={() => navigate('/adopt')}>Adopt</button>
            <button className="main-btn donate-btn" onClick={() => alert('Coming soon!')}>Donate</button>
          </div>
        </div>
      </main>
      <section className="features-section" id="features">
        <h2>Why Stray Sense?</h2>
        <div className="features-list">
          {features.map((f, i) => (
            <div className="feature-card" key={i}>
              <div className="feature-icon">{f.icon}</div>
              <div className="feature-title">{f.title}</div>
              <div className="feature-desc">{f.desc}</div>
            </div>
          ))}
        </div>
      </section>
      <section className="testimonials-section" id="testimonials">
        <h2>What People Say</h2>
        <div className="testimonials-list">
          {testimonials.map((t, i) => (
            <div className="testimonial-card" key={i}>
              <div className="testimonial-quote">“{t.quote}”</div>
              <div className="testimonial-name">- {t.name}</div>
            </div>
          ))}
        </div>
      </section>
      <section className="donate-section" id="donate">
        <h2>Make a Difference</h2>
        <div className="donate-content">
          <div className="donate-info">
            <h3>Your Support Matters</h3>
            <p>Every donation helps us provide:</p>
            <ul className="donate-benefits">
              <li>❤️ Medical care for sick and injured animals</li>
              <li>🏥 Vaccinations and spaying/neutering</li>
              <li>🍖 Food and shelter for rescued animals</li>
              <li>🏡 Support for our adoption program</li>
            </ul>
            <button className="main-btn donate-btn" onClick={() => alert('Donation system coming soon!')}>
              Donate Now
            </button>
          </div>
          <div className="donate-image">
            <img src={catDogImage} alt="Help Animals" className="donate-img" />
          </div>
        </div>
      </section>
      <AnimalFooterIllustration />
      <footer className="main-footer">
        <div className="footer-content">
          <span>© {new Date().getFullYear()} Stray Sense. All rights reserved.</span>
          <span className="footer-links">
            <a href="#" onClick={e => {e.preventDefault(); window.scrollTo({top: 0, behavior: 'smooth'});}}>Home</a>
            <a href="#" onClick={e => {e.preventDefault(); document.getElementById('features').scrollIntoView({behavior: 'smooth'});}}>Features</a>
            <a href="#" onClick={e => {e.preventDefault(); document.getElementById('testimonials').scrollIntoView({behavior: 'smooth'});}}>Testimonials</a>
          </span>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage; 