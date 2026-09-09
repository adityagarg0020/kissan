import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Home,
  TrendingUp,
  MapPin,
  Wheat,
  Bell,
  X
} from 'lucide-react';
import Sidebar from './Sidebar';

export default function MobileNavigation({ isOpen, onClose }) {
  const bottomItems = [
    { path: '/', label: 'Home', icon: Home, emoji: '🏠' },
    { path: '/market', label: 'Prices', icon: TrendingUp, emoji: '📈' },
    { path: '/nearby-mandis', label: 'Nearby', icon: MapPin, emoji: '📍' },
    { path: '/sell-decision', label: 'Decision', icon: Wheat, emoji: '🌾' },
    { path: '/alerts', label: 'Alerts', icon: Bell, emoji: '🔔' }
  ];

  return (
    <>
      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div className="mobile-drawer-overlay" onClick={onClose} aria-hidden="true">
          <div
            className="mobile-drawer-content"
            onClick={(e) => e.stopPropagation()}
            aria-label="Mobile Navigation Menu"
          >
            <div className="mobile-drawer-header">
              <span style={{ fontWeight: 700, color: 'var(--primary-dark)', fontSize: '1.1rem' }}>
                🌾 KisanSaathi Menu
              </span>
              <button
                onClick={onClose}
                className="btn-close-drawer"
                aria-label="Close menu"
              >
                <X size={20} />
              </button>
            </div>
            <Sidebar onCloseMobile={onClose} />
          </div>
        </div>
      )}

      {/* Compact Bottom Navigation Bar */}
      <nav className="mobile-bottom-bar" aria-label="Quick Mobile Navigation">
        {bottomItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}
            >
              <Icon size={18} className="bottom-nav-icon" />
              <span className="bottom-nav-label">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </>
  );
}
