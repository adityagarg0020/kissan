import React, { useState, useEffect } from 'react';
import { Bell, Plus, CheckCircle, ShieldCheck } from 'lucide-react';
import { useMarket } from '../context/MarketContext';
import CropSelector from '../components/common/CropSelector';
import StateSelector from '../components/common/StateSelector';
import AlertCard from '../components/common/AlertCard';
import LoadingState from '../components/common/LoadingState';
import EmptyState from '../components/common/EmptyState';

export default function AlertsPage() {
  const { filters, commodities, states, setAlertsCount } = useMarket();

  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);

  // Form states
  const [selectedCrop, setSelectedCrop] = useState(filters.commodity || 'Wheat');
  const [selectedState, setSelectedState] = useState(filters.state || 'Uttar Pradesh');
  const [alertType, setAlertType] = useState('above');
  const [targetPrice, setTargetPrice] = useState(2600);
  const [thresholdPct, setThresholdPct] = useState(5);
  const [successMsg, setSuccessMsg] = useState(null);

  // Load existing alerts
  const loadAlerts = () => {
    setLoading(true);
    fetch('/api/market/alerts')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.alerts) {
          setAlerts(data.alerts);
          setAlertsCount(data.alerts.length);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load alerts:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadAlerts();
  }, []);

  const handleCreateAlert = (e) => {
    e.preventDefault();

    const payload = {
      commodity: selectedCrop,
      state: selectedState,
      alert_type: alertType,
      target_price: parseFloat(targetPrice) || 2500,
      threshold_pct: parseFloat(thresholdPct) || 5,
      current_price: 2450
    };

    fetch('/api/market/alerts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.alert) {
          const updated = [data.alert, ...alerts];
          setAlerts(updated);
          setAlertsCount(updated.length);
          setSuccessMsg(`Price alert successfully activated for ${selectedCrop}!`);
          setTimeout(() => setSuccessMsg(null), 3500);
        }
      })
      .catch(err => console.error('Failed to create alert:', err));
  };

  const handleDeleteAlert = (id) => {
    fetch(`/api/market/alerts/${id}`, { method: 'DELETE' })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          const updated = alerts.filter(a => a.id !== id);
          setAlerts(updated);
          setAlertsCount(updated.length);
        }
      })
      .catch(err => console.error('Failed to delete alert:', err));
  };

  return (
    <div className="alerts-page">
      {/* Page Header */}
      <div className="page-header-box">
        <h1 className="page-title">
          🔔 Farmer Price Alerts & Notifications
        </h1>
        <p className="page-subtitle">
          Configure real-time threshold notifications for auction price increases, drops, daily volatility spikes, or AI forecast trend changes.
        </p>
      </div>

      {/* 1. Create New Price Alert Form Card */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="card-header">
          <div className="card-title">
            <Plus size={18} color="var(--primary)" /> Create New Price Alert
          </div>
          <span className="card-badge">{alerts.length} Active Alerts</span>
        </div>

        <form onSubmit={handleCreateAlert}>
          <div className="filter-grid" style={{ marginBottom: '1rem' }}>
            {/* Crop */}
            <CropSelector
              value={selectedCrop}
              onChange={(val) => setSelectedCrop(val)}
              commodities={commodities}
              showAllOption={false}
            />

            {/* State */}
            <StateSelector
              value={selectedState}
              onChange={(val) => setSelectedState(val)}
              states={states}
              showAllOption={false}
            />

            {/* Alert Type */}
            <div className="form-group">
              <label className="form-label" htmlFor="alert-type-select">Alert Trigger Condition</label>
              <select
                id="alert-type-select"
                className="form-select"
                value={alertType}
                onChange={(e) => setAlertType(e.target.value)}
              >
                <option value="above">Price Rises Above Target (₹/q)</option>
                <option value="below">Price Drops Below Floor (₹/q)</option>
                <option value="movement">Significant Daily Shift (±%)</option>
                <option value="forecast">AI Forecast Trend Change</option>
              </select>
            </div>

            {/* Conditional Target Input */}
            {(alertType === 'above' || alertType === 'below') && (
              <div className="form-group">
                <label className="form-label" htmlFor="target-price-input">
                  Target Modal Price (₹/quintal)
                </label>
                <input
                  id="target-price-input"
                  type="number"
                  className="form-input"
                  value={targetPrice}
                  onChange={(e) => setTargetPrice(e.target.value)}
                  min="100"
                  step="50"
                  required
                />
              </div>
            )}

            {alertType === 'movement' && (
              <div className="form-group">
                <label className="form-label" htmlFor="threshold-pct-input">
                  Percentage Shift Threshold (±%)
                </label>
                <input
                  id="threshold-pct-input"
                  type="number"
                  className="form-input"
                  value={thresholdPct}
                  onChange={(e) => setThresholdPct(e.target.value)}
                  min="1"
                  max="50"
                  required
                />
              </div>
            )}

            {alertType === 'forecast' && (
              <div className="form-group">
                <label className="form-label">AI Forecast Watch</label>
                <div style={{ padding: '0.65rem', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  Triggers whenever model shifts between Increasing, Decreasing, or Stable.
                </div>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
            <button type="submit" className="btn btn-primary" style={{ padding: '0.65rem 1.25rem' }}>
              <Plus size={16} /> Set Active Alert
            </button>

            {successMsg && (
              <div style={{ color: 'var(--primary)', fontSize: '0.86rem', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600 }}>
                <CheckCircle size={16} /> {successMsg}
              </div>
            )}
          </div>
        </form>
      </div>

      {/* 2. Active Alerts List */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <Bell size={18} color="var(--primary)" /> Your Active Alerts
          </div>
          <button className="btn btn-outline" onClick={loadAlerts} style={{ fontSize: '0.78rem', padding: '0.3rem 0.65rem' }}>
            Refresh Alerts
          </button>
        </div>

        {loading ? (
          <LoadingState message="Loading active alerts..." />
        ) : alerts.length === 0 ? (
          <EmptyState
            title="No Active Alerts Configured"
            message="Set a price alert above to be notified when your crop reaches your desired selling rate or experiences market shifts."
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {alerts.map((al) => (
              <AlertCard
                key={al.id}
                alert={al}
                onDelete={handleDeleteAlert}
              />
            ))}
          </div>
        )}
      </div>

      {/* 3. Advisory Card */}
      <div className="card" style={{ marginTop: '1.5rem', backgroundColor: 'var(--bg-subtle)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
          <ShieldCheck size={22} color="var(--primary)" style={{ flexShrink: 0, marginTop: '0.1rem' }} />
          <div>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--primary-dark)' }}>
              How KisanSaathi Alerts Function
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.25rem', lineHeight: '1.5' }}>
              Every morning when fresh APMC arrival rates are published on Agmarknet, alerts are evaluated against updated auction records. In the live prototype, active alerts simulate instant trigger detection based on the latest 2026 session records.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
