import React, { useState, useEffect } from 'react';
import TruckCard from '../components/TruckCard';
import TruckMap from '../components/TruckMap';
import socketService from '../services/socketService';
import { Card, Form, Button } from 'react-bootstrap';
import '../styles/Dashboard.css';

function Trucks() {
  const [trucks, setTrucks] = useState([]);
  const [filteredTrucks, setFilteredTrucks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [filter, setFilter] = useState({
    status: 'all',
    search: '',
  });
  const [stats, setStats] = useState({
    totalTrucks: 0,
    onRoute: 0,
    needsAttention: 0,
    totalDistance: 0,
  });

  // Connect to socket server and handle real-time data
  useEffect(() => {
    console.log("Initializing trucks page and connecting to socket server...");
    
    // Connect to socket service
    const socket = socketService.connect();

    // Listen for connection events
    socket.on('connect', () => {
      console.log('Socket connected successfully for trucks page');
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected from trucks page');
      setIsConnected(false);
    });

    // Listen for initial data from socket
    socket.on('initial-data', (data) => {
      console.log("Received initial data from server for trucks");
      processTrucksData(data);
    });

    // Listen for real-time updates
    socket.on('vehicle-updates', (data) => {
      console.log("Received real-time update for trucks data");
      processTrucksData(data);
    });

    // Fetch initial trucks data directly via API
    const fetchInitialData = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/vehicles');
        if (response.ok) {
          const data = await response.json();
          processTrucksData(data);
        } else {
          console.error("Failed to fetch initial trucks data");
        }
      } catch (error) {
        console.error("Error fetching trucks data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();

    // Cleanup on component unmount
    return () => {
      socket.off('initial-data');
      socket.off('vehicle-updates');
      socket.off('connect');
      socket.off('disconnect');
      socketService.disconnect();
      console.log("Trucks page unmounted, socket disconnected");
    };
  }, []);

  // Apply filters whenever trucks or filter state changes
  useEffect(() => {
    applyFilters();
  }, [trucks, filter]);

  // Process the trucks data from socket or API
  const processTrucksData = (data) => {
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
        description: vehicle.goods?.type || 'N/A',
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
      onRoute: trucksData.filter((t) => t.status === 'On Route').length,
      needsAttention: trucksData.filter((t) => 
        t.status === 'Low Fuel' || 
        t.status === 'High Temperature' || 
        t.status === 'Maintenance'
      ).length,
      totalDistance: Math.round(trucksData.reduce((sum, t) => {
        const odometer = parseInt((t.odometer || "0").replace(/[^\d]/g, ""));
        return sum + (odometer || 0);
      }, 0) / 1000),
    };
    
    setStats(newStats);
  };

  // Apply filters to the trucks data
  const applyFilters = () => {
    let filtered = [...trucks];
    
    // Filter by status
    if (filter.status !== 'all') {
      filtered = filtered.filter(truck => truck.status === filter.status);
    }
    
    // Filter by search term
    if (filter.search.trim() !== '') {
      const searchTerm = filter.search.toLowerCase();
      filtered = filtered.filter(truck => 
        truck.id.toLowerCase().includes(searchTerm) ||
        truck.description.toLowerCase().includes(searchTerm) ||
        truck.driver?.name.toLowerCase().includes(searchTerm) ||
        truck.route.origin.toLowerCase().includes(searchTerm) ||
        truck.route.destination.toLowerCase().includes(searchTerm)
      );
    }
    
    setFilteredTrucks(filtered);
  };

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Reset filters
  const resetFilters = () => {
    setFilter({
      status: 'all',
      search: '',
    });
  };

  return (
    <div className="dashboard-container">
      <div className="header">
        <h2>Truck Fleet Management</h2>
        <div className="status-indicator">
          <span className={`indicator ${isConnected ? 'connected' : 'disconnected'}`}></span>
          {isConnected ? 'Live Data' : 'Connecting...'}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="row mb-4">
        <div className="stats-card">
          <h5>TOTAL TRUCKS</h5>
          <h3>{stats.totalTrucks}</h3>
        </div>
        <div className="stats-card">
          <h5>ON ROUTE</h5>
          <h3>{stats.onRoute}</h3>
        </div>
        <div className="stats-card">
          <h5>NEEDS ATTENTION</h5>
          <h3>{stats.needsAttention}</h3>
        </div>
        <div className="stats-card">
          <h5>TOTAL DISTANCE</h5>
          <h3>{stats.totalDistance.toLocaleString()} km</h3>
        </div>
      </div>

      {/* Filter Panel */}
      <Card className="mb-4 p-3">
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-2">
          <h5 className="mb-0">Fleet Overview</h5>
          <div className="d-flex flex-wrap gap-2">
            <Form.Control
              type="text"
              placeholder="Search trucks, drivers, routes..."
              name="search"
              value={filter.search}
              onChange={handleFilterChange}
              style={{ width: 'auto' }}
            />
            <Form.Select
              name="status"
              value={filter.status}
              onChange={handleFilterChange}
              style={{ width: 'auto' }}
            >
              <option value="all">All Status</option>
              <option value="On Route">On Route</option>
              <option value="Low Fuel">Low Fuel</option>
              <option value="High Temperature">High Temperature</option>
              <option value="Rest Stop">Rest Stop</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Delivered">Delivered</option>
            </Form.Select>
            <Button variant="outline-secondary" onClick={resetFilters}>
              Reset
            </Button>
          </div>
        </div>
      </Card>

      {/* Map Section */}
      <div className="map-section">
        <h4>Fleet Location Map</h4>
        <TruckMap trucks={filteredTrucks.length > 0 ? filteredTrucks : trucks} />
      </div>

      {/* Truck Cards */}
      <h4 className="mt-4 mb-3">Truck Details</h4>
      <div className="truck-cards-container">
        {isLoading ? (
          <div className="text-center p-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3">Loading truck data...</p>
          </div>
        ) : filteredTrucks.length > 0 ? (
          <div className="truck-cards-row">
            {filteredTrucks.map(truck => (
              <TruckCard key={truck.id} truck={truck} />
            ))}
          </div>
        ) : (
          <div className="no-results-container text-center p-5">
            <i className="fa-solid fa-truck-fast fa-3x mb-3 text-muted"></i>
            <h5>No trucks match your filters</h5>
            <p className="text-muted">Try adjusting your search criteria</p>
            <Button variant="primary" onClick={resetFilters}>Clear Filters</Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Trucks;