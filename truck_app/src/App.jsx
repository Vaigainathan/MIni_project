import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Goods from './pages/Goods';
import Reports from './pages/Reports';
import RoutesPage from './pages/Routes';  // renamed to avoid naming conflict with Routes component
import Trucks from './pages/Trucks';
import './styles/styles.css';

function App() {
  return (
    <Router>
      <Sidebar />
      <div className="container">
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/goods" element={<Goods />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/routes" element={<RoutesPage />} />
          <Route path="/trucks" element={<Trucks />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
