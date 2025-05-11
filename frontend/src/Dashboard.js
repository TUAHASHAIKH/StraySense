import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Dashboard.css';

const Dashboard = () => {
  const [sessions, setSessions] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/sessions');
      if (!response.ok) {
        throw new Error('Failed to fetch sessions');
      }
      const data = await response.json();
      console.log('Fetched sessions:', data);
      setSessions(data);
    } catch (error) {
      console.error('Error fetching sessions:', error);
      setError('Failed to load sessions. Please try again later.');
    }
  };

  const handleSessionChange = (event) => {
    const userId = event.target.value;
    setSelectedUserId(userId);
    localStorage.setItem('selectedUserId', userId);
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
      </div>
      
      <div className="session-selector">
        <label htmlFor="sessionSelect">Select User Session:</label>
        <select 
          id="sessionSelect"
          value={selectedUserId}
          onChange={handleSessionChange}
        >
          <option value="">Select a session...</option>
          {sessions.map(session => (
            <option key={session.session_id} value={session.user_id}>
              {session.first_name} {session.last_name} ({session.email})
            </option>
          ))}
        </select>
        {error && <div className="error-message">{error}</div>}
      </div>

      <div className="dashboard-content">
        <div className="dashboard-card">
          <h2>Welcome to StraySense</h2>
          <p>Select your session above to start managing your adoptions.</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 