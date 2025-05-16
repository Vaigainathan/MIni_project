// truck_app/src/components/DriverReportComponent.jsx
import React, { useState, useEffect } from 'react';
import { 
  User, 
  Fuel, 
  Clock, 
  Gauge, 
  TrendingUp, 
  TrendingDown, 
  AlertCircle,
  CheckCircle,
  BarChart3,
  Target
} from 'lucide-react';
import '../styles/DriverReports.css';
// Import the override CSS AFTER the regular CSS
import '../styles/DriverReportsOverride.css';

// Mock historical driver data - In real app, this would come from API/database
const generateHistoricalData = (driverId) => {
  const baseMetrics = {
    1: { avgFuel: 8.5, avgSpeed: 55, avgDeliveryTime: 48 },
    2: { avgFuel: 9.2, avgSpeed: 62, avgDeliveryTime: 44 },
    3: { avgFuel: 7.8, avgSpeed: 58, avgDeliveryTime: 52 },
    4: { avgFuel: 8.0, avgSpeed: 65, avgDeliveryTime: 46 },
    5: { avgFuel: 8.8, avgSpeed: 54, avgDeliveryTime: 50 }
  };
  
  const base = baseMetrics[driverId] || baseMetrics[1];
  
  return {
    avgFuelConsumption: base.avgFuel + (Math.random() - 0.5) * 0.5, // L/100km
    avgSpeed: base.avgSpeed + (Math.random() - 0.5) * 3, // km/h
    avgDeliveryTime: base.avgDeliveryTime + (Math.random() - 0.5) * 4, // hours
    totalDeliveries: Math.floor(Math.random() * 50) + 100,
    totalDistance: Math.floor(Math.random() * 10000) + 50000,
    incidents: Math.floor(Math.random() * 5),
    lateDeliveries: Math.floor(Math.random() * 10) + 5,
    idleTime: Math.random() * 15 + 5, // percentage
    harshBraking: Math.floor(Math.random() * 20) + 10,
    rapidAcceleration: Math.floor(Math.random() * 15) + 5,
    speedingIncidents: Math.floor(Math.random() * 25) + 10
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

const DriverReportComponent = ({ driverId = 1, driverName = "Rajesh Kumar" }) => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch driver metrics from API
    const fetchDriverMetrics = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/drivers/${driverId}/metrics`);
        const data = await response.json();
        setMetrics(data.metrics);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching driver metrics:', error);
        // Fallback to mock data if API fails
        setMetrics(generateHistoricalData(driverId));
        setLoading(false);
      }
    };

    fetchDriverMetrics();
  }, [driverId]);

  const evaluateMetric = (value, benchmarks, isLowerBetter = true) => {
    if (isLowerBetter) {
      if (value <= benchmarks.excellent) return 'excellent';
      if (value <= benchmarks.good) return 'good';
      return 'poor';
    } else {
      if (value >= benchmarks.excellent) return 'excellent';
      if (value >= benchmarks.good) return 'good';
      return 'poor';
    }
  };

  const getRecommendations = (metrics) => {
    const recommendations = [];
    
    // Fuel consumption analysis
    const fuelEval = evaluateMetric(metrics.avgFuelConsumption, BENCHMARKS.fuelConsumption);
    if (fuelEval === 'poor') {
      recommendations.push({
        category: 'Fuel Efficiency',
        issue: 'High fuel consumption detected',
        suggestions: [
          'Reduce harsh acceleration and sudden braking',
          'Maintain steady speeds on highways',
          'Ensure proper tire pressure maintenance',
          'Schedule regular engine maintenance'
        ]
      });
    }
    
    // Speed maintenance analysis
    const speedEval = evaluateMetric(metrics.avgSpeed, BENCHMARKS.avgSpeed, false);
    if (speedEval === 'poor') {
      recommendations.push({
        category: 'Speed Management',
        issue: 'Below optimal speed average',
        suggestions: [
          'Plan routes to avoid heavy traffic areas',
          'Optimize departure times to minimize congestion',
          'Use highway routes when possible',
          'Monitor and reduce unnecessary stops'
        ]
      });
    }
    
    // Delivery time analysis
    const deliveryEval = evaluateMetric(metrics.avgDeliveryTime, BENCHMARKS.deliveryTime);
    if (deliveryEval === 'poor') {
      recommendations.push({
        category: 'Delivery Efficiency',
        issue: 'Extended delivery times',
        suggestions: [
          'Improve route planning and optimization',
          'Reduce loading/unloading times',
          'Minimize rest stops during peak hours',
          'Use GPS for real-time traffic updates'
        ]
      });
    }
    
    // Idle time analysis
    const idleEval = evaluateMetric(metrics.idleTime, BENCHMARKS.idleTime);
    if (idleEval === 'poor') {
      recommendations.push({
        category: 'Idle Time Reduction',
        issue: 'Excessive engine idling',
        suggestions: [
          'Turn off engine during extended stops',
          'Improve scheduling to reduce waiting times',
          'Use auxiliary power units for cabin comfort',
          'Educate on fuel wastage from idling'
        ]
      });
    }
    
    // Late delivery analysis
    const lateDeliveryRate = (metrics.lateDeliveries / metrics.totalDeliveries) * 100;
    const lateEval = evaluateMetric(lateDeliveryRate, BENCHMARKS.lateDeliveryRate);
    if (lateEval === 'poor') {
      recommendations.push({
        category: 'On-Time Performance',
        issue: 'High rate of late deliveries',
        suggestions: [
          'Add buffer time to delivery schedules',
          'Improve communication with dispatch',
          'Address recurring delay causes',
          'Consider traffic patterns in planning'
        ]
      });
    }
    
    // Driving behavior analysis
    if (metrics.harshBraking > 15 || metrics.rapidAcceleration > 10) {
      recommendations.push({
        category: 'Driving Behavior',
        issue: 'Aggressive driving patterns detected',
        suggestions: [
          'Practice defensive driving techniques',
          'Maintain safe following distances',
          'Anticipate traffic flow changes',
          'Complete advanced driver training'
        ]
      });
    }
    
    return recommendations;
  };

  const getPerformanceScore = (metrics) => {
    const scores = {
      fuel: evaluateMetric(metrics.avgFuelConsumption, BENCHMARKS.fuelConsumption) === 'excellent' ? 100 : 
            evaluateMetric(metrics.avgFuelConsumption, BENCHMARKS.fuelConsumption) === 'good' ? 70 : 40,
      speed: evaluateMetric(metrics.avgSpeed, BENCHMARKS.avgSpeed, false) === 'excellent' ? 100 : 
             evaluateMetric(metrics.avgSpeed, BENCHMARKS.avgSpeed, false) === 'good' ? 70 : 40,
      delivery: evaluateMetric(metrics.avgDeliveryTime, BENCHMARKS.deliveryTime) === 'excellent' ? 100 : 
                evaluateMetric(metrics.avgDeliveryTime, BENCHMARKS.deliveryTime) === 'good' ? 70 : 40,
      behavior: ((30 - metrics.harshBraking) / 30 * 50) + ((20 - metrics.rapidAcceleration) / 20 * 50)
    };
    
    return Math.round((scores.fuel + scores.speed + scores.delivery + scores.behavior) / 4);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-text">Loading driver report...</div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="error-container">
        <AlertCircle className="error-icon" />
        <p className="error-text">Failed to load driver metrics</p>
      </div>
    );
  }

  const recommendations = getRecommendations(metrics);
  const performanceScore = getPerformanceScore(metrics);

  return (
    <div className="driver-report">
      {/* Header */}
      <div className="report-header-card">
        <div className="driver-profile">
          <User className="driver-avatar-icon" />
          <div>
            <h1 className="driver-report-name">{driverName}</h1>
            <p className="driver-report-id">Driver ID: #{driverId.toString().padStart(3, '0')}</p>
          </div>
        </div>
        <div className="performance-score">
          <div className={`score-value ${
            performanceScore >= 80 ? 'score-excellent' : 
            performanceScore >= 60 ? 'score-good' : 'score-poor'
          }`}>
            {performanceScore}
          </div>
          <p className="score-label">Overall Score</p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="metrics-grid">
        {/* Fuel Efficiency */}
        <div className="metric-card">
          <div className="metric-header">
            <Fuel className="metric-icon fuel" />
            <h3 className="metric-title">Fuel Efficiency</h3>
          </div>
          <p className="metric-value">{metrics.avgFuelConsumption.toFixed(1)} L/100km</p>
          <p className={`metric-status ${
            evaluateMetric(metrics.avgFuelConsumption, BENCHMARKS.fuelConsumption) === 'excellent' ? 'status-excellent' :
            evaluateMetric(metrics.avgFuelConsumption, BENCHMARKS.fuelConsumption) === 'good' ? 'status-good' : 'status-poor'
          }`}>
            {evaluateMetric(metrics.avgFuelConsumption, BENCHMARKS.fuelConsumption) === 'excellent' ? 
              <><CheckCircle className="status-icon" />Excellent</> :
              evaluateMetric(metrics.avgFuelConsumption, BENCHMARKS.fuelConsumption) === 'good' ?
              <><AlertCircle className="status-icon" />Good</> :
              <><AlertCircle className="status-icon" />Needs Improvement</>
            }
          </p>
        </div>

        {/* Average Speed */}
        <div className="metric-card">
          <div className="metric-header">
            <Gauge className="metric-icon speed" />
            <h3 className="metric-title">Average Speed</h3>
          </div>
          <p className="metric-value">{metrics.avgSpeed.toFixed(1)} km/h</p>
          <p className={`metric-status ${
            evaluateMetric(metrics.avgSpeed, BENCHMARKS.avgSpeed, false) === 'excellent' ? 'status-excellent' :
            evaluateMetric(metrics.avgSpeed, BENCHMARKS.avgSpeed, false) === 'good' ? 'status-good' : 'status-poor'
          }`}>
            {evaluateMetric(metrics.avgSpeed, BENCHMARKS.avgSpeed, false) === 'excellent' ? 
              <><CheckCircle className="status-icon" />Excellent</> :
              evaluateMetric(metrics.avgSpeed, BENCHMARKS.avgSpeed, false) === 'good' ?
              <><AlertCircle className="status-icon" />Good</> :
              <><AlertCircle className="status-icon" />Below Average</>
            }
          </p>
        </div>

        {/* Delivery Time */}
        <div className="metric-card">
          <div className="metric-header">
            <Clock className="metric-icon time" />
            <h3 className="metric-title">Avg Delivery Time</h3>
          </div>
          <p className="metric-value">{metrics.avgDeliveryTime.toFixed(1)} hrs</p>
          <p className={`metric-status ${
            evaluateMetric(metrics.avgDeliveryTime, BENCHMARKS.deliveryTime) === 'excellent' ? 'status-excellent' :
            evaluateMetric(metrics.avgDeliveryTime, BENCHMARKS.deliveryTime) === 'good' ? 'status-good' : 'status-poor'
          }`}>
            {evaluateMetric(metrics.avgDeliveryTime, BENCHMARKS.deliveryTime) === 'excellent' ? 
              <><CheckCircle className="status-icon" />Excellent</> :
              evaluateMetric(metrics.avgDeliveryTime, BENCHMARKS.deliveryTime) === 'good' ?
              <><AlertCircle className="status-icon" />Good</> :
              <><AlertCircle className="status-icon" />Extended</>
            }
          </p>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <p className="stat-card-label">Total Deliveries</p>
          <p className="stat-card-value">{metrics.totalDeliveries}</p>
        </div>
        <div className="stat-card">
          <p className="stat-card-label">Total Distance</p>
          <p className="stat-card-value">{(metrics.totalDistance/1000).toFixed(0)}k km</p>
        </div>
        <div className="stat-card">
          <p className="stat-card-label">Late Deliveries</p>
          <p className="stat-card-value">{metrics.lateDeliveries}</p>
        </div>
        <div className="stat-card">
          <p className="stat-card-label">Incidents</p>
          <p className="stat-card-value">{metrics.incidents}</p>
        </div>
      </div>

      {/* Driving Behavior */}
      <div className="behavior-card">
        <h2 className="behavior-title">
          <BarChart3 className="section-icon" />
          Driving Behavior Analysis
        </h2>
        <div className="behavior-metrics">
          <div className="behavior-metric">
            <p className="behavior-label">Harsh Braking Events</p>
            <div className="behavior-chart">
              <div className="behavior-bar">
                <div 
                  className="behavior-fill harsh-braking" 
                  style={{width: `${Math.min(metrics.harshBraking * 4, 100)}%`}}
                ></div>
              </div>
              <span className="behavior-value">{metrics.harshBraking}</span>
            </div>
          </div>
          <div className="behavior-metric">
            <p className="behavior-label">Rapid Acceleration</p>
            <div className="behavior-chart">
              <div className="behavior-bar">
                <div 
                  className="behavior-fill rapid-acceleration" 
                  style={{width: `${Math.min(metrics.rapidAcceleration * 5, 100)}%`}}
                ></div>
              </div>
              <span className="behavior-value">{metrics.rapidAcceleration}</span>
            </div>
          </div>
          <div className="behavior-metric">
            <p className="behavior-label">Speeding Incidents</p>
            <div className="behavior-chart">
              <div className="behavior-bar">
                <div 
                  className="behavior-fill speeding" 
                  style={{width: `${Math.min(metrics.speedingIncidents * 3, 100)}%`}}
                ></div>
              </div>
              <span className="behavior-value">{metrics.speedingIncidents}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="recommendations-card">
          <h2 className="recommendations-title">
            <Target className="section-icon" />
            Improvement Recommendations
          </h2>
          <div className="recommendations-list">
            {recommendations.map((rec, index) => (
              <div key={index} className="recommendation-item">
                <h3 className="recommendation-category">{rec.category}</h3>
                <p className="recommendation-issue">{rec.issue}</p>
                <ul className="suggestion-list">
                  {rec.suggestions.map((suggestion, idx) => (
                    <li key={idx} className="suggestion-item">
                      <span className="suggestion-bullet">•</span>
                      <span>{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DriverReportComponent;