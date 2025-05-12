import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MapPicker from './MapPicker';
import axios from 'axios';
import './StrayReport.css';

const StrayReport = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const [formData, setFormData] = useState({
    animal_type: '',
    description: '',
    location: null,
    condition: '',
    image: null
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        image: file
      }));
    }
  };

  const handleLocationSelect = (location) => {
    setFormData(prev => ({
      ...prev,
      location: location
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.location) {
      setError('Please select a location on the map');
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('user_id', user.id);
      formDataToSend.append('animal_type', formData.animal_type);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('latitude', formData.location.lat);
      formDataToSend.append('longitude', formData.location.lng);
      formDataToSend.append('condition', formData.condition);
      if (formData.image) {
        formDataToSend.append('image', formData.image);
      }

      const response = await axios.post('http://localhost:3001/api/stray-reports', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setSuccess('Stray animal report submitted successfully!');
      setTimeout(() => {
        navigate('/landing');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error submitting report');
    }
  };

  return (
    <div className="stray-report-container">
      <h2>Report a Stray Animal</h2>
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
      
      <form onSubmit={handleSubmit} className="stray-report-form">
        <div className="form-group">
          <label htmlFor="animal_type">Animal Type:</label>
          <select
            id="animal_type"
            name="animal_type"
            value={formData.animal_type}
            onChange={handleInputChange}
            required
          >
            <option value="">Select animal type</option>
            <option value="dog">Dog</option>
            <option value="cat">Cat</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="condition">Condition:</label>
          <select
            id="condition"
            name="condition"
            value={formData.condition}
            onChange={handleInputChange}
            required
          >
            <option value="">Select condition</option>
            <option value="healthy">Healthy</option>
            <option value="injured">Injured</option>
            <option value="sick">Sick</option>
            <option value="unknown">Unknown</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="description">Description:</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            required
            placeholder="Describe the animal's appearance, behavior, and any other relevant details"
          />
        </div>

        <div className="form-group">
          <label>Location:</label>
          <MapPicker onLocationSelect={handleLocationSelect} />
          {formData.location && (
            <div className="location-coordinates">
              Latitude: {formData.location.lat.toFixed(6)}, 
              Longitude: {formData.location.lng.toFixed(6)}
            </div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="image">Upload Image:</label>
          <input
            type="file"
            id="image"
            name="image"
            onChange={handleImageChange}
            accept="image/*"
          />
        </div>

        <button type="submit" className="submit-btn">Submit Report</button>
      </form>
    </div>
  );
};

export default StrayReport;
