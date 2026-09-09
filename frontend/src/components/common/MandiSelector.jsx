import React from 'react';

export default function MandiSelector({
  value,
  onChange,
  markets = [],
  disabled = false,
  id = 'mandi-selector',
  label = 'Mandi / Market',
  showAllOption = true,
  placeholder = '-- Select District First --'
}) {
  return (
    <div className="form-group">
      {label && <label className="form-label" htmlFor={id}>{label}</label>}
      <select
        id={id}
        className="form-select"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
      >
        {showAllOption && <option value="">-- All Mandis --</option>}
        {!showAllOption && <option value="">{placeholder}</option>}
        {markets.map((m) => (
          <option key={m} value={m}>{m}</option>
        ))}
      </select>
    </div>
  );
}
