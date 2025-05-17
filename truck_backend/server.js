// truck_backend/server.js - Modified to meet specific parameters
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');
const authRouter = require('./auth');

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: "http://localhost:5173", // Vite default port
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());
app.use('/api/auth', authRouter);

// Truck fleet data
const TRUCKS = [
  { id: 0, make: 'Volvo', model: 'FH16', registration: 'DL01TC1234', fuelCapacity: 300 },
  { id: 1, make: 'Mercedes-Benz', model: 'Actros', registration: 'MH02AB5678', fuelCapacity: 400 },
  { id: 2, make: 'Scania', model: 'R Series', registration: 'KA03CD9876', fuelCapacity: 350 },
  { id: 3, make: 'Tata', model: 'Prima', registration: 'TN04EF3456', fuelCapacity: 250 },
  { id: 4, make: 'Ashok Leyland', model: 'Captain', registration: 'GJ05GH7890', fuelCapacity: 280 }
];

// Fixed driver names with profile indicators
const DRIVERS = [
  { id: 0, name: 'Rajesh Kumar (Bad Driver)', license: 'DL1234567', experience: 5, phone: '+91-9876543210', profile: 'Bad' },
  { id: 1, name: 'Amit Singh (Good Driver)', license: 'MH7654321', experience: 15, phone: '+91-9876543211', profile: 'Good' },
  { id: 2, name: 'Suresh Patil (Avg Driver)', license: 'KA2468135', experience: 10, phone: '+91-9876543212', profile: 'Average' },
  { id: 3, name: 'Mohammed Ali (Avg Driver)', license: 'TN1357924', experience: 8, phone: '+91-9876543213', profile: 'Average' },
  { id: 4, name: 'Deepak Sharma (Avg Driver)', license: 'GJ3692581', experience: 7, phone: '+91-9876543214', profile: 'Average' }
];

const HELPERS = [
  { id: 0, name: 'Ravi Verma', phone: '+91-8765432100' },
  { id: 1, name: 'Sanjay Yadav', phone: '+91-8765432101' },
  { id: 2, name: 'Pramod Gupta', phone: '+91-8765432102' },
  { id: 3, name: null }, // No helper
  { id: 4, name: 'Vikram Singh', phone: '+91-8765432103' }
];

const GOODS_CATALOG = [
  { type: 'Electronics', baseWeight: 500, pricePerKg: 100 },
  { type: 'Textiles', baseWeight: 800, pricePerKg: 50 },
  { type: 'Food Products', baseWeight: 1000, pricePerKg: 30 },
  { type: 'Industrial Equipment', baseWeight: 2000, pricePerKg: 200 },
  { type: 'Pharmaceuticals', baseWeight: 300, pricePerKg: 500 }
];

// Fixed routes as specified
const FIXED_ROUTES = [
  { origin: 'Pune', destination: 'Delhi', distance: 1400 },
  { origin: 'Bangalore', destination: 'Delhi', distance: 2100 },
  { origin: 'Mumbai', destination: 'Pune', distance: 150 },
  { origin: 'Hyderabad', destination: 'Mumbai', distance: 700 },
  { origin: 'Kolkata', destination: 'Delhi', distance: 1500 }
];

// City coordinates for position simulation
const CITY_COORDINATES = {
  'Delhi': { lat: 28.6139, lng: 77.2090 },
  'Mumbai': { lat: 19.0760, lng: 72.8777 },
  'Bangalore': { lat: 12.9716, lng: 77.5946 },
  'Chennai': { lat: 13.0827, lng: 80.2707 },
  'Kolkata': { lat: 22.5726, lng: 88.3639 },
  'Pune': { lat: 18.5204, lng: 73.8567 },
  'Hyderabad': { lat: 17.6850, lng: 78.6416 }
};

