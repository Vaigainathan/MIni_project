import React from 'react';

function GoodsTable({ goods }) {
  return (
    <table className="table goods-table">
      <thead>
        <tr>
          <th>Goods ID</th>
          <th>Description</th>
          <th>Quantity</th>
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
            <td>{item.destination}</td>
            <td>
              <span className={`status-badge status-${item.status.toLowerCase()}`}>
                {item.status}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default GoodsTable;
