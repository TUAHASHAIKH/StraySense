import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginForm from './components/auth/LoginForm';
import SignupForm from './components/auth/SignupForm';
import AdoptPage from './AdoptPage';
import MyAdoptions from './MyAdoptions';
import ProtectedRoute from './common/ProtectedRoute';
import LandingPage from './LandingPage';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginForm />} />
        <Route path="/signup" element={<SignupForm />} />
        <Route path="/landing" element={<LandingPage />} />
        
        {/* Protected routes */}
        <Route 
          path="/adopt" 
          element={
            <ProtectedRoute>
              <AdoptPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/my-adoptions" 
          element={
            <ProtectedRoute>
              <MyAdoptions />
            </ProtectedRoute>
          } 
        />
        
        {/* Redirect root to login if not authenticated */}
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
