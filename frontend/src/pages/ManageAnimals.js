import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/global.css';

const API_URL = 'http://localhost:5000/api/admin/animals';
const UPLOAD_URL = 'http://localhost:5000/api/admin/animal/upload';

// Helper to convert DB image_path to public URL
const getImageUrl = (image_path) => {
  if (!image_path) return '/animal.jpg'; // fallback image
  // Remove 'frontend/public' if present
  return image_path.replace(/^frontend\/public/, '') || '/animal.jpg';
};

const defaultAnimal = {
  name: '',
  species: 'dog',
  breed: '',
  age: '',
  gender: 'male',
  health_status: '',
  neutered: false,
  shelter_id: '',
  status: 'available',
  image_path: ''
};

function AnimalFormModal({ open, onClose, onSubmit, initialData }) {
  const [form, setForm] = useState(initialData || defaultAnimal);
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(initialData?.image_path ? getImageUrl(initialData.image_path) : '/animal.jpg');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setForm(initialData || defaultAnimal);
    setPreview(initialData?.image_path ? getImageUrl(initialData.image_path) : '/animal.jpg');
    setImageFile(null);
    setError('');
  }, [open, initialData]);

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleImageChange = e => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setUploading(true);
    setError('');
    let image_path = form.image_path;
    try {
      if (imageFile) {
        const token = localStorage.getItem('adminToken');
        const data = new FormData();
        data.append('image', imageFile);
        const res = await fetch(UPLOAD_URL, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: data
        });
        if (!res.ok) throw new Error('Image upload failed');
        const img = await res.json();
        image_path = img.image_path;
      }
      await onSubmit({ ...form, image_path });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to submit');
    } finally {
      setUploading(false);
    }
  };

  if (!open) return null;
  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h2 style={{ marginBottom: 12 }}>{initialData ? 'Edit Animal' : 'Add New Animal'}</h2>
        <form onSubmit={handleSubmit} className="animal-form">
          <div className="animal-form-img-preview">
            <img src={preview} alt="Preview" style={{ width: 120, height: 120, objectFit: 'cover', borderRadius: 12, border: '2px solid #eee' }} />
            <input type="file" accept="image/*" onChange={handleImageChange} />
          </div>
          <div className="animal-form-fields">
            <input name="name" value={form.name} onChange={handleChange} placeholder="Name" required />
            <select name="species" value={form.species} onChange={handleChange} required>
              <option value="dog">Dog</option>
              <option value="cat">Cat</option>
              <option value="other">Other</option>
            </select>
            <input name="breed" value={form.breed} onChange={handleChange} placeholder="Breed" />
            <input name="age" value={form.age} onChange={handleChange} placeholder="Age" type="number" min="0" />
            <select name="gender" value={form.gender} onChange={handleChange} required>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="unknown">Unknown</option>
            </select>
            <input name="health_status" value={form.health_status} onChange={handleChange} placeholder="Health Status" />
            <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input type="checkbox" name="neutered" checked={form.neutered} onChange={handleChange} /> Neutered
            </label>
            <input name="shelter_id" value={form.shelter_id} onChange={handleChange} placeholder="Shelter ID" type="number" min="1" />
            <select name="status" value={form.status} onChange={handleChange} required>
              <option value="available">Available</option>
              <option value="pending_adoption">Pending Adoption</option>
              <option value="adopted">Adopted</option>
              <option value="pending_foster">Pending Foster</option>
              <option value="fostered">Fostered</option>
              <option value="medical_hold">Medical Hold</option>
            </select>
          </div>
          {error && <div className="auth-error" style={{ marginTop: 8 }}>{error}</div>}
          <div style={{ display: 'flex', gap: 12, marginTop: 18, justifyContent: 'flex-end' }}>
            <button type="button" className="action-button" onClick={onClose} disabled={uploading}>Cancel</button>
            <button type="submit" className="action-button primary" disabled={uploading}>{uploading ? 'Saving...' : (initialData ? 'Save Changes' : 'Add Animal')}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

const ManageAnimals = () => {
  const navigate = useNavigate();
  const [animals, setAnimals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editAnimal, setEditAnimal] = useState(null);

  useEffect(() => {
    fetchAnimals();
    // eslint-disable-next-line
  }, []);

  const fetchAnimals = async () => {
    setLoading(true);
    setError(null);
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

  const handleAddAnimal = () => {
    setEditAnimal(null);
    setModalOpen(true);
  };

  const handleEditAnimal = (animal) => {
    setEditAnimal(animal);
    setModalOpen(true);
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

  const handleFormSubmit = async (animal) => {
    const token = localStorage.getItem('adminToken');
    if (editAnimal) {
      // Edit
      const response = await fetch(`${API_URL}/${editAnimal.animal_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(animal)
      });
      if (!response.ok) throw new Error('Failed to update animal');
      await fetchAnimals();
    } else {
      // Add
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(animal)
      });
      if (!response.ok) throw new Error('Failed to add animal');
      await fetchAnimals();
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '2rem' }}>
          {animals.map(animal => (
            <div key={animal.animal_id} className="stat-card animal-card" style={{ minHeight: 340, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}>
              <div style={{ width: '100%', height: 160, overflow: 'hidden', borderRadius: '12px', marginBottom: 16, background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img
                  src={getImageUrl(animal.image_path)}
                  alt={animal.name || 'Animal'}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px' }}
                  onError={e => { e.target.src = '/animal.jpg'; }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ marginBottom: 8 }}>{animal.name || 'Unnamed Animal'}</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem 1.5rem', fontSize: '0.98rem' }}>
                  <span><b>Species:</b> {animal.species}</span>
                  <span><b>Breed:</b> {animal.breed || '-'}</span>
                  <span><b>Age:</b> {animal.age || '-'}</span>
                  <span><b>Gender:</b> {animal.gender}</span>
                  <span><b>Status:</b> {animal.status}</span>
                  <span><b>Neutered:</b> {animal.neutered ? 'Yes' : 'No'}</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.2rem', justifyContent: 'flex-end' }}>
                <button className="action-button secondary" onClick={() => handleEditAnimal(animal)}>Edit</button>
                <button className="action-button" onClick={() => handleRemoveAnimal(animal.animal_id)}>Remove</button>
              </div>
            </div>
          ))}
        </div>
        <AnimalFormModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onSubmit={handleFormSubmit}
          initialData={editAnimal}
        />
      </main>
    </div>
  );
};

export default ManageAnimals; 