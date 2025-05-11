import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/global.css';

const API_URL = 'http://localhost:5000/api/admin/reports';
const ANIMALS_API_URL = 'http://localhost:5000/api/admin/animals';
const SHELTERS_API_URL = 'http://localhost:5000/api/admin/shelters';
const UPLOAD_URL = 'http://localhost:5000/api/admin/animal/upload';

// Helper to convert DB image_path to public URL
const getImageUrl = (image_path) => {
  if (!image_path) return '/animal.jpg';
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

const statusOptions = [
  { label: 'Pending Requests', value: 'pending' },
  { label: 'Accepted Requests', value: 'accepted' },
  { label: 'Rejected Requests', value: 'rejected' },
];

function AnimalFormModal({ open, onClose, onSubmit, initialData, shelters, speciesReadOnly }) {
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
            {speciesReadOnly ? (
              <input name="species" value={form.species} readOnly style={{ background: '#f5f5f5', color: '#888' }} />
            ) : (
              <select name="species" value={form.species} onChange={handleChange} required>
                <option value="dog">Dog</option>
                <option value="cat">Cat</option>
                <option value="other">Other</option>
              </select>
            )}
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
            <select name="shelter_id" value={form.shelter_id} onChange={handleChange} required>
              <option value="">Select Shelter</option>
              {shelters.map(shelter => (
                <option key={shelter.shelter_id} value={shelter.shelter_id}>{shelter.name}</option>
              ))}
            </select>
            <input name="status" value={form.status} readOnly style={{ background: '#f5f5f5', color: '#888' }} />
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

const ManageReports = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReport, setSelectedReport] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showAddAnimalForm, setShowAddAnimalForm] = useState(false);
  const [error, setError] = useState(null);
  const [newAnimal, setNewAnimal] = useState({
    name: '',
    species: 'dog',
    breed: '',
    age: '',
    gender: 'unknown',
    health_status: '',
    neutered: false,
    shelter_id: '',
    status: 'available',
    image_path: ''
  });
  const [shelters, setShelters] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState('pending');

  useEffect(() => {
    const adminToken = localStorage.getItem('adminToken');
    if (!adminToken) {
      navigate('/admin');
      return;
    }
    fetchReports();
    fetchShelters();
  }, [navigate]);

  const fetchReports = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get(API_URL, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setReports(response.data);
    } catch (error) {
      setError('Error fetching reports');
      console.error(error);
    }
  };

  const fetchShelters = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get(SHELTERS_API_URL, {
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

  const filteredReports = reports.filter(report =>
    (report.status === selectedStatus) &&
    (report.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    `${report.first_name} ${report.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleViewDetails = (report) => {
    setSelectedReport(report);
    setShowDetails(true);
  };

  const handleCloseDetails = () => {
    setShowDetails(false);
    setSelectedReport(null);
  };

  const handleStatusChange = async (reportId, newStatus) => {
    try {
      const token = localStorage.getItem('adminToken');
      await axios.put(`${API_URL}/${reportId}/status`, 
        { status: newStatus },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      if (newStatus === 'accepted') {
        setShowAddAnimalForm(true);
      }
      
      fetchReports();
    } catch (error) {
      alert('Error updating report status');
      console.error(error);
    }
  };

  const handleViewLocation = (latitude, longitude) => {
    window.open(`https://www.google.com/maps?q=${latitude},${longitude}`, '_blank');
  };

  const handleAddAnimal = async (animal) => {
    try {
      const token = localStorage.getItem('adminToken');
      // If animal.image_path is a File, use FormData
      let dataToSend = animal;
      let headers = { 'Authorization': `Bearer ${token}` };
      if (animal.image_path instanceof File) {
        const formData = new FormData();
        Object.keys(animal).forEach(key => {
          if (key === 'image_path') {
            formData.append('image', animal.image_path);
          } else {
            formData.append(key, animal[key]);
          }
        });
        formData.append('report_id', selectedReport.report_id);
        dataToSend = formData;
        headers['Content-Type'] = 'multipart/form-data';
      } else {
        dataToSend = { ...animal, report_id: selectedReport.report_id };
        headers['Content-Type'] = 'application/json';
      }
      await axios.post('http://localhost:5000/api/admin/animals', dataToSend, { headers });
      alert('Animal added successfully');
      setShowAddAnimalForm(false);
      setShowDetails(false);
      fetchReports();
    } catch (error) {
      alert('Error adding animal');
      console.error(error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewAnimal(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  if (error) return <div className="dashboard-error">{error}</div>;

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="logo-container">
          <img src="/logo.png" alt="StraySense Logo" className="auth-brand-logo" style={{ width: 40, height: 40, marginRight: 10 }} />
          <h1>Manage Reports</h1>
        </div>
        <button onClick={() => navigate('/admin/dashboard')} className="logout-btn">Back to Admin</button>
      </header>

      <main className="dashboard-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h2>Stray Animal Reports</h2>
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <input
            type="text"
            placeholder="Search reports by description or reporter name..."
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

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '2rem' }}>
          {filteredReports.map(report => (
            <div key={report.report_id} className="stat-card" style={{ minHeight: 200, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}>
              <div style={{ flex: 1 }}>
                <h3 style={{ marginBottom: 8 }}>Report #{report.report_id}</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem 1.5rem', fontSize: '0.98rem' }}>
                  <span><b>Reported by:</b> {report.first_name} {report.last_name}</span>
                  <span><b>Date:</b> {new Date(report.report_date).toLocaleDateString()}</span>
                  <span><b>Status:</b> {report.status}</span>
                  <p style={{ marginTop: '0.5rem', width: '100%' }}><b>Description:</b> {report.description}</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.2rem', justifyContent: 'flex-end' }}>
                <button className="action-button secondary" onClick={() => handleViewDetails(report)}>View Details</button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {showDetails && selectedReport && (
        <div className="modal-overlay">
          <div className="modal-box" style={{ maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ marginBottom: 12 }}>Report Details</h2>
            <div style={{ display: 'grid', gap: '1rem' }}>
              <div>
                <h3>Reporter Information</h3>
                <p><b>Name:</b> {selectedReport.first_name} {selectedReport.last_name}</p>
                <p><b>Report Date:</b> {new Date(selectedReport.report_date).toLocaleString()}</p>
              </div>

              <div>
                <h3>Animal Information</h3>
                <p><b>Type:</b> {selectedReport.animal_type}</p>
                <p><b>Size:</b> {selectedReport.animal_size}</p>
                <p><b>Visible Injuries:</b> {selectedReport.visible_injuries || 'None reported'}</p>
              </div>

              <div>
                <h3>Location</h3>
                <p><b>Province:</b> {selectedReport.province}</p>
                <p><b>City:</b> {selectedReport.city}</p>
                {selectedReport.latitude && selectedReport.longitude && (
                  <button 
                    className="action-button secondary"
                    onClick={() => handleViewLocation(selectedReport.latitude, selectedReport.longitude)}
                  >
                    View on Google Maps
                  </button>
                )}
              </div>

              <div>
                <h3>Description</h3>
                <p>{selectedReport.description}</p>
              </div>

              <div>
                <h3>Status</h3>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button 
                    className={`action-button ${selectedReport.status === 'pending' ? 'primary' : 'secondary'}`}
                    onClick={() => handleStatusChange(selectedReport.report_id, 'pending')}
                    disabled={selectedReport.status === 'pending'}
                  >
                    Pending
                  </button>
                  <button 
                    className={`action-button ${selectedReport.status === 'accepted' ? 'primary' : 'secondary'}`}
                    onClick={() => handleStatusChange(selectedReport.report_id, 'accepted')}
                    disabled={selectedReport.status === 'accepted'}
                  >
                    Accept
                  </button>
                  <button 
                    className={`action-button ${selectedReport.status === 'rejected' ? 'primary' : 'secondary'}`}
                    onClick={() => handleStatusChange(selectedReport.report_id, 'rejected')}
                    disabled={selectedReport.status === 'rejected'}
                  >
                    Reject
                  </button>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12, marginTop: 18, justifyContent: 'flex-end' }}>
              <button className="action-button" onClick={handleCloseDetails}>Close</button>
            </div>
          </div>
        </div>
      )}

      {showAddAnimalForm && selectedReport && (
        <AnimalFormModal
          open={showAddAnimalForm}
          onClose={() => setShowAddAnimalForm(false)}
          onSubmit={handleAddAnimal}
          initialData={{ ...defaultAnimal, species: selectedReport.animal_type?.toLowerCase() || 'dog' }}
          shelters={shelters}
          speciesReadOnly={true}
        />
      )}
    </div>
  );
};

export default ManageReports; 