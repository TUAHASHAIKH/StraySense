import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './LandingPage';
import AdoptPage from './AdoptPage';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/adopt" element={<AdoptPage />} />
      </Routes>
    </Router>
  );
}

export default App;
