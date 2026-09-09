import React, { useState, useEffect } from 'react';
import { Sparkles, TrendingUp, TrendingDown, Minus, ShieldCheck, AlertCircle, Info, Calendar } from 'lucide-react';
import { useMarket } from '../context/MarketContext';
import CropSelector from '../components/common/CropSelector';
import StateSelector from '../components/common/StateSelector';
import LoadingState from '../components/common/LoadingState';

export default function PredictionPage() {
  const { filters, updateFilters, commodities, states } = useMarket();

  const [selectedState, setSelectedState] = useState(filters.state || 'Uttar Pradesh');
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
      state: selectedState || 'Uttar Pradesh'
    });

    if (currentPrice) {
      params.append('current_price', currentPrice.toString());
    }

    fetch(`/api/market/forecast?${params.toString()}`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.monthly_forecast && data.monthly_forecast.length > 0) {
          setForecastData(data);
        } else if (data.status === 'failed' || data.error) {
          setForecastData(null);
          setErrorMsg(data.error || 'Unable to generate prediction.');
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
  }, [filters.commodity, selectedState, currentPrice]);

  const trend = forecastData?.trend || 'Stable';
  const monthlyList = forecastData?.monthly_forecast || [];
  const modelInfo = forecastData?.model_info;
  const nextMonth = forecastData?.next_month_projection;

  return (
    <div className="prediction-page">
      {/* Page Header */}
      <div className="page-header-box">
        <h1 className="page-title">
          🤖 AI Price Prediction & Market Trajectory
        </h1>
        <p className="page-subtitle">
          Statistically sound forward price projections trained chronologically across 10 years of Agmarknet modal records using Hist Gradient Boosting Regression.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="card-header">
          <div className="card-title">
            <Sparkles size={18} color="var(--primary)" /> Forecast Settings
          </div>
        </div>

        <div className="filter-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
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
        </div>
      </div>

      {/* Phase 15 Mandatory Daily Forecast Transparency Notice */}
      <div className="card" style={{ marginBottom: '1.5rem', borderLeft: '4px solid #f59f00', backgroundColor: '#fff9db' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
          <Info size={20} color="#e67700" style={{ flexShrink: 0, marginTop: '0.2rem' }} />
          <div>
            <div style={{ fontWeight: 700, color: '#d9480f', fontSize: '0.92rem' }}>
              Daily 7–10 Day Forecast Validity Notice
            </div>
            <div style={{ fontSize: '0.85rem', color: '#495057', marginTop: '0.25rem', lineHeight: '1.5' }}>
              <strong>Not enough historical data to generate a reliable 7–10 day mandi forecast.</strong> The APMC Agmarknet daily dataset contains recent market snapshot dates (September 2026), which does not provide the multi-year daily time-series required for reliable daily-level predictions. In accordance with strict AI validation standards, speculative daily forecasts are not manufactured. Legitimate <strong>multi-month state-level projections</strong> are presented below.
            </div>
          </div>
        </div>
      </div>

      {loading && (
        <LoadingState message={`Executing trained ML model for ${filters.commodity}...`} />
      )}

      {!loading && errorMsg && (
        <div className="card" style={{ textAlign: 'center', padding: '2.5rem 1.5rem', borderColor: '#ffa8a8' }}>
          <div style={{ display: 'inline-flex', padding: '0.75rem', borderRadius: '50%', backgroundColor: 'var(--red-wash)', color: 'var(--accent-red)', marginBottom: '0.75rem' }}>
            <AlertCircle size={28} />
          </div>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent-red)' }}>
            {errorMsg}
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: '480px', margin: '0.5rem auto' }}>
            The machine learning engine strictly validates crop inputs against historical Agmarknet records.
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
                  🌾 {forecastData.commodity} &bull; {forecastData.matched_state}
                </div>
                <div style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                  Current Reported Baseline: <strong>₹{Number(forecastData.current_price).toLocaleString('en-IN')}/q</strong>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span className={`ticker-badge ${trend.toLowerCase()}`} style={{ fontSize: '0.92rem', padding: '0.4rem 0.85rem' }}>
                  {trend === 'Increasing' && <TrendingUp size={16} />}
                  {trend === 'Decreasing' && <TrendingDown size={16} />}
                  {trend === 'Stable' && <Minus size={16} />}
                  Next-Month Trend: {trend} ({forecastData.predicted_change_pct > 0 ? `+${forecastData.predicted_change_pct}%` : `${forecastData.predicted_change_pct}%`})
                </span>

                {nextMonth && (
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
                    {nextMonth.period} Projected Rate: <strong>₹{nextMonth.predicted_price.toLocaleString('en-IN')}</strong> / quintal
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Decision Support Card */}
          {forecastData.decision_support && (
            <div className={`decision-box ${trend === 'Increasing' ? 'wait' : trend === 'Decreasing' ? 'sell' : 'stable'}`} style={{ marginBottom: '1.5rem' }}>
              <div className="decision-tag" style={{ fontSize: '1.15rem', fontWeight: 800 }}>
                {forecastData.decision_support.recommendation === 'Potentially favorable to wait' && '🌱 Recommendation: Potentially Favorable to Wait'}
                {forecastData.decision_support.recommendation === 'Potentially favorable to sell now' && '⚡ Recommendation: Potentially Favorable to Sell Now'}
                {forecastData.decision_support.recommendation !== 'Potentially favorable to wait' && forecastData.decision_support.recommendation !== 'Potentially favorable to sell now' && '⚖️ Recommendation: Market Appears Relatively Stable'}
              </div>

              <p className="decision-rationale" style={{ fontSize: '0.95rem', marginTop: '0.35rem', lineHeight: '1.6' }}>
                {forecastData.decision_support.rationale}
              </p>

              {forecastData.decision_support.market_context && (
                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                  Historical Context: {forecastData.decision_support.market_context}
                </div>
              )}
            </div>
          )}

          {/* Month-by-Month Projected Rates */}
          <div className="section-block">
            <h2 className="section-title">
              📅 Multi-Month Forward Projections
            </h2>
            <p className="section-subtitle">
              Autoregressive forward predictions with uncertainty intervals derived from holdout test RMSE (±₹{modelInfo?.test_rmse || 735}/q)
            </p>

            <div className="forecast-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
              {monthlyList.map((m) => (
                <div className="forecast-day-card" key={m.period} style={{ padding: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--primary)', fontWeight: 700, fontSize: '0.88rem' }}>
                    <Calendar size={16} />
                    <span>{m.period}</span>
                  </div>
                  <div className="forecast-price" style={{ fontSize: '1.75rem', margin: '0.6rem 0 0.3rem' }}>
                    ₹{Math.round(m.predicted_modal_price).toLocaleString('en-IN')}
                    <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-muted)' }}>/q</span>
                  </div>
                  <div className="forecast-range" style={{ fontSize: '0.82rem' }}>
                    Uncertainty Band: ₹{Math.round(m.range_low).toLocaleString('en-IN')} – ₹{Math.round(m.range_high).toLocaleString('en-IN')}
                  </div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
                    Step {m.step} &bull; Autoregressive projection
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Model Evaluation & Architecture Card */}
          {modelInfo && (
            <div className="card" style={{ marginTop: '1.5rem', backgroundColor: 'var(--bg-subtle)' }}>
              <div className="card-header">
                <div className="card-title" style={{ fontSize: '0.95rem' }}>
                  <ShieldCheck size={18} color="var(--primary)" /> Machine Learning Model Transparency & Validation
                </div>
                <span className="card-badge" style={{ backgroundColor: '#ffffff' }}>Zero Data Leakage</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '0.5rem' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>Algorithm</div>
                  <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--primary-dark)', marginTop: '0.1rem' }}>{modelInfo.algorithm}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>Holdout Test R² Score</div>
                  <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--primary)', marginTop: '0.1rem' }}>{modelInfo.test_r2} (Unseen 2025–2026 data)</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>Holdout Test RMSE</div>
                  <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '0.1rem' }}>₹{modelInfo.test_rmse} / quintal</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>Holdout Test MAE</div>
                  <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '0.1rem' }}>₹{modelInfo.test_mae} / quintal</div>
                </div>
              </div>

              <div style={{ marginTop: '0.85rem', fontSize: '0.8rem', color: 'var(--text-secondary)', borderTop: '1px solid var(--border-light)', paddingTop: '0.65rem' }}>
                Methodology: Chronologically split training (2016–2023), validation (2024), and unseen holdout test (2025–2026). Outlier bounds fitted strictly on training observations to guarantee zero data leakage.
              </div>
            </div>
          )}

          {/* Mandatory AI Disclaimer */}
          <div className="disclaimer-box" style={{ marginTop: '1.25rem' }}>
            <div className="disclaimer-title">Mandatory AI Decision Support Disclaimer</div>
            {forecastData.disclaimer}
          </div>
        </>
      )}
    </div>
  );
}
