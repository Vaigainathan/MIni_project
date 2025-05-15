// truck_app/src/components/GoodsTable.jsx - Enhanced with more details
import React from 'react';

function GoodsTable({ goods }) {
  const getStatusClass = (status) => {
    switch(status) {
      case 'Transit': return 'warning';
      case 'Active': return 'success';
      case 'Delivered': return 'info';
      default: return 'secondary';
    }
  };

  return (
    <div className="goods-table-container">
      <table className="table table-striped goods-table">
        <thead>
          <tr>
            <th>Goods ID</th>
            <th>Description</th>
            <th>Quantity</th>
            <th>Weight</th>
            <th>Value</th>
            <th>Destination</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {goods.map((item) => (
            <tr key={item.id}>
              <td>{item.id}</td>
              <td>{item.description}</td>
              <td>{item.quantity}</td>
              <td>{item.weight || 'N/A'}</td>
              <td>{item.value || 'N/A'}</td>
              <td>{item.destination}</td>
              <td>
                <span className={`badge bg-${getStatusClass(item.status)}`}>
                  {item.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default GoodsTable;