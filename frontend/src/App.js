// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginForm from './components/auth/LoginForm';
import SignupForm from './components/auth/SignupForm';
import AdoptPage from './AdoptPage';
import MyAdoptions from './MyAdoptions';
import ProtectedRoute from './components/common/ProtectedRoute';
import LandingPage from './LandingPage';
import StrayReport from './components/StrayReport';
import VaccinationSchedules from './components/VaccinationSchedules';

// Admin imports
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import ManageAnimals from './pages/ManageAnimals';
import ManageShelters from './pages/ManageShelters';
import ManageReports from './pages/ManageReports';
import ManageAdoptions from './pages/ManageAdoptions';
import ManageVaccinations from './pages/ManageVaccinations';

// Styles
import './styles/variables.css';
import './App.css';
import './styles/global.css';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginForm />} />
        <Route path="/signup" element={<SignupForm />} />
        <Route path="/landing" element={<LandingPage />} />
        
        {/* User Protected routes */}
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
        <Route 
          path="/report" 
          element={
            <ProtectedRoute>
              <StrayReport />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/vaccination-schedules" 
          element={
            <ProtectedRoute>
              <VaccinationSchedules />
            </ProtectedRoute>
          } 
        />
        
        {/* Admin routes */}
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/animals" element={<ManageAnimals />} />
        <Route path="/admin/shelters" element={<ManageShelters />} />
        <Route path="/admin/reports" element={<ManageReports />} />
        <Route path="/admin/adoptions" element={<ManageAdoptions />} />
        <Route path="/admin/vaccinations" element={<ManageVaccinations />} />
        
        {/* Redirect root to login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;