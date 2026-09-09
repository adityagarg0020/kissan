import React from 'react';
import { Bell, Trash2 } from 'lucide-react';

export default function AlertCard({ alert, onDelete }) {
  if (!alert) return null;

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0.75rem 1rem',
        backgroundColor: '#ffffff',
        border: '1px solid var(--border-light)',
        borderRadius: 'var(--radius-sm)',
        fontSize: '0.88rem',
        gap: '0.75rem'
      }}
    >
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, color: 'var(--primary-dark)' }}>
          <Bell size={15} color="var(--primary)" />
          🌾 {alert.commodity} {alert.state ? `(${alert.state})` : ''}
        </div>
        <div style={{ color: 'var(--text-secondary)', marginTop: '0.2rem', fontSize: '0.84rem' }}>
          {alert.alert_type === 'above' && `Notify if price rises above ₹${Number(alert.target_price).toLocaleString('en-IN')}/q`}
          {alert.alert_type === 'below' && `Notify if price drops below ₹${Number(alert.target_price).toLocaleString('en-IN')}/q`}
          {alert.alert_type === 'movement' && `Notify on > ${alert.threshold_pct}% daily price shift`}
          {alert.alert_type === 'forecast' && `Notify when AI forecast trajectory shifts`}
        </div>
        {alert.message && (
          <div style={{ fontSize: '0.78rem', color: 'var(--accent-red)', marginTop: '0.2rem', fontWeight: 600 }}>
            {alert.message}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span className="card-badge" style={{ fontSize: '0.72rem', textTransform: 'uppercase' }}>
          {alert.status || 'Active'}
        </span>
        {onDelete && (
          <button
            onClick={() => onDelete(alert.id)}
            style={{ background: 'none', border: 'none', color: '#c92a2a', cursor: 'pointer', padding: '0.3rem', borderRadius: '4px' }}
            title="Delete Alert"
            aria-label="Delete Alert"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
