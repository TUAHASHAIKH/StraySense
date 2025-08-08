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
        <section className="admin-welcome-card">
          <h1 className="admin-welcome-title">Welcome, Admin! <span role="img" aria-label="wave">👋</span></h1>
          <p className="admin-welcome-desc">Manage users, animals, shelters, reports, adoptions, and vaccinations with ease. Your dashboard gives you a quick overview and powerful controls.</p>
        </section>

        <div className="admin-stats two-rows">
          <div className="stat-card stat-users">
            <div className="stat-accent"></div>
            <div className="stat-icon">👤</div>
            <div className="stat-label">Total Users</div>
            <div className="stat-number">{stats.totalUsers}</div>
          </div>
          <div className="stat-card stat-animals">
            <div className="stat-accent"></div>
            <div className="stat-icon">🐾</div>
            <div className="stat-label">Total Animals</div>
            <div className="stat-number">{stats.totalAnimals}</div>
          </div>
          <div className="stat-card stat-shelters">
            <div className="stat-accent"></div>
            <div className="stat-icon">🏠</div>
            <div className="stat-label">Total Shelters</div>
            <div className="stat-number">{stats.totalShelters}</div>
          </div>
          <div className="stat-card stat-reports">
            <div className="stat-accent"></div>
            <div className="stat-icon">📢</div>
            <div className="stat-label">Active Reports</div>
            <div className="stat-number">{stats.activeReports}</div>
          </div>
          <div className="stat-card stat-adoptions">
            <div className="stat-accent"></div>
            <div className="stat-icon">❤️</div>
            <div className="stat-label">Active Adoptions</div>
            <div className="stat-number">{stats.activeAdoptionRequests}</div>
          </div>
          <div className="stat-card stat-vaccinations">
            <div className="stat-accent"></div>
            <div className="stat-icon">💉</div>
            <div className="stat-label">Pending Vaccinations</div>
            <div className="stat-number">{stats.pendingVaccinations}</div>
          </div>
        </div>

        <section className="dashboard-actions">
          <h3>Quick Actions</h3>
          <div className="action-buttons">
            <button className="action-button primary" onClick={() => navigate('/admin/animals')}>🐾 Manage Animals</button>
            <button className="action-button secondary" onClick={() => navigate('/admin/shelters')}>🏠 Manage Shelters</button>
            <button className="action-button report-btn" style={{ background: '#ff914d', color: '#fff' }} onClick={() => navigate('/admin/reports')}>📢 Manage Reports</button>
            <button className="action-button adoption-btn" style={{ background: '#4e9cff', color: '#fff' }} onClick={() => navigate('/admin/adoptions')}>❤️ Manage Adoptions</button>
            <button className="action-button vaccination-btn" style={{ background: '#43c59e', color: '#fff' }} onClick={() => navigate('/admin/vaccinations')}>💉 Manage Vaccinations</button>
          </div>
        </section>
      </main>
    </div>
  );
};

export default AdminDashboard; 