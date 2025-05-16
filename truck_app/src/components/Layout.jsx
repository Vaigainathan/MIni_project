import React from 'react';
import { Navigate } from 'react-router-dom';
import Sidebar from './Navbar';
import { getToken } from '../utils/auth';
import '../styles/Dashboard.css'

function Layout({ children }) {
  // Check if user is authenticated
  const token = getToken();
  if (!token) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content container">
        {children}
      </div>
    </div>
  );
}

export default Layout;