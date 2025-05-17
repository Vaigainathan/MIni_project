import React, { useState, useEffect } from 'react';
import GoodsTable from '../components/GoodsTable';
import socketService from '../services/socketService';
import { Card } from 'react-bootstrap';
import '../styles/Dashboard.css';

function Goods() {
  const [goods, setGoods] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalGoods: 0,
    totalValue: 0,
    avgWeight: 0
  });

  // Connect to socket server and fetch goods data
  useEffect(() => {
    console.log("Initializing goods page and connecting to socket server...");
    
    // Connect to socket service
    const socket = socketService.connect();

    // Listen for connection events
    socket.on('connect', () => {
      console.log('Socket connected successfully for goods page');
    });

    // Listen for initial data from socket
    socket.on('initial-data', (data) => {
      console.log("Received initial data from server for goods");
      processGoodsData(data);
    });

    // Listen for real-time updates
    socket.on('vehicle-updates', (data) => {
      console.log("Received real-time update for goods data");
      processGoodsData(data);
    });

    // Fetch initial goods data directly via API
    const fetchInitialData = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/vehicles');
        if (response.ok) {
          const data = await response.json();
          processGoodsData(data);
        } else {
          console.error("Failed to fetch initial goods data");
        }
      } catch (error) {
        console.error("Error fetching goods data:", error);
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
      socketService.disconnect();
      console.log("Goods page unmounted, socket disconnected");
    };
  }, []);

  // Process the goods data from vehicles
  const processGoodsData = (vehiclesData) => {
    if (!vehiclesData || !Array.isArray(vehiclesData)) {
      return;
    }
    
    // Extract and format goods data from vehicles
    const goodsItems = vehiclesData.map(vehicle => {
      const goods = vehicle.goods || {};
      return {
        id: vehicle.id,
        description: goods.type || 'Unknown',
        quantity: goods.quantity || 0,
        weight: goods.weight ? `${goods.weight} kg` : 'N/A',
        destination: vehicle.route?.destination || 'Unknown',
        status: vehicle.status || 'Unknown',
        value: goods.value ? `₹${goods.value.toLocaleString()}` : 'N/A',
        origin: vehicle.route?.origin || 'Unknown',
        truckId: vehicle.id,
        driver: vehicle.driver?.name || 'Unknown',
        estimatedDelivery: calculateEstimatedDelivery(vehicle)
      };
    });
    
    setGoods(goodsItems);
    calculateStats(goodsItems);
  };
  
  // Calculate overall statistics
  const calculateStats = (goodsItems) => {
    const totalGoods = goodsItems.length;
    let totalValue = 0;
    let totalWeight = 0;
    
    goodsItems.forEach(item => {
      // Extract numeric value from string
      if (item.value) {
        const value = parseFloat(item.value.replace(/[^\d.-]/g, ''));
        if (!isNaN(value)) totalValue += value;
      }
      
      // Extract numeric weight from string
      if (item.weight) {
        const weight = parseFloat(item.weight.replace(/[^\d.-]/g, ''));
        if (!isNaN(weight)) totalWeight += weight;
      }
    });
    
    const avgWeight = totalGoods > 0 ? Math.round(totalWeight / totalGoods) : 0;
    
    setStats({
      totalGoods,
      totalValue: Math.round(totalValue),
      avgWeight
    });
  };
  
  // Calculate estimated delivery date based on progress
  const calculateEstimatedDelivery = (vehicle) => {
    if (!vehicle.route || !vehicle.speed) return 'Unknown';
    
    const progress = vehicle.route.progress || 0;
    if (progress >= 100) return 'Delivered';
    
    const remainingDistance = vehicle.route.distance ? 
      (vehicle.route.distance * (1 - progress/100)) : 0;
    
    if (!remainingDistance) return 'In Transit';
    
    // Calculate hours remaining based on current speed
    const hoursRemaining = remainingDistance / (vehicle.speed || 60);
    
    // Add hours to current date
    const deliveryDate = new Date();
    deliveryDate.setHours(deliveryDate.getHours() + hoursRemaining);
    
    // Format the date
    return deliveryDate.toLocaleDateString('en-IN', { 
      day: 'numeric', 
      month: 'short', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="dashboard-container">
      <div className="header">
        <h2>Goods Management</h2>
        <div>
          <button className="btn btn-primary">Download Report</button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="row mb-4">
        <div className="stats-card">
          <h5>TOTAL GOODS</h5>
          <h3>{stats.totalGoods}</h3>
        </div>
        <div className="stats-card">
          <h5>TOTAL VALUE</h5>
          <h3>₹{stats.totalValue.toLocaleString()}</h3>
        </div>
        <div className="stats-card">
          <h5>AVERAGE WEIGHT</h5>
          <h3>{stats.avgWeight} kg</h3>
        </div>
        <div className="stats-card">
          <h5>ACTIVE SHIPMENTS</h5>
          <h3>{goods.filter(g => g.status !== 'Delivered').length}</h3>
        </div>
      </div>

      {/* Goods Filter Options */}
      <Card className="mb-4 p-3">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h5 className="mb-0">Goods in Transit</h5>
          </div>
          <div className="d-flex gap-2">
            <select className="form-select form-select-sm">
              <option>All Types</option>
              <option>Electronics</option>
              <option>Textiles</option>
              <option>Food Products</option>
              <option>Industrial Equipment</option>
              <option>Pharmaceuticals</option>
            </select>
            <select className="form-select form-select-sm">
              <option>All Status</option>
              <option>On Route</option>
              <option>Low Fuel</option>
              <option>High Temperature</option>
              <option>Delivered</option>
            </select>
            <button className="btn btn-sm btn-outline-primary">Filter</button>
          </div>
        </div>
      </Card>

      {/* Goods Table */}
      <div className="table-responsive">
        {isLoading ? (
          <div className="text-center p-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3">Loading goods data...</p>
          </div>
        ) : (
          <GoodsTable goods={goods} />
        )}
      </div>

      {/* Additional features could be added here */}
    </div>
  );
}

export default Goods;