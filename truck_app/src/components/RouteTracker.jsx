import React from 'react';

function RouteTracker() {
  return (
    <div className="route-tracker">
      <iframe
        src="https://www.google.com/maps/embed?pb=YOUR_MAP_EMBED_URL"
        width="100%"
        height="100%"
        style={{ border: 0 }}
        allowFullScreen=""
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        title="Route Map"
      ></iframe>
    </div>
  );
}

export default RouteTracker;
