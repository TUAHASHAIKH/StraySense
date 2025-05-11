import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const AuthTest = () => {
  const { user, login, signup, logout } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [showAuth, setShowAuth] = useState(true);

  const handleLogin = async (e) => {
    e.preventDefault();
    const result = await login(email, password);
    if (result.success) {
      alert('Login successful!');
      setShowAuth(false); // Hide auth forms after successful login
    } else {
      alert(result.message);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    const result = await signup({
      email,
      password,
      firstName,
      lastName
    });
    if (result.success) {
      alert('Signup successful! Please login.');
      // Clear form
      setEmail('');
      setPassword('');
      setFirstName('');
      setLastName('');
    } else {
      alert(result.message);
    }
  };

  const handleLogout = async () => {
    await logout();
    alert('Logged out successfully!');
    setShowAuth(true); // Show auth forms after logout
  };

  // If user is logged in and we're not showing auth forms, show the main content
  if (user && !showAuth) {
    return (
      <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h2>Welcome, {user.first_name}!</h2>
            <p>Email: {user.email}</p>
            <p>User ID: {user.user_id}</p>
          </div>
          <button 
            onClick={handleLogout}
            style={{ 
              padding: '8px 16px',
              backgroundColor: '#ff4444',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Logout
          </button>
        </div>
        <div style={{ marginTop: '20px' }}>
          <h3>Your Dashboard</h3>
          <p>You are now logged in and can access all features:</p>
          <ul>
            <li>Submit stray animal reports</li>
            <li>View vaccination schedules</li>
            <li>Manage your profile</li>
          </ul>
        </div>
      </div>
    );
  }

  // Show auth forms if user is not logged in or showAuth is true
  return (
    <div style={{ padding: '20px', maxWidth: '400px', margin: '0 auto' }}>
      <h2>Auth Test Panel</h2>
      <div>
        <h3>Login</h3>
        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '10px' }}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ width: '100%', padding: '8px' }}
            />
          </div>
          <div style={{ marginBottom: '10px' }}>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: '100%', padding: '8px' }}
            />
          </div>
          <button 
            type="submit" 
            style={{ 
              width: '100%', 
              padding: '8px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Login
          </button>
        </form>

        <h3>Signup</h3>
        <form onSubmit={handleSignup}>
          <div style={{ marginBottom: '10px' }}>
            <input
              type="text"
              placeholder="First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              style={{ width: '100%', padding: '8px' }}
            />
          </div>
          <div style={{ marginBottom: '10px' }}>
            <input
              type="text"
              placeholder="Last Name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              style={{ width: '100%', padding: '8px' }}
            />
          </div>
          <div style={{ marginBottom: '10px' }}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ width: '100%', padding: '8px' }}
            />
          </div>
          <div style={{ marginBottom: '10px' }}>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: '100%', padding: '8px' }}
            />
          </div>
          <button 
            type="submit" 
            style={{ 
              width: '100%', 
              padding: '8px',
              backgroundColor: '#2196F3',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Signup
          </button>
        </form>
      </div>
    </div>
  );
};

export default AuthTest; 