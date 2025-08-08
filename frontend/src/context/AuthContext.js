import React, { createContext, useContext } from 'react';

/**
 * Authentication Context Class - Implements OOP principles
 * Manages authentication state and provides authentication methods
 */
class AuthContextManager {
  constructor() {
    this.context = createContext(null);
    this.state = {
      user: null,
      loading: true
    };
    this.listeners = new Set();
  }

  /**
   * Initialize authentication state
   */
  initialize() {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      this.state.user = JSON.parse(storedUser);
    }
    this.state.loading = false;
    this.notifyListeners();
  }

  /**
   * Login user
   */
  login(userData) {
    this.state.user = userData;
    localStorage.setItem('user', JSON.stringify(userData));
    this.notifyListeners();
  }

  /**
   * Logout user
   */
  logout() {
    this.state.user = null;
    localStorage.removeItem('user');
    this.notifyListeners();
  }

  /**
   * Get current user
   */
  getCurrentUser() {
    return this.state.user;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    return !!this.state.user;
  }

  /**
   * Check if context is loading
   */
  isLoading() {
    return this.state.loading;
  }

  /**
   * Add state change listener
   */
  addListener(listener) {
    this.listeners.add(listener);
  }

  /**
   * Remove state change listener
   */
  removeListener(listener) {
    this.listeners.delete(listener);
  }

  /**
   * Notify all listeners of state change
   */
  notifyListeners() {
    this.listeners.forEach(listener => listener(this.state));
  }

  /**
   * Get context value
   */
  getContextValue() {
    return {
      user: this.state.user,
      login: this.login.bind(this),
      logout: this.logout.bind(this),
      loading: this.state.loading
    };
  }
}

// Create singleton instance
const authContextManager = new AuthContextManager();

/**
 * Authentication Provider Component
 */
class AuthProvider extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user: null,
      loading: true
    };
  }

  componentDidMount() {
    // Initialize authentication state
    authContextManager.initialize();
    
    // Subscribe to state changes
    authContextManager.addListener(this.handleStateChange.bind(this));
    
    // Set initial state
    this.setState({
      user: authContextManager.getCurrentUser(),
      loading: authContextManager.isLoading()
    });
  }

  componentWillUnmount() {
    // Unsubscribe from state changes
    authContextManager.removeListener(this.handleStateChange.bind(this));
  }

  handleStateChange(newState) {
    this.setState({
      user: newState.user,
      loading: newState.loading
    });
  }

  render() {
    const { children } = this.props;
    const { loading } = this.state;

    if (loading) {
      return null; // or a loading spinner
    }

    return (
      <authContextManager.context.Provider value={authContextManager.getContextValue()}>
        {children}
      </authContextManager.context.Provider>
    );
  }
}

/**
 * Custom hook to use authentication context
 */
const useAuth = () => {
  const context = useContext(authContextManager.context);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export { AuthProvider, useAuth };
export default authContextManager.context; 