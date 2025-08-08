// AdoptPage.js - Displays animals available for adoption
// TODO: Replace dummy data with SQL database integration
// Database schema should include:
// - id (primary key)
// - name
// - type (enum: 'Dog', 'Cat', 'Other')
// - age
// - image_path
// - description
// - status (available, adopted, pending)
// - created_at
// - updated_at

import React from 'react';
import { useNavigate } from 'react-router-dom';
import BaseComponent from './core/BaseComponent';
import './AdoptPage.css';
import logo from './assets/logo.jpg';
import authService from './services/authService';
import animalService from './services/animalService';
import DataUtils from './utils/DataUtils';
import UserNavbar from './components/UserNavbar';



/**
 * Adopt Page Component - Extends BaseComponent
 * Displays animals available for adoption
 */
class AdoptPage extends BaseComponent {
  constructor(props) {
    super(props);
    
    this.state = {
      ...this.state,
      activeFilter: 'All',
      pets: [],
      loading: true,
      error: null,
      userAdoptions: []
    };

    // Bind methods
    this.handleAdopt = this.handleAdopt.bind(this);
    this.handleLogout = this.handleLogout.bind(this);
    this.setActiveFilter = this.setActiveFilter.bind(this);
  }

  /**
   * Handle component mount
   */
  async onComponentMount() {
    if (authService.isAuthenticated()) {
      await this.fetchData();
    } else {
      this.props.navigate('/login');
    }
  }

  /**
   * Fetch pets and user adoptions data
   */
  async fetchData() {
    try {
      this.setStateSafely({ loading: true });
      
      // Fetch both pets and user adoptions in parallel
      const [petsResponse, adoptionsResponse] = await Promise.all([
        animalService.getAnimals(),
        authService.getUserAdoptions()
      ]);
      
      this.setStateSafely({
        pets: petsResponse,
        userAdoptions: adoptionsResponse,
        error: null
      });
    } catch (err) {
      console.error('Error fetching data:', err);
      this.setStateSafely({
        error: 'Failed to load data. Please try again later.'
      });
    } finally {
      this.setStateSafely({ loading: false });
    }
  }

  /**
   * Handle adoption request
   */
  async handleAdopt(animalId) {
    try {
      const user = authService.getCurrentUser();
      console.log('Current user:', user);
      console.log('Attempting to adopt animal:', animalId);
      
      if (!user || !user.user_id) {
        console.error('No user found or missing user_id');
        alert('Please log in to adopt an animal');
        return;
      }

      console.log('Sending adoption request for animal:', animalId);
      
      const response = await animalService.submitAdoptionRequest(user.user_id, animalId);
      
      console.log('Adoption response:', response);
      
      if (response.message === 'Adoption request submitted successfully') {
        // Refresh the adoptions list
        const adoptions = await authService.getUserAdoptions();
        this.setStateSafely({ userAdoptions: adoptions });
        alert('Adoption request submitted successfully!');
      }
    } catch (err) {
      console.error('Error submitting adoption request:', err);
      alert(err.message || 'Failed to submit adoption request');
    }
  }

  /**
   * Handle logout
   */
  handleLogout() {
    authService.logout();
    this.props.navigate('/login');
  }

  /**
   * Set active filter
   */
  setActiveFilter(filter) {
    this.setStateSafely({ activeFilter: filter });
  }

  /**
   * Get filtered pets
   */
  getFilteredPets() {
    const { pets, activeFilter } = this.state;
    return activeFilter === 'All' 
      ? pets 
      : pets.filter(pet => pet.species.toLowerCase() === activeFilter.toLowerCase());
  }

  /**
   * Check if pet is already adopted by user
   */
  isPetAlreadyAdopted(petId) {
    return this.state.userAdoptions.some(a => a.animal_id === petId);
  }

  /**
   * Get adoption button text
   */
  getAdoptionButtonText(pet) {
    if (pet.status !== 'available') {
      return 'Not Available';
    }
    if (this.isPetAlreadyAdopted(pet.animal_id)) {
      return 'Already Requested';
    }
    return `Adopt ${pet.name}`;
  }

  /**
   * Check if adoption button should be disabled
   */
  isAdoptionButtonDisabled(pet) {
    return pet.status !== 'available' || this.isPetAlreadyAdopted(pet.animal_id);
  }

  /**
   * Render loading state
   */
  renderLoading() {
    return <div className="loading">Loading...</div>;
  }

  /**
   * Render error state
   */
  renderError() {
    return <div className="error">{this.state.error}</div>;
  }

  /**
   * Render filter buttons
   */
  renderFilters() {
    const { activeFilter } = this.state;
    const filters = ['All', 'dog', 'cat', 'other'];

    return (
      <div className="filters" id="filters" style={{ marginTop: '2rem' }}>
        <h3>Find Your Perfect Companion</h3>
        <div className="filter-group">
          {filters.map(filter => (
            <button 
              key={filter}
              className={`filter-button ${activeFilter === filter ? 'active' : ''}`}
              onClick={() => this.setActiveFilter(filter)}
            >
              {filter === 'All' ? 'All' : filter.charAt(0).toUpperCase() + filter.slice(1) + 's'}
            </button>
          ))}
        </div>
      </div>
    );
  }

  /**
   * Render pet card
   */
  renderPetCard(pet) {
    return (
      <div className="pet-card" key={pet.animal_id}>
        <div className="pet-image-container">
          <img src={DataUtils.getImageUrl(pet.image_path)} alt={pet.name} className="pet-image" />
        </div>
        <div className="pet-info">
          <h3 className="pet-name">{pet.name}</h3>
          <div className="pet-details">
            <span>{DataUtils.capitalize(pet.species)}</span> • <span>{pet.age} years old</span>
          </div>
          <p className="pet-description">{pet.description}</p>
          <button 
            className="adopt-button"
            onClick={() => this.handleAdopt(pet.animal_id)}
            disabled={this.isAdoptionButtonDisabled(pet)}
          >
            {this.getAdoptionButtonText(pet)}
          </button>
        </div>
      </div>
    );
  }

  /**
   * Render pets grid
   */
  renderPetsGrid() {
    const filteredPets = this.getFilteredPets();
    
    return (
      <div className="adopt-grid">
        {filteredPets.map(pet => this.renderPetCard(pet))}
      </div>
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
      <div className="adopt-page">
        <UserNavbar />
        <main className="adopt-content">
          {this.renderFilters()}
          {this.renderPetsGrid()}
        </main>
      </div>
    );
  }
}

/**
 * Functional wrapper to provide navigation props
 */
const AdoptPageWrapper = (props) => {
  const navigate = useNavigate();
  
  return (
    <AdoptPage 
      {...props} 
      navigate={navigate} 
    />
  );
};

export default AdoptPageWrapper; 