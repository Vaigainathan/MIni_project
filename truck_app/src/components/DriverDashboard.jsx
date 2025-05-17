import React, { useState, useEffect } from 'react';
import TruckCard from '../components/TruckCard';
import TruckMap from '../components/TruckMap';
import { Card, ProgressBar, Badge } from 'react-bootstrap';
import { MapPin, Clock } from 'lucide-react';
import socketService from '../services/socketService';
import { useAuth } from '../contexts/AuthContext';
import '../styles/Dashboard.css';
import '../styles/DriverDashboard.css';

function DriverDashboard() {
  const [truckData, setTruckData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const { user } = useAuth();
  
  // For driver1, we'll set the assigned truck ID to 1
  const driverId = 1; // This should match driver1's assigned truck
  
  // Connect to socket server and handle real-time data
  useEffect(() => {
    console.log("Initializing driver dashboard and connecting to socket server...");
    
    // Connect to socket service
    const socket = socketService.connect();
    
    // Listen for connection events
    socket.on('connect', () => {
      console.log('Socket connected successfully for driver dashboard');
      setIsConnected(true);
    });
    
    socket.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
    });
    
    // Listen for initial data from socket
    socket.on('initial-data', (data) => {
      console.log("Received initial data from server");
      processDriverData(data);
    });
    
    // Listen for real-time updates
    socket.on('vehicle-updates', (data) => {
      console.log("Received real-time update from server");
      processDriverData(data);
    });
    
    // Fetch initial data directly via API
    const fetchInitialData = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/vehicles/${driverId}`);
        if (response.ok) {
          const data = await response.json();
          processDriverData([data]); // Wrap in array for consistent processing
        } else {
          console.error("Failed to fetch driver's truck data");
        }
      } catch (error) {
        console.error("Error fetching truck data:", error);
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
      console.log("Driver dashboard unmounted, socket disconnected");
    };
  }, [driverId]);
  
  // Process the truck data for this specific driver
  const processDriverData = (vehicles) => {
    if (!vehicles || !Array.isArray(vehicles)) {
      console.error("Invalid data received:", vehicles);
      return;
    }
    
    // Find the driver's truck
    const driverVehicle = vehicles.find(v => v.id === driverId);
    
    if (!driverVehicle) {
      console.log("Driver's vehicle not found in data");
      return;
    }
    
    console.log("Processing driver's vehicle data:", driverVehicle);
    
    // Format truck data for display
    const formattedTruck = {
      id: String(driverVehicle.id).padStart(3, '0'),
      description: `${driverVehicle.truck?.make || ''} ${driverVehicle.truck?.model || ''}`,
      status: driverVehicle.status || 'Unknown',
      location: `${driverVehicle.route?.origin || 'N/A'} → ${driverVehicle.route?.destination || 'N/A'}`,
      speed: typeof driverVehicle.speed === 'string' ? driverVehicle.speed : `${driverVehicle.speed || 0} km/h`,
      odometer: typeof driverVehicle.odometer === 'string' ? driverVehicle.odometer : `${(driverVehicle.odometer || 0).toLocaleString()} km`,
      type: driverVehicle.type || driverVehicle.goods?.type || 'N/A',
      position: driverVehicle.position || { lat: 20.5937, lng: 78.9629 },
      fuel: driverVehicle.fuel || 0,
      engineTemp: driverVehicle.engineTemp || 0,
      driver: driverVehicle.driver || null,
      helper: driverVehicle.helper || null,
      route: {
        origin: driverVehicle.route?.origin || 'Unknown',
        destination: driverVehicle.route?.destination || 'Unknown',
        progress: driverVehicle.route?.progress || 0,
        distance: driverVehicle.route?.distance || 0
      },
      truck: driverVehicle.truck || {},
      goods: {
        description: driverVehicle.goods?.type || 'N/A',
        quantity: driverVehicle.goods?.quantity || '0 Units',
        destination: driverVehicle.route?.destination || 'N/A',
        status: driverVehicle.goods?.status || (driverVehicle.status === 'On Route' ? 'Transit' : 'Active'),
        weight: driverVehicle.goods?.weight || '0 kg',
        value: driverVehicle.goods?.value || '₹0',
      },
      lastUpdated: driverVehicle.lastUpdated || new Date().toISOString()
    };
    
    // Calculate estimated arrival
    const progress = formattedTruck.route.progress || 0;
    const remainingProgress = 100 - progress;
    const speed = formattedTruck.speed ? parseInt(formattedTruck.speed, 10) : 60; // km/h
    const totalDistance = formattedTruck.route.distance || 0;
    const remainingDistance = totalDistance * (remainingProgress / 100);
    const remainingHours = remainingDistance / speed;
    
    const arrivalDate = new Date();
    arrivalDate.setHours(arrivalDate.getHours() + remainingHours);
    
    formattedTruck.estimatedArrival = formatArrivalTime(arrivalDate, progress);
    
    setTruckData(formattedTruck);
  };
  
  // Format arrival time in a user-friendly way
  const formatArrivalTime = (date, progress) => {
    if (progress >= 100) return 'Delivered';
    
    const now = new Date();
    const diff = date - now;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
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
  
  // Get status badge color
  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'On Route':
        return 'success';
      case 'Low Fuel':
        return 'warning';
      case 'High Temperature':
        return 'danger';
      case 'Delivered':
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
  
  // Get delivery status message
  const getDeliveryStatusMessage = (truck) => {
    if (!truck) return '';
    
    switch (truck.status) {
      case 'Low Fuel':
        return 'Warning: Fuel level is low. Please refuel soon.';
      case 'High Temperature':
        return 'Warning: Engine temperature is high. Please check.';
      case 'Rest Stop':
        return 'Currently on scheduled rest stop.';
      case 'Maintenance':
        return 'Vehicle is under maintenance.';
      case 'Delivered':
        return 'Delivery completed successfully.';
      default:
        return `En route to ${truck.route.destination}. Keep driving safely.`;
    }
  };

  return (
    <div className="dashboard-container driver-dashboard">
      <div className="welcome-header">
        <div className="welcome-message">
          <h2>Welcome, {truckData?.driver?.name || user?.username || 'Driver'}</h2>
          <p className="driver-subtitle">Have a safe journey today!</p>
        </div>
        <div className="status-indicator">
          <span className={`indicator ${isConnected ? 'connected' : 'disconnected'}`}></span>
          {isConnected ? 'Live Data' : 'Connecting...'}
        </div>
      </div>

      {isLoading ? (
        <div className="loading-container">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p>Loading your truck details...</p>
        </div>
      ) : !truckData ? (
        <div className="error-container">
          <div className="alert alert-warning">
            <h4>Truck Not Found</h4>
            <p>We couldn't find your assigned truck. Please contact dispatch.</p>
          </div>
        </div>
      ) : (
        <>
          {/* Current Assignment */}
          <div className="assignment-card">
            <div className="assignment-header">
              <h3>Current Assignment</h3>
              <Badge bg={getStatusBadgeColor(truckData.status)}>
                {truckData.status}
              </Badge>
            </div>
            
            <div className="assignment-details">
              <div className="route-info">
                <div className="origin-destination">
                  <div className="location origin">
                    <div className="location-dot origin-dot"></div>
                    <div className="location-name">{truckData.route.origin}</div>
                  </div>
                  <div className="route-line"></div>
                  <div className="location destination">
                    <div className="location-dot destination-dot"></div>
                    <div className="location-name">{truckData.route.destination}</div>
                  </div>
                </div>
                
                <div className="route-progress">
                  <div className="progress-label">
                    <span>Progress: {truckData.route.progress}%</span>
                    <span>Distance: {truckData.route.distance} km</span>
                  </div>
                  <ProgressBar 
                    now={truckData.route.progress} 
                    variant={truckData.route.progress >= 100 ? 'success' : 'primary'} 
                  />
                </div>
                
                <div className="route-eta">
                  <div className="eta-label">
                    <Clock size={16} />
                    <span>Estimated Arrival:</span>
                  </div>
                  <div className="eta-value">{truckData.estimatedArrival}</div>
                </div>
              </div>
              
              <div className="cargo-info">
                <h4>Cargo Details</h4>
                <p><strong>Type:</strong> {truckData.goods.description}</p>
                <p><strong>Quantity:</strong> {truckData.goods.quantity}</p>
                <p><strong>Weight:</strong> {truckData.goods.weight}</p>
                <p><strong>Value:</strong> {truckData.goods.value}</p>
              </div>
            </div>
            
            <div className="status-message">
              {getDeliveryStatusMessage(truckData)}
            </div>
          </div>
          
          {/* Truck Map */}
          <Card className="map-card">
            <Card.Header>
              <h3>Your Location</h3>
            </Card.Header>
            <Card.Body className="p-0">
              <TruckMap trucks={[truckData]} />
            </Card.Body>
          </Card>
          
          {/* Truck Details */}
          <div className="truck-details-section">
            <h3>Your Truck Details</h3>
            <TruckCard truck={truckData} />
            
            <div className="key-metrics">
              <div className="metric-item">
                <div className="metric-icon">
                  <i className="fa-solid fa-gas-pump"></i>
                </div>
                <div className="metric-value">{truckData.fuel}%</div>
                <div className="metric-label">Fuel Level</div>
                <ProgressBar 
                  now={truckData.fuel} 
                  variant={truckData.fuel < 20 ? 'danger' : truckData.fuel < 50 ? 'warning' : 'success'} 
                />
              </div>
              
              <div className="metric-item">
                <div className="metric-icon">
                  <i className="fa-solid fa-temperature-high"></i>
                </div>
                <div className="metric-value">{truckData.engineTemp}°C</div>
                <div className="metric-label">Engine Temp</div>
                <ProgressBar 
                  now={(truckData.engineTemp - 70) * 3.33} 
                  variant={truckData.engineTemp > 95 ? 'danger' : truckData.engineTemp > 90 ? 'warning' : 'info'} 
                />
              </div>
              
              <div className="metric-item">
                <div className="metric-icon">
                  <i className="fa-solid fa-gauge-high"></i>
                </div>
                <div className="metric-value">
                  {typeof truckData.speed === 'string' 
                    ? truckData.speed 
                    : `${truckData.speed} km/h`}
                </div>
                <div className="metric-label">Current Speed</div>
              </div>
              
              <div className="metric-item">
                <div className="metric-icon">
                  <i className="fa-solid fa-road"></i>
                </div>
                <div className="metric-value">{truckData.odometer}</div>
                <div className="metric-label">Odometer</div>
              </div>
            </div>
          </div>
          
          {/* Helper Information */}
          {truckData.helper && (
            <Card className="helper-card">
              <Card.Header>
                <h3>Your Helper</h3>
              </Card.Header>
              <Card.Body>
                <div className="helper-info">
                  <div className="helper-avatar">
                    <i className="fa-solid fa-user"></i>
                  </div>
                  <div className="helper-details">
                    <h4>{truckData.helper.name}</h4>
                    <p>{truckData.helper.phone}</p>
                  </div>
                </div>
              </Card.Body>
            </Card>
          )}
          
          {/* Emergency Contact */}
          <Card className="emergency-card">
            <Card.Body>
              <h3>Emergency Contact</h3>
              <p>In case of emergency, contact dispatch:</p>
              <div className="emergency-phone">
                <i className="fa-solid fa-phone"></i>
                <span>+91-1800-123-4567</span>
              </div>
            </Card.Body>
          </Card>
        </>
      )}
    </div>
  );
}

export default DriverDashboard;