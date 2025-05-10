import React from 'react';
import { Modal, Button } from 'react-bootstrap';

function TruckDetailsModal({ show, onClose, truck }) {
  return (
    <Modal show={show} onHide={onClose}>
      <Modal.Header closeButton>
        <Modal.Title>Truck Details - #{truck.id}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p><strong>Mileage:</strong> {truck.mileage}</p>
        <p><strong>Location:</strong> {truck.location}</p>
        <p><strong>Speed:</strong> {truck.speed}</p>
        <p><strong>Odometer:</strong> {truck.odometer}</p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>Close</Button>
      </Modal.Footer>
    </Modal>
  );
}

export default TruckDetailsModal;
