import React from 'react';

export default function CropSelector({ value, onChange, commodities = [], id = 'crop-selector', label = 'Crop / Commodity', showAllOption = false }) {
  return (
    <div className="form-group">
      {label && <label className="form-label" htmlFor={id}>{label}</label>}
      <select
        id={id}
        className="form-select"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
      >
        {showAllOption && <option value="">-- All Crops --</option>}
        {!showAllOption && !value && <option value="">-- Select Crop --</option>}
        {commodities.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>
    </div>
  );
}
