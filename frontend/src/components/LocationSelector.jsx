import React, { useState } from 'react';
import { MapPin, Navigation, CheckCircle, AlertCircle } from 'lucide-react';

export default function LocationSelector({ userLocation, onLocationChange }) {
  const [locating, setLocating] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setErrorMsg('Geolocation is not supported by your browser.');
      return;
    }

    setLocating(true);
    setErrorMsg(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setLocating(false);

        // Approximate nearest known agricultural district center
        // e.g. If in north India near 27N, 78E -> Agra/Mathura
        onLocationChange({
          lat: Math.round(lat * 10000) / 10000,
          lng: Math.round(lng * 10000) / 10000,
          district: userLocation.district || 'Agra',
          state: userLocation.state || 'Uttar Pradesh',
          method: 'GPS'
        });
      },
      (error) => {
        setLocating(false);
        let msg = 'Could not acquire GPS position.';
        if (error.code === 1) msg = 'Location access permission was denied. Please select your district manually below.';
        else if (error.code === 2) msg = 'Position unavailable. Please select your district manually.';
        else if (error.code === 3) msg = 'Location request timed out. Please select your district manually.';
        setErrorMsg(msg);
      },
      { timeout: 10000, maximumAge: 60000 }
    );
  };

  return (
    <div className="card" style={{ padding: '1rem 1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.04em' }}>
            📍 Farmer Location
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 700, color: 'var(--primary-deep)', marginTop: '0.1rem' }}>
            {userLocation.district ? `${userLocation.district}, ${userLocation.state}` : 'Location Not Set'}
          </div>
          {userLocation.lat && userLocation.lng && (
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              GPS: {userLocation.lat}° N, {userLocation.lng}° E ({userLocation.method || 'Manual'})
            </div>
          )}
        </div>

        <button 
          className="btn btn-location"
          onClick={handleUseMyLocation}
          disabled={locating}
        >
          <Navigation size={16} className={locating ? 'spin' : ''} />
          {locating ? 'Detecting Location...' : '📍 Use My Location'}
        </button>
      </div>

      {errorMsg && (
        <div style={{ marginTop: '0.75rem', fontSize: '0.82rem', color: 'var(--accent-red)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <AlertCircle size={15} /> {errorMsg}
        </div>
      )}
    </div>
  );
}
