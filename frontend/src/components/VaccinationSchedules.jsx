import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './VaccinationSchedules.css';
import authService from '../services/authService';

const VaccinationSchedules = () => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [adoptedAnimals, setAdoptedAnimals] = useState([]);

  useEffect(() => {
    const fetchAdoptedAnimals = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/user/adoptions', {
          headers: { Authorization: `Bearer ${authService.getToken()}` }
        });
        // Filter only approved adoptions
        const approvedAdoptions = response.data.filter(adoption => 
          adoption.status === 'approved' || adoption.status === 'completed'
        );
        setAdoptedAnimals(approvedAdoptions);
        
        if (approvedAdoptions.length === 0) {
          setError('You have no adopted animals.');
          setLoading(false);
          return;
        }

        // Fetch vaccination schedules for all adopted animals
        const animalIds = approvedAdoptions.map(adoption => adoption.animal_id);
        const schedulesResponse = await axios.get('http://localhost:3001/api/vaccinations/animals', {
          params: { animal_ids: animalIds.join(',') }
        });
        
        setSchedules(schedulesResponse.data);
        setError('');
      } catch (err) {
        setError('Failed to fetch vaccination schedules. Please try again later.');
        setSchedules([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAdoptedAnimals();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return 'Not scheduled';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="vaccination-schedules-container">
        <h2>Vaccination Schedules</h2>
        <div className="loading">Loading vaccination schedules...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="vaccination-schedules-container">
        <h2>Vaccination Schedules</h2>
        <div className="error-message">{error}</div>
      </div>
    );
  }

  // Group schedules by animal
  const schedulesByAnimal = schedules.reduce((acc, schedule) => {
    const animalId = schedule.animal_id;
    if (!acc[animalId]) {
      acc[animalId] = [];
    }
    acc[animalId].push(schedule);
    return acc;
  }, {});

  return (
    <div className="vaccination-schedules-container">
      <h2>Vaccination Schedules</h2>
      {Object.entries(schedulesByAnimal).length === 0 ? (
        <div className="no-schedules">
          <p>No vaccinations scheduled for your adopted animals.</p>
        </div>
      ) : (
        Object.entries(schedulesByAnimal).map(([animalId, animalSchedules]) => {
          const animal = adoptedAnimals.find(a => a.animal_id === parseInt(animalId));
          return (
            <div key={animalId} className="animal-schedules">
              <h3 className="animal-name">{animal?.animal_name || 'Unnamed Animal'}</h3>
              <div className="schedules-list">
                {animalSchedules.map((schedule) => (
                  <div key={schedule.vaccination_id} className="schedule-card">
                    <div className="schedule-header">
                      <span className={`status ${schedule.status?.toLowerCase() || 'pending'}`}>
                        {schedule.status || 'Pending'}
                      </span>
                    </div>
                    <div className="schedule-details">
                      <div className="detail-item">
                        <label>Vaccine Type:</label>
                        <span>{schedule.vaccine_type || 'Not specified'}</span>
                      </div>
                      <div className="detail-item">
                        <label>Scheduled Date:</label>
                        <span>{formatDate(schedule.scheduled_date)}</span>
                      </div>
                      {schedule.completed_date && (
                        <div className="detail-item">
                          <label>Completed Date:</label>
                          <span>{formatDate(schedule.completed_date)}</span>
                        </div>
                      )}
                      <div className="detail-item">
                        <label>Notes:</label>
                        <span>{schedule.notes || 'No additional notes'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default VaccinationSchedules; 