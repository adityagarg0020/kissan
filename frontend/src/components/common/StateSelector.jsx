import React from 'react';

export default function StateSelector({ value, onChange, states = [], id = 'state-selector', label = 'State', showAllOption = false }) {
  return (
    <div className="form-group">
      {label && <label className="form-label" htmlFor={id}>{label}</label>}
      <select
        id={id}
        className="form-select"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
      >
        {showAllOption && <option value="">-- All States --</option>}
        {!showAllOption && !value && <option value="">-- Select State --</option>}
        {states.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>
    </div>
  );
}
