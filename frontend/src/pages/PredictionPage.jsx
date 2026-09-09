import React, { useState, useEffect } from 'react';
import { Sparkles, TrendingUp, TrendingDown, Minus, ShieldCheck, AlertCircle } from 'lucide-react';
import { useMarket } from '../context/MarketContext';
import CropSelector from '../components/common/CropSelector';
import StateSelector from '../components/common/StateSelector';
import PriceChart from '../components/charts/PriceChart';
import LoadingState from '../components/common/LoadingState';
import EmptyState from '../components/common/EmptyState';

export default function PredictionPage() {
  const { filters, updateFilters, commodities, states } = useMarket();

  const [selectedState, setSelectedState] = useState(filters.state || 'Uttar Pradesh');
  const [horizonDays, setHorizonDays] = useState(7);
  const [forecastData, setForecastData] = useState(null);
  const [currentPrice, setCurrentPrice] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  // Fetch current baseline price first
  useEffect(() => {
    if (!filters.commodity) return;

    const params = new URLSearchParams({
      commodity: filters.commodity,
      state: selectedState || ''
    });

    fetch(`/api/market/current-price?${params.toString()}`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          setCurrentPrice(data.data.modal_price);
        } else {
          setCurrentPrice(null);
        }
      })
      .catch(() => setCurrentPrice(null));
  }, [filters.commodity, selectedState]);

  // Fetch AI Prediction
  useEffect(() => {
    if (!filters.commodity) return;
    setLoading(true);
    setErrorMsg(null);

    const params = new URLSearchParams({
      commodity: filters.commodity,
      state: selectedState || 'Uttar Pradesh',
      horizon_days: horizonDays.toString()
    });

    if (currentPrice) {
      params.append('current_price', currentPrice.toString());
    }

    fetch(`/api/market/forecast?${params.toString()}`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.forecast && data.forecast.length > 0) {
          setForecastData(data);
        } else {
          setForecastData(null);
          setErrorMsg('Not enough historical data to generate a reliable forecast.');
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Forecast error:', err);
        setForecastData(null);
        setErrorMsg('Not enough historical data to generate a reliable forecast.');
        setLoading(false);
      });
  }, [filters.commodity, selectedState, horizonDays, currentPrice]);

  const trend = forecastData?.trend || 'Stable';
  const forecastList = forecastData?.forecast || [];
  const modelInfo = forecastData?.model_info;
  const expectedRange = forecastData?.expected_range;

  return (
    <div className="prediction-page">
      {/* Page Header */}
      <div className="page-header-box">
        <h1 className="page-title">
          🤖 AI Price Prediction & Trajectory
        </h1>
        <p className="page-subtitle">
          Statistical time-series forecasting powered by a 10-year trained Hist Gradient Boosting Regressor combined with active Agmarknet mandi baselines.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="card-header">
          <div className="card-title">
            <Sparkles size={18} color="var(--primary)" /> Forecast Settings
          </div>
        </div>

        <div className="filter-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
          <CropSelector
            value={filters.commodity}
            onChange={(val) => updateFilters({ commodity: val })}
            commodities={commodities}
            showAllOption={false}
          />

          <StateSelector
            value={selectedState}
            onChange={(val) => setSelectedState(val)}
            states={states}
            showAllOption={false}
          />

          <div className="form-group">
            <label className="form-label" htmlFor="horizon-select">Forecast Horizon</label>
            <select
              id="horizon-select"
              className="form-select"
              value={horizonDays}
              onChange={(e) => setHorizonDays(parseInt(e.target.value, 10))}
            >
              <option value={7}>Next 7 Days (Standard)</option>
              <option value={10}>Next 10 Days (Extended)</option>
            </select>
          </div>
        </div>
      </div>

      {loading && (
        <LoadingState message={`Executing AI forecast model for ${filters.commodity}...`} />
      )}

      {!loading && errorMsg && (
        <div className="card" style={{ textAlign: 'center', padding: '2.5rem 1.5rem', borderColor: '#ffa8a8' }}>
          <div style={{ display: 'inline-flex', padding: '0.75rem', borderRadius: '50%', backgroundColor: 'var(--red-wash)', color: 'var(--accent-red)', marginBottom: '0.75rem' }}>
            <AlertCircle size={28} />
          </div>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent-red)' }}>
            Not enough historical data to generate a reliable forecast.
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: '480px', margin: '0.5rem auto' }}>
            The machine learning engine strictly refuses to generate speculative or synthetic predictions when historical observations fall below reliable statistical thresholds.
          </p>
        </div>
      )}

      {!loading && !errorMsg && forecastData && (
        <>
          {/* Key Forecast Summary Banner */}
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>
                  Active Forecast For
                </span>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary-dark)', marginTop: '0.1rem' }}>
                  🌾 {forecastData.commodity} &bull; {forecastData.state}
                </div>
                <div style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                  Latest Actual Baseline Price: <strong>₹{Number(forecastData.current_price).toLocaleString('en-IN')}/q</strong>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span className={`ticker-badge ${trend.toLowerCase()}`} style={{ fontSize: '0.92rem', padding: '0.4rem 0.85rem' }}>
                  {trend === 'Increasing' && <TrendingUp size={16} />}
                  {trend === 'Decreasing' && <TrendingDown size={16} />}
                  {trend === 'Stable' && <Minus size={16} />}
                  Trend: {trend} ({forecastData.predicted_change_pct > 0 ? `+${forecastData.predicted_change_pct}%` : `${forecastData.predicted_change_pct}%`})
                </span>

                {expectedRange && (
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
                    Expected Range: <strong>₹{expectedRange.low.toLocaleString('en-IN')} – ₹{expectedRange.high.toLocaleString('en-IN')}</strong>/q
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Forecast Trajectory SVG Chart */}
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <div className="card-header">
              <div className="card-title">
                📈 {horizonDays}-Day Predicted Price Trajectory & Confidence Ribbon
              </div>
              <span className="card-badge">Hist Gradient Boosting</span>
            </div>

            <div style={{ backgroundColor: '#ffffff', borderRadius: 'var(--radius-md)', padding: '1rem', border: '1px solid var(--border-light)' }}>
              <PriceChart forecast={forecastList} currentPrice={forecastData.current_price} height={230} />
            </div>

            <div style={{ marginTop: '0.75rem', fontSize: '0.76rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
              <span>Shaded ribbon denotes statistical confidence interval range (lower to upper bound).</span>
              <span>Baseline: ₹{Number(forecastData.current_price).toLocaleString('en-IN')}/q</span>
            </div>
          </div>

          {/* Day-by-Day Forecast Cards */}
          <div className="section-block">
            <h2 className="section-title">
              📅 Day-by-Day Projected Rates
            </h2>
            <p className="section-subtitle">
              Detailed daily modal price estimate and expected auction variance band
            </p>

            <div className="forecast-grid">
              {forecastList.map((day) => (
                <div className="forecast-day-card" key={day.day}>
                  <div className="forecast-date">Day {day.day} &bull; {day.display_date}</div>
                  <div className="forecast-price">₹{Math.round(day.predicted_price).toLocaleString('en-IN')}</div>
                  <div className="forecast-range">Band: ₹{Math.round(day.range_low)} – ₹{Math.round(day.range_high)}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Model Evaluation & Architecture Card */}
          {modelInfo && (
            <div className="card" style={{ marginTop: '1.5rem', backgroundColor: 'var(--bg-subtle)' }}>
              <div className="card-header">
                <div className="card-title" style={{ fontSize: '0.95rem' }}>
                  <ShieldCheck size={18} color="var(--primary)" /> Machine Learning Model Transparency
                </div>
                <span className="card-badge" style={{ backgroundColor: '#ffffff' }}>Verified Training</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '0.5rem' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>Algorithm</div>
                  <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--primary-dark)', marginTop: '0.1rem' }}>{modelInfo.algorithm}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>Evaluation R² Score</div>
                  <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--primary)', marginTop: '0.1rem' }}>{modelInfo.evaluation_r2} (High Correlation)</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>Holdout MAE</div>
                  <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '0.1rem' }}>₹{modelInfo.evaluation_mae} / quintal</div>
                </div>
              </div>

              <div style={{ marginTop: '0.85rem', fontSize: '0.8rem', color: 'var(--text-secondary)', borderTop: '1px solid var(--border-light)', paddingTop: '0.65rem' }}>
                {modelInfo.source}
              </div>
            </div>
          )}

          {/* Mandatory AI Disclaimer */}
          <div className="disclaimer-box" style={{ marginTop: '1.25rem' }}>
            <div className="disclaimer-title">Mandatory AI Decision Support Disclaimer</div>
            {forecastData.disclaimer || 'AI-based estimate for decision support. Actual market prices may vary depending on daily arrivals, moisture, grade, and market conditions. Historical patterns do not guarantee future prices.'}
          </div>
        </>
      )}
    </div>
  );
}
