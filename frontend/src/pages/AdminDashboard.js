import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/global.css';
import logoImg from '../assets/logo.jpg';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalAnimals: 0,
    totalShelters: 0,
    activeReports: 0,
    activeAdoptionRequests: 0,
    pendingVaccinations: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if admin is authenticated
    const adminToken = localStorage.getItem('adminToken');
    if (!adminToken) {
      navigate('/admin');
      return;
    }

    // Fetch admin stats
    const fetchStats = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/admin/stats', {
          headers: {
            'Authorization': `Bearer ${adminToken}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch stats');
        }

        const data = await response.json();
        setStats(data);
      } catch (err) {
        setError('Failed to load dashboard data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin');
  };

  if (loading) {
    return <div className="dashboard-loading">Loading...</div>;
  }

  if (error) {
    return <div className="dashboard-error">{error}</div>;
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="logo-container" style={{ display: 'flex', alignItems: 'flex-end', gap: '0.9rem' }}>
          <img src={logoImg} alt="StraySense Logo" className="auth-brand-logo" style={{ width: 56, height: 56, borderRadius: 12, objectFit: 'cover', boxShadow: '0 4px 16px #ffb77c33, 0 2px 8px rgba(0,0,0,0.08)', marginBottom: '-8px' }} />
          <span className="title" style={{ fontSize: '1.7rem', fontWeight: 700, color: '#FF7F00', letterSpacing: '1px', lineHeight: 1.1, display: 'inline-block' }}>StraySense Admin</span>
        </div>
        <button onClick={handleLogout} className="logout-btn">Logout</button>
      </header>
      
      <main className="dashboard-content">
        <h2>Admin Dashboard</h2>
        <p>Welcome to the StraySense administration panel.</p>
        
        <div className="admin-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem', margin: '2.5rem 0 0 0' }}>
          <div className="stat-card">
            <h3>Total Users</h3>
            <p className="stat-number">{stats.totalUsers}</p>
          </div>
          <div className="stat-card">
            <h3>Total Animals</h3>
            <p className="stat-number">{stats.totalAnimals}</p>
          </div>
          <div className="stat-card">
            <h3>Total Shelters</h3>
            <p className="stat-number">{stats.totalShelters}</p>
          </div>
          <div className="stat-card">
            <h3>Active Reports</h3>
            <p className="stat-number">{stats.activeReports}</p>
          </div>
          <div className="stat-card">
            <h3>Active Adoption Requests</h3>
            <p className="stat-number">{stats.activeAdoptionRequests}</p>
          </div>
          <div className="stat-card">
            <h3>Pending Vaccinations</h3>
            <p className="stat-number">{stats.pendingVaccinations}</p>
          </div>
        </div>

        <div style={{ marginTop: '2.5rem', display: 'flex', gap: '1.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="action-button primary" style={{ minWidth: 180 }} onClick={() => navigate('/admin/animals')}>Manage Animals</button>
          <button className="action-button secondary" style={{ minWidth: 180 }} onClick={() => navigate('/admin/shelters')}>Manage Shelters</button>
          <button className="action-button report-btn" style={{ minWidth: 180, background: '#ff914d', color: '#fff', border: 'none' }} onClick={() => navigate('/admin/reports')}>Manage Reports</button>
          <button className="action-button adoption-btn" style={{ minWidth: 180, background: '#4e9cff', color: '#fff', border: 'none' }} onClick={() => navigate('/admin/adoptions')}>Manage Adoption Requests</button>
          <button className="action-button vaccination-btn" style={{ minWidth: 180, background: '#43c59e', color: '#fff', border: 'none' }} onClick={() => navigate('/admin/vaccinations')}>Manage Vaccinations</button>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard; 