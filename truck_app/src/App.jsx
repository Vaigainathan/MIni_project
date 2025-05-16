import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Goods from './pages/Goods';
import Reports from './pages/Reports';
import RoutesPage from './pages/Routes';
import Trucks from './pages/Trucks';
import DriverReports from './pages/DriverReports';
import './styles/styles.css';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  const [sidebarActive, setSidebarActive] = useState(false);

  const toggleSidebar = () => {
    setSidebarActive(!sidebarActive);
  };

  return (
    <Router>
      <div className="App">
        <button className="menu-toggle" onClick={toggleSidebar}>
          <i className="fas fa-bars"></i>
        </button>
        <Sidebar active={sidebarActive} />
        <div className={`sidebar-overlay ${sidebarActive ? 'active' : ''}`} onClick={toggleSidebar}></div>
        <div className="main-content">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/goods" element={<Goods />} />
            <Route path="/reports" element={<DriverReports />} />
            <Route path="/routes" element={<RoutesPage />} />
            <Route path="/trucks" element={<Trucks />} />
            <Route path="/driver-reports" element={<DriverReports />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;