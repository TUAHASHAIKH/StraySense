// src/components/VaccinationSchedule.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './VaccinationSchedule.css'; // optional for custom styling

function VaccinationSchedule({ userId }) {
  const [animalVaccines, setAnimalVaccines] = useState({});

  useEffect(() => {
    axios
      .get(`http://localhost:5000/api/vaccinations/user/${userId}/schedule`)
      .then((res) => {
        const grouped = {};

        res.data.forEach((entry) => {
          const animalKey = entry.animal_id;
          if (!grouped[animalKey]) {
            grouped[animalKey] = {
              animal_name: entry.animal_name,
              image_path: entry.image_path,
              vaccines: [],
            };
          }
          grouped[animalKey].vaccines.push({
            vaccine_name: entry.vaccine_name,
            scheduled_date: entry.scheduled_date,
            completed_date: entry.completed_date,
          });
        });

        setAnimalVaccines(grouped);
      })
      .catch((err) => {
        console.error('Error fetching schedule:', err);
      });
  }, [userId]);

  return (
    <div className="vaccination-schedule">
    <h2>Vaccination Schedules</h2>
    <div className="vaccination-container">
      
      {Object.keys(animalVaccines).length === 0 ? (
        <p>No schedule found.</p>
      ) : (
        <div className="animals-grid">
          {Object.entries(animalVaccines).map(([animalId, animalData]) => {
            console.log('Image path for animal:', animalData.animal_name, animalData.image_path);

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
               
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
    </div>
  );
}

export default VaccinationSchedule;
