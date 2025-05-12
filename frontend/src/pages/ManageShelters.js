import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/global.css';
import logoImg from '../assets/logo.jpg';

const API_URL = 'http://localhost:5000/api/admin/shelters';

const ManageShelters = () => {
  const navigate = useNavigate();
  const [shelters, setShelters] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [currentShelter, setCurrentShelter] = useState({
    name: '',
    address: '',
    city: '',
    country: '',
    phone: '',
    email: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if admin is authenticated
    const adminToken = localStorage.getItem('adminToken');
    if (!adminToken) {
      navigate('/admin');
      return;
    }
    fetchShelters();
  }, [navigate]);

  const fetchShelters = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get(API_URL, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setShelters(response.data);
    } catch (error) {
      setError('Error fetching shelters');
      console.error(error);
    }
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const filteredShelters = shelters.filter(shelter =>
    shelter.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenModal = (shelter = null) => {
    if (shelter) {
      setCurrentShelter(shelter);
      setIsEditing(true);
    } else {
      setCurrentShelter({
        name: '',
        address: '',
        city: '',
        country: '',
        phone: '',
        email: '',
      });
      setIsEditing(false);
    }
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setCurrentShelter({
      name: '',
      address: '',
      city: '',
      country: '',
      phone: '',
      email: '',
    });
    setIsEditing(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentShelter(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (isEditing) {
        await axios.put(`${API_URL}/${currentShelter.shelter_id}`, currentShelter, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        alert('Shelter updated successfully');
      } else {
        await axios.post(API_URL, currentShelter, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        alert('Shelter added successfully');
      }
      fetchShelters();
      handleCloseModal();
    } catch (error) {
      alert('Error saving shelter');
      console.error(error);
    }
  };

  const handleDelete = async (shelterId) => {
    if (!window.confirm('Are you sure you want to delete this shelter?')) return;
    try {
      const token = localStorage.getItem('adminToken');
      await axios.delete(`${API_URL}/${shelterId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      alert('Shelter deleted successfully');
      fetchShelters();
    } catch (error) {
      alert('Error deleting shelter');
      console.error(error);
    }
  };

  if (error) return <div className="dashboard-error">{error}</div>;

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="logo-container" style={{ display: 'flex', alignItems: 'flex-end', gap: '0.9rem' }}>
          <img src={logoImg} alt="StraySense Logo" className="auth-brand-logo" style={{ width: 56, height: 56, borderRadius: 12, objectFit: 'cover', boxShadow: '0 4px 16px #ffb77c33, 0 2px 8px rgba(0,0,0,0.08)', marginBottom: '-8px' }} />
          <span className="title" style={{ fontSize: '1.7rem', fontWeight: 700, color: '#FF7F00', letterSpacing: '1px', lineHeight: 1.1, display: 'inline-block' }}>Manage Shelters</span>
        </div>
        <button onClick={() => navigate('/admin/dashboard')} className="logout-btn">Back to Admin</button>
      </header>

      <main className="dashboard-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h2>Shelters</h2>
          <button className="action-button primary" onClick={() => handleOpenModal()}>Add New Shelter</button>
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <input
            type="text"
            placeholder="Search shelters by name..."
            value={searchTerm}
            onChange={handleSearch}
            style={{
              width: '100%',
              padding: '0.5rem',
              borderRadius: '4px',
              border: '1px solid #ddd',
              fontSize: '1rem'
            }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '2rem' }}>
          {filteredShelters.map(shelter => (
            <div key={shelter.shelter_id} className="stat-card" style={{ minHeight: 200, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}>
              <div style={{ flex: 1 }}>
                <h3 style={{ marginBottom: 8 }}>{shelter.name}</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem 1.5rem', fontSize: '0.98rem' }}>
                  <span><b>Address:</b> {shelter.address}</span>
                  <span><b>City:</b> {shelter.city}</span>
                  <span><b>Country:</b> {shelter.country}</span>
                  <span><b>Phone:</b> {shelter.phone || '-'}</span>
                  <span><b>Email:</b> {shelter.email || '-'}</span>
                </div>
              </div>
              <div className="card-actions">
                <button className="action-button secondary" onClick={() => handleOpenModal(shelter)}>Edit</button>
                <button className="action-button" onClick={() => handleDelete(shelter.shelter_id)}>Remove</button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h2 style={{ marginBottom: 12 }}>{isEditing ? 'Edit Shelter' : 'Add New Shelter'}</h2>
            <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="animal-form">
              <div className="animal-form-fields">
                <input
                  name="name"
                  value={currentShelter.name}
                  onChange={handleInputChange}
                  placeholder="Shelter Name"
                  required
                />
                <input
                  name="address"
                  value={currentShelter.address}
                  onChange={handleInputChange}
                  placeholder="Address"
                  required
                />
                <input
                  name="city"
                  value={currentShelter.city}
                  onChange={handleInputChange}
                  placeholder="City"
                  required
                />
                <input
                  name="country"
                  value={currentShelter.country}
                  onChange={handleInputChange}
                  placeholder="Country"
                  required
                />
                <input
                  name="phone"
                  value={currentShelter.phone}
                  onChange={handleInputChange}
                  placeholder="Phone"
                />
                <input
                  name="email"
                  type="email"
                  value={currentShelter.email}
                  onChange={handleInputChange}
                  placeholder="Email"
                />
              </div>
              <div style={{ display: 'flex', gap: 12, marginTop: 18, justifyContent: 'flex-end' }}>
                <button type="button" className="action-button" onClick={handleCloseModal}>Cancel</button>
                <button type="submit" className="action-button primary">
                  {isEditing ? 'Save Changes' : 'Add Shelter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageShelters; 