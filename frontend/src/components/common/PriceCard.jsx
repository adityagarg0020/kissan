import React from 'react';
import { MapPin, Tag, ShieldCheck, AlertTriangle } from 'lucide-react';

export default function PriceCard({ priceData, compact = false, showSpread = true }) {
  if (!priceData) return null;

  const {
    commodity,
    variety,
    grade,
    market,
    district,
    state,
    modal_price,
    min_price,
    max_price,
    price_spread,
    display_date,
    arrival_date,
    freshness,
    source,
    disclaimer
  } = priceData;

  const dateStr = display_date || arrival_date || 'Recent';

  return (
    <div className={`price-hero-card ${compact ? 'price-card-compact' : ''}`}>
      <div className="price-hero-header">
        <div>
          <div className="crop-name-hero">
            🌾 {commodity}
          </div>
          <div className="location-breadcrumbs">
            <MapPin size={15} color="var(--primary)" />
            <strong>{market}</strong> &bull; {district}, {state}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {variety && variety !== 'Other' && (
            <span className="card-badge">
              <Tag size={12} style={{ display: 'inline', marginRight: '3px' }} />
              {variety}
            </span>
          )}
          {grade && (
            <span className="card-badge" style={{ backgroundColor: 'var(--blue-wash)', borderColor: '#a5d8ff', color: 'var(--accent-blue)' }}>
              Grade: {grade}
            </span>
          )}
        </div>
      </div>

      {/* Primary Price Statistics */}
      <div className="price-stat-grid">
        <div className="modal-price-box">
          <div className="modal-price-label">Current Reported Modal Price</div>
          <div className="modal-price-value">
            ₹{Number(modal_price).toLocaleString('en-IN')}
            <span style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--primary-soft)', marginLeft: '0.4rem' }}>
              / quintal
            </span>
          </div>
          <div style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.7)' }}>
            Most frequent auction rate in session
          </div>
        </div>

        <div className="secondary-price-box">
          <div className="secondary-price-label">Minimum Price</div>
          <div className="secondary-price-value" style={{ color: 'var(--text-secondary)' }}>
            ₹{Number(min_price).toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>/ quintal</div>
        </div>

        <div className="secondary-price-box">
          <div className="secondary-price-label">Maximum Price</div>
          <div className="secondary-price-value" style={{ color: 'var(--primary-dark)' }}>
            ₹{Number(max_price).toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>/ quintal</div>
        </div>
      </div>

      {showSpread && price_spread > 0 && (
        <div style={{ marginTop: '0.85rem', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
          Daily auction spread: <strong>₹{Number(price_spread).toLocaleString('en-IN')}/q</strong> (between min and max grades).
        </div>
      )}

      {freshness && (
        <div className={`freshness-banner ${freshness.status || 'fresh'}`}>
          {freshness.status === 'fresh' ? (
            <ShieldCheck size={18} color="var(--primary)" />
          ) : (
            <AlertTriangle size={18} color="var(--accent-red)" />
          )}
          <div>
            <span><strong>Arrival date:</strong> {dateStr} &bull; {freshness.message || 'Official Mandi Session'}</span>
          </div>
        </div>
      )}

      {(source || disclaimer) && (
        <div style={{ marginTop: '0.75rem', fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
          {source && <span>Source: {source}</span>}
          {disclaimer && <span>{disclaimer}</span>}
        </div>
      )}
    </div>
  );
}
