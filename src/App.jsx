import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Sidebar } from './components/layout';
import Dashboard from './pages/Dashboard';
import Bikes from './pages/Bikes';
import BikeDetail from './pages/BikeDetail';
import Components from './pages/Components';
import Consumables from './pages/Consumables';
import Activities from './pages/Activities';
import ActivityDetail from './pages/ActivityDetail';

export default function App() {
  return (
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
  );
}
