import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/global.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalAnimals: 0,
    activeReports: 0
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
        <div className="logo-container">
          <img src="/logo.png" alt="StraySense Logo" className="auth-brand-logo" style={{ width: 40, height: 40, marginRight: 10 }} />
          <h1>StraySense Admin</h1>
        </div>
        <button onClick={handleLogout} className="logout-btn">Logout</button>
      </header>
      
      <main className="dashboard-content">
        <h2>Admin Dashboard</h2>
        <p>Welcome to the StraySense administration panel.</p>
        
        <div className="admin-stats">
          <div className="stat-card">
            <h3>Total Users</h3>
            <p className="stat-number">{stats.totalUsers}</p>
          </div>
          <div className="stat-card">
            <h3>Total Animals</h3>
            <p className="stat-number">{stats.totalAnimals}</p>
          </div>
          <div className="stat-card">
            <h3>Active Reports</h3>
            <p className="stat-number">{stats.activeReports}</p>
          </div>
        </div>

        <div style={{ marginTop: '2.5rem', display: 'flex', gap: '1.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="action-button primary" style={{ minWidth: 180 }} onClick={() => navigate('/admin/animals')}>Manage Animals</button>
          <button className="action-button secondary" style={{ minWidth: 180 }} onClick={() => navigate('/admin/shelters')}>Manage Shelters</button>
          <button className="action-button" style={{ minWidth: 180 }} onClick={() => navigate('/admin/reports')}>Manage Reports</button>
          <button className="action-button" style={{ minWidth: 180 }}>Manage Vaccination</button>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard; 