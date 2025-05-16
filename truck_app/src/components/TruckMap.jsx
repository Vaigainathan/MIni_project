import React, { useEffect, useRef, useState } from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '300px', // smaller height to fit nicely on page
};

const defaultCenter = {
  lat: 20.5937,
  lng: 78.9629,
};

// Add custom marker icons for different truck statuses
const getMarkerIcon = (status) => {
  switch(status) {
    case 'On Route':
      return { url: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png' };
    case 'Low Fuel':
      return { url: 'https://maps.google.com/mapfiles/ms/icons/yellow-dot.png' };
    case 'High Temperature':
      return { url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png' };
    case 'Rest Stop':
      return { url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png' };
    case 'Maintenance':
      return { url: 'https://maps.google.com/mapfiles/ms/icons/purple-dot.png' };
    case 'Delivered':
      return { url: 'https://maps.google.com/mapfiles/ms/icons/ltblue-dot.png' };
    default:
      return { url: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png' };
  }
};

function TruckMap({ trucks = [] }) {
  const mapRef = useRef(null);
  const [useFallback, setUseFallback] = useState(false);
  
  // Check if API key is available
  useEffect(() => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      console.warn('Google Maps API key is not available. Using fallback map.');
      setUseFallback(true);
    }
  }, []);

  // Adjust map to fit all trucks
  useEffect(() => {
    if (mapRef.current && trucks.length > 0 && window.google) {
      try {
        const bounds = new window.google.maps.LatLngBounds();
        trucks.forEach(truck => {
          if (truck.position && truck.position.lat && truck.position.lng) {
            bounds.extend({ lat: truck.position.lat, lng: truck.position.lng });
          }
        });
        mapRef.current.fitBounds(bounds);
      } catch (error) {
        console.error("Error adjusting map bounds:", error);
      }
    }
  }, [trucks]);

  // Fallback map when Google Maps API is not available
  const renderFallbackMap = () => {
    const getPositionStyle = (position) => {
      const latPercent = ((position.lat - 8) / 40) * 100;
      const lngPercent = ((position.lng - 67) / 40) * 100;
      
      return {
        position: 'absolute',
        left: `${Math.max(5, Math.min(95, lngPercent))}%`,
        top: `${Math.max(5, Math.min(95, latPercent))}%`,
        transform: 'translate(-50%, -50%)',
        zIndex: 100
      };
    };

    const getStatusColor = (status) => {
      switch(status) {
        case 'On Route': return '#28a745';
        case 'Low Fuel': return '#ffc107';
        case 'Rest Stop': return '#6c757d';
        case 'Maintenance': return '#9b59b6';
        case 'High Temperature': return '#dc3545';
        case 'Delivered': return '#17a2b8';
        default: return '#3498db';
      }
    };

    return (
      <div className="placeholder-map">
        <img 
          src="https://i.imgur.com/B1YFpPs.png" 
          alt="India Map" 
          style={{ 
            width: '100%', 
            height: '100%', 
            objectFit: 'cover', 
            opacity: 0.7 
          }} 
        />
        
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
                backgroundColor: getStatusColor(truck.status),
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
      </div>
    );
  };

  return useFallback ? (
    <div className="map-container">
      {renderFallbackMap()}
      <div className="map-legend">
        <h6>Legend</h6>
        <div className="legend-items">
          <div className="legend-item">
            <div className="legend-color" style={{backgroundColor: '#28a745'}}></div>
            <span>On Route</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{backgroundColor: '#ffc107'}}></div>
            <span>Low Fuel</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{backgroundColor: '#dc3545'}}></div>
            <span>High Temp</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{backgroundColor: '#6c757d'}}></div>
            <span>Rest Stop</span>
          </div>
        </div>
      </div>
    </div>
  ) : (
    <div className="map-container">
      <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={defaultCenter}
          zoom={5}
          onLoad={map => (mapRef.current = map)}
          options={{
            styles: [
              {
                featureType: "poi",
                elementType: "labels",
                stylers: [{ visibility: "off" }],
              },
            ],
          }}
        >
          {trucks.map(truck => (
            <Marker
              key={truck.id}
              position={{ lat: truck.position.lat, lng: truck.position.lng }}
              title={`Truck #${truck.id} - ${truck.status}`}
              icon={getMarkerIcon(truck.status)}
            />
          ))}
        </GoogleMap>
      </LoadScript>
      <div className="map-legend">
        <h6>Legend</h6>
        <div className="legend-items">
          <div className="legend-item">
            <div className="legend-color" style={{backgroundColor: '#28a745'}}></div>
            <span>On Route</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{backgroundColor: '#ffc107'}}></div>
            <span>Low Fuel</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{backgroundColor: '#dc3545'}}></div>
            <span>High Temp</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{backgroundColor: '#6c757d'}}></div>
            <span>Rest Stop</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default React.memo(TruckMap);
