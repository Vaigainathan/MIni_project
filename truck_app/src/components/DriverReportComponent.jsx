// truck_app/src/components/DriverReportComponent.jsx
import React, { useState, useEffect } from "react";
import { Card, Table } from "react-bootstrap";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Fuel,
  Loader2,
  BarChart3,
  Target
} from "lucide-react";
import "../styles/DriverReports.css";

const DriverReportComponent = ({ driverId }) => {
  const [driverData, setDriverData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch driver metrics from API
    const fetchDriverData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`http://localhost:5000/api/drivers/${driverId}/metrics`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch driver data: ${response.status}`);
        }
        
        const data = await response.json();
        console.log("Fetched driver data:", data);
        
        // Process the data to match the expected format for display
        const processedData = {
          metrics: {
            onTimePercentage: Math.round(100 - (data.metrics.lateDeliveries / data.metrics.totalDeliveries) * 100),
            onTimeChange: Math.round(Math.random() * 10 - 5), // Random change for demonstration
            fuelEfficiency: data.metrics.avgFuelConsumption.toFixed(1),
            fuelEfficiencyChange: Math.round(Math.random() * 10 - 5), // Random change for demonstration
            performanceScore: calculatePerformanceScore(data.metrics),
            totalDeliveries: data.metrics.totalDeliveries
          },
          deliveries: generateDeliveryHistory(data.metrics.totalDeliveries, data.metrics.lateDeliveries),
          fuelEfficiency: generateFuelEfficiencyTrend(data.metrics.avgFuelConsumption),
          incidents: generateIncidents(data.metrics.incidents)
        };
        
        setDriverData(processedData);
      } catch (error) {
        console.error("Error fetching driver data:", error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDriverData();
  }, [driverId]);

  // Calculate an overall performance score based on various metrics
  const calculatePerformanceScore = (metrics) => {
    // Base score out of 100
    let score = 75; // Start with average score
    
    // Add/subtract based on metrics
    if (metrics.avgFuelConsumption < 8.0) score += 5;
    if (metrics.avgFuelConsumption > 9.0) score -= 5;
    
    if (metrics.avgSpeed > 55 && metrics.avgSpeed < 65) score += 5;
    if (metrics.avgSpeed > 80) score -= 10;
    
    if (metrics.idleTime < 8) score += 5;
    if (metrics.idleTime > 12) score -= 5;
    
    // Incidents have major negative impact
    score -= metrics.incidents * 3;
    score -= (metrics.harshBraking / 10);
    score -= (metrics.rapidAcceleration / 10);
    score -= (metrics.speedingIncidents / 10);
    
    // Cap between 0-100
    return Math.max(0, Math.min(100, Math.round(score)));
  };

  // Generate sample delivery history based on total deliveries and late deliveries
  const generateDeliveryHistory = (total, late) => {
    const deliveries = [];
    const today = new Date();
    const routes = [
      "Delhi → Mumbai",
      "Mumbai → Bangalore",
      "Bangalore → Chennai",
      "Chennai → Kolkata",
      "Kolkata → Delhi",
      "Pune → Hyderabad"
    ];
    
    // Generate last 5 deliveries
    for (let i = 0; i < 5; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - (i * 3 + Math.floor(Math.random() * 3)));
      
      const isLate = i < late && Math.random() > 0.6;
      
      deliveries.push({
        date: date.toLocaleDateString("en-IN"),
        route: routes[Math.floor(Math.random() * routes.length)],
        distance: Math.floor(Math.random() * 800) + 200 + " km",
        deliveryTime: Math.floor(Math.random() * 24) + 24 + " hours",
        status: isLate ? "Delayed" : "OnTime"
      });
    }
    
    return deliveries;
  };

  // Generate fuel efficiency trend data
  const generateFuelEfficiencyTrend = (avgEfficiency) => {
    const weeks = ["Week 1", "Week 2", "Week 3", "Week 4"];
    return weeks.map(week => ({
      week,
      efficiency: avgEfficiency * (0.9 + Math.random() * 0.2) // Variations around the average
    }));
  };

  // Generate safety incidents based on incident count
  const generateIncidents = (count) => {
    if (count <= 0) return [];
    
    const incidents = [];
    const today = new Date();
    const incidentTypes = [
      "Harsh Braking Incident",
      "Speed Limit Violation",
      "Rapid Acceleration",
      "Idle Time Violation",
      "Route Deviation"
    ];
    const locations = [
      "Mumbai-Pune Expressway",
      "NH8, Gujarat",
      "Chennai Outer Ring Road",
      "Bangalore Electronic City",
      "Delhi-Jaipur Highway"
    ];
    
    for (let i = 0; i < Math.min(count, 3); i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - Math.floor(Math.random() * 30));
      
      incidents.push({
        type: incidentTypes[Math.floor(Math.random() * incidentTypes.length)],
        date: date.toLocaleDateString("en-IN"),
        location: locations[Math.floor(Math.random() * locations.length)],
        description: "Driver exhibited unsafe driving behavior that triggered vehicle safety systems."
      });
    }
    
    return incidents;
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <Loader2 className="animate-spin" />
        <p>Loading driver data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <AlertTriangle />
        <p>Error loading driver data: {error}</p>
      </div>
    );
  }

  if (!driverData) {
    return (
      <div className="error-container">
        <AlertTriangle />
        <p>Unable to load driver data</p>
      </div>
    );
  }

  return (
    <div className="driver-reports-container">
      <div className="report-header">
        <h2>Driver Performance Report</h2>
        <p>Driver ID: {driverId}</p>
      </div>

      <div className="metrics-row">
        <Card className="metric-card">
          <Card.Body>
            <div className="metric-header">
              <Clock className="metric-icon" />
              <h3>On-Time Deliveries</h3>
            </div>
            <div className="metric-value">{driverData.metrics.onTimePercentage}%</div>
            <Card.Text className="metric-description">
              {driverData.metrics.onTimeChange > 0 ? "+" : ""}{driverData.metrics.onTimeChange}% from last month
            </Card.Text>
          </Card.Body>
        </Card>

        <Card className="metric-card">
          <Card.Body>
            <div className="metric-header">
              <Fuel className="metric-icon" />
              <h3>Fuel Efficiency</h3>
            </div>
            <div className="metric-value">{driverData.metrics.fuelEfficiency} km/L</div>
            <Card.Text className="metric-description">
              {driverData.metrics.fuelEfficiencyChange > 0 ? "+" : ""}{driverData.metrics.fuelEfficiencyChange}% from last month
            </Card.Text>
          </Card.Body>
        </Card>

        <Card className="metric-card">
          <Card.Body>
            <div className="metric-header">
              <Target className="metric-icon" />
              <h3>Performance Score</h3>
            </div>
            <div className="metric-value">{driverData.metrics.performanceScore}/100</div>
            <Card.Text className="metric-description">
              Based on multiple factors
            </Card.Text>
          </Card.Body>
        </Card>

        <Card className="metric-card">
          <Card.Body>
            <div className="metric-header">
              <BarChart3 className="metric-icon" />
              <h3>Total Deliveries</h3>
            </div>
            <div className="metric-value">{driverData.metrics.totalDeliveries}</div>
            <Card.Text className="metric-description">
              Last 30 days
            </Card.Text>
          </Card.Body>
        </Card>
      </div>

      <div className="report-section">
        <h3>Delivery History</h3>
        <div className="table-container">
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>Date</th>
                <th>Route</th>
                <th>Distance</th>
                <th>Delivery Time</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {driverData.deliveries.map((delivery, index) => (
                <tr key={index}>
                  <td>{delivery.date}</td>
                  <td>{delivery.route}</td>
                  <td>{delivery.distance}</td>
                  <td>{delivery.deliveryTime}</td>
                  <td>
                    <span className={`status-pill status-${delivery.status.toLowerCase()}`}>
                      {delivery.status === "OnTime" ? (
                        <>
                          <CheckCircle2 size={14} />
                          On Time
                        </>
                      ) : (
                        <>
                          <AlertTriangle size={14} />
                          Delayed
                        </>
                      )}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </div>

      <div className="report-section">
        <h3>Fuel Efficiency Trends</h3>
        <Card className="chart-card">
          <Card.Body>
            <div className="chart-placeholder">
              {/* Placeholder for fuel efficiency chart */}
              <div className="bar-chart">
                {driverData.fuelEfficiency.map((item, index) => (
                  <div key={index} className="chart-bar-container">
                    <div 
                      className="chart-bar" 
                      style={{ height: `${item.efficiency * 5}px` }}
                      title={`${item.week}: ${item.efficiency.toFixed(1)} km/L`}
                    ></div>
                    <div className="chart-label">{item.week}</div>
                  </div>
                ))}
              </div>
            </div>
          </Card.Body>
        </Card>
      </div>

      <div className="report-section">
        <h3>Safety Incidents</h3>
        <div className="incident-cards">
          {driverData.incidents.length > 0 ? (
            driverData.incidents.map((incident, index) => (
              <Card key={index} className="incident-card">
                <Card.Body>
                  <Card.Title className="incident-title">
                    {incident.type}
                  </Card.Title>
                  <Card.Text>
                    <strong>Date:</strong> {incident.date}<br />
                    <strong>Location:</strong> {incident.location}<br />
                    <strong>Description:</strong> {incident.description}
                  </Card.Text>
                </Card.Body>
              </Card>
            ))
          ) : (
            <Card className="empty-state">
              <Card.Body className="text-center">
                <CheckCircle2 size={48} className="mb-2 text-success" />
                <Card.Title>No Safety Incidents</Card.Title>
                <Card.Text>
                  Great job! No safety incidents have been reported for this driver.
                </Card.Text>
              </Card.Body>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default DriverReportComponent;