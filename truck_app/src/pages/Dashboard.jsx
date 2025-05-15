// truck_app/src/pages/Dashboard.jsx - Updated for real-time data
import React, { useState, useEffect } from 'react';
import StatsCard from '../components/StatsCards';
import TruckCard from '../components/TruckCard';
import RouteTracker from '../components/RouteTracker';
import GoodsTable from '../components/GoodsTable';
import socketService from '../services/socketService';
import '../styles/Dashboard.css';

function Dashboard() {
  const [trucks, setTrucks] = useState([]);
  const [stats, setStats] = useState({
    totalTrucks: 0,
    goodsInTransit: 0,
    activeRoutes: 0,
    totalDistance: 0
  });

  useEffect(() => {
    // Connect to socket server
    const socket = socketService.connect();

    // Initial data
    socketService.on('initial-data', (data) => {
      formatTrucksData(data);
    });

    // Real-time updates
    socketService.on('vehicle-updates', (data) => {
      formatTrucksData(data);
    });

    // Fetch stats
    fetchStats();
    const statsInterval = setInterval(fetchStats, 5000);

    // Cleanup
    return () => {
      clearInterval(statsInterval);
      socketService.off('initial-data');
      socketService.off('vehicle-updates');
      socketService.disconnect();
    };
  }, []);

  const formatTrucksData = (data) => {
    const formattedTrucks = data.map(vehicle => ({
      id: vehicle.id.toString().padStart(3, '0'),
      description: `${vehicle.truck.make} ${vehicle.truck.model}`,
      status: vehicle.status,
      mileage: `${vehicle.truck.odometer.toLocaleString()} km`,
      location: `${vehicle.route.origin} → ${vehicle.route.destination}`,
      speed: `${vehicle.speed} km/h`,
      odometer: `${vehicle.truck.odometer.toLocaleString()} km`,
      type: vehicle.goods.type,
      position: vehicle.position,
      fuel: vehicle.fuel,
      engineTemp: vehicle.engineTemp,
      driver: vehicle.driver,
      helper: vehicle.helper,
      goods: {
        id: `GD${vehicle.id.toString().padStart(3, '0')}`,
        description: vehicle.goods.type,
        quantity: `${vehicle.goods.quantity} Units`,
        destination: vehicle.route.destination,
        status: vehicle.status === 'On Route' ? 'Transit' : 'Active',
        weight: `${vehicle.goods.weight} kg`,
        value: `₹${vehicle.goods.value.toLocaleString()}`
      },
      route: vehicle.route
    }));
    
    setTrucks(formattedTrucks);
    
    // Update stats
    const newStats = {
      totalTrucks: formattedTrucks.length,
      goodsInTransit: formattedTrucks.reduce((sum, t) => sum + parseInt(t.goods.quantity), 0),
      activeRoutes: formattedTrucks.filter(t => t.status === 'On Route').length,
      totalDistance: Math.round(data.reduce((sum, v) => sum + v.distanceCovered, 0))
    };
    setStats(newStats);
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/stats');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const goods = trucks.map(truck => truck.goods);

  return (
    <div className="dashboard-container">
      <div className="header">
        <h2>Logistics Dashboard - Real-time</h2>
        <div>
          <button className="btn btn-primary">Generate Report</button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="row mb-4">
        <StatsCard title="Total Trucks" value={stats.totalTrucks} />
        <StatsCard title="Goods in Transit" value={stats.goodsInTransit} />
        <StatsCard title="Active Routes" value={stats.activeRoutes} />
        <StatsCard title="Total Distance" value={`${stats.totalDistance.toLocaleString()} km`} />
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
          <RouteTracker trucks={trucks} />
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