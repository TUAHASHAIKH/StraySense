import BaseService from '../core/BaseService';

/**
 * Authentication Service Class - Extends BaseService
 * Handles user authentication and authorization
 */
class AuthService extends BaseService {
  constructor() {
    super();
    this.endpoints = {
      login: '/auth/login',
      signup: '/auth/signup',
      profile: '/user/profile',
      adoptions: '/user/adoptions'
    };
  }

  /**
   * Authenticate user with email and password
   * @param {string} email - User's email
   * @param {string} password - User's password
   * @returns {Promise<Object>} Authentication response
   */
  async login(email, password) {
    try {
      const response = await this.post(this.endpoints.login, { email, password });
      
      if (response.token) {
        this.setAuthToken(response.token);
        this.setCurrentUser(response.user);
      }
      
      return response;
    } catch (error) {
      throw this.processError(error);
    }
  }

  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @returns {Promise<Object>} Registration response
   */
  async signup(userData) {
    try {
      const response = await this.post(this.endpoints.signup, userData);
      return response;
    } catch (error) {
      throw this.processError(error);
    }
  }

  /**
   * Get current user's profile
   * @returns {Promise<Object>} User profile data
   */
  async getUserProfile() {
    try {
      const response = await this.get(this.endpoints.profile);
      return response;
    } catch (error) {
      throw this.processError(error);
    }
  }

  /**
   * Get user's adoption history
   * @returns {Promise<Array>} User's adoptions
   */
  async getUserAdoptions() {
    try {
      const response = await this.get(this.endpoints.adoptions);
      return response;
    } catch (error) {
      throw this.processError(error);
    }
  }

  /**
   * Logout current user
   */
  logout() {
    super.logout();
  }

  /**
   * Get current authenticated user
   * @returns {Object|null} Current user data
   */
  getCurrentUser() {
    return super.getCurrentUser();
  }

  /**
   * Get authentication token
   * @returns {string|null} Authentication token
   */
  getToken() {
    return this.getAuthToken();
  }

  /**
   * Check if user is authenticated
   * @returns {boolean} Authentication status
   */
  isAuthenticated() {
    return super.isAuthenticated();
  }
}

// Create singleton instance
const authService = new AuthService();

export default authService; 