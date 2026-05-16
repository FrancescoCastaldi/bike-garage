import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, NavLink, useLocation } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Bikes from './pages/Bikes';
import BikeDetail from './pages/BikeDetail';
import Components from './pages/Components';
import Consumables from './pages/Consumables';
import Activities from './pages/Activities';
import ActivityDetail from './pages/ActivityDetail';
import './index.css';

const NAV_ITEMS = [
  { to: '/', end: true, icon: '📊', label: 'Dashboard' },
  { to: '/bikes', icon: '🚲', label: 'Le Mie Bici' },
  { to: '/components', icon: '🔧', label: 'Componenti' },
  { to: '/consumables', icon: '🗂️', label: 'Consumabili' },
  { to: '/activities', icon: '⚡', label: 'Attività' },
];

function Sidebar() {
  const location = useLocation();
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <span className="logo-icon">🚲</span>
        <span className="logo-text">Bike Garage</span>
      </div>
      <nav className="sidebar-nav">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="sidebar-footer">
        <span className="version">v1.0.0</span>
      </div>
    </aside>
  );
}

export default function App() {
  return (
    <Router>
      <div className="app-layout">
        <Sidebar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/bikes" element={<Bikes />} />
            <Route path="/bikes/:id" element={<BikeDetail />} />
            <Route path="/components" element={<Components />} />
            <Route path="/consumables" element={<Consumables />} />
            <Route path="/activities" element={<Activities />} />
                          <Route path="/activities/:id" element={<ActivityDetail />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
