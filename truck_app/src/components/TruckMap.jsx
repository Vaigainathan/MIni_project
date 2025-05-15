import React, { useEffect, useRef } from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '300px', // smaller height to fit nicely on page
};

const defaultCenter = {
  lat: 20.5937,
  lng: 78.9629,
};

function TruckMap({ trucks }) {
  const mapRef = useRef(null);

  // Adjust map to fit all trucks
  useEffect(() => {
    if (mapRef.current && trucks.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      trucks.forEach(truck => {
        bounds.extend({ lat: truck.position.lat, lng: truck.position.lng });
      });
      mapRef.current.fitBounds(bounds);
    }
  }, [trucks]);

  return (
    <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={defaultCenter}
        zoom={5}
        onLoad={map => (mapRef.current = map)}
      >
        {trucks.map(truck => (
          <Marker
            key={truck.id}
            position={{ lat: truck.position.lat, lng: truck.position.lng }}
            title={`Truck #${truck.id} - ${truck.status}`}
          />
        ))}
      </GoogleMap>
    </LoadScript>
  );
}

export default React.memo(TruckMap);
