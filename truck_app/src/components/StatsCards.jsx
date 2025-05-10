import React from 'react';

function StatsCard({ title, value }) {
  return (
    <div className="col-md-3">
      <div className="stats-card">
        <h5>{title}</h5>
        <h3>{value}</h3>
      </div>
    </div>
  );
}

export default StatsCard;
