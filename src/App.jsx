import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Sidebar } from './components/layout';
import Dashboard from './features/dashboard/Dashboard';
import Bikes from './features/bikes/Bikes';
import BikeDetail from './features/bikes/BikeDetail';
import Components from './features/components/Components';
import Consumables from './features/consumables/Consumables';
import Activities from './features/activities/Activities';
import ActivityDetail from './features/activities/ActivityDetail';

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
