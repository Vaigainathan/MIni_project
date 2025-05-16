import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../styles/Navbar.css';

function Navbar() {
  const { user, logout } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);
  
  const toggleNavbar = () => setIsExpanded(!isExpanded);

  return (
    <nav className="top-navbar">
      <div className="navbar-container">
        {/* Logo and Brand */}
        <div className="navbar-brand">
          <h3>LogiTrack</h3>
        </div>
        
        {/* Mobile Toggle Button */}
        <button 
          className="navbar-toggler" 
          onClick={toggleNavbar}
          aria-label={isExpanded ? 'Close navigation' : 'Open navigation'}
        >
          <span className="navbar-toggler-icon">
            {isExpanded ? '✕' : '☰'}
          </span>
        </button>
        
        {/* Navigation Links */}
        <div className={`navbar-collapse ${isExpanded ? 'show' : ''}`}>
          <ul className="navbar-nav">
            {user?.role === 'owner' && (
              <>
                <li className="nav-item">
                  <NavLink to="/dashboard" className={({ isActive }) => (isActive ? 'active' : '')}>
                    Dashboard
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink to="/goods" className={({ isActive }) => (isActive ? 'active' : '')}>
                    Goods
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink to="/reports" className={({ isActive }) => (isActive ? 'active' : '')}>
                    Reports
                  </NavLink>
                </li>
              </>
            )}
            
            {/* Both owner & driver */}
            <li className="nav-item">
              <NavLink to="/trucks" className={({ isActive }) => (isActive ? 'active' : '')}>
                Trucks
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/routes" className={({ isActive }) => (isActive ? 'active' : '')}>
                Routes
              </NavLink>
            </li>
          </ul>
          
          {/* User Info and Logout */}
          <div className="user-section">
            <span className="user-role">{user?.role || 'Guest'}</span>
            {user && (
              <button
                onClick={logout}
                className="logout-btn"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;