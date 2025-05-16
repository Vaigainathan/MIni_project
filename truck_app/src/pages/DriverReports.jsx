// truck_app/src/pages/DriverReports.jsx
import React, { useState, useEffect } from 'react';
import DriverReportComponent from '../components/DriverReportComponent';
import { User, FileText, Download, Filter } from 'lucide-react';
import '../styles/DriverReports.css';

function DriverReports() {
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Fetch drivers list from API
    const fetchDrivers = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/drivers');
        const data = await response.json();
        setDrivers(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching drivers:', error);
        // Fallback to mock data if API fails
        const mockDrivers = [
          { id: 0, name: 'Rajesh Kumar (Bad Driver)', profile: 'Bad', totalDeliveries: 145, avgRating: 2.8 },
          { id: 1, name: 'Amit Singh (Good Driver)', profile: 'Good', totalDeliveries: 203, avgRating: 4.7 },
          { id: 2, name: 'Suresh Patil (Avg Driver)', profile: 'Average', totalDeliveries: 178, avgRating: 3.9 },
          { id: 3, name: 'Mohammed Ali (Avg Driver)', profile: 'Average', totalDeliveries: 156, avgRating: 3.5 },
          { id: 4, name: 'Deepak Sharma (Avg Driver)', profile: 'Average', totalDeliveries: 167, avgRating: 3.7 }
        ];
        setDrivers(mockDrivers);
        setLoading(false);
      }
    };

    fetchDrivers();

    // Add class to body for full-width layout
    document.body.classList.add('reports-page');
    
    // Cleanup function
    return () => {
      document.body.classList.remove('reports-page');
    };
  }, []);

  const handleDriverSelect = (driver) => {
    setSelectedDriver(driver);
  };

  const getProfileBadgeClass = (profile) => {
    switch(profile) {
      case 'Good': return 'profile-badge profile-good';
      case 'Bad': return 'profile-badge profile-bad';
      default: return 'profile-badge profile-average';
    }
  };

  return (
    <div className="driver-reports-container full-width">
      <a href="/dashboard" className="home-button">
        <i className="fas fa-home"></i>
        Back to Dashboard
      </a>
      <div className="header-section">
        <h1 className="page-title">Driver Performance Reports</h1>
        <p className="page-description">Analyze driver performance metrics and get improvement recommendations</p>
      </div>

      {!selectedDriver ? (
        <div>
          <div className="driver-selection-header">
            <h2 className="section-title">Select a Driver</h2>
            <button className="btn-filter">
              <Filter className="icon-small" />
              Filter
            </button>
          </div>
          
          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <div className="loading-text">Loading drivers...</div>
            </div>
          ) : (
            <div className="driver-grid">
              {drivers.map(driver => (
                <div
                  key={driver.id}
                  className="driver-card"
                  onClick={() => handleDriverSelect(driver)}
                >
                  <div className="driver-card-header">
                    <div className="driver-info">
                      <User className="driver-icon" />
                      <div>
                        <h3 className="driver-name">{driver.name}</h3>
                        <p className="driver-id">ID: #{driver.id.toString().padStart(3, '0')}</p>
                      </div>
                    </div>
                    <span className={getProfileBadgeClass(driver.profile)}>
                      {driver.profile}
                    </span>
                  </div>
                  
                  <div className="driver-stats">
                    <div className="stat-row">
                      <span className="stat-label">Total Deliveries:</span>
                      <span className="stat-value">{driver.totalDeliveries}</span>
                    </div>
                    <div className="stat-row">
                      <span className="stat-label">Average Rating:</span>
                      <span className="stat-value">⭐ {driver.avgRating.toFixed(1)}</span>
                    </div>
                  </div>
                  
                  <button className="btn-view-report">
                    <FileText className="icon-small" />
                    View Report
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div>
          <div className="report-header">
            <button
              onClick={() => setSelectedDriver(null)}
              className="btn-back"
            >
              ← Back to Drivers
            </button>
            <button className="btn-export">
              <Download className="icon-small" />
              Export Report
            </button>
          </div>
          
          <DriverReportComponent 
            driverId={selectedDriver.id} 
            driverName={selectedDriver.name}
          />
        </div>
      )}
    </div>
  );
}

export default DriverReports;