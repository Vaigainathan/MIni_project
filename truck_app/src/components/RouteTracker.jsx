// truck_app/src/components/RouteTracker.jsx - Enhanced with real positions
import React from 'react';

function RouteTracker({ trucks = [] }) {
  // For now, we'll show the truck positions in a simple way
  // You can later integrate with a real map service like Google Maps or Leaflet
  
  const getPositionStyle = (position) => {
    // Convert lat/lng to percentage positions on the placeholder map
    const latPercent = ((position.lat - 8) / 40) * 100; // Normalize to 0-100%
    const lngPercent = ((position.lng - 67) / 40) * 100;
    
    return {
      position: 'absolute',
      left: `${Math.max(5, Math.min(95, lngPercent))}%`,
      top: `${Math.max(5, Math.min(95, latPercent))}%`,
      transform: 'translate(-50%, -50%)'
    };
  };

  return (
    <div className="route-tracker-container">
      <div className="route-tracker">
        <div className="placeholder-map" style={{ position: 'relative' }}>
          {trucks.length === 0 ? (
            <p>Waiting for vehicle data...</p>
          ) : (
            <>
              <p style={{ position: 'absolute', top: '10px', left: '10px', margin: 0, fontWeight: 'bold' }}>
                Live Vehicle Positions
              </p>
              {trucks.map((truck) => (
                <div
                  key={truck.id}
                  style={getPositionStyle(truck.position)}
                  className="truck-marker"
                  title={`Truck #${truck.id} - ${truck.status}`}
                >
                  <div 
                    style={{
                      width: '30px',
                      height: '30px',
                      backgroundColor: truck.status === 'On Route' ? '#28a745' : 
                                     truck.status === 'Low Fuel' ? '#ffc107' : '#dc3545',
                      borderRadius: '50%',
                      border: '3px solid white',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: '12px',
                      cursor: 'pointer'
                    }}
                  >
                    {truck.id}
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
      
      <div className="map-legend mt-3 p-3 bg-light rounded">
        <h6>Legend</h6>
        <div className="d-flex flex-wrap gap-3">
          <div className="d-flex align-items-center">
            <div style={{
              width: '20px',
              height: '20px',
              backgroundColor: '#28a745',
              borderRadius: '50%',
              marginRight: '8px'
            }}></div>
            <span>On Route</span>
          </div>
          <div className="d-flex align-items-center">
            <div style={{
              width: '20px',
              height: '20px',
              backgroundColor: '#ffc107',
              borderRadius: '50%',
              marginRight: '8px'
            }}></div>
            <span>Low Fuel</span>
          </div>
          <div className="d-flex align-items-center">
            <div style={{
              width: '20px',
              height: '20px',
              backgroundColor: '#dc3545',
              borderRadius: '50%',
              marginRight: '8px'
            }}></div>
            <span>Needs Attention</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RouteTracker;