// Vehicle simulation class
class VehicleSimulator {
  constructor(vehicleId) {
    this.vehicleId = vehicleId;
    this.truck = TRUCKS[vehicleId];
    this.driver = DRIVERS[vehicleId];
    this.helper = HELPERS[vehicleId];
    
    // Initialize goods
    const goodsType = GOODS_CATALOG[vehicleId % GOODS_CATALOG.length];
    this.goods = {
      type: goodsType.type,
      quantity: Math.floor(Math.random() * 50) + 20,
      weight: goodsType.baseWeight + Math.floor(Math.random() * 500),
      value: 0
    };
    this.goods.value = this.goods.weight * goodsType.pricePerKg;
    
    // Fixed route based on truck ID
    this.route = FIXED_ROUTES[vehicleId];
    
    // Initialize position at origin
    const originCoords = CITY_COORDINATES[this.route.origin];
    const destCoords = CITY_COORDINATES[this.route.destination];
    
    // Set initial progress based on truck ID
    let initialProgress;
    if (vehicleId === 0) {
      initialProgress = 70;
    } else if (vehicleId === 1) {
      initialProgress = 50;
    } else {
      initialProgress = Math.floor(Math.random() * 35);
    }
    
    // Calculate initial position based on progress
    const progressRatio = initialProgress / 100;
    this.position = {
      lat: originCoords.lat + (destCoords.lat - originCoords.lat) * progressRatio,
      lng: originCoords.lng + (destCoords.lng - originCoords.lng) * progressRatio
    };
    
    // Initialize vehicle metrics based on driver profile
    if (vehicleId === 0) {
      // Bad driver metrics
      this.status = 'On Route';
      this.speed = 85 + Math.random() * 10; // High speed (85-95 km/h)
      this.fuel = 15 + Math.random() * 10; // Low fuel (15-25%)
      this.engineTemp = 95 + Math.random() * 5; // High temp (95-100°C)
    } else if (vehicleId === 1) {
      // Good driver metrics
      this.status = 'On Route';
      this.speed = 58 + Math.random() * 4; // Moderate speed (58-62 km/h)
      this.fuel = 80 + Math.random() * 15; // High fuel (80-95%)
      this.engineTemp = 85 + Math.random() * 5; // Moderate temp (85-90°C)
    } else {
      // Average driver metrics
      this.status = 'On Route';
      this.speed = 65 + Math.random() * 10; // Mixed speed (65-75 km/h)
      this.fuel = 40 + Math.random() * 40; // Mixed fuel (40-80%)
      this.engineTemp = 87 + Math.random() * 8; // Mixed temp (87-95°C)
    }
    
    this.odometer = Math.floor(Math.random() * 50000) + 100000;
    this.distanceCovered = this.route.distance * (initialProgress / 100);
  }
  
  update() {
    // Only move if not at 100% progress
    const progress = Math.min(100, (this.distanceCovered / this.route.distance) * 100);
    
    if (progress < 100) {
      // Calculate movement towards destination
      const originCoords = CITY_COORDINATES[this.route.origin];
      const destCoords = CITY_COORDINATES[this.route.destination];
      
      // Update distance covered
      this.distanceCovered += this.speed / 60; // km per minute
      this.odometer += this.speed / 60;
      
      // Update position based on new progress
      const newProgress = Math.min(100, (this.distanceCovered / this.route.distance) * 100);
      const progressRatio = newProgress / 100;
      
      this.position = {
        lat: originCoords.lat + (destCoords.lat - originCoords.lat) * progressRatio,
        lng: originCoords.lng + (destCoords.lng - originCoords.lng) * progressRatio
      };
    }
    
    // Update vehicle metrics based on driver profile
    if (this.vehicleId === 0) {
      // Bad driver - erratic metrics
      this.speed = Math.max(80, Math.min(100, this.speed + (Math.random() - 0.5) * 8));
      this.fuel = Math.max(5, this.fuel - 0.2); // Rapid fuel consumption
      this.engineTemp = Math.max(94, Math.min(100, this.engineTemp + (Math.random() - 0.3) * 2));
    } else if (this.vehicleId === 1) {
      // Good driver - stable metrics
      this.speed = Math.max(58, Math.min(62, this.speed + (Math.random() - 0.5) * 2));
      this.fuel = Math.max(50, this.fuel - 0.05); // Efficient fuel consumption
      this.engineTemp = Math.max(83, Math.min(90, this.engineTemp + (Math.random() - 0.5) * 1));
    } else {
      // Average drivers - moderate variation
      this.speed = Math.max(60, Math.min(80, this.speed + (Math.random() - 0.5) * 5));
      this.fuel = Math.max(20, this.fuel - 0.1);
      this.engineTemp = Math.max(85, Math.min(95, this.engineTemp + (Math.random() - 0.5) * 2));
    }
    
    // Update status based on conditions
    if (this.fuel < 20) {
      this.status = 'Low Fuel';
    } else if (this.engineTemp > 95) {
      this.status = 'High Temperature';
    } else if (progress >= 100) {
      this.status = 'Delivered';
    } else {
      this.status = 'On Route';
    }
    
    return this.getVehicleData();
  }
  
  getVehicleData() {
    const progress = Math.min(100, Math.round((this.distanceCovered / this.route.distance) * 100));
    
    return {
      id: this.vehicleId,
      truck: {
        ...this.truck,
        odometer: Math.round(this.odometer)
      },
      driver: this.driver,
      helper: this.helper.name ? this.helper : null,
      goods: this.goods,
      status: this.status,
      position: this.position,
      speed: Math.round(this.speed),
      fuel: Math.round(this.fuel),
      engineTemp: Math.round(this.engineTemp),
      distanceCovered: Math.round(this.distanceCovered),
      route: {
        origin: this.route.origin,
        destination: this.route.destination,
        distance: this.route.distance,
        progress: progress
      },
      lastUpdated: new Date().toISOString()
    };
  }
}

// Active vehicles
const activeVehicles = new Map();

// Initialize 5 vehicles
for (let i = 0; i < 5; i++) {
  activeVehicles.set(i, new VehicleSimulator(i));
}

// Socket connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  // Send initial data
  const vehicleData = Array.from(activeVehicles.values()).map(v => v.getVehicleData());
  socket.emit('initial-data', vehicleData);
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Update simulation every 3 seconds
setInterval(() => {
  const updates = [];
  activeVehicles.forEach((vehicle) => {
    updates.push(vehicle.update());
  });
  io.emit('vehicle-updates', updates);
}, 3000);

