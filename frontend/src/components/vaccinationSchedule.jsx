// src/components/VaccinationSchedule.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './VaccinationSchedule.css'; // optional for custom styling
import { useAuth } from '../context/AuthContext';

function VaccinationSchedule() {
  const { user, token, isAuthenticated } = useAuth();
  const [animalVaccines, setAnimalVaccines] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isAuthenticated()) return;

    setLoading(true);
    setError(null);

    console.log('Fetching vaccination schedule for user:', user);

    axios
      .get('http://localhost:5000/api/vaccinations/schedule', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      .then((res) => {
        console.log('Raw vaccination schedule data:', res.data);
        const grouped = {};

        // Handle the stored procedure response format
        const vaccinationData = Array.isArray(res.data[0]) ? res.data[0] : res.data;

        vaccinationData.forEach((entry) => {
          if (!entry || !entry.animal_id) {
            console.warn('Invalid entry:', entry);
            return;
          }

          const animalKey = entry.animal_id;
          if (!grouped[animalKey]) {
            grouped[animalKey] = {
              animal_name: entry.animal_name,
              image_path: entry.image_path,
              vaccines: [],
            };
          }
          if (entry.vaccine_name) { // Only add if there's a vaccine
            grouped[animalKey].vaccines.push({
              vaccine_name: entry.vaccine_name,
              scheduled_date: entry.scheduled_date,
              completed_date: entry.completed_date,
            });
          }
        });

        console.log('Processed vaccination schedule:', grouped);
        setAnimalVaccines(grouped);
      })
      .catch((err) => {
        console.error('Error fetching schedule:', err);
        setError('Failed to load vaccination schedule. Please try again.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [isAuthenticated, token, user]);

  if (!isAuthenticated()) {
    return <div>Please log in to view vaccination schedules.</div>;
  }

  if (loading) {
    return <div>Loading vaccination schedules...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  // Check if there are any animals with vaccines
  const hasSchedules = Object.values(animalVaccines).some(animal => animal.vaccines.length > 0);

  if (!hasSchedules) {
    return (
      <div className="vaccination-schedule">
        <h2>Vaccination Schedules</h2>
        <div className="no-schedules">
          <p>No vaccination schedules found.</p>
          <p>When you adopt an animal, their vaccination schedules will appear here.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="vaccination-schedule">
      <h2>Vaccination Schedules</h2>
      <div className="vaccination-container">
        <div className="animals-grid">
          {Object.entries(animalVaccines).map(([animalId, animalData]) => {
            const imagePath = animalData.image_path?.replace(/\\/g, '/');

            return (
              <div className="animal-card" key={animalId}>
                <img
                  src={`http://localhost:5000/${imagePath}`}
                  alt={animalData.animal_name}
                  className="animal-image"
                />
                <div className="animal-info">
                  <h3>{animalData.animal_name}</h3>
                  {animalData.vaccines.length > 0 ? (
                    <ul>
                      {animalData.vaccines.map((vaccine, index) => (
                        <li key={index}>
                          {vaccine.vaccine_name} — {new Date(vaccine.scheduled_date).toLocaleDateString()} &nbsp;
                          <span style={{ 
                            color: vaccine.completed_date ? 'green' : 'var(--primary-color)', 
                            fontWeight: 600 
                          }}>
                            [{vaccine.completed_date ? 'Completed' : 'Pending'}]
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>No vaccines scheduled for this animal.</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default VaccinationSchedule;
