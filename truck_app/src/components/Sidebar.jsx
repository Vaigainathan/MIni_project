import React from 'react';
import { NavLink } from 'react-router-dom';
import logo from '../assets/logo.jpg';

function Sidebar({ active }) {
  return (
    <div className={`sidebar ${active ? 'active' : ''}`}>
      <div className="logo">
        <img src={logo} alt="LogiTrack Logo" />
        <h3>LogiTrack</h3>
        <ul className="nav flex-column">
          <li className="nav-item">
            <NavLink to="/dashboard" className={({ isActive }) => (isActive ? 'active' : '')}>
              Dashboard
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink to="/trucks" className={({ isActive }) => (isActive ? 'active' : '')}>
              Trucks
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink to="/goods" className={({ isActive }) => (isActive ? 'active' : '')}>
              Goods
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink to="/routes" className={({ isActive }) => (isActive ? 'active' : '')}>
              Routes
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink to="/reports" className={({ isActive }) => (isActive ? 'active' : '')}>
              Reports
            </NavLink>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default Sidebar;
