import React, { useState } from 'react';
import axios from 'axios';
import './StrayReport.css';
import MapPicker from "./MapPicker";
import { useAuth } from '../context/AuthContext';

const provinces = {
  Punjab: ['Lahore', 'Rawalpindi', 'Faisalabad', 'Multan'],
  Sindh: ['Karachi', 'Hyderabad', 'Sukkur'],
  KhyberPakhtunkhwa: ['Peshawar', 'Abbottabad', 'Mardan'],
  Balochistan: ['Quetta', 'Gwadar'],
  GilgitBaltistan: ['Gilgit', 'Skardu'],
  AJK: ['Muzaffarabad', 'Mirpur'],
  Islamabad: ['Islamabad'],
};

const animalTypes = ['Dog', 'Cat', 'Cow', 'Donkey', 'Other'];
const animalSizes = ['Small', 'Medium', 'Large'];

function StrayReportForm() {
  const { user, token, isAuthenticated } = useAuth();
  const [latLng, setLatLng] = useState({ lat: null, lng: null });

  const handleMapClick = (location) => {
    setLatLng({ lat: location.lat, lng: location.lng });
    setFormData((prev) => ({
      ...prev,
      latitude: location.lat,
      longitude: location.lng,
    }));
  };

  const [formData, setFormData] = useState({
    description: '',
    animal_type: '',
    animal_size: '',
    visible_injuries: '',
    province: '',
    city: '',
    latitude: null,
    longitude: null,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
  
    setFormData((prev) => {
      let newState = { ...prev, [name]: value };
  
      if (name === 'province') {
        newState.city = '';
      }
  
      return newState;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated()) {
      alert('Please log in to submit a report');
      return;
    }

    try {
      await axios.post('http://localhost:5000/api/stray-reports', formData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      alert('Report submitted successfully!');
      // Reset form
      setFormData({
        description: '',
        animal_type: '',
        animal_size: '',
        visible_injuries: '',
        province: '',
        city: '',
        latitude: null,
        longitude: null,
      });
      setLatLng({ lat: null, lng: null });
    } catch (err) {
      console.error('Error reporting stray animal:', err);
      alert('Failed to submit report. Please try again.');
    }
  };

  if (!isAuthenticated()) {
    return <div>Please log in to submit a stray animal report.</div>;
  }

  return (
    <form className="stray-report-form" onSubmit={handleSubmit}>
      <h2>Report a Stray Animal</h2>

      <label>Animal Type:</label>
      <select name="animal_type" value={formData.animal_type} onChange={handleChange} required>
        <option value="">Select type</option>
        {animalTypes.map((type) => (
          <option key={type} value={type}>{type}</option>
        ))}
      </select>

      <label>Approx Size:</label>
      <select name="animal_size" value={formData.animal_size} onChange={handleChange} required>
        <option value="">Select size</option>
        {animalSizes.map((size) => (
          <option key={size} value={size}>{size}</option>
        ))}
      </select>

      <label>Visible Injuries (if any):</label>
      <input
        type="text"
        name="visible_injuries"
        value={formData.visible_injuries}
        onChange={handleChange}
        placeholder="e.g. bleeding leg"
      />

      <label>Province:</label>
      <select name="province" value={formData.province} onChange={handleChange} required>
        <option value="">Select province</option>
        {Object.keys(provinces).map((prov) => (
          <option key={prov} value={prov}>{prov}</option>
        ))}
      </select>

      <label>City:</label>
      <select name="city" value={formData.city} onChange={handleChange} required>
        <option value="">Select city</option>
        {formData.province &&
          provinces[formData.province].map((city) => (
            <option key={city} value={city}>{city}</option>
          ))}
      </select>

      <label>Additional Description:</label>
      <textarea
        name="description"
        value={formData.description}
        onChange={handleChange}
        required
        placeholder="Details about the stray animal and its condition"
      />
      <label>Click on map to select location:</label>
      <MapPicker onLocationChange={handleMapClick} />
      <p>
        Selected Location: {latLng.lat}, {latLng.lng}
      </p>
      <button type="submit">Submit Report</button>
    </form>
  );
}

export default StrayReportForm;
