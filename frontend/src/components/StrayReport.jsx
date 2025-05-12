import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MapPicker from './MapPicker';
import axios from 'axios';
import './StrayReport.css';

const StrayReport = () => {
  const navigate = useNavigate();
  // Get user info from localStorage - handle both possible formats
  const userInfo = JSON.parse(localStorage.getItem('user')) || JSON.parse(localStorage.getItem('userInfo'));
  const [formData, setFormData] = useState({
    animal_type: '',
    animal_size: '',
    description: '',
    visible_injuries: '',
    province: '',
    city: '',
    location: null,
    latitude: '',
    longitude: ''
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

  const handleLocationSelect = (location) => {
    setFormData(prev => ({
      ...prev,
      location: location,
      latitude: location.lat,
      longitude: location.lng
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const userId = userInfo?.id || userInfo?.user_id || userInfo?.userId;
    console.log('User info from localStorage:', userInfo);
    console.log('Extracted userId:', userId);
    
    if (!userId) {
      setError('Please log in to submit a report');
      return;
    }

    if (!formData.location) {
      setError('Please select a location on the map');
      return;
    }

    try {
      const data = {
        user_id: parseInt(userId),
        animal_type: formData.animal_type,
        animal_size: formData.animal_size,
        description: formData.description,
        visible_injuries: formData.visible_injuries || '',
        province: formData.province,
        city: formData.city,
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude)
      };

      console.log('Sending data to server:', data);

      const response = await axios.post('http://localhost:3001/api/stray-reports', data);
      console.log('Server response:', response.data);
      setSuccess('Report submitted successfully!');
      setTimeout(() => navigate('/landing'), 2000);
    } catch (err) {
      console.error('Full error:', err);
      console.error('Error response:', err.response?.data);
      console.error('Error status:', err.response?.status);
      setError(err.response?.data?.error || err.response?.data?.details || 'Error submitting report');
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
            <option value="Dog">Dog</option>
            <option value="Cat">Cat</option>
            <option value="Cow">Cow</option>
            <option value="Donkey">Donkey</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="animal_size">Animal Size:</label>
          <select
            id="animal_size"
            name="animal_size"
            value={formData.animal_size}
            onChange={handleInputChange}
            required
          >
            <option value="">Select size</option>
            <option value="Small">Small</option>
            <option value="Medium">Medium</option>
            <option value="Large">Large</option>
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
          <label htmlFor="visible_injuries">Visible Injuries:</label>
          <textarea
            id="visible_injuries"
            name="visible_injuries"
            value={formData.visible_injuries}
            onChange={handleInputChange}
            placeholder="Describe any visible injuries or health concerns"
          />
        </div>

        <div className="form-group">
          <label htmlFor="province">Province:</label>
          <input
            type="text"
            id="province"
            name="province"
            value={formData.province}
            onChange={handleInputChange}
            required
            placeholder="Enter province"
          />
        </div>

        <div className="form-group">
          <label htmlFor="city">City:</label>
          <input
            type="text"
            id="city"
            name="city"
            value={formData.city}
            onChange={handleInputChange}
            required
            placeholder="Enter city"
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

        <button type="submit" className="submit-btn">Submit Report</button>
      </form>
    </div>
  );
};

export default StrayReport;
