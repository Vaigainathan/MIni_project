import React from 'react';
import TruckDetailsModal from './TruckDetailsModal';

function TruckCard({ truck }) {
  const [showModal, setShowModal] = React.useState(false);

  const toggleModal = () => {
    setShowModal(!showModal);
  };

  return (
    <>
      <div className="truck-card" onClick={toggleModal}>
        <div>
          <i className={`fa-solid ${truck.type === 'Delivery' ? 'fa-truck' : 'fa-truck-front'}`}></i>
        </div>
        <div>
          <h5>Truck #{truck.id}</h5>
          <p>{truck.description}</p>
          <span className={`status-badge status-${truck.status.toLowerCase()}`}>{truck.status}</span>
        </div>
      </div>

      <TruckDetailsModal show={showModal} onClose={toggleModal} truck={truck} />
    </>
  );
}

export default TruckCard;
