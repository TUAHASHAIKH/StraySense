import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/global.css';

const API_URL = 'http://localhost:5000/api/admin/animals';

const ManageAnimals = () => {
  const navigate = useNavigate();
  const [animals, setAnimals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnimals = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        const response = await fetch(API_URL, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (!response.ok) throw new Error('Failed to fetch animals');
        const data = await response.json();
        setAnimals(data);
      } catch (err) {
        setError('Failed to load animals');
      } finally {
        setLoading(false);
      }
    };
    fetchAnimals();
  }, []);

  const handleAddAnimal = () => {
    // TODO: Show add animal form/modal
    alert('Add Animal form coming soon!');
  };

  const handleEditAnimal = (animal) => {
    // TODO: Show edit animal form/modal
    alert('Edit Animal form coming soon!');
  };

  const handleRemoveAnimal = async (animal_id) => {
    if (!window.confirm('Are you sure you want to remove this animal?')) return;
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_URL}/${animal_id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Failed to delete animal');
      setAnimals(animals.filter(a => a.animal_id !== animal_id));
    } catch (err) {
      alert('Failed to delete animal');
    }
  };

  if (loading) return <div className="dashboard-loading">Loading...</div>;
  if (error) return <div className="dashboard-error">{error}</div>;

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="logo-container">
          <img src="/logo.png" alt="StraySense Logo" className="auth-brand-logo" style={{ width: 40, height: 40, marginRight: 10 }} />
          <h1>Manage Animals</h1>
        </div>
        <button onClick={() => navigate('/admin/dashboard')} className="logout-btn">Back to Admin</button>
      </header>
      <main className="dashboard-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h2>Animals</h2>
          <button className="action-button primary" onClick={handleAddAnimal}>Add New Animal</button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
          {animals.map(animal => (
            <div key={animal.animal_id} className="stat-card" style={{ minHeight: 220, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <h3>{animal.name || 'Unnamed Animal'}</h3>
                <p><b>Species:</b> {animal.species}</p>
                <p><b>Breed:</b> {animal.breed || '-'}</p>
                <p><b>Age:</b> {animal.age || '-'}</p>
                <p><b>Status:</b> {animal.status}</p>
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button className="action-button secondary" onClick={() => handleEditAnimal(animal)}>Edit</button>
                <button className="action-button" onClick={() => handleRemoveAnimal(animal.animal_id)}>Remove</button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default ManageAnimals; 