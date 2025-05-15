// truck_backend/server.js
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');

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

// Truck fleet data
const TRUCKS = [
  { id: 1, make: 'Volvo', model: 'FH16', registration: 'DL01TC1234', fuelCapacity: 300 },
  { id: 2, make: 'Mercedes-Benz', model: 'Actros', registration: 'MH02AB5678', fuelCapacity: 400 },
  { id: 3, make: 'Scania', model: 'R Series', registration: 'KA03CD9876', fuelCapacity: 350 },
  { id: 4, make: 'Tata', model: 'Prima', registration: 'TN04EF3456', fuelCapacity: 250 },
  { id: 5, make: 'Ashok Leyland', model: 'Captain', registration: 'GJ05GH7890', fuelCapacity: 280 }
];

const DRIVERS = [
  { id: 1, name: 'Rajesh Kumar', license: 'DL1234567', experience: 12, phone: '+91-9876543210' },
  { id: 2, name: 'Amit Singh', license: 'MH7654321', experience: 8, phone: '+91-9876543211' },
  { id: 3, name: 'Suresh Patil', license: 'KA2468135', experience: 15, phone: '+91-9876543212' },
  { id: 4, name: 'Mohammed Ali', license: 'TN1357924', experience: 10, phone: '+91-9876543213' },
  { id: 5, name: 'Deepak Sharma', license: 'GJ3692581', experience: 7, phone: '+91-9876543214' }
];

const HELPERS = [
  { id: 1, name: 'Ravi Verma', phone: '+91-8765432100' },
  { id: 2, name: 'Sanjay Yadav', phone: '+91-8765432101' },
  { id: 3, name: 'Pramod Gupta', phone: '+91-8765432102' },
  { id: 4, name: null }, // No helper
  { id: 5, name: 'Vikram Singh', phone: '+91-8765432103' }
];

const GOODS_CATALOG = [
  { type: 'Electronics', baseWeight: 500, pricePerKg: 100 },
  { type: 'Textiles', baseWeight: 800, pricePerKg: 50 },
  { type: 'Food Products', baseWeight: 1000, pricePerKg: 30 },
  { type: 'Industrial Equipment', baseWeight: 2000, pricePerKg: 200 },
  { type: 'Pharmaceuticals', baseWeight: 300, pricePerKg: 500 }
];

const CITIES = ['Delhi', 'Mumbai', 'Bangalore', 'Chennai', 'Kolkata', 'Pune', 'Hyderabad'];

// Vehicle simulation class
class VehicleSimulator {
  constructor(vehicleId) {
    this.vehicleId = vehicleId;
    this.truck = TRUCKS[vehicleId % TRUCKS.length];
    this.driver = DRIVERS[vehicleId % DRIVERS.length];
    this.helper = HELPERS[vehicleId % HELPERS.length];
    
    // Initialize goods
    const goodsType = GOODS_CATALOG[vehicleId % GOODS_CATALOG.length];
    this.goods = {
      type: goodsType.type,
      quantity: Math.floor(Math.random() * 50) + 20,
      weight: goodsType.baseWeight + Math.floor(Math.random() * 500),
      value: 0
    };
    this.goods.value = this.goods.weight * goodsType.pricePerKg;
    
    // Initialize route
    this.origin = CITIES[Math.floor(Math.random() * CITIES.length)];
    this.destination = CITIES[Math.floor(Math.random() * CITIES.length)];
    while (this.destination === this.origin) {
      this.destination = CITIES[Math.floor(Math.random() * CITIES.length)];
    }
    
    // Initialize position
    this.position = {
      lat: 28.6139 + (Math.random() - 0.5) * 20,
      lng: 77.2090 + (Math.random() - 0.5) * 20
    };
    
    // Initialize vehicle status
    this.status = 'On Route';
    this.speed = Math.floor(Math.random() * 20) + 50; // 50-70 km/h
    this.fuel = Math.floor(Math.random() * 50) + 50; // 50-100%
    this.odometer = Math.floor(Math.random() * 50000) + 100000;
    this.engineTemp = Math.floor(Math.random() * 10) + 85; // 85-95°C
    this.distanceCovered = 0;
  }
  
  update() {
    // Update position (simulate movement)
    this.position.lat += (Math.random() - 0.5) * 0.1;
    this.position.lng += (Math.random() - 0.5) * 0.1;
    
    // Update vehicle metrics
    this.speed = Math.max(40, Math.min(80, this.speed + (Math.random() - 0.5) * 5));
    this.fuel = Math.max(10, this.fuel - 0.1);
    this.engineTemp = Math.max(80, Math.min(100, this.engineTemp + (Math.random() - 0.5) * 2));
    this.distanceCovered += this.speed / 60; // km per minute
    this.odometer += this.speed / 60;
    
    // Update status based on conditions
    if (this.fuel < 20) {
      this.status = 'Low Fuel';
    } else if (this.engineTemp > 95) {
      this.status = 'High Temperature';
    } else if (Math.random() < 0.02) {
      this.status = Math.random() < 0.5 ? 'Rest Stop' : 'Maintenance';
    } else {
      this.status = 'On Route';
    }
    
    return this.getVehicleData();
  }
  
  getVehicleData() {
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
        origin: this.origin,
        destination: this.destination,
        progress: Math.min(100, Math.round((this.distanceCovered / 500) * 100))
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

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});