import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../styles/Login.css';

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login, user } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      const redirectPath = user.role === 'driver' ? '/trucks' : '/dashboard';
      navigate(redirectPath, { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    console.log('Login attempt with username:', username, 'and password:', password);
    
    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      console.log('Response status:', res.status);
      
      // Always try to parse JSON response, even for errors
      let data;
      try {
        data = await res.json();
        console.log('Response data:', data);
      } catch (err) {
        console.error('Failed to parse JSON response:', err);
        throw new Error('Invalid server response');
      }
      
      if (!res.ok) {
        throw new Error(data.message || 'Login failed');
      }
      
      // Store token and get role
      await login(data.token);
      console.log('Login successful with role:', data.role);
      
      // Navigate based on role
      if (data.role === 'driver') {
        navigate('/trucks');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };
  
  // Quick login buttons (for testing)
  const fillCredentials = (userType) => {
    if (userType === 'admin') {
      setUsername('admin');
      setPassword('admin123');
    } else if (userType === 'driver') {
      setUsername('driver1');
      setPassword('driver123');
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h2>Truck Management System</h2>
          <div className="login-logo">
            <i className="fas fa-truck"></i>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="login-form">
          <h3>Sign In</h3>
          
          {error && <div className="alert alert-danger">{error}</div>}
          
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <div className="input-with-icon">
              <i className="fas fa-user"></i>
              <input 
                id="username"
                type="text" 
                value={username} 
                onChange={e => setUsername(e.target.value)}
                placeholder="Enter your username"
                required 
              />
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="input-with-icon">
              <i className="fas fa-lock"></i>
              <input 
                id="password"
                type="password" 
                value={password} 
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter your password"
                required 
              />
            </div>
          </div>
          
          <button 
            type="submit" 
            className="login-button" 
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>

          
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
