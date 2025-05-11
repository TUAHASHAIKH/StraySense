import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/global.css';
import dayjs from 'dayjs';

const tabOptions = [
  { label: 'Vaccines', value: 'vaccines' },
  { label: 'Schedule Vaccine', value: 'schedule' },
  { label: 'Scheduled Vaccinations', value: 'scheduled' },
];

const VACCINE_API = 'http://localhost:5000/api/admin/vaccines';
const ANIMALS_API = 'http://localhost:5000/api/admin/animals';
const VACCINATIONS_API = 'http://localhost:5000/api/admin/vaccinations';

function VaccineModal({ open, onClose, onSubmit, initialData }) {
  const [form, setForm] = useState(initialData || { name: '', description: '' });
  const [descCount, setDescCount] = useState(0);
  useEffect(() => {
    setForm(initialData || { name: '', description: '' });
    setDescCount((initialData && initialData.description ? initialData.description.length : 0));
  }, [open, initialData]);
  if (!open) return null;
  return (
    <div className="modal-overlay">
      <div className="modal-box" style={{ maxWidth: 420 }}>
        <h2 style={{ marginBottom: 20 }}>{initialData ? 'Edit Vaccine' : 'Add Vaccine'}</h2>
        <form onSubmit={e => { e.preventDefault(); onSubmit(form); }} className="animal-form">
          <div className="animal-form-fields" style={{ gap: 18 }}>
            <label style={{ fontWeight: 500, marginBottom: 4, color: '#222' }}>Vaccine Name</label>
            <input
              name="name"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="Vaccine Name"
              required
              style={{ marginBottom: 12 }}
            />
            <label style={{ fontWeight: 500, marginBottom: 4, color: '#222' }}>Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={e => {
                setForm(f => ({ ...f, description: e.target.value }));
                setDescCount(e.target.value.length);
              }}
              placeholder="Description"
              rows={4}
              maxLength={300}
              style={{
                resize: 'vertical',
                marginBottom: 6,
                borderRadius: 10,
                border: '1.5px solid #e0e0e0',
                padding: '12px',
                fontSize: '1rem',
                outline: 'none',
                transition: 'border 0.2s',
                boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
              }}
              onFocus={e => e.target.style.border = '1.5px solid #ff914d'}
              onBlur={e => e.target.style.border = '1.5px solid #e0e0e0'}
            />
            <div style={{ fontSize: '0.92em', color: descCount === 300 ? '#ff914d' : '#888', alignSelf: 'flex-end', marginBottom: 8, fontWeight: 500 }}>{descCount}/300</div>
          </div>
          <div style={{ display: 'flex', gap: 16, marginTop: 24, justifyContent: 'flex-end' }}>
            <button type="button" className="action-button" onClick={onClose}>Cancel</button>
            <button type="submit" className="action-button primary">{initialData ? 'Save Changes' : 'Add Vaccine'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ScheduleVaccineModal({ open, onClose, onSubmit, animal, vaccines }) {
  const [form, setForm] = useState({ vaccine_id: '', scheduled_date: '' });
  const [error, setError] = useState('');
  useEffect(() => {
    setForm({ vaccine_id: '', scheduled_date: '' });
    setError('');
  }, [open, animal]);
  if (!open || !animal) return null;
  return (
    <div className="modal-overlay">
      <div className="modal-box" style={{ maxWidth: 420 }}>
        <h2 style={{ marginBottom: 20 }}>Schedule Vaccine for <span style={{ color: '#ff914d' }}>{animal.name}</span></h2>
        <form onSubmit={e => { e.preventDefault(); if (!form.vaccine_id || !form.scheduled_date) { setError('All fields required'); return; } onSubmit(form); }} className="animal-form">
          <div className="animal-form-fields" style={{ gap: 18 }}>
            <label style={{ fontWeight: 500, marginBottom: 4, color: '#222' }}>Vaccine</label>
            <select
              name="vaccine_id"
              value={form.vaccine_id}
              onChange={e => setForm(f => ({ ...f, vaccine_id: e.target.value }))}
              required
              style={{ marginBottom: 12, borderRadius: 8, padding: '8px', fontSize: '1rem', border: '1.5px solid #e0e0e0' }}
            >
              <option value="">Select Vaccine</option>
              {vaccines.map(v => (
                <option key={v.vaccine_id} value={v.vaccine_id}>{v.name}</option>
              ))}
            </select>
            <label style={{ fontWeight: 500, marginBottom: 4, color: '#222' }}>Scheduled Date</label>
            <input
              type="date"
              name="scheduled_date"
              value={form.scheduled_date}
              onChange={e => setForm(f => ({ ...f, scheduled_date: e.target.value }))}
              required
              style={{ borderRadius: 8, padding: '8px', fontSize: '1rem', border: '1.5px solid #e0e0e0' }}
              min={dayjs().format('YYYY-MM-DD')}
            />
          </div>
          {error && <div className="auth-error" style={{ marginTop: 8 }}>{error}</div>}
          <div style={{ display: 'flex', gap: 16, marginTop: 24, justifyContent: 'flex-end' }}>
            <button type="button" className="action-button" onClick={onClose}>Cancel</button>
            <button type="submit" className="action-button primary">Schedule</button>
          </div>
        </form>
      </div>
    </div>
  );
}

const ManageVaccinations = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('vaccines');
  const [search, setSearch] = useState('');
  // Vaccines state
  const [vaccines, setVaccines] = useState([]);
  const [loadingVaccines, setLoadingVaccines] = useState(false);
  const [vaccineModalOpen, setVaccineModalOpen] = useState(false);
  const [editVaccine, setEditVaccine] = useState(null);
  const [error, setError] = useState(null);
  // Schedule Vaccine tab state
  const [animals, setAnimals] = useState([]);
  const [loadingAnimals, setLoadingAnimals] = useState(false);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [selectedAnimal, setSelectedAnimal] = useState(null);
  const [vaccinesList, setVaccinesList] = useState([]);
  // Scheduled Vaccinations tab state
  const [scheduled, setScheduled] = useState([]);
  const [loadingScheduled, setLoadingScheduled] = useState(false);

  useEffect(() => {
    if (activeTab === 'vaccines') fetchVaccines();
    if (activeTab === 'schedule') fetchAnimals();
    if (activeTab === 'scheduled') fetchScheduled();
    // eslint-disable-next-line
  }, [activeTab]);

  const fetchVaccines = async () => {
    setLoadingVaccines(true);
    setError(null);
    try {
      const token = localStorage.getItem('adminToken');
      const res = await axios.get(VACCINE_API, { headers: { 'Authorization': `Bearer ${token}` } });
      setVaccines(res.data);
    } catch (err) {
      setError('Failed to load vaccines');
    } finally {
      setLoadingVaccines(false);
    }
  };

  const fetchAnimals = async () => {
    setLoadingAnimals(true);
    try {
      const token = localStorage.getItem('adminToken');
      const res = await axios.get(ANIMALS_API, { headers: { 'Authorization': `Bearer ${token}` } });
      setAnimals(res.data);
    } catch {
      setAnimals([]);
    } finally {
      setLoadingAnimals(false);
    }
  };

  const fetchScheduled = async () => {
    setLoadingScheduled(true);
    try {
      const token = localStorage.getItem('adminToken');
      const res = await axios.get(VACCINATIONS_API, { headers: { 'Authorization': `Bearer ${token}` } });
      setScheduled(res.data);
    } catch {
      setScheduled([]);
    } finally {
      setLoadingScheduled(false);
    }
  };

  const handleAddVaccine = () => {
    setEditVaccine(null);
    setVaccineModalOpen(true);
  };
  const handleEditVaccine = (vaccine) => {
    setEditVaccine(vaccine);
    setVaccineModalOpen(true);
  };
  const handleDeleteVaccine = async (id) => {
    if (!window.confirm('Delete this vaccine?')) return;
    try {
      const token = localStorage.getItem('adminToken');
      await axios.delete(`${VACCINE_API}/${id}`, { headers: { 'Authorization': `Bearer ${token}` } });
      fetchVaccines();
    } catch {
      alert('Failed to delete vaccine');
    }
  };
  const handleVaccineModalSubmit = async (form) => {
    try {
      const token = localStorage.getItem('adminToken');
      if (editVaccine) {
        await axios.put(`${VACCINE_API}/${editVaccine.vaccine_id}`, form, { headers: { 'Authorization': `Bearer ${token}` } });
      } else {
        await axios.post(VACCINE_API, form, { headers: { 'Authorization': `Bearer ${token}` } });
      }
      setVaccineModalOpen(false);
      fetchVaccines();
    } catch {
      alert('Failed to save vaccine');
    }
  };

  const openScheduleModal = async (animal) => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await axios.get(VACCINE_API, { headers: { 'Authorization': `Bearer ${token}` } });
      setVaccinesList(res.data);
      setSelectedAnimal(animal);
      setScheduleModalOpen(true);
    } catch {
      setVaccinesList([]);
      setSelectedAnimal(animal);
      setScheduleModalOpen(true);
    }
  };

  const handleScheduleSubmit = async (form) => {
    try {
      const token = localStorage.getItem('adminToken');
      await axios.post(VACCINATIONS_API, {
        animal_id: selectedAnimal.animal_id,
        vaccine_id: form.vaccine_id,
        scheduled_date: form.scheduled_date
      }, { headers: { 'Authorization': `Bearer ${token}` } });
      setScheduleModalOpen(false);
      setSelectedAnimal(null);
      alert('Vaccine scheduled successfully!');
    } catch {
      alert('Failed to schedule vaccine');
    }
  };

  const handleMarkDone = async (vaccination_id) => {
    if (!window.confirm('Mark this vaccination as done?')) return;
    try {
      const token = localStorage.getItem('adminToken');
      await axios.put(`${VACCINATIONS_API}/${vaccination_id}/complete`, {}, { headers: { 'Authorization': `Bearer ${token}` } });
      fetchScheduled();
    } catch {
      alert('Failed to mark as done');
    }
  };

  // Filtered vaccines
  const filteredVaccines = vaccines.filter(v => v.name.toLowerCase().includes(search.toLowerCase()));
  // Filtered animals
  const filteredAnimals = animals.filter(a => a.name?.toLowerCase().includes(search.toLowerCase()));
  // Filtered scheduled vaccinations
  const filteredScheduled = scheduled.filter(v => v.animal_name?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="logo-container">
          <img src="/logo.png" alt="StraySense Logo" className="auth-brand-logo" style={{ width: 40, height: 40, marginRight: 10 }} />
          <h1>Manage Vaccinations</h1>
        </div>
        <button onClick={() => navigate('/admin/dashboard')} className="logout-btn">Back to Admin</button>
      </header>
      <main className="dashboard-content">
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
          {tabOptions.map(opt => (
            <button
              key={opt.value}
              className={`action-button${activeTab === opt.value ? ' primary' : ''}`}
              onClick={() => { setActiveTab(opt.value); setSearch(''); }}
            >
              {opt.label}
            </button>
          ))}
        </div>
        {/* Search bar for each tab */}
        <div style={{ marginBottom: '1.5rem' }}>
          <input
            type="text"
            placeholder={activeTab === 'vaccines' ? 'Search vaccines by name...' : activeTab === 'schedule' ? 'Search animals by name...' : 'Search scheduled vaccinations by animal name...'}
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd', fontSize: '1rem' }}
          />
        </div>
        {/* Tab content */}
        {activeTab === 'vaccines' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
              <button className="action-button primary" onClick={handleAddVaccine}>Add Vaccine</button>
            </div>
            {loadingVaccines ? (
              <div className="dashboard-loading">Loading...</div>
            ) : error ? (
              <div className="dashboard-error">{error}</div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '2rem' }}>
                {filteredVaccines.map(vaccine => (
                  <div key={vaccine.vaccine_id} className="stat-card" style={{ minHeight: 120, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <h3 style={{ marginBottom: 8 }}>{vaccine.name}</h3>
                      <div style={{ fontSize: '0.98rem', color: '#555' }}>{vaccine.description}</div>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1.2rem', justifyContent: 'flex-end' }}>
                      <button className="action-button secondary" onClick={() => handleEditVaccine(vaccine)}>Edit</button>
                      <button className="action-button" onClick={() => handleDeleteVaccine(vaccine.vaccine_id)}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <VaccineModal
              open={vaccineModalOpen}
              onClose={() => setVaccineModalOpen(false)}
              onSubmit={handleVaccineModalSubmit}
              initialData={editVaccine}
            />
          </div>
        )}
        {activeTab === 'schedule' && (
          <div>
            {loadingAnimals ? (
              <div className="dashboard-loading">Loading...</div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '2rem' }}>
                {filteredAnimals.map(animal => (
                  <div key={animal.animal_id} className="stat-card" style={{ minHeight: 120, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <h3 style={{ marginBottom: 8 }}>{animal.name || 'Unnamed Animal'}</h3>
                      <div style={{ fontSize: '0.98rem', color: '#555' }}>Species: {animal.species}, Age: {animal.age || '-'}<br />Status: {animal.status}</div>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1.2rem', justifyContent: 'flex-end' }}>
                      <button className="action-button primary" onClick={() => openScheduleModal(animal)}>Schedule Vaccine</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <ScheduleVaccineModal
              open={scheduleModalOpen}
              onClose={() => { setScheduleModalOpen(false); setSelectedAnimal(null); }}
              onSubmit={handleScheduleSubmit}
              animal={selectedAnimal}
              vaccines={vaccinesList}
            />
          </div>
        )}
        {activeTab === 'scheduled' && (
          <div>
            {loadingScheduled ? (
              <div className="dashboard-loading">Loading...</div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '2rem' }}>
                {filteredScheduled.map(vac => (
                  <div key={vac.vaccination_id} className="stat-card" style={{ minHeight: 120, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <h3 style={{ marginBottom: 8 }}>{vac.animal_name}</h3>
                      <div style={{ fontSize: '0.98rem', color: '#555' }}>
                        Vaccine: {vac.vaccine_name}<br />
                        Scheduled: {vac.scheduled_date}<br />
                        Completed: {vac.completed_date ? vac.completed_date : <span style={{ color: '#ff914d' }}>Not done</span>}
                      </div>
                    </div>
                    {!vac.completed_date && (
                      <div style={{ display: 'flex', gap: '1rem', marginTop: '1.2rem', justifyContent: 'flex-end' }}>
                        <button className="action-button primary" onClick={() => handleMarkDone(vac.vaccination_id)}>Mark as Done</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default ManageVaccinations; 