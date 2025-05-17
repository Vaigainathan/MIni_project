import React, { useState, useEffect } from 'react';
import socketService from '../services/socketService';
import TruckMap from '../components/TruckMap';
import { Card, Table, ProgressBar, Form, Button, Badge } from 'react-bootstrap';
import { MapPin, Clock, TrendingUp, AlertTriangle } from 'lucide-react';
import '../styles/Dashboard.css';

function Routes() {
  const [routes, setRoutes] = useState([]);
  const [filteredRoutes, setFilteredRoutes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [filter, setFilter] = useState({
    origin: 'all',
    destination: 'all',
    status: 'all',
    search: '',
  });
  const [stats, setStats] = useState({
    totalRoutes: 0,
    activeRoutes: 0,
    totalDistance: 0,
    avgProgress: 0,
  });
  const [cities, setCities] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(null);

  // Connect to socket server and handle real-time data
  useEffect(() => {
    console.log("Initializing routes page and connecting to socket server...");
    
    // Connect to socket service
    const socket = socketService.connect();

    // Listen for connection events
    socket.on('connect', () => {
      console.log('Socket connected successfully for routes page');
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected from routes page');
      setIsConnected(false);
    });

    // Listen for initial data from socket
    socket.on('initial-data', (data) => {
      console.log("Received initial data from server for routes");
      processRoutesData(data);
    });

    // Listen for real-time updates
    socket.on('vehicle-updates', (data) => {
      console.log("Received real-time update for routes data");
      processRoutesData(data);
    });

    // Fetch initial routes data directly via API
    const fetchInitialData = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/vehicles');
        if (response.ok) {
          const data = await response.json();
          processRoutesData(data);
        } else {
          console.error("Failed to fetch initial routes data");
        }
      } catch (error) {
        console.error("Error fetching routes data:", error);
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
      console.log("Routes page unmounted, socket disconnected");
    };
  }, []);

  // Apply filters whenever routes or filter state changes
  useEffect(() => {
    applyFilters();
  }, [routes, filter]);

  // Process the routes data from socket or API
  const processRoutesData = (data) => {
    if (!data || !Array.isArray(data)) {
      console.error("Invalid data received:", data);
      return;
    }
    
    console.log(`Processing ${data.length} routes from server`);
    
    // Extract unique cities for filters
    const uniqueCities = new Set();
    
    const routesData = data.map(vehicle => {
      const origin = vehicle.route?.origin || 'Unknown';
      const destination = vehicle.route?.destination || 'Unknown';
      
      // Add to unique cities set
      uniqueCities.add(origin);
      uniqueCities.add(destination);
      
      // Calculate estimated arrival time based on progress and speed
      const progress = vehicle.route?.progress || 0;
      const remainingProgress = 100 - progress;
      const speed = vehicle.speed || 60; // km/h
      const totalDistance = vehicle.route?.distance || 0;
      const remainingDistance = totalDistance * (remainingProgress / 100);
      const remainingHours = remainingDistance / speed;
      
      const arrivalDate = new Date();
      arrivalDate.setHours(arrivalDate.getHours() + remainingHours);
      
      // Determine status
      let routeStatus = vehicle.status;
      if (progress >= 100) {
        routeStatus = 'Completed';
      } else if (vehicle.fuel < 20) {
        routeStatus = 'Low Fuel';
      } else if (vehicle.engineTemp > 95) {
        routeStatus = 'High Temperature';
      }
      
      return {
        id: vehicle.id,
        truckId: String(vehicle.id).padStart(3, '0'),
        truckName: `${vehicle.truck?.make || ''} ${vehicle.truck?.model || ''}`,
        driver: vehicle.driver?.name || 'Unknown',
        origin,
        destination,
        distance: vehicle.route?.distance || 0,
        progress,
        status: routeStatus,
        estimatedArrival: progress >= 100 ? 'Delivered' : formatArrivalTime(arrivalDate),
        startTime: calculateStartTime(vehicle),
        position: vehicle.position,
        speed: vehicle.speed || 0,
        goods: vehicle.goods?.type || 'Unknown',
        warnings: getRouteWarnings(vehicle)
      };
    });

    setCities(Array.from(uniqueCities).sort());
    setRoutes(routesData);
    updateStats(routesData);
  };

  // Calculate approximate start time based on progress and speed
  const calculateStartTime = (vehicle) => {
    const progress = vehicle.route?.progress || 0;
    const speed = vehicle.speed || 60; // km/h
    const totalDistance = vehicle.route?.distance || 0;
    const coveredDistance = totalDistance * (progress / 100);
    const hoursElapsed = coveredDistance / speed;
    
    const startDate = new Date();
    startDate.setHours(startDate.getHours() - hoursElapsed);
    
    return startDate.toLocaleDateString('en-IN', { 
      day: 'numeric', 
      month: 'short',
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };
  
  // Format arrival time in a user-friendly way
  const formatArrivalTime = (date) => {
    const now = new Date();
    const diff = date - now;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours < 24) {
      return `Today, ${date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (hours < 48) {
      return `Tomorrow, ${date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString('en-IN', { 
        day: 'numeric', 
        month: 'short',
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }
  };
  
  // Get warnings for a route
  const getRouteWarnings = (vehicle) => {
    const warnings = [];
    
    if (vehicle.fuel < 20) {
      warnings.push({ type: 'fuel', message: 'Low fuel level' });
    }
    
    if (vehicle.engineTemp > 95) {
      warnings.push({ type: 'temperature', message: 'High engine temperature' });
    }
    
    if (vehicle.status === 'Rest Stop') {
      warnings.push({ type: 'stop', message: 'Vehicle stopped for rest' });
    }
    
    if (vehicle.status === 'Maintenance') {
      warnings.push({ type: 'maintenance', message: 'Vehicle under maintenance' });
    }
    
    return warnings;
  };

  // Calculate dashboard stats from route data
  const updateStats = (routesData) => {
    const activeRoutes = routesData.filter(r => r.progress < 100 && r.progress > 0);
    const totalDistance = routesData.reduce((sum, r) => sum + r.distance, 0);
    const avgProgress = activeRoutes.length > 0 
      ? activeRoutes.reduce((sum, r) => sum + r.progress, 0) / activeRoutes.length 
      : 0;
    
    setStats({
      totalRoutes: routesData.length,
      activeRoutes: activeRoutes.length,
      totalDistance,
      avgProgress: Math.round(avgProgress)
    });
  };

  // Apply filters to the routes data
  const applyFilters = () => {
    let filtered = [...routes];
    
    // Filter by origin
    if (filter.origin !== 'all') {
      filtered = filtered.filter(route => route.origin === filter.origin);
    }
    
    // Filter by destination
    if (filter.destination !== 'all') {
      filtered = filtered.filter(route => route.destination === filter.destination);
    }
    
    // Filter by status
    if (filter.status !== 'all') {
      filtered = filtered.filter(route => route.status === filter.status);
    }
    
    // Filter by search term
    if (filter.search.trim() !== '') {
      const searchTerm = filter.search.toLowerCase();
      filtered = filtered.filter(route => 
        route.truckId.toLowerCase().includes(searchTerm) ||
        route.driver.toLowerCase().includes(searchTerm) ||
        route.truckName.toLowerCase().includes(searchTerm) ||
        route.goods.toLowerCase().includes(searchTerm)
      );
    }
    
    setFilteredRoutes(filtered);
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
      origin: 'all',
      destination: 'all',
      status: 'all',
      search: '',
    });
  };
  
  // Get status badge color
  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'On Route':
        return 'success';
      case 'Low Fuel':
        return 'warning';
      case 'High Temperature':
        return 'danger';
      case 'Completed':
        return 'info';
      case 'Rest Stop':
        return 'secondary';
      case 'Maintenance':
        return 'dark';
      default:
        return 'primary';
    }
  };
  
  // Handle route selection
  const handleRouteSelect = (route) => {
    setSelectedRoute(route);
  };

  return (
    <div className="dashboard-container">
      <div className="header">
        <h2>Route Management</h2>
        <div className="status-indicator">
          <span className={`indicator ${isConnected ? 'connected' : 'disconnected'}`}></span>
          {isConnected ? 'Live Data' : 'Connecting...'}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="row mb-4">
        <div className="stats-card">
          <h5>TOTAL ROUTES</h5>
          <h3>{stats.totalRoutes}</h3>
        </div>
        <div className="stats-card">
          <h5>ACTIVE ROUTES</h5>
          <h3>{stats.activeRoutes}</h3>
        </div>
        <div className="stats-card">
          <h5>TOTAL DISTANCE</h5>
          <h3>{stats.totalDistance.toLocaleString()} km</h3>
        </div>
        <div className="stats-card">
          <h5>AVG PROGRESS</h5>
          <h3>{stats.avgProgress}%</h3>
        </div>
      </div>

      {/* Filter Panel */}
      <Card className="mb-4 p-3">
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-2">
          <h5 className="mb-0">Route Overview</h5>
          <div className="d-flex flex-wrap gap-2">
            <Form.Control
              type="text"
              placeholder="Search truck, driver..."
              name="search"
              value={filter.search}
              onChange={handleFilterChange}
              style={{ width: 'auto' }}
            />
            <Form.Select
              name="origin"
              value={filter.origin}
              onChange={handleFilterChange}
              style={{ width: 'auto' }}
            >
              <option value="all">All Origins</option>
              {cities.map(city => (
                <option key={`origin-${city}`} value={city}>{city}</option>
              ))}
            </Form.Select>
            <Form.Select
              name="destination"
              value={filter.destination}
              onChange={handleFilterChange}
              style={{ width: 'auto' }}
            >
              <option value="all">All Destinations</option>
              {cities.map(city => (
                <option key={`dest-${city}`} value={city}>{city}</option>
              ))}
            </Form.Select>
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
              <option value="Completed">Completed</option>
            </Form.Select>
            <Button variant="outline-secondary" onClick={resetFilters}>
              Reset
            </Button>
          </div>
        </div>
      </Card>

      {/* Map Section */}
      <div className="map-section">
        <h4>Route Map</h4>
        <TruckMap trucks={filteredRoutes.length > 0 
          ? filteredRoutes.map(r => ({ ...r, id: r.id, status: r.status })) 
          : routes.map(r => ({ ...r, id: r.id, status: r.status }))} 
        />
      </div>

      {/* Route Details */}
      <div className="mt-4">
        <h4 className="mb-3">Route Details</h4>
        {isLoading ? (
          <div className="text-center p-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3">Loading route data...</p>
          </div>
        ) : filteredRoutes.length > 0 ? (
          <div className="table-responsive">
            <Table striped hover className="route-table">
              <thead>
                <tr>
                  <th>Truck ID</th>
                  <th>Driver</th>
                  <th>Route</th>
                  <th>Distance</th>
                  <th>Progress</th>
                  <th>Status</th>
                  <th>Started</th>
                  <th>ETA</th>
                  <th>Cargo</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRoutes.map(route => (
                  <tr key={route.id} onClick={() => handleRouteSelect(route)}>
                    <td>{route.truckId}</td>
                    <td>{route.driver}</td>
                    <td>
                      <div className="d-flex align-items-center gap-1">
                        <MapPin size={14} />
                        {route.origin} → {route.destination}
                      </div>
                    </td>
                    <td>{route.distance} km</td>
                    <td>
                      <div className="progress-with-label">
                        <ProgressBar now={route.progress} />
                        <div className="progress-label">{route.progress}%</div>
                      </div>
                    </td>
                    <td>
                      <Badge bg={getStatusBadgeColor(route.status)}>
                        {route.status}
                      </Badge>
                      {route.warnings.length > 0 && (
                        <AlertTriangle size={14} className="ms-1 text-warning" />
                      )}
                    </td>
                    <td>{route.startTime}</td>
                    <td>
                      <div className="d-flex align-items-center gap-1">
                        <Clock size={14} />
                        {route.estimatedArrival}
                      </div>
                    </td>
                    <td>{route.goods}</td>
                    <td>
                      <Button size="sm" variant="outline-primary" onClick={(e) => {
                        e.stopPropagation();
                        handleRouteSelect(route);
                      }}>
                        Details
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        ) : (
          <div className="no-results-container text-center p-5">
            <MapPin size={48} className="mb-3 text-muted" />
            <h5>No routes match your filters</h5>
            <p className="text-muted">Try adjusting your search criteria</p>
            <Button variant="primary" onClick={resetFilters}>Clear Filters</Button>
          </div>
        )}
      </div>

      {/* Selected Route Details Modal */}
      {selectedRoute && (
        <div className="route-details-container mt-4">
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Route Details: {selectedRoute.origin} to {selectedRoute.destination}</h5>
              <Button variant="close" onClick={() => setSelectedRoute(null)} />
            </Card.Header>
            <Card.Body>
              <div className="row">
                <div className="col-md-6">
                  <h6>Truck Information</h6>
                  <p><strong>ID:</strong> {selectedRoute.truckId}</p>
                  <p><strong>Model:</strong> {selectedRoute.truckName}</p>
                  <p><strong>Driver:</strong> {selectedRoute.driver}</p>
                  <p><strong>Cargo:</strong> {selectedRoute.goods}</p>
                  <p><strong>Current Speed:</strong> {selectedRoute.speed} km/h</p>
                  
                  <h6 className="mt-4">Route Status</h6>
                  <p>
                    <strong>Status:</strong> 
                    <Badge bg={getStatusBadgeColor(selectedRoute.status)} className="ms-2">
                      {selectedRoute.status}
                    </Badge>
                  </p>
                  
                  {selectedRoute.warnings.length > 0 && (
                    <div className="alert alert-warning">
                      <h6 className="alert-heading">Warnings</h6>
                      <ul className="mb-0">
                        {selectedRoute.warnings.map((warning, idx) => (
                          <li key={idx}>{warning.message}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                
                <div className="col-md-6">
                  <h6>Route Information</h6>
                  <p><strong>Origin:</strong> {selectedRoute.origin}</p>
                  <p><strong>Destination:</strong> {selectedRoute.destination}</p>
                  <p><strong>Distance:</strong> {selectedRoute.distance} km</p>
                  <p><strong>Started:</strong> {selectedRoute.startTime}</p>
                  <p><strong>ETA:</strong> {selectedRoute.estimatedArrival}</p>
                  
                  <h6 className="mt-3">Progress</h6>
                  <ProgressBar 
                    now={selectedRoute.progress} 
                    label={`${selectedRoute.progress}%`}
                    style={{ height: '24px' }}
                    variant={
                      selectedRoute.progress >= 100 ? 'success' :
                      selectedRoute.progress > 75 ? 'info' :
                      selectedRoute.progress > 25 ? 'primary' : 
                      'secondary'
                    }
                  />
                  
                  <div className="d-flex justify-content-between mt-2">
                    <span>{selectedRoute.origin}</span>
                    <span>{selectedRoute.destination}</span>
                  </div>
                </div>
              </div>
            </Card.Body>
            <Card.Footer className="text-end">
              <Button variant="secondary" onClick={() => setSelectedRoute(null)}>Close</Button>
            </Card.Footer>
          </Card>
        </div>
      )}
    </div>
  );
}

export default Routes;