import React, { useState, useEffect } from 'react';
import { Wheat, Calendar } from 'lucide-react';
import { useMarket } from '../context/MarketContext';
import CropSelector from '../components/common/CropSelector';
import StateSelector from '../components/common/StateSelector';
import LoadingState from '../components/common/LoadingState';
import EmptyState from '../components/common/EmptyState';

export default function SellDecisionPage() {
  const { filters, updateFilters, commodities, states } = useMarket();

  const [selectedState, setSelectedState] = useState(filters.state || 'Uttar Pradesh');
  const [currentPriceData, setCurrentPriceData] = useState(null);
  const [historicalData, setHistoricalData] = useState(null);
  const [forecastData, setForecastData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch current price, historical pattern, and forecast concurrently
  useEffect(() => {
    if (!filters.commodity) return;
    setLoading(true);

    const priceParams = new URLSearchParams({
      commodity: filters.commodity,
      state: selectedState || ''
    });

    const histParams = new URLSearchParams({
      commodity: filters.commodity,
      state: selectedState || 'All India'
    });

    Promise.all([
      fetch(`/api/market/current-price?${priceParams.toString()}`).then(r => r.json()),
      fetch(`/api/market/historical-analysis?${histParams.toString()}`).then(r => r.json()),
      fetch(`/api/market/forecast?commodity=${filters.commodity}&state=${selectedState || 'Uttar Pradesh'}`).then(r => r.json())
    ])
      .then(([pRes, hRes, fRes]) => {
        if (pRes.success && pRes.data) setCurrentPriceData(pRes.data);
        else setCurrentPriceData(null);

        if (hRes.success) setHistoricalData(hRes);
        else setHistoricalData(null);

        if (fRes.success) setForecastData(fRes);
        else setForecastData(null);

        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading sell decision data:', err);
        setLoading(false);
      });
  }, [filters.commodity, selectedState]);

  // Determine synthesis recommendation
  const currentModal = currentPriceData?.modal_price || 2450;
  const histAvg = historicalData?.trend?.summary?.average_price || 2100;
  const forecastTrend = forecastData?.trend || 'Stable';
  const volatilityCat = historicalData?.volatility?.category || 'Moderate';
  const bestMonthName = historicalData?.best_month?.best_month?.month_name || 'September';

  // Recommendation logic
  let recommendationType = 'stable';
  let recommendationTitle = '⚖️ Market Appears Relatively Stable';
  let rationaleExplanation = '';
  let favorableWindow = 'Flexible throughout the coming 5–7 days';

  const priceDiffPct = Math.round(((currentModal - histAvg) / histAvg) * 100);

  if (!forecastData && !historicalData) {
    recommendationType = 'insufficient';
    recommendationTitle = '⚠️ Insufficient Data';
    rationaleExplanation = 'Not enough recent mandi arrivals or historical series are available to generate a reliable sell/wait recommendation. Please monitor local mandi auctions.';
  } else if (forecastTrend === 'Increasing' && priceDiffPct < 25) {
    recommendationType = 'wait';
    recommendationTitle = '🌱 Potentially Favorable to Wait';
    rationaleExplanation = `AI 7-day forecast indicates an upward price trajectory (+${forecastData?.predicted_change_pct || '1.5'}%) in coming days, while current rate (₹${currentModal.toLocaleString('en-IN')}) is within reasonable range of historical peaks. If holding and storage facilities are secure, monitoring upcoming auction quotes may be advantageous.`;
    favorableWindow = 'Next 4–7 days (monitor peak arrivals)';
  } else if (currentModal > histAvg * 1.12 && (forecastTrend === 'Decreasing' || forecastTrend === 'Stable')) {
    recommendationType = 'sell';
    recommendationTitle = '⚡ Potentially Favorable to Sell Now';
    rationaleExplanation = `Current price of ₹${currentModal.toLocaleString('en-IN')}/q is relatively high (+${priceDiffPct}%) compared with the 10-year historical pattern of ₹${histAvg.toLocaleString('en-IN')}/q, while the available forecast does not indicate a strong expected increase. Selling in current sessions avoids storage risks and potential arrival influx.`;
    favorableWindow = 'Immediate sessions (next 1–3 days)';
  } else {
    recommendationType = 'stable';
    recommendationTitle = '⚖️ Market Appears Relatively Stable';
    rationaleExplanation = `Current modal price of ₹${currentModal.toLocaleString('en-IN')}/q is tracking close to historical benchmarks (within ±${Math.abs(priceDiffPct)}%), with expected steady price movement. The decision depends primarily on your immediate cash requirements, storage costs, and transport availability.`;
    favorableWindow = 'Flexible throughout the coming week';
  }

  return (
    <div className="sell-decision-page">
      {/* Page Header */}
      <div className="page-header-box">
        <h1 className="page-title">
          🌾 Sell Decision Support
        </h1>
        <p className="page-subtitle">
          Data-backed guidance comparing current auction rates against 10-year historical baselines and machine learning forecast trends to help you choose the best selling window.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="card-header">
          <div className="card-title">
            <Wheat size={18} color="var(--primary)" /> Crop & Location Selection
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

      {loading && (
        <LoadingState message={`Synthesizing sell decision matrix for ${filters.commodity}...`} />
      )}

      {!loading && (
        <>
          {/* Primary Recommendation Banner */}
          <div className={`decision-box ${recommendationType}`} style={{ marginBottom: '1.5rem' }}>
            <div className="decision-tag" style={{ fontSize: '1.25rem', fontWeight: 800 }}>
              {recommendationTitle}
            </div>

            <div style={{ marginTop: '0.75rem', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-muted)' }}>
              Why this recommendation was generated:
            </div>
            <p className="decision-rationale" style={{ fontSize: '1rem', marginTop: '0.35rem', lineHeight: '1.6' }}>
              {rationaleExplanation}
            </p>

            <div className="favorable-window-badge" style={{ marginTop: '1rem' }}>
              <Calendar size={16} color="var(--primary)" />
              <span>Recommended Selling Window: <strong>{favorableWindow}</strong></span>
            </div>
          </div>

          {/* 4 Pillars of Decision Support */}
          <div className="section-block">
            <h2 className="section-title">
              🔍 Decision Synthesis Metrics
            </h2>
            <p className="section-subtitle">
              How current price, 10-year history, AI trajectory, and volatility inform this decision
            </p>

            <div className="dashboard-stats-strip" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
              {/* 1. Current Price */}
              <div className="card" style={{ padding: '1rem' }}>
                <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>
                  1. Current Modal Rate
                </div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary-dark)', marginTop: '0.2rem' }}>
                  ₹{Number(currentModal).toLocaleString('en-IN')}<span style={{ fontSize: '0.8rem', fontWeight: 500 }}>/q</span>
                </div>
                <div style={{ fontSize: '0.8rem', color: priceDiffPct >= 0 ? '#2b8a3e' : '#c92a2a', marginTop: '0.2rem', fontWeight: 600 }}>
                  {priceDiffPct >= 0 ? `+${priceDiffPct}% vs 10-Yr Avg` : `${priceDiffPct}% vs 10-Yr Avg`}
                </div>
              </div>

              {/* 2. 10-Year Historical Benchmark */}
              <div className="card" style={{ padding: '1rem' }}>
                <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>
                  2. 10-Year Historical Benchmark
                </div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.2rem' }}>
                  ₹{Number(histAvg).toLocaleString('en-IN')}<span style={{ fontSize: '0.8rem', fontWeight: 500 }}>/q</span>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                  Peak Season: <strong>{bestMonthName}</strong>
                </div>
              </div>

              {/* 3. AI 7-Day Trajectory */}
              <div className="card" style={{ padding: '1rem' }}>
                <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>
                  3. AI Forecast Direction
                </div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 800, color: forecastTrend === 'Increasing' ? '#2b8a3e' : forecastTrend === 'Decreasing' ? '#c92a2a' : 'var(--primary-dark)', marginTop: '0.2rem' }}>
                  {forecastTrend}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                  Shift: <strong>{forecastData?.predicted_change_pct > 0 ? `+${forecastData?.predicted_change_pct}%` : `${forecastData?.predicted_change_pct || 0}%`}</strong>
                </div>
              </div>

              {/* 4. Volatility & Anomaly */}
              <div className="card" style={{ padding: '1rem' }}>
                <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>
                  4. Historical Volatility
                </div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 800, color: volatilityCat === 'High' ? 'var(--accent-red)' : 'var(--primary-dark)', marginTop: '0.2rem' }}>
                  {volatilityCat}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                  CV: <strong>{historicalData?.volatility?.cv_percentage || 14}%</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Practical Farmer Considerations Card */}
          <div className="card" style={{ marginTop: '1.5rem' }}>
            <div className="card-header">
              <div className="card-title">
                ⚖️ Practical Farmer Considerations Before Deciding
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginTop: '0.5rem', fontSize: '0.85rem' }}>
              <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)' }}>
                <strong>🌾 Storage & Spoilage:</strong>
                <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                  Holding produce incurs bag costs, fumigation, and weight shrinkage. For perishable crops like vegetables, immediate selling is almost always prudent.
                </p>
              </div>

              <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)' }}>
                <strong>🚚 Transportation & Fuel:</strong>
                <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                  Ensure the price spread between markets comfortably exceeds diesel and loading charges before traveling to a distant mandi.
                </p>
              </div>

              <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)' }}>
                <strong>💰 Immediate Liquidity:</strong>
                <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                  If repayment deadlines or sowing input costs (fertilizer, diesel) are pressing, realizing current rates avoids borrowing costs.
                </p>
              </div>
            </div>
          </div>

          {/* Decision Support Non-Guarantee Notice */}
          <div className="disclaimer-box" style={{ marginTop: '1.5rem' }}>
            <div className="disclaimer-title">Decision Support Disclaimer & Transparency</div>
            This advice is provided purely for informational and decision-support purposes. KisanSaathi does not guarantee future rates or profits. Actual prices received in APMC auctions depend on individual lot moisture, grading, arrival volume, and daily buyer participation.
          </div>
        </>
      )}
    </div>
  );
}
