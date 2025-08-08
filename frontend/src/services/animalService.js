import BaseService from '../core/BaseService';

/**
 * Animal Service Class - Extends BaseService
 * Handles animal-related operations and data management
 */
class AnimalService extends BaseService {
  constructor() {
    super();
    this.endpoints = {
      animals: '/animals',
      adopt: '/adopt',
      strayReports: '/stray-reports',
      vaccinations: '/vaccinations/animals'
    };
  }

  /**
   * Get all available animals
   * @returns {Promise<Array>} List of animals
   */
  async getAnimals() {
    try {
      const response = await this.get(this.endpoints.animals);
      return response;
    } catch (error) {
      throw this.processError(error);
    }
  }

  /**
   * Submit adoption request
   * @param {number} userId - User ID
   * @param {number} animalId - Animal ID
   * @returns {Promise<Object>} Adoption response
   */
  async submitAdoptionRequest(userId, animalId) {
    try {
      const data = {
        userId: parseInt(userId),
        animalId: parseInt(animalId)
      };
      
      const response = await this.post(this.endpoints.adopt, data);
      return response;
    } catch (error) {
      throw this.processError(error);
    }
  }

  /**
   * Submit stray animal report
   * @param {Object} reportData - Report data
   * @returns {Promise<Object>} Report submission response
   */
  async submitStrayReport(reportData) {
    try {
      const response = await this.post(this.endpoints.strayReports, reportData);
      return response;
    } catch (error) {
      throw this.processError(error);
    }
  }

  /**
   * Get vaccination schedules for animals
   * @param {Array<number>} animalIds - Array of animal IDs
   * @returns {Promise<Array>} Vaccination schedules
   */
  async getVaccinationSchedules(animalIds) {
    try {
      const params = { animal_ids: animalIds.join(',') };
      const response = await this.get(this.endpoints.vaccinations, { params });
      return response;
    } catch (error) {
      throw this.processError(error);
    }
  }

  /**
   * Get animal by ID
   * @param {number} animalId - Animal ID
   * @returns {Promise<Object>} Animal data
   */
  async getAnimalById(animalId) {
    try {
      const response = await this.get(`${this.endpoints.animals}/${animalId}`);
      return response;
    } catch (error) {
      throw this.processError(error);
    }
  }

  /**
   * Update animal information
   * @param {number} animalId - Animal ID
   * @param {Object} updateData - Updated animal data
   * @returns {Promise<Object>} Update response
   */
  async updateAnimal(animalId, updateData) {
    try {
      const response = await this.put(`${this.endpoints.animals}/${animalId}`, updateData);
      return response;
    } catch (error) {
      throw this.processError(error);
    }
  }

  /**
   * Delete animal
   * @param {number} animalId - Animal ID
   * @returns {Promise<Object>} Delete response
   */
  async deleteAnimal(animalId) {
    try {
      const response = await this.delete(`${this.endpoints.animals}/${animalId}`);
      return response;
    } catch (error) {
      throw this.processError(error);
    }
  }

  /**
   * Filter animals by criteria
   * @param {Object} filters - Filter criteria
   * @returns {Promise<Array>} Filtered animals
   */
  async filterAnimals(filters) {
    try {
      const response = await this.get(this.endpoints.animals, { params: filters });
      return response;
    } catch (error) {
      throw this.processError(error);
    }
  }

  /**
   * Get animals by species
   * @param {string} species - Animal species
   * @returns {Promise<Array>} Animals of specified species
   */
  async getAnimalsBySpecies(species) {
    return this.filterAnimals({ species });
  }

  /**
   * Get available animals
   * @returns {Promise<Array>} Available animals
   */
  async getAvailableAnimals() {
    return this.filterAnimals({ status: 'available' });
  }

  /**
   * Get adopted animals
   * @returns {Promise<Array>} Adopted animals
   */
  async getAdoptedAnimals() {
    return this.filterAnimals({ status: 'adopted' });
  }
}

// Create singleton instance
const animalService = new AnimalService();

export default animalService; 