import React from 'react';

export default function DistrictSelector({
  value,
  onChange,
  districts = [],
  disabled = false,
  id = 'district-selector',
  label = 'District',
  showAllOption = false,
  placeholder = '-- Select District --'
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
        {showAllOption && <option value="">-- All Districts --</option>}
        {!showAllOption && <option value="">{placeholder}</option>}
        {districts.map((d) => (
          <option key={d} value={d}>{d}</option>
        ))}
      </select>
    </div>
  );
}
