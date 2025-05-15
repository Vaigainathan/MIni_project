import React, { useState, useEffect } from 'react';
import StatsCard from '../components/StatsCard';  // Note: Your earlier file was StatsCard, not StatsCards
import TruckCard from '../components/TruckCard';
import TruckMap from '../components/TruckMap';  // Import TruckMap for Google Maps
import GoodsTable from '../components/GoodsTable';
import socketService from '../services/socketService';
import '../styles/Dashboard.css';

function Dashboard() {
  const [trucks, setTrucks] = useState([]);
  const [stats, setStats] = useState({
    totalTrucks: 0,
    goodsInTransit: 0,
    activeRoutes: 0,
    totalDistance: 0,
  });

  useEffect(() => {
    const socket = socketService.connect();

    socketService.on('initial-data', (data) => {
      formatTrucksData(data);
    });

    socketService.on('vehicle-updates', (data) => {
      formatTrucksData(data);
    });

    fetchStats();
    const statsInterval = setInterval(fetchStats, 5000);

    return () => {
      clearInterval(statsInterval);
      socketService.off('initial-data');
      socketService.off('vehicle-updates');
      socketService.disconnect();
    };
  }, []);

  const formatTrucksData = (data) => {
    const formattedTrucks = data.map((vehicle) => ({
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
        value: `₹${vehicle.goods.value.toLocaleString()}`,
      },
      route: vehicle.route,
    }));

    setTrucks(formattedTrucks);

    const newStats = {
      totalTrucks: formattedTrucks.length,
      goodsInTransit: formattedTrucks.reduce((sum, t) => sum + parseInt(t.goods.quantity), 0),
      activeRoutes: formattedTrucks.filter((t) => t.status === 'On Route').length,
      totalDistance: Math.round(data.reduce((sum, v) => sum + v.distanceCovered, 0)),
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

  const goods = trucks.map((truck) => truck.goods);

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

      {/* Truck Cards Row */}
      <div className="truck-fleet-section">
        <h4>Truck Fleet</h4>
        <div className="truck-cards-row">
          {trucks.map((truck) => (
            <TruckCard key={truck.id} truck={truck} />
          ))}
        </div>
      </div>

      {/* Route Map Below */}
      <div className="map-section mt-4">
        <h4>Route Tracker</h4>
        <TruckMap trucks={trucks} />
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
