import BaseComponent from './BaseComponent';

/**
 * Base Data Component Class - Extends BaseComponent
 * Provides common data fetching and display functionality
 */
class BaseDataComponent extends BaseComponent {
  constructor(props) {
    super(props);
    
    this.state = {
      ...this.state,
      data: [],
      loading: true,
      error: null,
      filters: {},
      pagination: {
        page: 1,
        limit: 10,
        total: 0
      }
    };

    // Bind methods
    this.fetchData = this.fetchData.bind(this);
    this.refreshData = this.refreshData.bind(this);
    this.setFilters = this.setFilters.bind(this);
    this.setPagination = this.setPagination.bind(this);
    this.handleError = this.handleError.bind(this);
  }

  /**
   * Handle component mount
   */
  async onComponentMount() {
    await this.fetchData();
  }

  /**
   * Fetch data from API
   * Template method for subclasses to implement
   */
  async fetchData() {
    throw new Error('fetchData must be implemented by subclass');
  }

  /**
   * Refresh data
   */
  async refreshData() {
    this.setStateSafely({ loading: true, error: null });
    await this.fetchData();
  }

  /**
   * Set filters and refetch data
   */
  async setFilters(filters) {
    this.setStateSafely({ 
      filters: { ...this.state.filters, ...filters },
      pagination: { ...this.state.pagination, page: 1 }
    });
    await this.fetchData();
  }

  /**
   * Set pagination and refetch data
   */
  async setPagination(pagination) {
    this.setStateSafely({ 
      pagination: { ...this.state.pagination, ...pagination }
    });
    await this.fetchData();
  }

  /**
   * Handle data fetching error
   */
  handleError(error) {
    console.error('Data fetching error:', error);
    this.setStateSafely({
      error: error.message || 'Failed to load data. Please try again later.',
      loading: false
    });
  }

  /**
   * Set data successfully
   */
  setData(data, additionalState = {}) {
    this.setStateSafely({
      data,
      loading: false,
      error: null,
      ...additionalState
    });
  }

  /**
   * Set loading state
   */
  setLoading(loading) {
    this.setStateSafely({ loading });
  }

  /**
   * Get current data
   */
  getData() {
    return this.state.data;
  }

  /**
   * Get current filters
   */
  getFilters() {
    return this.state.filters;
  }

  /**
   * Get current pagination
   */
  getPagination() {
    return this.state.pagination;
  }

  /**
   * Check if data is loading
   */
  isLoading() {
    return this.state.loading;
  }

  /**
   * Check if there's an error
   */
  hasError() {
    return !!this.state.error;
  }

  /**
   * Get error message
   */
  getError() {
    return this.state.error;
  }

  /**
   * Check if data is empty
   */
  isEmpty() {
    return this.state.data.length === 0;
  }

  /**
   * Get data count
   */
  getDataCount() {
    return this.state.data.length;
  }

  /**
   * Render loading state
   * Template method for subclasses to override
   */
  renderLoading() {
    return <div className="loading">Loading...</div>;
  }

  /**
   * Render error state
   * Template method for subclasses to override
   */
  renderError() {
    return <div className="error">{this.state.error}</div>;
  }

  /**
   * Render empty state
   * Template method for subclasses to override
   */
  renderEmpty() {
    return <div className="empty">No data available</div>;
  }

  /**
   * Render data content
   * Template method for subclasses to implement
   */
  renderData() {
    throw new Error('renderData must be implemented by subclass');
  }

  /**
   * Render the component
   */
  render() {
    const { loading, error, data } = this.state;

    if (loading) {
      return this.renderLoading();
    }

    if (error) {
      return this.renderError();
    }

    if (data.length === 0) {
      return this.renderEmpty();
    }

    return this.renderData();
  }
}

export default BaseDataComponent; 