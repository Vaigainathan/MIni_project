import React from 'react';
import { Routes as RouterRoutes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Goods from './pages/Goods';
import Reports from './pages/Reports';
import Trucks from './pages/Trucks';
import RoutesPage from './pages/Routes';
import DriverDashboard from './pages/DriverDashboard'; // Import the new DriverDashboard

import Navbar from './components/Navbar';
import { useAuth } from './contexts/AuthContext';

import './styles/dashboard.css';

function App() {
  const { user } = useAuth();
  console.log("Auth state:", user); // Debug auth state
  
  return (
    <div className="app-container">
      {user && <Navbar />}
      <div className="main-content">
        <RouterRoutes>
          {/* Check if user is authenticated */}
          <Route path="/login" element={!user ? <Login /> : (
            user.role === 'driver' ? <Navigate to="/driver-dashboard" /> : <Navigate to="/dashboard" />
          )} />
          
          {/* Owner routes */}
          <Route path="/dashboard" element={
            user?.role === 'owner' ? <Dashboard /> : 
            user?.role === 'driver' ? <Navigate to="/driver-dashboard" /> : 
            <Navigate to="/login" />
          } />
          <Route path="/goods" element={user?.role === 'owner' ? <Goods /> : <Navigate to="/login" />} />
          <Route path="/reports" element={user?.role === 'owner' ? <Reports /> : <Navigate to="/login" />} />
          
          {/* Shared routes - but with different access levels */}
          <Route path="/trucks" element={
            user?.role === 'owner' ? <Trucks /> : 
            user?.role === 'driver' ? <Navigate to="/driver-dashboard" /> : 
            <Navigate to="/login" />
          } />
          <Route path="/routes" element={
            user?.role === 'owner' ? <RoutesPage /> : 
            user?.role === 'driver' ? <Navigate to="/driver-dashboard" /> : 
            <Navigate to="/login" />
          } />
          
          {/* Driver-specific dashboard */}
          <Route path="/driver-dashboard" element={
            user?.role === 'driver' ? <DriverDashboard /> : <Navigate to="/login" />
          } />
          
          {/* Root path redirects based on role */}
          <Route path="/" element={
            !user ? <Navigate to="/login" /> : 
            user.role === 'driver' ? <Navigate to="/driver-dashboard" /> : 
            <Navigate to="/dashboard" />
          } />
          
          {/* Catch all routes */}
          <Route path="*" element={
            !user ? <Navigate to="/login" /> : 
            user.role === 'driver' ? <Navigate to="/driver-dashboard" /> : 
            <Navigate to="/dashboard" />
          } />
        </RouterRoutes>
      </div>
    </div>
  );
}

export default App;