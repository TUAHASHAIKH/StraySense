import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/global.css';

const API_URL = 'http://localhost:5000/api/admin/adoptions';

const statusOptions = [
  { label: 'Pending Requests', value: 'pending' },
  { label: 'Accepted Requests', value: 'approved' },
  { label: 'Rejected Requests', value: 'rejected' },
];

const ManageAdoptions = () => {
  const navigate = useNavigate();
  const [adoptions, setAdoptions] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState('pending');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionState, setActionState] = useState({});

  useEffect(() => {
    fetchAdoptions();
  }, []);

  const fetchAdoptions = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get(API_URL, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setAdoptions(response.data);
    } catch (err) {
      setError('Failed to load adoptions');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckbox = (adoption_id, field) => {
    setActionState(prev => ({
      ...prev,
      [adoption_id]: {
        ...prev[adoption_id],
        [field]: !prev[adoption_id]?.[field]
      }
    }));
  };

  const handleAccept = async (adoption) => {
    const { adoption_id } = adoption;
    const checks = actionState[adoption_id] || {};
    if (!checks.home_check_passed || !checks.fee_paid || !checks.contract_signed) {
      alert('All checkboxes must be selected to accept.');
      return;
    }
    try {
      const token = localStorage.getItem('adminToken');
      await axios.put(`${API_URL}/${adoption_id}/status`, {
        status: 'approved',
        home_check_passed: true,
        fee_paid: true,
        contract_signed: true
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchAdoptions();
    } catch (err) {
      alert('Failed to accept adoption request');
    }
  };

  const handleReject = async (adoption_id) => {
    try {
      const token = localStorage.getItem('adminToken');
      await axios.put(`${API_URL}/${adoption_id}/status`, {
        status: 'rejected'
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchAdoptions();
    } catch (err) {
      alert('Failed to reject adoption request');
    }
  };

  const filteredAdoptions = adoptions.filter(a => a.status === selectedStatus);

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="logo-container">
          <img src="/logo.png" alt="StraySense Logo" className="auth-brand-logo" style={{ width: 40, height: 40, marginRight: 10 }} />
          <h1>Manage Adoption Requests</h1>
        </div>
        <button onClick={() => navigate('/admin/dashboard')} className="logout-btn">Back to Admin</button>
      </header>
      <main className="dashboard-content">
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
          {statusOptions.map(opt => (
            <button
              key={opt.value}
              className={`action-button${selectedStatus === opt.value ? ' primary' : ''}`}
              onClick={() => setSelectedStatus(opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>
        {loading ? (
          <div className="dashboard-loading">Loading...</div>
        ) : error ? (
          <div className="dashboard-error">{error}</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '2rem' }}>
            {filteredAdoptions.map(adoption => (
              <div key={adoption.adoption_id} className="stat-card" style={{ minHeight: 200, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ marginBottom: 8 }}>Adoption #{adoption.adoption_id}</h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem 1.5rem', fontSize: '0.98rem' }}>
                    <span><b>Requester:</b> {adoption.first_name} {adoption.last_name}</span>
                    <span><b>Animal:</b> {adoption.animal_name}</span>
                    <span><b>Status:</b> {adoption.status}</span>
                    <span><b>Applied:</b> {adoption.application_date ? new Date(adoption.application_date).toLocaleDateString() : '-'}</span>
                    <span><b>Approved:</b> {adoption.approval_date ? new Date(adoption.approval_date).toLocaleDateString() : '-'}</span>
                  </div>
                  {selectedStatus === 'pending' && (
                    <div style={{ marginTop: 12 }}>
                      <label style={{ display: 'block', marginBottom: 6 }}>
                        <input type="checkbox" checked={!!actionState[adoption.adoption_id]?.home_check_passed} onChange={() => handleCheckbox(adoption.adoption_id, 'home_check_passed')} /> Home Check Passed
                      </label>
                      <label style={{ display: 'block', marginBottom: 6 }}>
                        <input type="checkbox" checked={!!actionState[adoption.adoption_id]?.fee_paid} onChange={() => handleCheckbox(adoption.adoption_id, 'fee_paid')} /> Fee Paid
                      </label>
                      <label style={{ display: 'block', marginBottom: 6 }}>
                        <input type="checkbox" checked={!!actionState[adoption.adoption_id]?.contract_signed} onChange={() => handleCheckbox(adoption.adoption_id, 'contract_signed')} /> Contract Signed
                      </label>
                    </div>
                  )}
                </div>
                {selectedStatus === 'pending' && (
                  <div style={{ display: 'flex', gap: '1rem', marginTop: '1.2rem', justifyContent: 'flex-end' }}>
                    <button className="action-button primary" onClick={() => handleAccept(adoption)}>Accept</button>
                    <button className="action-button" onClick={() => handleReject(adoption.adoption_id)}>Reject</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default ManageAdoptions; 