// truck_app/src/components/TruckCard.jsx - Updated for real-time data
import React, { useState } from 'react';
import TruckDetailsModal from './TruckDetailsModal';
import '../styles/Dashboard.css';

function TruckCard({ truck }) {
  const [showModal, setShowModal] = useState(false);

  const toggleModal = () => {
    setShowModal(!showModal);
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'On Route': return 'active';
      case 'Low Fuel': return 'warning';
      case 'High Temperature': return 'danger';
      case 'Rest Stop': return 'info';
      case 'Maintenance': return 'secondary';
      case 'Delivered': return 'delivered';
      default: return 'transit';
    }
  };

  const getIconClass = (type) => {
    switch(type) {
      case 'Electronics': return 'fa-microchip';
      case 'Food Products': return 'fa-apple-whole';
      case 'Textiles': return 'fa-shirt';
      case 'Industrial Equipment': return 'fa-gear';
      case 'Pharmaceuticals': return 'fa-pills';
      default: return 'fa-truck';
    }
  };

  return (
    <>
      <div className="truck-card" onClick={toggleModal}>
        {/* Speed indicator */}
        <div className="truck-speed">
          {truck.speed?.split(' ')[0] || '0'} <small>km/h</small>
        </div>

        <div className="d-flex align-items-center">
          <div className="truck-icon">
            <i className={`fa-solid ${getIconClass(truck.type)}`}></i>
          </div>
          
          <div className="truck-info flex-grow-1 ms-3">
            <h5>Truck #{truck.id}</h5>
            <p className="mb-1">{truck.description}</p>
            
            {/* Route with arrow */}
            <div className="route-info mb-2">
              {truck.location?.split('→')[0]?.trim() || 'Unknown'} 
              <i className="fas fa-arrow-right mx-2"></i> 
              {truck.location?.split('→')[1]?.trim() || 'Unknown'}
            </div>
            
            <div className="d-flex align-items-center">
              <span className={`status-badge status-${getStatusColor(truck.status)}`}>
                {truck.status}
              </span>
              {truck.fuel < 30 && (
                <span className="ms-2 text-warning">
                  <i className="fa-solid fa-gas-pump"></i> {truck.fuel}%
                </span>
              )}
              {truck.engineTemp > 90 && (
                <span className="ms-2 text-danger">
                  <i className="fa-solid fa-temperature-high"></i> {truck.engineTemp}°C
                </span>
              )}
            </div>
          </div>
          
          <div className="truck-metrics">
            <small className="d-block"><i className="fa-solid fa-road"></i> {truck.odometer}</small>
          </div>
        </div>
      </div>

      {showModal && <TruckDetailsModal show={showModal} onClose={toggleModal} truck={truck} />}
    </>
  );
}

export default TruckCard;