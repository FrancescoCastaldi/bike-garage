import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { APP_INFO } from '../../constants';

const NAV_ITEMS = [
  { to: '/', end: true, icon: '📊', label: 'Dashboard' },
  { to: '/bikes', icon: '🚲', label: 'Le Mie Bici' },
  { to: '/components', icon: '🔧', label: 'Componenti' },
  { to: '/consumables', icon: '🗂️', label: 'Consumabili' },
  { to: '/activities', icon: '⚡', label: 'Attività' },
];

export function Sidebar() {
  const location = useLocation();
  
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <span className="logo-icon">🚲</span>
        <span className="logo-text">{APP_INFO.name}</span>
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
        <span className="version">v{APP_INFO.version}</span>
      </div>
    </aside>
  );
}

export default Sidebar;
