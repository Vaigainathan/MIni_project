import React, { useState } from 'react';
import StatsCard from '../components/StatsCards';
import TruckCard from '../components/TruckCard';
import RouteTracker from '../components/RouteTracker';
import GoodsTable from '../components/GoodsTable';
import '../styles/Dashboard.css'; // Assuming you have a CSS file for styling

function Dashboard() {
  // Sample data - in a real app, this would come from an API
  const [trucks] = useState([
    {
      id: '001',
      description: 'Delivery Truck',
      status: 'Active',
      mileage: '120,000 km',
      location: 'New York',
      speed: '80 km/h',
      odometer: '125,000 km',
      type: 'Delivery'
    },
    {
      id: '002',
      description: 'Refrigerated Truck',
      status: 'Transit',
      mileage: '80,000 km',
      location: 'Chicago',
      speed: '70 km/h',
      odometer: '85,000 km',
      type: 'Refrigerated'
    }
  ]);

  const [goods] = useState([
    {
      id: 'GD001',
      description: 'Electronics',
      quantity: '500 Units',
      destination: 'New York',
      status: 'Transit'
    },
    {
      id: 'GD002',
      description: 'Perishable Goods',
      quantity: '200 Boxes',
      destination: 'Chicago',
      status: 'Active'
    }
  ]);

  return (
    <div className="dashboard-container">
      <div className="header">
        <h2>Logistics Dashboard</h2>
        <div>
          <button className="btn btn-primary">Generate Report</button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="row mb-4">
        <StatsCard title="Total Trucks" value="42" />
        <StatsCard title="Goods in Transit" value="127" />
        <StatsCard title="Active Routes" value="18" />
        <StatsCard title="Total Distance" value="24,563 km" />
      </div>

      <div className="row">
        {/* Trucks List */}
        <div className="col-md-4">
          <h4>Truck Fleet</h4>
          {trucks.map(truck => (
            <TruckCard key={truck.id} truck={truck} />
          ))}
        </div>

        {/* Route Tracker */}
        <div className="col-md-8">
          <h4>Route Tracker</h4>
          <RouteTracker />
        </div>
      </div>

      {/* Goods Information */}
      <div className="row mt-4">
        <div className="col-12">
          <h4>Goods in Transit</h4>
          <GoodsTable goods={goods} />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
