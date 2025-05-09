// NavBar.js
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import logo from '../assets/logo.jpg';
import './NavBar.css';

export default function NavBar() {
  const navigate = useNavigate();
  const location = useLocation();

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const isLanding = location.pathname === '/';

  return (
    <header className="main-header">
      <div className="header-content">
        <div className="ss-logo-title" onClick={() => navigate('/')}>
          <img src={logo} alt="StraySense Logo" className="ss-logo" />
          <span className="ss-title">StraySense</span>
        </div>
        <nav className="nav-links">
          <a
            href="#"
            className="nav-link"
            onClick={(e) => {
              e.preventDefault();
              if (isLanding) window.scrollTo({ top: 0, behavior: 'smooth' });
              else navigate('/');
            }}
          >
            Home
          </a>
          <a
            href="#features"
            className="nav-link"
            onClick={(e) => {
              e.preventDefault();
              isLanding ? scrollToSection('features') : navigate('/');
            }}
          >
            Features
          </a>
          <a
            href="#testimonials"
            className="nav-link"
            onClick={(e) => {
              e.preventDefault();
              isLanding ? scrollToSection('testimonials') : navigate('/');
            }}
          >
            Testimonials
          </a>
          <a
            href="#donate"
            className="nav-link"
            onClick={(e) => {
              e.preventDefault();
              isLanding ? scrollToSection('donate') : navigate('/');
            }}
          >
            Donate
          </a>
          <a
            href="#"
            className="nav-link"
            onClick={(e) => {
              e.preventDefault();
              alert('Contact coming soon!');
            }}
          >
            Contact
          </a>
        </nav>
      </div>
    </header>
  );
};


