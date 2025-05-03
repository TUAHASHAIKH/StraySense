import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AdoptionPage.css';

const AdoptionPage = () => {
  const [animals, setAnimals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [adoptionStatus, setAdoptionStatus] = useState({});

  useEffect(() => {
    console.log('AdoptionPage mounted');
    fetchAnimals();
  }, []);

  const fetchAnimals = async () => {
    try {
      setLoading(true);
      console.log('Fetching animals from API...');
      
      const apiUrl = 'http://localhost:3001/api/animals';
      console.log('Making request to:', apiUrl);
      
      const response = await axios.get(apiUrl);
      console.log('API Response:', response.data);
      
      if (!Array.isArray(response.data)) {
        console.error('Expected array but got:', typeof response.data);
        throw new Error('Invalid response format');
      }
      
      // Transform the data to match the expected format
      const transformedData = response.data.map(animal => ({
        animal_id: animal.animal_id,
        name: animal.name,
        species: animal.species,
        breed: animal.breed,
        age: animal.age,
        gender: animal.gender,
        health_status: animal.health_status,
        status: animal.status,
        image_url: animal.image_url || 'https://via.placeholder.com/300x200?text=Pet+Image'
      }));
      
      console.log('Transformed data:', transformedData);
      setAnimals(transformedData);
      setError(null);
    } catch (err) {
      console.error('Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      setError(`Failed to fetch animals: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Test database connection
  const testConnection = async () => {
    try {
      console.log('Testing database connection...');
      const apiUrl = 'http://localhost:3001/api/test';
      console.log('Making request to:', apiUrl);
      
      const response = await axios.get(apiUrl);
      console.log('Test Response:', response.data);
      console.log('Raw animals data:', response.data.animals);
      
      if (response.data.animals) {
        console.log('Number of animals in test response:', response.data.animals.length);
      }
      
      alert(`Database connection successful! Found ${response.data.count} animals.`);
    } catch (err) {
      console.error('Test connection error:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        config: {
          url: err.config?.url,
          method: err.config?.method,
          headers: err.config?.headers
        }
      });
      alert(`Database connection failed: ${err.message}`);
    }
  };

  const handleAdopt = async (animalId) => {
    try {
      // For demo purposes, using a hardcoded user_id. In a real app, this would come from authentication
      const userId = 1;
      
      console.log('Submitting adoption request for animal:', animalId);
      const response = await axios.post('http://localhost:3001/api/adopt', {
        user_id: userId,
        animal_id: animalId
      });
      console.log('Adoption response:', response.data);

      setAdoptionStatus(prev => ({
        ...prev,
        [animalId]: 'pending'
      }));

      // Refresh the animals list to update status
      fetchAnimals();
      
      alert('Adoption request submitted successfully! We will contact you soon.');
    } catch (err) {
      console.error('Adoption error:', err);
      alert('Failed to submit adoption request. Please try again later.');
    }
  };

  const filteredAnimals = animals.filter(animal => {
    if (filter === 'all') return true;
    return animal.species.toLowerCase() === filter.toLowerCase();
  });

  console.log('Current animals state:', animals);
  console.log('Filtered animals:', filteredAnimals);

  if (loading) {
    return <div className="loading">Loading available animals...</div>;
  }

  if (error) {
    return (
      <div className="error">
        <p>{error}</p>
        <button onClick={testConnection} className="test-btn">
          Test Database Connection
        </button>
      </div>
    );
  }

  return (
    <div className="adoption-page">
      <div className="adoption-header">
        <h1>Adopt a Pet</h1>
        <p>Give a loving home to a pet in need</p>
      </div>

      <div className="filter-section">
        <button 
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All
        </button>
        <button 
          className={`filter-btn ${filter === 'dog' ? 'active' : ''}`}
          onClick={() => setFilter('dog')}
        >
          Dogs
        </button>
        <button 
          className={`filter-btn ${filter === 'cat' ? 'active' : ''}`}
          onClick={() => setFilter('cat')}
        >
          Cats
        </button>
      </div>

      <div className="animals-grid">
        {filteredAnimals.map(animal => (
          <div key={animal.animal_id} className="animal-card">
            <div className="animal-image">
              <img 
                src={animal.image_url || 'https://via.placeholder.com/300x200?text=Pet+Image'} 
                alt={animal.name}
              />
            </div>
            <div className="animal-info">
              <h3>{animal.name}</h3>
              <p className="breed">{animal.breed}</p>
              <p className="age">{animal.age} years old</p>
              <p className="gender">{animal.gender}</p>
              <p className="health">{animal.health_status}</p>
              {adoptionStatus[animal.animal_id] === 'pending' ? (
                <button className="adopt-btn pending" disabled>
                  Adoption Pending
                </button>
              ) : (
                <button 
                  className="adopt-btn"
                  onClick={() => handleAdopt(animal.animal_id)}
                >
                  Adopt Me
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredAnimals.length === 0 && (
        <div className="no-animals">
          <p>No animals available for adoption in this category.</p>
          <button onClick={testConnection} className="test-btn">
            Test Database Connection
          </button>
        </div>
      )}
    </div>
  );
};

export default AdoptionPage; 