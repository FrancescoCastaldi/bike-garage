import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Bikes from './pages/Bikes';
import BikeDetail from './pages/BikeDetail';
import Components from './pages/Components';
import Consumables from './pages/Consumables';
import Activities from './pages/Activities';
import ActivityDetail from './pages/ActivityDetail';

export default function App() {
  return (
    <Router>
      <div className="app-layout">
        <aside className="sidebar">
          <div className="sidebar-logo">
            <span className="logo-icon">🚴</span>
            <span className="logo-text">Bike Garage</span>
          </div>
          <nav className="sidebar-nav">
            <NavLink to="/" end className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>
              <span className="nav-icon">📊</span> Dashboard
            </NavLink>
            <NavLink to="/bikes" className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>
              <span className="nav-icon">🚲</span> Le Mie Bici
            </NavLink>
            <NavLink to="/components" className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>
              <span className="nav-icon">🔧</span> Componenti
            </NavLink>
            <NavLink to="/consumables" className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>
              <span className="nav-icon">🧴</span> Consumabili
            </NavLink>
            <NavLink to="/activities" className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>
              <span className="nav-icon">🗺️</span> Attivita
            </NavLink>
          </nav>
        </aside>
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
