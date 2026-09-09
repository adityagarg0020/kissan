import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, Info, AlertCircle } from 'lucide-react';
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
    updateLocation,
    commodities,
    states,
    districts
  } = useMarket();

  const [locating, setLocating] = useState(false);
  const [gpsError, setGpsError] = useState(null);
  const [showWeightsInfo, setShowWeightsInfo] = useState(false);

  const [comparisonData, setComparisonData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Use My Location (GPS)
  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser.');
      return;
    }

    setLocating(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = Math.round(position.coords.latitude * 10000) / 10000;
        const lng = Math.round(position.coords.longitude * 10000) / 10000;
        setLocating(false);

        updateLocation({
          lat,
          lng,
          district: userLocation.district || 'Agra',
          state: userLocation.state || 'Uttar Pradesh',
          method: 'GPS'
        });
      },
      (error) => {
        setLocating(false);
        let msg = 'Could not acquire GPS coordinates.';
        if (error.code === 1) msg = 'Location permission was denied. Please select your district manually below.';
        else if (error.code === 2) msg = 'Location position unavailable. Please choose district manually.';
        else if (error.code === 3) msg = 'Location request timed out. Please choose district manually.';
        setGpsError(msg);
      },
      { timeout: 10000, maximumAge: 60000 }
    );
  };

  // Fetch Nearby Mandis & Best Mandi Recommendation
  useEffect(() => {
    if (!filters.commodity) return;
    setLoading(true);

    const params = new URLSearchParams({
      commodity: filters.commodity,
      district: userLocation.district || filters.district || 'Agra',
      lat: userLocation.lat ? userLocation.lat.toString() : '',
      lng: userLocation.lng ? userLocation.lng.toString() : ''
    });

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
  }, [filters.commodity, userLocation.district, userLocation.lat, userLocation.lng, filters.district]);

  const bestMandi = comparisonData?.best_mandi;
  const comparisonList = comparisonData?.comparison || [];
  const spreadAnalysis = comparisonData?.spread_analysis;

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
          >
            <Navigation size={15} className={locating ? 'spin' : ''} />
            {locating ? 'Detecting Location...' : '📍 Use My Location'}
          </button>
        </div>

        {gpsError && (
          <div style={{ padding: '0.6rem 0.85rem', backgroundColor: 'var(--red-wash)', borderRadius: 'var(--radius-sm)', color: 'var(--accent-red)', fontSize: '0.84rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <AlertCircle size={16} /> {gpsError}
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', padding: '0.75rem 1rem', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)', marginBottom: '1rem' }}>
          <div>
            <span style={{ fontSize: '0.78rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>
              Detected Reference Location:
            </span>
            <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--primary-dark)', marginTop: '0.1rem' }}>
              {userLocation.district ? `${userLocation.district}, ${userLocation.state}` : 'District Not Set'}
            </div>
          </div>

          {userLocation.lat && userLocation.lng && (
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Coordinates: {userLocation.lat}° N, {userLocation.lng}° E ({userLocation.method || 'Manual'})
            </div>
          )}
        </div>

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
            value={userLocation.state}
            onChange={(val) => {
              updateLocation({ ...userLocation, state: val, district: '', method: 'Manual' });
            }}
            states={states}
            label="Manual State Selection"
          />

          {/* Manual District Selection */}
          <DistrictSelector
            value={userLocation.district}
            onChange={(val) => {
              updateLocation({ ...userLocation, district: val, method: 'Manual' });
            }}
            districts={districts}
            disabled={!userLocation.state}
            label="Manual District Selection"
          />
        </div>

        <div style={{ marginTop: '0.75rem', fontSize: '0.76rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
          Note: Straight-line distance (Haversine formula) is computed using verified district market coordinates. Real transit distance depends on local road geometry.
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
          message={`No reporting mandis for ${filters.commodity} found near ${userLocation.district || 'this area'}. Try selecting an adjoining district.`}
        />
      )}

      {!loading && comparisonList.length > 0 && (
        <div className="section-block">
          <h2 className="section-title">
            All Nearby Mandis for {filters.commodity}
          </h2>
          <p className="section-subtitle">
            Ranked by proximity and modal price. Distances represent straight-line Haversine calculations.
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
