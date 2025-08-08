import React from 'react';

/**
 * Base Component Class - Implements OOP principles
 * Provides common functionality for all components
 */
class BaseComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    this._isMounted = false;
    this._errorBoundary = null;
  }

  componentDidMount() {
    this._isMounted = true;
    this.onComponentMount();
  }

  componentWillUnmount() {
    this._isMounted = false;
    this.onComponentUnmount();
  }

  componentDidCatch(error, errorInfo) {
    this.handleError(error, errorInfo);
  }

  // Template methods for subclasses to override
  onComponentMount() {
    // Override in subclasses
  }

  onComponentUnmount() {
    // Override in subclasses
  }

  handleError(error, errorInfo) {
    console.error('Component Error:', error, errorInfo);
    this.setState({ error: error.message });
  }

  // Utility methods
  setStateSafely(newState) {
    if (this._isMounted) {
      this.setState(newState);
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    return true;
  }

  // Static lifecycle methods
  static getDerivedStateFromProps(nextProps, prevState) {
    return null;
  }

  // Error boundary functionality
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
}

export default BaseComponent; 