import React from 'react';
import { useNavigate } from 'react-router-dom';
import BaseComponent from '../core/BaseComponent';
import './VaccinationSchedules.css';
import authService from '../services/authService';
import animalService from '../services/animalService';
import DataUtils from '../utils/DataUtils';
import UserNavbar from './UserNavbar';

/**
 * Vaccination Schedules Component - Extends BaseComponent
 * Displays vaccination schedules for adopted animals
 */
class VaccinationSchedules extends BaseComponent {
  constructor(props) {
    super(props);
    
    this.state = {
      ...this.state,
      schedules: [],
      loading: true,
      error: '',
      adoptedAnimals: []
    };

    // Bind methods
    this.fetchAdoptedAnimals = this.fetchAdoptedAnimals.bind(this);
    this.fetchVaccinationSchedules = this.fetchVaccinationSchedules.bind(this);
  }

  /**
   * Handle component mount
   */
  async onComponentMount() {
    await this.fetchAdoptedAnimals();
  }

  /**
   * Fetch adopted animals for the current user
   */
  async fetchAdoptedAnimals() {
    try {
      const response = await authService.getUserAdoptions();
      
      // Filter only approved adoptions
      const approvedAdoptions = response.filter(adoption => 
        adoption.status === 'approved' || adoption.status === 'completed'
      );
      
      this.setStateSafely({ adoptedAnimals: approvedAdoptions });
      
      if (approvedAdoptions.length === 0) {
        this.setStateSafely({
          error: 'You have no adopted animals.',
          loading: false
        });
        return;
      }

      // Fetch vaccination schedules for all adopted animals
      await this.fetchVaccinationSchedules(approvedAdoptions);
    } catch (err) {
      this.setStateSafely({
        error: 'Failed to fetch vaccination schedules. Please try again later.',
        schedules: [],
        loading: false
      });
    }
  }

  /**
   * Fetch vaccination schedules for adopted animals
   */
  async fetchVaccinationSchedules(adoptedAnimals) {
    try {
      const animalIds = adoptedAnimals.map(adoption => adoption.animal_id);
      const schedulesResponse = await animalService.getVaccinationSchedules(animalIds);
      
      this.setStateSafely({
        schedules: schedulesResponse,
        error: '',
        loading: false
      });
    } catch (err) {
      this.setStateSafely({
        error: 'Failed to fetch vaccination schedules. Please try again later.',
        schedules: [],
        loading: false
      });
    }
  }

  /**
   * Format date for display
   */
  formatDate(dateString) {
    return DataUtils.formatDate(dateString);
  }

  /**
   * Group schedules by animal
   */
  getSchedulesByAnimal() {
    const { schedules } = this.state;
    return DataUtils.groupBy(schedules, 'animal_id');
  }

  /**
   * Get animal name by ID
   */
  getAnimalName(animalId) {
    const { adoptedAnimals } = this.state;
    const animal = adoptedAnimals.find(a => a.animal_id === parseInt(animalId));
    return animal?.animal_name || 'Unnamed Animal';
  }

  /**
   * Render loading state
   */
  renderLoading() {
    return (
      <>
        <UserNavbar />
        <div className="vaccination-schedules-container">
          <h2>Vaccination Schedules</h2>
          <div className="loading">Loading vaccination schedules...</div>
        </div>
      </>
    );
  }

  /**
   * Render error state
   */
  renderError() {
    return (
      <>
        <UserNavbar />
        <div className="vaccination-schedules-container">
          <h2>Vaccination Schedules</h2>
          <div className="error-message">{this.state.error}</div>
        </div>
      </>
    );
  }

  /**
   * Render no schedules message
   */
  renderNoSchedules() {
    return (
      <div className="no-schedules">
        <p>No vaccinations scheduled for your adopted animals.</p>
      </div>
    );
  }

  /**
   * Render schedule card
   */
  renderScheduleCard(schedule) {
    return (
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
            <span>{this.formatDate(schedule.scheduled_date)}</span>
          </div>
          {schedule.completed_date && (
            <div className="detail-item">
              <label>Completed Date:</label>
              <span>{this.formatDate(schedule.completed_date)}</span>
            </div>
          )}
          <div className="detail-item">
            <label>Notes:</label>
            <span>{schedule.notes || 'No additional notes'}</span>
          </div>
        </div>
      </div>
    );
  }

  /**
   * Render animal schedules section
   */
  renderAnimalSchedules(animalId, animalSchedules) {
    return (
      <div key={animalId} className="animal-schedules">
        <h3 className="animal-name">{this.getAnimalName(animalId)}</h3>
        <div className="schedules-list">
          {animalSchedules.map(schedule => this.renderScheduleCard(schedule))}
        </div>
      </div>
    );
  }

  /**
   * Render schedules content
   */
  renderSchedulesContent() {
    const schedulesByAnimal = this.getSchedulesByAnimal();
    
    if (Object.entries(schedulesByAnimal).length === 0) {
      return this.renderNoSchedules();
    }

    return Object.entries(schedulesByAnimal).map(([animalId, animalSchedules]) => 
      this.renderAnimalSchedules(animalId, animalSchedules)
    );
  }

  /**
   * Render the component
   */
  render() {
    const { loading, error } = this.state;

    if (loading) {
      return this.renderLoading();
    }

    if (error) {
      return this.renderError();
    }

    return (
      <>
        <UserNavbar />
        <div style={{height: '3.5rem'}}></div>
        <div className="vaccination-schedules-container" style={{ marginTop: '3rem' }}>
          <h2>Vaccination Schedules</h2>
          {this.renderSchedulesContent()}
        </div>
      </>
    );
  }
}

/**
 * Functional wrapper to provide navigation props
 */
const VaccinationSchedulesWrapper = (props) => {
  const navigate = useNavigate();
  
  return (
    <VaccinationSchedules 
      {...props} 
      navigate={navigate} 
    />
  );
};

export default VaccinationSchedulesWrapper; 