import React from 'react';
import { Menu, Bell, MapPin, Wheat } from 'lucide-react';
import { useLocation, Link } from 'react-router-dom';
import { useMarket } from '../../context/MarketContext';
import { NAV_ITEMS } from './Sidebar';

export default function Navbar({ onToggleMobileMenu }) {
  const location = useLocation();
  const { filters, userLocation, alertsCount } = useMarket();

  // Find active nav item
  const currentItem = NAV_ITEMS.find(item => item.path === location.pathname) || {
    label: 'KisanSaathi',
    emoji: '🌾'
  };

  return (
    <header className="app-top-navbar" aria-label="Header Bar">
      <div className="navbar-left">
        {/* Mobile menu hamburger button */}
        <button
          className="mobile-hamburger-btn"
          onClick={onToggleMobileMenu}
          aria-label="Toggle navigation menu"
        >
          <Menu size={22} />
        </button>

        <div className="navbar-title-group">
          <div className="navbar-current-page">
            <span style={{ marginRight: '0.4rem' }}>{currentItem.emoji}</span>
            <span>{currentItem.label}</span>
          </div>
        </div>
      </div>

      <div className="navbar-right">
        {/* Quick Context Badges */}
        <div className="navbar-badge crop-badge">
          <Wheat size={14} color="var(--primary)" />
          <span>{filters.commodity || 'Wheat'}</span>
        </div>

        <div className="navbar-badge location-badge">
          <MapPin size={14} color="var(--primary)" />
          <span>{userLocation.district || filters.district || 'Agra'}, {userLocation.state || filters.state || 'UP'}</span>
        </div>

        {/* Alerts Link */}
        <Link to="/alerts" className="navbar-alert-btn" aria-label="View Alerts">
          <Bell size={18} />
          {alertsCount > 0 && <span className="alert-dot" />}
        </Link>
      </div>
    </header>
  );
}
