import React from 'react';
import { useNavigate } from 'react-router-dom';
import BaseFormComponent from '../core/BaseFormComponent';
import MapPicker from './MapPicker';
import animalService from '../services/animalService';
import './StrayReport.css';
import UserNavbar from './UserNavbar';

/**
 * Stray Report Component - Extends BaseFormComponent
 * Handles stray animal reporting functionality
 */
class StrayReport extends BaseFormComponent {
  constructor(props) {
    super(props);
    
    // Initialize form data
    this.state = {
      ...this.state,
      formData: {
        animal_type: '',
        animal_size: '',
        description: '',
        visible_injuries: '',
        province: '',
        city: '',
        location: null,
        latitude: '',
        longitude: ''
      }
    };

    // Location data
    this.locationData = {
      'Balochistan': ['Gwadar', 'Quetta'],
      'Punjab': ['Islamabad', 'Lahore', 'Rawalpindi'],
      'Sindh': ['Karachi', 'Hyderabad', 'Sukkur'],
      'Khyber Pakhtunkhwa': ['Peshawar', 'Abbottabad', 'Swat'],
      'Gilgit-Baltistan': ['Gilgit', 'Skardu'],
      'Azad Kashmir': ['Muzaffarabad', 'Mirpur']
    };

    // Setup field validators
    this.setupValidators();

    // Bind methods
    this.handleLocationSelect = this.handleLocationSelect.bind(this);
  }

  /**
   * Setup form field validators
   */
  setupValidators() {
    this.addFieldValidator('animal_type', (value) => {
      if (!value) {
        return { isValid: false, message: 'Animal type is required' };
      }
      return { isValid: true, message: '' };
    });

    this.addFieldValidator('animal_size', (value) => {
      if (!value) {
        return { isValid: false, message: 'Animal size is required' };
      }
      return { isValid: true, message: '' };
    });

    this.addFieldValidator('description', (value) => {
      if (!value) {
        return { isValid: false, message: 'Description is required' };
      }
      return { isValid: true, message: '' };
    });

    this.addFieldValidator('province', (value) => {
      if (!value) {
        return { isValid: false, message: 'Province is required' };
      }
      return { isValid: true, message: '' };
    });

    this.addFieldValidator('city', (value) => {
      if (!value) {
        return { isValid: false, message: 'City is required' };
      }
      return { isValid: true, message: '' };
    });
  }

  /**
   * Handle input change with special handling for province
   */
  handleInputChange(event) {
    const { name, value } = event.target;
    this.setState(prevState => ({
      formData: {
        ...prevState.formData,
        [name]: value,
        // Reset city when province changes
        ...(name === 'province' && { city: '' })
      },
      errors: {
        ...prevState.errors,
        [name]: ''
      }
    }));
  }

  /**
   * Handle location selection from map
   */
  handleLocationSelect(location) {
    this.setState(prevState => ({
      formData: {
        ...prevState.formData,
        location: location,
        latitude: location.lat,
        longitude: location.lng
      }
    }));
  }

  /**
   * Get user info from localStorage
   */
  getUserInfo() {
    return JSON.parse(localStorage.getItem('user')) || JSON.parse(localStorage.getItem('userInfo'));
  }

  /**
   * Extract user ID from user info
   */
  getUserId() {
    const userInfo = this.getUserInfo();
    return userInfo?.id || userInfo?.user_id || userInfo?.userId;
  }

  /**
   * Validate location selection
   */
  validateLocation() {
    const { location } = this.state.formData;
    if (!location) {
      this.setError('Please select a location on the map');
      return false;
    }
    return true;
  }

  /**
   * Process form submission
   */
  async processFormSubmission() {
    const userId = this.getUserId();
    console.log('User info from localStorage:', this.getUserInfo());
    console.log('Extracted userId:', userId);
    
    if (!userId) {
      throw new Error('Please log in to submit a report');
    }

    if (!this.validateLocation()) {
      return;
    }

    const { formData } = this.state;
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

    const response = await animalService.submitStrayReport(data);
    console.log('Server response:', response);
    
    this.setSuccess('Report submitted successfully!');
    setTimeout(() => this.props.navigate('/landing'), 2000);
  }

  /**
   * Get available cities for selected province
   */
  getAvailableCities() {
    const { province } = this.state.formData;
    return province ? this.locationData[province] || [] : [];
  }

