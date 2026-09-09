import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, Info, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useMarket } from '../context/MarketContext';
import CropSelector from '../components/common/CropSelector';
import StateSelector from '../components/common/StateSelector';
import DistrictSelector from '../components/common/DistrictSelector';
import RecommendationCard from '../components/common/RecommendationCard';
import LoadingState from '../components/common/LoadingState';
import EmptyState from '../components/common/EmptyState';

export default function NearbyMandisPage() {
  const {
    filters,
    updateFilters,
    userLocation,
    setManualLocation,
    setGpsLocation,
    commodities,
    states,
    districts
  } = useMarket();

  const [locating, setLocating] = useState(false);
  const [gpsError, setGpsError] = useState(null);
  const [gpsSuccess, setGpsSuccess] = useState(null);
  const [showWeightsInfo, setShowWeightsInfo] = useState(false);

  const [comparisonData, setComparisonData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Use My Location (GPS) Flow
  const handleUseMyLocation = () => {
    if (locating) return; // Disable duplicate clicks while detection is running

    if (!navigator.geolocation) {
      setGpsError('Your browser does not support location detection. Please select your location manually.');
      return;
    }

    setLocating(true);
    setGpsError(null);
    setGpsSuccess(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = Math.round(position.coords.latitude * 10000) / 10000;
        const lng = Math.round(position.coords.longitude * 10000) / 10000;

        try {
          // Reverse geocode coordinates via backend service
          const res = await fetch(`/api/market/reverse-geocode?lat=${lat}&lng=${lng}`);
          const geoData = await res.json();

          if (geoData.success && geoData.resolved) {
            setGpsLocation({
              lat,
              lng,
              district: geoData.district,
              state: geoData.state,
              city: geoData.city,
              displayName: geoData.display_name,
              matchedInDataset: geoData.matched_in_dataset
            });
            setGpsSuccess(`Location detected: ${geoData.display_name}`);
          } else {
            // Geocoding succeeded but coordinates cannot be named with certainty
            setGpsLocation({
              lat,
              lng,
              district: null,
              state: null,
              city: null,
              displayName: 'Current GPS location (Location name unavailable)',
              matchedInDataset: false
            });
            setGpsSuccess('Location detected from device GPS coordinates.');
          }
        } catch (err) {
          console.warn('Reverse geocoding request error:', err);
          setGpsLocation({
            lat,
            lng,
            district: null,
            state: null,
            city: null,
            displayName: 'Current GPS location (Location name unavailable)',
            matchedInDataset: false
          });
          setGpsSuccess('Location coordinates acquired.');
        } finally {
          setLocating(false);
          setTimeout(() => setGpsSuccess(null), 5000);
        }
      },
      (error) => {
        setLocating(false);
        let msg = 'Unable to determine your current location. Please try again or select manually.';
        if (error.code === 1) {
          msg = 'Location permission denied. Please select your location manually.';
        } else if (error.code === 2) {
          msg = 'Unable to determine your current location. Please try again or select manually.';
        } else if (error.code === 3) {
          msg = 'Location request timed out. Please try again.';
        }
        setGpsError(msg);
      },
      { timeout: 12000, maximumAge: 30000, enableHighAccuracy: true }
    );
  };

  // Fetch Nearby Mandis & Recommendation based on active location mode
  useEffect(() => {
    if (!filters.commodity) return;
    setLoading(true);

    const isGps = userLocation.mode === 'gps';
    const params = new URLSearchParams({
      commodity: filters.commodity
    });

    if (isGps && userLocation.lat && userLocation.lng) {
      // In GPS mode, strictly use actual GPS coordinates
      params.append('lat', userLocation.lat.toString());
      params.append('lng', userLocation.lng.toString());
      if (userLocation.district) {
        params.append('district', userLocation.district);
      }
    } else {
      // In Manual mode, use selected district and manual coordinates if present
      const manualDistrict = userLocation.district || filters.district || 'Agra';
      params.append('district', manualDistrict);
      if (userLocation.lat && userLocation.lng) {
        params.append('lat', userLocation.lat.toString());
        params.append('lng', userLocation.lng.toString());
      }
    }

    fetch(`/api/market/compare?${params.toString()}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setComparisonData(data);
        } else {
          setComparisonData(null);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching nearby mandis:', err);
        setLoading(false);
      });
  }, [
    filters.commodity,
    userLocation.mode,
    userLocation.lat,
    userLocation.lng,
    userLocation.district,
    userLocation.state,
    filters.district
  ]);

  const bestMandi = comparisonData?.best_mandi;
  const comparisonList = comparisonData?.comparison || [];
  const spreadAnalysis = comparisonData?.spread_analysis;
  const isGpsMode = userLocation.mode === 'gps';

  return (
    <div className="nearby-mandis-page">
      {/* Page Header */}
      <div className="page-header-box">
        <h1 className="page-title">
          📍 Nearby Mandis & Distance Proximity
        </h1>
        <p className="page-subtitle">
          Find agricultural markets in your region, evaluate straight-line Haversine distances and transportation burden, and identify top auction rates.
        </p>
      </div>

      {/* 1. Location & Crop Selection Controls */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="card-header">
          <div className="card-title">
            <MapPin size={18} color="var(--primary)" /> Farmer Location & Crop Selection
          </div>
          <button
            className="btn btn-location"
            onClick={handleUseMyLocation}
            disabled={locating}
            style={{ minWidth: '170px' }}
          >
            <Navigation size={15} className={locating ? 'spin' : ''} />
            {locating ? 'Detecting your location...' : '📍 Use My Location'}
          </button>
        </div>

        {gpsError && (
          <div style={{ padding: '0.65rem 0.85rem', backgroundColor: 'var(--red-wash)', borderRadius: 'var(--radius-sm)', color: 'var(--accent-red)', fontSize: '0.84rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.45rem', border: '1px solid #ffa8a8' }}>
            <AlertCircle size={16} /> {gpsError}
          </div>
        )}

        {gpsSuccess && (
          <div style={{ padding: '0.65rem 0.85rem', backgroundColor: '#d8f3dc', borderRadius: 'var(--radius-sm)', color: '#2b8a3e', fontSize: '0.84rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.45rem', border: '1px solid #b2f2bb' }}>
            <CheckCircle2 size={16} /> {gpsSuccess}
          </div>
        )}

        {/* Unified Location Display Banner */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', padding: '0.85rem 1.15rem', backgroundColor: isGpsMode ? '#e7f5ff' : 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)', marginBottom: '1.25rem', borderLeft: isGpsMode ? '4px solid #1971c2' : '4px solid var(--border-medium)' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.76rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>
                Detected Reference Location:
              </span>
              <span className="card-badge" style={{ backgroundColor: isGpsMode ? '#228be6' : 'var(--border-medium)', color: isGpsMode ? '#ffffff' : 'var(--text-main)', fontSize: '0.7rem', padding: '0.15rem 0.45rem' }}>
                {isGpsMode ? '📍 GPS Mode Active' : '📍 Manual Selection Mode'}
              </span>
            </div>

            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: isGpsMode ? '#1864ab' : 'var(--primary-dark)', marginTop: '0.2rem' }}>
              {userLocation.displayName || (userLocation.district ? `${userLocation.district}, ${userLocation.state}` : 'Location Not Set')}
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            {userLocation.lat && userLocation.lng ? (
              <div style={{ fontSize: '0.82rem', color: isGpsMode ? '#1971c2' : 'var(--text-muted)', fontWeight: 600 }}>
                Coordinates: {userLocation.lat}° N, {userLocation.lng}° E ({isGpsMode ? 'GPS' : 'District Center'})
              </div>
            ) : (
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Coordinates: Unavailable
              </div>
            )}
            {isGpsMode && (
              <div style={{ fontSize: '0.72rem', color: '#1864ab', marginTop: '0.15rem' }}>
                Real-time device coordinates used for distance calculation
              </div>
            )}
          </div>
        </div>

        {/* Filter Grid */}
        <div className="filter-grid">
          {/* Crop Selection */}
          <CropSelector
            value={filters.commodity}
            onChange={(val) => updateFilters({ commodity: val })}
            commodities={commodities}
            showAllOption={false}
          />

          {/* Manual State Selection */}
          <StateSelector
            value={userLocation.state || ''}
            onChange={(val) => {
              setManualLocation({ state: val, district: '' });
            }}
            states={states}
            label="Manual State Selection"
          />

          {/* Manual District Selection */}
          <DistrictSelector
            value={userLocation.district || ''}
            onChange={(val) => {
              setManualLocation({ state: userLocation.state, district: val });
            }}
            districts={districts}
            disabled={!userLocation.state}
            label="Manual District Selection"
          />
        </div>

        <div style={{ marginTop: '0.85rem', fontSize: '0.76rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
          Note: Straight-line distance (Haversine formula) is computed using active coordinates. Real transit distance depends on local road geometry and transport routes.
        </div>
      </div>

      {/* 2. Recommendation Algorithm Explainer */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
        <button
          className="btn btn-outline"
          onClick={() => setShowWeightsInfo(!showWeightsInfo)}
          style={{ fontSize: '0.78rem', padding: '0.3rem 0.65rem' }}
        >
          <Info size={14} /> How Recommendation is Calculated
        </button>
      </div>

      {showWeightsInfo && (
        <div style={{ backgroundColor: 'var(--primary-wash)', border: '1px solid var(--primary-soft)', borderRadius: 'var(--radius-md)', padding: '1rem', marginBottom: '1.25rem', fontSize: '0.85rem' }}>
          <strong>Recommendation Scoring Breakdown:</strong>
          <ul style={{ marginLeft: '1.25rem', marginTop: '0.35rem', lineHeight: '1.6' }}>
            <li><strong>Reported Modal Price (60%):</strong> Rewards mandis reporting higher auction rates for {filters.commodity}.</li>
            <li><strong>Straight-Line Proximity (30%):</strong> Rewards closer markets to minimize hauling time.</li>
            <li><strong>Data Freshness (10%):</strong> Rewards recent trading sessions.</li>
          </ul>
          <p style={{ marginTop: '0.4rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
            "Recommended based on current reported price, distance and data freshness. Net realization depends on individual transportation costs and lot grading."
          </p>
        </div>
      )}

      {/* 3. Loading State */}
      {loading && (
        <LoadingState message="Calculating nearby mandi distances and price spreads..." />
      )}

      {/* 4. Top Recommended Mandi Highlight */}
      {!loading && bestMandi && (
        <div style={{ marginBottom: '1.5rem' }}>
          <RecommendationCard
            title="Top Recommended Mandi"
            subtitle={bestMandi.market}
            distanceLabel={`${bestMandi.district}, ${bestMandi.state} • ${bestMandi.distance_label}`}
            burden={bestMandi.transportation_burden}
            price={bestMandi.modal_price}
            date={bestMandi.arrival_date}
            statement={bestMandi.recommendation_statement}
          />
        </div>
      )}

      {/* 5. Nearby Mandis Price Spread Banner */}
      {!loading && spreadAnalysis && spreadAnalysis.price_spread > 0 && (
        <div style={{ backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', padding: '0.85rem 1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', borderLeft: '4px solid var(--accent-gold)' }}>
          <div>
            <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>
              Price Difference Across Nearby Mandis
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.1rem' }}>
              {spreadAnalysis.spread_label}
            </div>
          </div>
          <div style={{ fontSize: '0.86rem', color: 'var(--text-secondary)' }}>
            High: <strong>₹{spreadAnalysis.highest_reported_price.toLocaleString('en-IN')}</strong> &bull; Low: <strong>₹{spreadAnalysis.lowest_reported_price.toLocaleString('en-IN')}</strong>
          </div>
        </div>
      )}

      {/* 6. Nearby Mandis Grid */}
      {!loading && comparisonList.length === 0 && (
        <EmptyState
          title="No Nearby Mandis Found"
          message={`No reporting mandis for ${filters.commodity} found near ${userLocation.displayName || 'this area'}. Try selecting an adjoining district or widening location.`}
        />
      )}

      {!loading && comparisonList.length > 0 && (
        <div className="section-block">
          <h2 className="section-title">
            All Nearby Mandis for {filters.commodity}
          </h2>
          <p className="section-subtitle">
            Ranked by proximity and modal price from active location ({userLocation.displayName}).
          </p>

          <div className="mandi-card-grid">
            {comparisonList.map((mandi, idx) => (
              <div className={`mandi-card ${idx === 0 ? 'is-best' : ''}`} key={`${mandi.market}-${idx}`}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                    <div className="mandi-card-name">{mandi.market}</div>
                    {idx === 0 && (
                      <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--primary-dark)', background: '#d8f3dc', padding: '0.15rem 0.45rem', borderRadius: '4px' }}>
                        TOP PICK
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                    {mandi.district}, {mandi.state}
                  </div>
                  <div style={{ marginTop: '0.5rem' }}>
                    <span className={`burden-tag ${mandi.transportation_burden?.level ? mandi.transportation_burden.level.toLowerCase() : 'low'}`}>
                      {mandi.distance_km !== null ? `${mandi.distance_km} km (straight-line)` : 'Distance N/A'} &bull; {mandi.transportation_burden?.level || 'Standard'} Burden
                    </span>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '0.6rem', marginTop: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Min: ₹{mandi.min_price} | Max: ₹{mandi.max_price}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Date: {mandi.arrival_date}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary-dark)' }}>
                      ₹{mandi.modal_price.toLocaleString('en-IN')}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>/ quintal</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
