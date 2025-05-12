// LandingPage.js - Main landing page for Stray Sense
// This page matches the provided design, minus the "Foster" option.

import React from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';
import catdogImg from './assets/Bottom_image_catdog.jpg';
import logoImg from './assets/logo.jpg';

const testimonials = [
  {
    quote: "Adopting from StraySense was the best decision ever. Our new family member brings us so much joy!",
    name: "Sarah & Max"
  },
  {
    quote: "The volunteers are amazing. They helped me find the perfect companion for my family.",
    name: "David K."
  },
  {
    quote: "The adoption process was smooth and professional. They really care about matching the right pet with the right family.",
    name: "Michael T."
  }
];

const reviews = [
  { stars: 5, text: 'Amazing experience! The staff truly care about the animals.', author: 'Priya S.' },
  { stars: 5, text: 'The adoption process was easy and transparent. Highly recommend!', author: 'Omar R.' },
  { stars: 5, text: 'StraySense made it so easy to find our new family member.', author: 'Ayesha T.' },
  { stars: 5, text: 'Great community and support for adopters.', author: 'Bilal M.' },
];

const features = [
  {
    icon: '❤️',
    title: 'Compassionate Care',
    desc: 'We provide love, food, and medical care to every stray animal we rescue.'
  },
  {
    icon: '🏡',
    title: 'Safe Adoptions',
    desc: 'Our adoption process ensures every animal finds a loving, responsible home.'
  },
  {
    icon: '🤝',
    title: 'Community Driven',
    desc: 'We work with volunteers and donors to make a real difference together.'
  }
];

const LandingPage = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  return (
    <div className="fullpage-bg">
      {/* Navbar */}
      <header className="main-header">
        <div className="header-content">
          <div className="logo-title">
            <img src={logoImg} alt="StraySense Logo" className="logo" />
            <span className="title">StraySense</span>
          </div>
          <nav className="nav-links">
            <a href="#hero" className="nav-link active">Home</a>
            <a href="#features" className="nav-link">What We Do</a>
            <a href="#testimonials" className="nav-link">Testimonials</a>
            <a href="#reviews" className="nav-link">Reviews</a>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section" id="hero">
        <div className="hero-content">
          <h1>Welcome{user ? `, ${user.first_name}` : ''}!</h1>
          <p>Giving Stray Animals a Second Chance at Life.<br />Find your forever friend today.</p>
          <div className="hero-img-container">
            <img src={catdogImg} alt="Cat and Dog" className="hero-img" />
            <div className="hero-buttons">
              <button className="main-btn adopt-btn" onClick={() => navigate('/adopt')}>
                <i className="fas fa-paw"></i> Adopt a Pet
              </button>
              <button className="main-btn report-btn" onClick={() => navigate('/report')}>
                <i className="fas fa-exclamation-circle"></i> Report a Stray
              </button>
              <button className="main-btn vaccine-btn" onClick={() => navigate('/vaccination-schedules')}>
                <i className="fas fa-syringe"></i> Vaccination Schedules
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* What We Do Section */}
      <section className="features-section" id="features">
        <h2>What We Do</h2>
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

      {/* Testimonials Section */}
      <section className="testimonials-section" id="testimonials">
        <h2>What People Say</h2>
        <div className="testimonials-container">
          {testimonials.map((t, i) => (
            <div className="testimonial-card" key={i}>
              <div className="testimonial-quote">"{t.quote}"</div>
              <div className="testimonial-name">- {t.name}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Reviews Ticker Section */}
      <section className="reviews-section" id="reviews">
        <h2>Community Reviews</h2>
        <div className="reviews-ticker">
          <div className="reviews-track">
            {[...reviews, ...reviews].map((r, i) => (
              <div className="review-card" key={i}>
                <div className="review-stars">{'⭐'.repeat(r.stars)}</div>
                <div className="review-text">"{r.text}"</div>
                <div className="review-author">- {r.author}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage; 