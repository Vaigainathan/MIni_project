import React from 'react';
import { Routes as RouterRoutes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Goods from './pages/Goods';
import Reports from './pages/Reports';
import Trucks from './pages/Trucks';
import RoutesPage from './pages/Routes'; // Renamed to avoid conflict

import Navbar from './components/Navbar'; // Using Sidebar as Navbar
import { useAuth } from './contexts/AuthContext';

import './styles/Dashboard.css';

function App() {
  const { user } = useAuth();
  console.log("Auth state:", user); // Debug auth state
  
  return (
    <div className="app-container">
      {user && <Navbar />}
      <div className="main-content">
        <RouterRoutes>
          {/* Check if user is authenticated */}
          <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
          <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/login" />} />
          <Route path="/goods" element={user?.role === 'owner' ? <Goods /> : <Navigate to="/login" />} />
          <Route path="/reports" element={user?.role === 'owner' ? <Reports /> : <Navigate to="/login" />} />
          <Route path="/trucks" element={user ? <Trucks /> : <Navigate to="/login" />} />
          <Route path="/routes" element={user ? <RoutesPage /> : <Navigate to="/login" />} />
          
          {/* Root path redirects to dashboard if authenticated, login if not */}
          <Route path="/" element={<Navigate to={user ? "/dashboard" : "/login"} />} />
          
          {/* Catch all routes */}
          <Route path="*" element={<Navigate to={user ? "/dashboard" : "/login"} />} />
        </RouterRoutes>
      </div>
    </div>
  );
}

export default App;