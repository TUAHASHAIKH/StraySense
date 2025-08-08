import BaseComponent from './BaseComponent';

/**
 * Base Form Component Class - Extends BaseComponent
 * Provides common form functionality and validation
 */
class BaseFormComponent extends BaseComponent {
  constructor(props) {
    super(props);
    this.state = {
      ...this.state,
      formData: {},
      errors: {},
      loading: false,
      success: ''
    };
    this._formValidators = new Map();
    this._formRef = null;
  }

  // Form validation methods
  validateField(fieldName, value) {
    const validator = this._formValidators.get(fieldName);
    if (validator) {
      return validator(value);
    }
    return { isValid: true, message: '' };
  }

  validateForm() {
    const errors = {};
    let isValid = true;

    Object.keys(this.state.formData).forEach(fieldName => {
      const validation = this.validateField(fieldName, this.state.formData[fieldName]);
      if (!validation.isValid) {
        errors[fieldName] = validation.message;
        isValid = false;
      }
    });

    this.setState({ errors });
    return isValid;
  }

  // Form data handling
  handleInputChange(event) {
    const { name, value } = event.target;
    this.setState(prevState => ({
      formData: {
        ...prevState.formData,
        [name]: value
      },
      errors: {
        ...prevState.errors,
        [name]: ''
      }
    }));
  }

  setFormData(formData) {
    this.setState({ formData });
  }

  resetForm() {
    this.setState({
      formData: {},
      errors: {},
      success: ''
    });
  }

  // Loading state management
  setLoading(loading) {
    this.setState({ loading });
  }

  // Error handling
  setError(error) {
    this.setState({ 
      errors: { general: error },
      success: ''
    });
  }

  setSuccess(message) {
    this.setState({ 
      success: message,
      errors: {}
    });
  }

  // Form submission template method
  async handleSubmit(event) {
    event.preventDefault();
    
    if (!this.validateForm()) {
      return;
    }

    this.setLoading(true);
    this.setError('');

    try {
      await this.processFormSubmission();
    } catch (error) {
      this.handleSubmissionError(error);
    } finally {
      this.setLoading(false);
    }
  }

  // Template method for subclasses to implement
  async processFormSubmission() {
    throw new Error('processFormSubmission must be implemented by subclass');
  }

  handleSubmissionError(error) {
    console.error('Form submission error:', error);
    this.setError(error.message || 'An error occurred during submission');
  }

  // Utility methods
  getFormData() {
    return this.state.formData;
  }

  getErrors() {
    return this.state.errors;
  }

  isFormValid() {
    return Object.keys(this.state.errors).length === 0;
  }

  // Add field validator
  addFieldValidator(fieldName, validator) {
    this._formValidators.set(fieldName, validator);
  }

  // Remove field validator
  removeFieldValidator(fieldName) {
    this._formValidators.delete(fieldName);
  }
}

export default BaseFormComponent; 