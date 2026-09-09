import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  MapPin,
  ArrowRight,
  Bell,
  Scale,
  BarChart2,
  Sparkles,
  Wheat
} from 'lucide-react';
import { useMarket } from '../context/MarketContext';
import DataSourceBadge from '../components/common/DataSourceBadge';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { filters, updateFilters, userLocation, tickerItems, alertsCount } = useMarket();

  // Summary statistics
  const [summaryStats, setSummaryStats] = useState({
    totalRecords: 40309,
    totalHistorical: 38550,
    reportingDate: '08 September 2026'
  });

  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    fetch('/api/market/alerts')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.alerts) {
          setAlerts(data.alerts);
        }
      })
      .catch(console.error);
  }, []);

  const handleSelectCrop = (commodity) => {
    updateFilters({ commodity });
    navigate('/market');
  };

  const featureCards = [
    {
      to: '/market',
      title: 'Live Mandi Prices',
      desc: 'Real-time auction rates, modal prices, varieties, and grade spreads across mandis.',
      icon: TrendingUp,
      badge: 'Live Data',
      color: 'var(--primary)'
    },
    {
      to: '/nearby-mandis',
      title: 'Nearby Mandis',
      desc: 'Straight-line Haversine distance, transportation burden tags, and 60/30/10 best mandi picks.',
      icon: MapPin,
      badge: 'Distance Matrix',
      color: '#1b4332'
    },
    {
      to: '/comparison',
      title: 'Price Comparison',
      desc: 'Side-by-side modal price comparison and price spreads across multiple mandis.',
      icon: Scale,
      badge: 'Visual Spread',
      color: '#c8963e'
    },
    {
      to: '/historical',
      title: 'Historical Analysis',
      desc: '10-year state-level monthly Agmarknet patterns, 12-month heatmap, and seasonal cycles.',
      icon: BarChart2,
      badge: '10-Year Series',
      color: '#2d6a4f'
    },
    {
      to: '/prediction',
      title: 'AI Price Prediction',
      desc: '7-day forecast trajectories, confidence bounds, and evaluation metrics (R²=0.928).',
      icon: Sparkles,
      badge: 'Machine Learning',
      color: '#40916c'
    },
    {
      to: '/sell-decision',
      title: 'Sell Decision Support',
      desc: 'Data-backed Sell Now vs Wait guidance explaining price strength and holding factors.',
      icon: Wheat,
      badge: 'Decision Engine',
      color: '#92580c'
    },
    {
      to: '/alerts',
      title: 'Price Alerts',
      desc: 'Custom target rate thresholds, daily percentage shifts, and trend shift notifications.',
      icon: Bell,
      badge: `${alertsCount} Active`,
      color: '#c92a2a'
    }
  ];

  return (
    <div className="dashboard-page">
      {/* 1. Welcome / Farmer Hero Banner */}
      <section className="dashboard-hero-card">
        <div className="dashboard-hero-content">
          <div className="sih-tag">
            SIH26127 &bull; Smart India Hackathon Prototype
          </div>
          <h1 className="dashboard-greeting">
            🌾 Welcome to KisanSaathi
          </h1>
          <p className="dashboard-lead">
            Empowering Indian farmers with transparent mandi auction rates, nearest-market comparison, 10-year historical intelligence, and machine-learning price forecasts.
          </p>

          <div className="dashboard-quick-location">
            <MapPin size={15} color="var(--primary)" />
            <span>Default Market Hub: <strong>{userLocation.district || 'Agra'}, {userLocation.state || 'Uttar Pradesh'}</strong></span>
            <Link to="/nearby-mandis" className="link-inline" style={{ marginLeft: '0.5rem', fontSize: '0.82rem' }}>
              Change Location &rarr;
            </Link>
          </div>
        </div>

        <div className="dashboard-stats-strip">
          <div className="stat-pill">
            <div className="stat-num">{summaryStats.totalRecords.toLocaleString('en-IN')}</div>
            <div className="stat-lbl">Active Mandi Records</div>
          </div>
          <div className="stat-pill">
            <div className="stat-num">{summaryStats.totalHistorical.toLocaleString('en-IN')}</div>
            <div className="stat-lbl">10-Year Historical Points</div>
          </div>
          <div className="stat-pill">
            <div className="stat-num">08 Sep 2026</div>
            <div className="stat-lbl">Mandi Session Freshness</div>
          </div>
        </div>
      </section>

      {/* 2. Selected / Popular Crop Prices (Actual Market Data) */}
      <section className="section-block">
        <div className="section-header-row">
          <div>
            <h2 className="section-title">
              🌾 Popular Mandi Commodities
            </h2>
            <p className="section-subtitle">
              Current session modal rates and recent price movements from official Agmarknet arrivals
            </p>
          </div>
          <Link to="/market" className="btn btn-outline" style={{ fontSize: '0.82rem', padding: '0.35rem 0.75rem' }}>
            View All Mandis &rarr;
          </Link>
        </div>

        <div className="popular-crops-grid">
          {tickerItems.slice(0, 8).map((crop) => (
            <div
              key={crop.commodity}
              className="popular-crop-card"
              onClick={() => handleSelectCrop(crop.commodity)}
              title={`Click to explore ${crop.commodity} prices`}
            >
              <div className="popular-crop-top">
                <span className="crop-title">🌾 {crop.commodity}</span>
                {crop.movement === 'up' && (
                  <span className="ticker-badge up" style={{ fontSize: '0.72rem' }}>
                    <TrendingUp size={12} /> +₹{Math.abs(crop.change)}
                  </span>
                )}
                {crop.movement === 'down' && (
                  <span className="ticker-badge down" style={{ fontSize: '0.72rem' }}>
                    <TrendingDown size={12} /> -₹{Math.abs(crop.change)}
                  </span>
                )}
                {crop.movement === 'neutral' && (
                  <span className="ticker-badge neutral" style={{ fontSize: '0.72rem' }}>
                    <Minus size={12} /> Steady
                  </span>
                )}
              </div>

              <div className="popular-crop-price">
                ₹{crop.modal_price.toLocaleString('en-IN')}
                <span className="price-unit">{crop.unit}</span>
              </div>

              <div className="popular-crop-footer">
                <span>Arrival: {crop.date}</span>
                <span className="crop-action-hint">Explore &rarr;</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Important Active Alerts Banner */}
      {alerts.length > 0 && (
        <section className="alerts-summary-banner">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div className="alert-bell-icon">
              <Bell size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--primary-dark)' }}>
                {alerts.length} Active Price Alerts Configured
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Latest tracking: <strong>{alerts[0].commodity}</strong> ({alerts[0].alert_type === 'above' ? `> ₹${alerts[0].target_price}/q` : `< ₹${alerts[0].target_price}/q`})
              </div>
            </div>
          </div>

          <Link to="/alerts" className="btn btn-outline" style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}>
            Manage Alerts
          </Link>
        </section>
      )}

      {/* 4. Quick Navigation Cards to Major Modules */}
      <section className="section-block">
        <h2 className="section-title">
          🧭 Explore Major Features
        </h2>
        <p className="section-subtitle">
          Jump directly to dedicated analytics, nearest mandi discovery, or decision-support tools
        </p>

        <div className="feature-nav-grid">
          {featureCards.map((feat) => {
            const Icon = feat.icon;
            return (
              <Link to={feat.to} key={feat.to} className="feature-nav-card">
                <div className="feature-card-header">
                  <div className="feature-icon-wrapper" style={{ color: feat.color, backgroundColor: 'var(--bg-subtle)' }}>
                    <Icon size={22} />
                  </div>
                  <span className="feature-pill">{feat.badge}</span>
                </div>

                <h3 className="feature-card-title">{feat.title}</h3>
                <p className="feature-card-desc">{feat.desc}</p>

                <div className="feature-card-action">
                  <span>Open Tool</span>
                  <ArrowRight size={15} />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 5. Data Freshness & Official Transparency Notice */}
      <section className="card" style={{ marginTop: '1.5rem', backgroundColor: 'var(--bg-subtle)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--primary-dark)' }}>
              Data Freshness & Transparency Guarantee
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
              Current mandi rates are extracted from official Agmarknet arrivals via Data.gov.in. 10-year chronological historical statistics reflect verified state-level monthly records.
            </div>
          </div>
          <DataSourceBadge source="Agmarknet Data.gov.in Certified" verified={true} />
        </div>
      </section>
    </div>
  );
}