  /**
   * Render animal type options
   */
  renderAnimalTypeOptions() {
    const animalTypes = ['Dog', 'Cat', 'Cow', 'Donkey', 'Other'];
    return animalTypes.map(type => (
      <option key={type} value={type}>{type}</option>
    ));
  }

  /**
   * Render animal size options
   */
  renderAnimalSizeOptions() {
    const sizes = ['Small', 'Medium', 'Large'];
    return sizes.map(size => (
      <option key={size} value={size}>{size}</option>
    ));
  }

  /**
   * Render province options
   */
  renderProvinceOptions() {
    return Object.keys(this.locationData).map(province => (
      <option key={province} value={province}>{province}</option>
    ));
  }

  /**
   * Render city options
   */
  renderCityOptions() {
    const cities = this.getAvailableCities();
    return cities.map(city => (
      <option key={city} value={city}>{city}</option>
    ));
  }

  /**
   * Render the component
   */
  render() {
    const { formData, errors, loading, success } = this.state;

    return (
      <>
        <UserNavbar />
        <div style={{height: '3.5rem'}}></div>
        <div className="stray-report-container" style={{ marginTop: '3rem' }}>
          <h2>Report a Stray Animal</h2>
          {errors.general && <div className="error-message">{errors.general}</div>}
          {success && <div className="success-message">{success}</div>}
          
          <form onSubmit={this.handleSubmit.bind(this)} className="stray-report-form">
            <div className="form-group">
              <label htmlFor="animal_type">Animal Type:</label>
              <select
                id="animal_type"
                name="animal_type"
                value={formData.animal_type}
                onChange={this.handleInputChange.bind(this)}
                required
              >
                <option value="">Select animal type</option>
                {this.renderAnimalTypeOptions()}
              </select>
              {errors.animal_type && <div className="field-error">{errors.animal_type}</div>}
            </div>

            <div className="form-group">
              <label htmlFor="animal_size">Animal Size:</label>
              <select
                id="animal_size"
                name="animal_size"
                value={formData.animal_size}
                onChange={this.handleInputChange.bind(this)}
                required
              >
                <option value="">Select size</option>
                {this.renderAnimalSizeOptions()}
              </select>
              {errors.animal_size && <div className="field-error">{errors.animal_size}</div>}
            </div>

            <div className="form-group">
              <label htmlFor="description">Description:</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={this.handleInputChange.bind(this)}
                required
                placeholder="Describe the animal's appearance, behavior, and any other relevant details"
              />
              {errors.description && <div className="field-error">{errors.description}</div>}
            </div>

            <div className="form-group">
              <label htmlFor="visible_injuries">Visible Injuries:</label>
              <textarea
                id="visible_injuries"
                name="visible_injuries"
                value={formData.visible_injuries}
                onChange={this.handleInputChange.bind(this)}
                placeholder="Describe any visible injuries or health concerns"
              />
            </div>

            <div className="form-group">
              <label htmlFor="province">Province:</label>
              <select
                id="province"
                name="province"
                value={formData.province}
                onChange={this.handleInputChange.bind(this)}
                required
              >
                <option value="">Select province</option>
                {this.renderProvinceOptions()}
              </select>
              {errors.province && <div className="field-error">{errors.province}</div>}
            </div>

            <div className="form-group">
              <label htmlFor="city">City:</label>
              <select
                id="city"
                name="city"
                value={formData.city}
                onChange={this.handleInputChange.bind(this)}
                required
                disabled={!formData.province}
              >
                <option value="">Select city</option>
                {this.renderCityOptions()}
              </select>
              {errors.city && <div className="field-error">{errors.city}</div>}
            </div>

            <div className="form-group">
              <label>Location:</label>
              <MapPicker onLocationSelect={this.handleLocationSelect} />
              {formData.location && (
                <div className="location-coordinates">
                  Latitude: {formData.location.lat.toFixed(6)}, 
                  Longitude: {formData.location.lng.toFixed(6)}
                </div>
              )}
            </div>

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Report'}
            </button>
          </form>
        </div>
      </>
    );
  }
}

/**
 * Functional wrapper to provide navigation props
 */
const StrayReportWrapper = (props) => {
  const navigate = useNavigate();
  
  return (
    <StrayReport 
      {...props} 
      navigate={navigate} 
    />
  );
};

export default StrayReportWrapper;
