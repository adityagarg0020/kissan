import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Home,
  TrendingUp,
  MapPin,
  Scale,
  BarChart2,
  Sparkles,
  Wheat,
  Bell,
  ShieldCheck
} from 'lucide-react';
import { useMarket } from '../../context/MarketContext';

export const NAV_ITEMS = [
  { path: '/', label: 'Dashboard', icon: Home, emoji: '🏠' },
  { path: '/market', label: 'Live Mandi Prices', icon: TrendingUp, emoji: '📈' },
  { path: '/nearby-mandis', label: 'Nearby Mandis', icon: MapPin, emoji: '📍' },
  { path: '/comparison', label: 'Price Comparison', icon: Scale, emoji: '⚖️' },
  { path: '/historical', label: 'Historical Analysis', icon: BarChart2, emoji: '📊' },
  { path: '/prediction', label: 'AI Price Prediction', icon: Sparkles, emoji: '🤖' },
  { path: '/sell-decision', label: 'Sell Decision', icon: Wheat, emoji: '🌾' },
  { path: '/alerts', label: 'Price Alerts', icon: Bell, emoji: '🔔' }
];

export default function Sidebar({ onCloseMobile }) {
  const { alertsCount, filters } = useMarket();

  return (
    <aside className="app-sidebar" aria-label="Main Navigation">
      {/* Brand & Identity */}
      <div className="sidebar-brand-box">
        <div className="sih-tag" style={{ fontSize: '0.68rem', marginBottom: '0.4rem' }}>
          SIH26127 &bull; Smart India Hackathon
        </div>
        <div className="sidebar-logo">
          <span style={{ fontSize: '1.4rem' }}>🌾</span>
          <span className="brand-title">KisanSaathi</span>
        </div>
        <p className="sidebar-tagline">
          Agricultural Market Intelligence & AI Decision Support
        </p>
      </div>

      {/* Navigation List */}
      <nav className="sidebar-nav">
        <ul className="nav-list">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.path} className="nav-item">
                <NavLink
                  to={item.path}
                  end={item.path === '/'}
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                  onClick={() => {
                    if (onCloseMobile) onCloseMobile();
                  }}
                >
                  <span className="nav-emoji">{item.emoji}</span>
                  <span className="nav-text">{item.label}</span>

                  {item.path === '/alerts' && alertsCount > 0 && (
                    <span className="nav-counter-badge">{alertsCount}</span>
                  )}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Farmer Active Selection Info */}
      <div className="sidebar-crop-summary">
        <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'rgba(255, 255, 255, 0.65)', fontWeight: 700, letterSpacing: '0.04em' }}>
          Active Selection
        </div>
        <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#ffffff', marginTop: '0.2rem' }}>
          🌾 {filters.commodity || 'Wheat'}
        </div>
        <div style={{ fontSize: '0.78rem', color: 'rgba(255, 255, 255, 0.8)', marginTop: '0.1rem' }}>
          {filters.district ? `${filters.district}, ${filters.state}` : filters.state}
        </div>
      </div>

      {/* Official Government Data Badge */}
      <div className="sidebar-footer">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.72rem', color: 'rgba(255, 255, 255, 0.7)' }}>
          <ShieldCheck size={14} color="var(--primary-mint)" />
          <span>Official Agmarknet Data</span>
        </div>
        <div style={{ fontSize: '0.68rem', color: 'rgba(255, 255, 255, 0.5)', marginTop: '0.2rem' }}>
          40,309 Records &bull; 10-Yr Series
        </div>
      </div>
    </aside>
  );
}
