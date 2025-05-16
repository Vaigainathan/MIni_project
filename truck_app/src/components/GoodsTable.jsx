// truck_app/src/components/GoodsTable.jsx - Enhanced with more details
import React from 'react';
import '../styles/Dashboard.css';

function GoodsTable({ goods }) {
  if (!goods || goods.length === 0) {
    return <p>No goods data available</p>;
  }
  
  return (
    <table className="goods-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Description</th>
          <th>Quantity</th>
          <th>Weight</th>
          <th>Destination</th>
          <th>Status</th>
          <th>Value</th>
        </tr>
      </thead>
      <tbody>
        {goods.map((item, index) => (
          <tr key={item.id || index}>
            <td>{item.id}</td>
            <td>{item.description}</td>
            <td>{item.quantity}</td>
            <td>{item.weight}</td>
            <td>{item.destination}</td>
            <td>
              <span className={`status-badge status-${(item.status || '').toLowerCase()}`}>
                {item.status}
              </span>
            </td>
            <td>{item.value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default GoodsTable;