// REST API endpoints
app.get('/api/vehicles', (req, res) => {
  const vehicleData = Array.from(activeVehicles.values()).map(v => v.getVehicleData());
  res.json(vehicleData);
});

app.get('/api/vehicles/:id', (req, res) => {
  const vehicleId = parseInt(req.params.id);
  const vehicle = activeVehicles.get(vehicleId);
  if (vehicle) {
    res.json(vehicle.getVehicleData());
  } else {
    res.status(404).json({ error: 'Vehicle not found' });
  }
});

app.get('/api/stats', (req, res) => {
  const vehicles = Array.from(activeVehicles.values()).map(v => v.getVehicleData());
  const stats = {
    totalTrucks: vehicles.length,
    activeRoutes: vehicles.filter(v => v.status === 'On Route').length,
    goodsInTransit: vehicles.reduce((sum, v) => sum + v.goods.quantity, 0),
    totalDistance: vehicles.reduce((sum, v) => sum + v.distanceCovered, 0)
  };
  res.json(stats);
});


const generateDriverMetrics = (driverId) => {
  // Get the driver's profile from existing DRIVERS array
  const driver = DRIVERS[driverId];
  const profile = driver.profile;
  let metrics = {};
  
  switch(profile) {
    case 'Bad':
      metrics = {
        avgFuelConsumption: 9.5 + Math.random() * 1.5, // Poor fuel efficiency
        avgSpeed: 48 + Math.random() * 5, // Below optimal speed
        avgDeliveryTime: 54 + Math.random() * 6, // Extended delivery times
        totalDeliveries: Math.floor(Math.random() * 30) + 120,
        totalDistance: Math.floor(Math.random() * 10000) + 40000,
        incidents: Math.floor(Math.random() * 5) + 3,
        lateDeliveries: Math.floor(Math.random() * 10) + 15,
        idleTime: 15 + Math.random() * 5, // High idle time
        harshBraking: Math.floor(Math.random() * 10) + 20,
        rapidAcceleration: Math.floor(Math.random() * 8) + 15,
        speedingIncidents: Math.floor(Math.random() * 10) + 25
      };
      break;
    case 'Good':
      metrics = {
        avgFuelConsumption: 7.2 + Math.random() * 0.8, // Excellent fuel efficiency
        avgSpeed: 58 + Math.random() * 4, // Optimal speed
        avgDeliveryTime: 42 + Math.random() * 4, // Fast delivery times
        totalDeliveries: Math.floor(Math.random() * 50) + 150,
        totalDistance: Math.floor(Math.random() * 15000) + 60000,
        incidents: Math.floor(Math.random() * 2),
        lateDeliveries: Math.floor(Math.random() * 5) + 2,
        idleTime: 4 + Math.random() * 3, // Low idle time
        harshBraking: Math.floor(Math.random() * 5) + 5,
        rapidAcceleration: Math.floor(Math.random() * 3) + 2,
        speedingIncidents: Math.floor(Math.random() * 5) + 5
      };
      break;
    default: // Average
      metrics = {
        avgFuelConsumption: 8.2 + Math.random() * 1.2,
        avgSpeed: 54 + Math.random() * 6,
        avgDeliveryTime: 48 + Math.random() * 5,
        totalDeliveries: Math.floor(Math.random() * 40) + 130,
        totalDistance: Math.floor(Math.random() * 12000) + 50000,
        incidents: Math.floor(Math.random() * 3) + 1,
        lateDeliveries: Math.floor(Math.random() * 8) + 8,
        idleTime: 8 + Math.random() * 4,
        harshBraking: Math.floor(Math.random() * 8) + 10,
        rapidAcceleration: Math.floor(Math.random() * 6) + 7,
        speedingIncidents: Math.floor(Math.random() * 8) + 12
      };
  }
  
  return {
    driverId,
    driverName: driver.name,
    profile,
    metrics,
    lastUpdated: new Date().toISOString()
  };
};

// Add driver metrics endpoint
app.get('/api/drivers/:id/metrics', (req, res) => {
  const driverId = parseInt(req.params.id);
  if (driverId >= 0 && driverId < DRIVERS.length) {
    const metrics = generateDriverMetrics(driverId);
    res.json(metrics);
  } else {
    res.status(404).json({ error: 'Driver not found' });
  }
});

// Add endpoint to get all drivers
app.get('/api/drivers', (req, res) => {
  const driversWithMetrics = DRIVERS.map((driver, index) => {
    const metrics = generateDriverMetrics(index);
    return {
      ...driver,
      totalDeliveries: metrics.metrics.totalDeliveries,
      avgRating: driver.profile === 'Good' ? 4.5 + Math.random() * 0.4 : 
                 driver.profile === 'Bad' ? 2.5 + Math.random() * 0.5 :
                 3.5 + Math.random() * 0.5
    };
  });
  res.json(driversWithMetrics);
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});