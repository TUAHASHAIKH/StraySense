/**
 * Data Utilities Class - Implements OOP principles
 * Provides common data manipulation and formatting methods
 */
class DataUtils {
  /**
   * Format date for display
   * @param {string|Date} date - Date to format
   * @param {Object} options - Formatting options
   * @returns {string} Formatted date
   */
  static formatDate(date, options = {}) {
    if (!date) return 'Not scheduled';
    
    const defaultOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      ...options
    };
    
    try {
      return new Date(date).toLocaleDateString('en-US', defaultOptions);
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  }

  /**
   * Format currency
   * @param {number} amount - Amount to format
   * @param {string} currency - Currency code
   * @returns {string} Formatted currency
   */
  static formatCurrency(amount, currency = 'USD') {
    if (amount === null || amount === undefined) return 'N/A';
    
    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency
      }).format(amount);
    } catch (error) {
      console.error('Error formatting currency:', error);
      return `${amount}`;
    }
  }

  /**
   * Capitalize first letter of string
   * @param {string} str - String to capitalize
   * @returns {string} Capitalized string
   */
  static capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }

  /**
   * Convert image path to public URL
   * @param {string} imagePath - Image path from database
   * @param {string} fallback - Fallback image path
   * @returns {string} Public image URL
   */
  static getImageUrl(imagePath, fallback = '/animal.jpg') {
    if (!imagePath) return fallback;
    return imagePath.replace(/^frontend[\\/]+public/, '') || fallback;
  }

  /**
   * Group array by key
   * @param {Array} array - Array to group
   * @param {string} key - Key to group by
   * @returns {Object} Grouped object
   */
  static groupBy(array, key) {
    return array.reduce((acc, item) => {
      const groupKey = item[key];
      if (!acc[groupKey]) {
        acc[groupKey] = [];
      }
      acc[groupKey].push(item);
      return acc;
    }, {});
  }

  /**
   * Filter array by multiple criteria
   * @param {Array} array - Array to filter
   * @param {Object} filters - Filter criteria
   * @returns {Array} Filtered array
   */
  static filterBy(array, filters) {
    return array.filter(item => {
      return Object.entries(filters).every(([key, value]) => {
        if (value === null || value === undefined || value === '') {
          return true;
        }
        
        const itemValue = item[key];
        if (typeof value === 'string') {
          return itemValue && itemValue.toLowerCase().includes(value.toLowerCase());
        }
        
        return itemValue === value;
      });
    });
  }

  /**
   * Sort array by key
   * @param {Array} array - Array to sort
   * @param {string} key - Key to sort by
   * @param {string} direction - Sort direction ('asc' or 'desc')
   * @returns {Array} Sorted array
   */
  static sortBy(array, key, direction = 'asc') {
    return [...array].sort((a, b) => {
      const aValue = a[key];
      const bValue = b[key];
      
      if (aValue < bValue) {
        return direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }

  /**
   * Paginate array
   * @param {Array} array - Array to paginate
   * @param {number} page - Current page
   * @param {number} limit - Items per page
   * @returns {Object} Paginated result
   */
  static paginate(array, page = 1, limit = 10) {
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const total = array.length;
    
    return {
      data: array.slice(startIndex, endIndex),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: endIndex < total,
        hasPrev: page > 1
      }
    };
  }

  /**
   * Debounce function
   * @param {Function} func - Function to debounce
   * @param {number} delay - Delay in milliseconds
   * @returns {Function} Debounced function
   */
  static debounce(func, delay) {
    let timeoutId;
    return function (...args) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
  }

  /**
   * Throttle function
   * @param {Function} func - Function to throttle
   * @param {number} delay - Delay in milliseconds
   * @returns {Function} Throttled function
   */
  static throttle(func, delay) {
    let lastCall = 0;
    return function (...args) {
      const now = Date.now();
      if (now - lastCall >= delay) {
        lastCall = now;
        return func.apply(this, args);
      }
    };
  }

  /**
   * Deep clone object
   * @param {*} obj - Object to clone
   * @returns {*} Cloned object
   */
  static deepClone(obj) {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }
    
    if (obj instanceof Date) {
      return new Date(obj.getTime());
    }
    
    if (obj instanceof Array) {
      return obj.map(item => this.deepClone(item));
    }
    
    if (typeof obj === 'object') {
      const cloned = {};
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          cloned[key] = this.deepClone(obj[key]);
        }
      }
      return cloned;
    }
  }

  /**
   * Validate email format
   * @param {string} email - Email to validate
   * @returns {boolean} Validation result
   */
  static isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate phone number format
   * @param {string} phone - Phone number to validate
   * @returns {boolean} Validation result
   */
  static isValidPhone(phone) {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
  }

  /**
   * Generate unique ID
   * @returns {string} Unique ID
   */
  static generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}

export default DataUtils; 