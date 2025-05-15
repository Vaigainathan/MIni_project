// truck_app/src/components/TruckDetailsModal.jsx - Enhanced with real-time data
import React from 'react';
import { Modal, Button, ProgressBar } from 'react-bootstrap';

function TruckDetailsModal({ show, onClose, truck }) {
  if (!truck) return null;

  const getFuelColor = (fuel) => {
    if (fuel < 20) return 'danger';
    if (fuel < 50) return 'warning';
    return 'success';
  };

  const getTempColor = (temp) => {
    if (temp > 95) return 'danger';
    if (temp > 90) return 'warning';
    return 'info';
  };

  return (
    <Modal show={show} onHide={onClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Truck Details - #{truck.id}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="row">
          <div className="col-md-6">
            <h5>Vehicle Information</h5>
            <p><strong>Make & Model:</strong> {truck.description}</p>
            <p><strong>Registration:</strong> {truck.truck?.registration || 'N/A'}</p>
            <p><strong>Odometer:</strong> {truck.odometer}</p>
            <p><strong>Fuel Capacity:</strong> {truck.truck?.fuelCapacity || 'N/A'} L</p>
            
            <h5 className="mt-4">Current Status</h5>
            <div className="mb-3">
              <strong>Fuel Level:</strong>
              <ProgressBar 
                now={truck.fuel} 
                variant={getFuelColor(truck.fuel)}
                label={`${truck.fuel}%`} 
              />
            </div>
            <div className="mb-3">
              <strong>Engine Temperature:</strong>
              <ProgressBar 
                now={(truck.engineTemp - 70) * 3.33} 
                variant={getTempColor(truck.engineTemp)}
                label={`${truck.engineTemp}°C`} 
              />
            </div>
            <p><strong>Speed:</strong> {truck.speed}</p>
            <p><strong>Status:</strong> <span className={`status-badge status-${truck.status.toLowerCase().replace(' ', '-')}`}>{truck.status}</span></p>
          </div>
          
          <div className="col-md-6">
            <h5>Crew Information</h5>
            {truck.driver && (
              <>
                <p><strong>Driver:</strong> {truck.driver.name}</p>
                <p><strong>License:</strong> {truck.driver.license}</p>
                <p><strong>Experience:</strong> {truck.driver.experience} years</p>
                <p><strong>Contact:</strong> {truck.driver.phone}</p>
              </>
            )}
            {truck.helper && (
              <>
                <hr />
                <p><strong>Helper:</strong> {truck.helper.name}</p>
                <p><strong>Contact:</strong> {truck.helper.phone}</p>
              </>
            )}
            
            <h5 className="mt-4">Route Information</h5>
            {truck.route && (
              <>
                <p><strong>Origin:</strong> {truck.route.origin}</p>
                <p><strong>Destination:</strong> {truck.route.destination}</p>
                <div className="mb-3">
                  <strong>Progress:</strong>
                  <ProgressBar 
                    now={truck.route.progress || 0} 
                    variant="primary"
                    label={`${truck.route.progress || 0}%`} 
                  />
                </div>
              </>
            )}
            
            <h5 className="mt-4">Cargo Information</h5>
            {truck.goods && (
              <>
                <p><strong>Type:</strong> {truck.goods.description}</p>
                <p><strong>Quantity:</strong> {truck.goods.quantity}</p>
                <p><strong>Weight:</strong> {truck.goods.weight}</p>
                <p><strong>Value:</strong> {truck.goods.value}</p>
              </>
            )}
          </div>
        </div>
        
        <div className="row mt-4">
          <div className="col-12">
            <h5>Current Location</h5>
            {truck.position && (
              <div className="location-info">
                <p><strong>Latitude:</strong> {truck.position.lat.toFixed(4)}</p>
                <p><strong>Longitude:</strong> {truck.position.lng.toFixed(4)}</p>
              </div>
            )}
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>Close</Button>
      </Modal.Footer>
    </Modal>
  );
}

export default TruckDetailsModal;