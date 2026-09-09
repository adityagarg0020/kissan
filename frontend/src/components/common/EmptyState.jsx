import React from 'react';
import { SearchX } from 'lucide-react';

export default function EmptyState({
  title = 'No Mandi Records Found',
  message = 'Try broadening your search filters (e.g. select All Mandis or check an adjoining district).',
  action
}) {
  return (
    <div className="card" style={{ padding: '2.5rem 1.5rem', textAlign: 'center' }}>
      <div style={{ display: 'inline-flex', padding: '0.75rem', borderRadius: '50%', backgroundColor: 'var(--bg-subtle)', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
        <SearchX size={28} />
      </div>
      <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--primary-dark)' }}>
        {title}
      </div>
      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: '460px', margin: '0.4rem auto 1rem auto' }}>
        {message}
      </p>
      {action && <div>{action}</div>}
    </div>
  );
}
