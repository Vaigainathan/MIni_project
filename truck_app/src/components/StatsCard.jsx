import React from 'react';
import '../styles/Dashboard.css';

function StatsCard({ title, value }) {
  return (
    <div className="stats-card">
      <h5>{title}</h5>
      <h3>{value}</h3>
    </div>
  );
}

export default StatsCard;
