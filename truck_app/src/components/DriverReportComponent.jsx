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

// Mock historical driver data - In real app, this would come from API/database
const generateHistoricalData = (driverId) => {
  const baseMetrics = {
    1: { avgFuel: 8.5, avgSpeed: 55, avgDeliveryTime: 48 },
    2: { avgFuel: 9.2, avgSpeed: 62, avgDeliveryTime: 44 },
    3: { avgFuel: 7.8, avgSpeed: 58, avgDeliveryTime: 52 },
    4: { avgFuel: 8.0, avgSpeed: 65, avgDeliveryTime: 46 },
    5: { avgFuel: 8.8, avgSpeed: 54, avgDeliveryTime: 50 },
    0: { avgFuel: 10.8, avgSpeed: 50.3, avgDeliveryTime: 54.3 } // Bad driver example
  };
  
  const base = baseMetrics[driverId] || baseMetrics[1];
  
  return {
    avgFuelConsumption: base.avgFuel,
    avgSpeed: base.avgSpeed,
    avgDeliveryTime: base.avgDeliveryTime,
    totalDeliveries: driverId === 0 ? 135 : Math.floor(Math.random() * 50) + 100,
    totalDistance: driverId === 0 ? 43000 : Math.floor(Math.random() * 10000) + 50000,
    incidents: driverId === 0 ? 8 : Math.floor(Math.random() * 5),
    lateDeliveries: driverId === 0 ? 25 : Math.floor(Math.random() * 10) + 5,
    idleTime: driverId === 0 ? 18 : Math.random() * 15 + 5, // percentage
    harshBraking: driverId === 0 ? 32 : Math.floor(Math.random() * 20) + 10,
    rapidAcceleration: driverId === 0 ? 28 : Math.floor(Math.random() * 15) + 5,
    speedingIncidents: driverId === 0 ? 35 : Math.floor(Math.random() * 25) + 10
  };
};

// Industry benchmarks
const BENCHMARKS = {
  fuelConsumption: { excellent: 7.5, good: 8.5, poor: 10 },
  avgSpeed: { excellent: 60, good: 55, poor: 50 },
  deliveryTime: { excellent: 42, good: 48, poor: 54 },
  idleTime: { excellent: 5, good: 10, poor: 15 },
  lateDeliveryRate: { excellent: 5, good: 10, poor: 15 }
};

const DriverReportComponent = ({ driverId }) => {
  const [performanceData, setPerformanceData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate API call to get driver data
    setIsLoading(true);
    setTimeout(() => {
      const data = generateHistoricalData(driverId);
      setPerformanceData(data);
      setIsLoading(false);
    }, 1000);
  }, [driverId]);

  if (isLoading) {
    return (
      <div className="loading-container">
        <Loader2 className="animate-spin" />
        <p>Loading driver data...</p>
      </div>
    );
  }

  if (!performanceData) {
    return (
      <div className="error-container">
        <AlertTriangle />
        <p>Unable to load driver data</p>
      </div>
    );
  }

  const { metrics, deliveries, fuelEfficiency, incidents } = performanceData;

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
            <div className="metric-value">{metrics.onTimePercentage}%</div>
            <Card.Text className="metric-description">
              {metrics.onTimeChange > 0 ? "+" : ""}{metrics.onTimeChange}% from last month
            </Card.Text>
          </Card.Body>
        </Card>

        <Card className="metric-card">
          <Card.Body>
            <div className="metric-header">
              <Fuel className="metric-icon" />
              <h3>Fuel Efficiency</h3>
            </div>
            <div className="metric-value">{metrics.fuelEfficiency} km/L</div>
            <Card.Text className="metric-description">
              {metrics.fuelEfficiencyChange > 0 ? "+" : ""}{metrics.fuelEfficiencyChange}% from last month
            </Card.Text>
          </Card.Body>
        </Card>

        <Card className="metric-card">
          <Card.Body>
            <div className="metric-header">
              <Target className="metric-icon" />
              <h3>Performance Score</h3>
            </div>
            <div className="metric-value">{metrics.performanceScore}/100</div>
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
            <div className="metric-value">{metrics.totalDeliveries}</div>
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
              {deliveries.map((delivery, index) => (
                <tr key={index}>
                  <td>{delivery.date}</td>
                  <td>{delivery.route}</td>
                  <td>{delivery.distance} km</td>
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
                {fuelEfficiency.map((item, index) => (
                  <div key={index} className="chart-bar-container">
                    <div 
                      className="chart-bar" 
                      style={{ height: `${item.efficiency * 5}px` }}
                      title={`${item.week}: ${item.efficiency} km/L`}
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
          {incidents.length > 0 ? (
            incidents.map((incident, index) => (
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