import React, { useState, useEffect } from 'react';
import StatsCard from '../components/StatsCard';
import TruckCard from '../components/TruckCard';
import TruckMap from '../components/TruckMap';
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
  const [isConnected, setIsConnected] = useState(false);

  // Connect to socket server and handle real-time data
  useEffect(() => {
    console.log("Initializing dashboard and connecting to socket server...");
    
    // Connect to socket service
    const socket = socketService.connect();

    // Listen for connection events
    socket.on('connect', () => {
      console.log('Socket connected successfully');
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setIsConnected(false);
    });

    // Listen for initial data from socket
    socket.on('initial-data', (data) => {
      console.log("Received initial data from server");
      formatTrucksData(data);
    });

    // Listen for real-time updates
    socket.on('vehicle-updates', (data) => {
      console.log("Received real-time update from server");
      formatTrucksData(data);
    });

    // Fetch initial stats
    fetchStats();
    const statsInterval = setInterval(fetchStats, 10000);

    // Cleanup on component unmount
    return () => {
      clearInterval(statsInterval);
      socket.off('initial-data');
      socket.off('vehicle-updates');
      socket.off('connect');
      socket.off('disconnect');
      socket.off('connect_error');
      socketService.disconnect();
      console.log("Dashboard unmounted, socket disconnected");
    };
  }, []);

  // Format the truck data from the server to match the component needs
  const formatTrucksData = (data) => {
    if (!data || !Array.isArray(data)) {
      console.error("Invalid truck data received:", data);
      return;
    }
    
    console.log(`Processing ${data.length} trucks from server`);
    
    const formattedTrucks = data.map(vehicle => ({
      id: String(vehicle.id).padStart(3, '0'),
      description: vehicle.description || `${vehicle.truck?.make || ''} ${vehicle.truck?.model || ''}`,
      status: vehicle.status || 'Unknown',
      location: vehicle.location || `${vehicle.route?.origin || 'N/A'} → ${vehicle.route?.destination || 'N/A'}`,
      speed: typeof vehicle.speed === 'string' ? vehicle.speed : `${vehicle.speed || 0} km/h`,
      odometer: typeof vehicle.odometer === 'string' ? vehicle.odometer : `${(vehicle.odometer || 0).toLocaleString()} km`,
      type: vehicle.type || vehicle.goods?.type || 'N/A',
      position: vehicle.position || { lat: 20.5937, lng: 78.9629 },
      fuel: vehicle.fuel || 0,
      engineTemp: vehicle.engineTemp || 0,
      driver: vehicle.driver || null,
      helper: vehicle.helper || null,
      route: {
        origin: vehicle.route?.origin || 'Unknown',
        destination: vehicle.route?.destination || 'Unknown',
        progress: vehicle.route?.progress || 0
      },
      truck: vehicle.truck || {},
      goods: {
        id: vehicle.goods?.id || `GD${String(vehicle.id).padStart(3, '0')}`,
        description: vehicle.goods?.description || vehicle.goods?.type || 'N/A',
        quantity: vehicle.goods?.quantity || '0 Units',
        destination: vehicle.route?.destination || 'N/A',
        status: vehicle.goods?.status || (vehicle.status === 'On Route' ? 'Transit' : 'Active'),
        weight: vehicle.goods?.weight || '0 kg',
        value: vehicle.goods?.value || '₹0',
      },
    }));

    setTrucks(formattedTrucks);
    updateStats(formattedTrucks);
  };

  // Calculate dashboard stats from truck data
  const updateStats = (trucksData) => {
    const newStats = {
      totalTrucks: trucksData.length,
      goodsInTransit: trucksData.reduce((sum, t) => {
        const quantityStr = t.goods?.quantity || '0';
        const quantityNum = parseInt(quantityStr.toString().replace(/[^0-9]/g, ''));
        return sum + quantityNum;
      }, 0),
      activeRoutes: trucksData.filter((t) => t.status === 'On Route').length,
      totalDistance: Math.round(trucksData.reduce((sum, t) => {
        const odometer = parseInt((t.odometer || "0").replace(/[^\d]/g, ""));
        return sum + (odometer || 0);
      }, 0) / 1000),
    };
    
    setStats(newStats);
  };

  // Fetch stats from backend API
  const fetchStats = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
        console.log("Updated stats from server API");
      }
    } catch (error) {
      // Silent fail - we'll use calculated stats instead
      console.log("Could not fetch stats from server API");
    }
  };

  // Extract goods data for the table
  const goods = trucks.map((truck) => truck.goods);

  return (
    <div className="dashboard-container">
      <div className="header">
        <h2>Logistics Dashboard - Real-time</h2>
        <div className="status-indicator">
          <span className={`indicator ${isConnected ? 'connected' : 'disconnected'}`}></span>
          {isConnected ? 'Live Data' : 'Connecting...'}
        </div>
        <div>
          <button className="btn btn-primary">Generate Report</button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="row mb-4">
        <StatsCard title="TOTAL TRUCKS" value={stats.totalTrucks} />
        <StatsCard title="GOODS IN TRANSIT" value={stats.goodsInTransit} />
        <StatsCard title="ACTIVE ROUTES" value={stats.activeRoutes} />
        <StatsCard title="TOTAL DISTANCE" value={`${stats.totalDistance.toLocaleString()} km`} />
      </div>

      {/* Truck Cards Row */}
      <div className="truck-fleet-section">
        <h4>Truck Fleet</h4>
        <div className="truck-cards-row">
          {trucks.length > 0 ? (
            trucks.map((truck) => (
              <TruckCard key={truck.id} truck={truck} />
            ))
          ) : (
            <p>No trucks available</p>
          )}
        </div>
      </div>

      {/* Route Map */}
      <div className="map-section">
        <h4>Route Tracker</h4>
        <TruckMap trucks={trucks} />
      </div>

      {/* Goods Information */}
      <div className="row mt-4">
        <div className="col-12">
          <h4>Goods in Transit</h4>
          <div className="table-responsive">
            <GoodsTable goods={goods} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
