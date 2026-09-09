import React from 'react';
import { Sparkles, TrendingUp, TrendingDown, Minus, Calendar, CheckCircle2, AlertCircle } from 'lucide-react';

export default function AIPredictionCard({ forecastData, loading }) {
  if (loading) {
    return (
      <div className="card">
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          Computing AI 7-day forecast & Sell Now / Wait decision matrix...
        </div>
      </div>
    );
  }

  if (!forecastData || !forecastData.forecast) {
    return null;
  }

  const {
    commodity,
    state,
    current_price,
    trend,
    predicted_change_pct,
    forecast,
    expected_range,
    decision_support,
    model_info,
    disclaimer
  } = forecastData;

  const getDecisionClass = () => {
    if (decision_support.recommendation.toLowerCase().includes('wait')) return 'wait';
    if (decision_support.recommendation.toLowerCase().includes('strong') || decision_support.recommendation.toLowerCase().includes('sell')) return 'sell';
    return 'stable';
  };

  return (
    <div className="card" id="ai-forecast-section">
      <div className="card-header">
        <div className="card-title">
          <Sparkles size={20} color="var(--primary)" /> 🤖 AI Price Forecast & Decision Support
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <span className={`ticker-badge ${trend.toLowerCase()}`} style={{ fontSize: '0.82rem', padding: '0.25rem 0.65rem' }}>
            {trend === 'Increasing' && <TrendingUp size={14} />}
            {trend === 'Decreasing' && <TrendingDown size={14} />}
            {trend === 'Stable' && <Minus size={14} />}
            {trend} ({predicted_change_pct > 0 ? `+${predicted_change_pct}%` : `${predicted_change_pct}%`})
          </span>
        </div>
      </div>

      <div className="ai-forecast-container">
        {/* 1. "Sell Now or Wait" Decision Box */}
        <div className={`decision-box ${getDecisionClass()}`}>
          <div className="decision-tag">
            {trend === 'Increasing' ? '🌱 Recommendation: Potentially Consider Waiting' :
             trend === 'Decreasing' ? '⚡ Recommendation: Current Price Appears Relatively Strong' :
             '⚖️ Recommendation: Market Appears Relatively Stable'}
          </div>

          <p className="decision-rationale">
            {decision_support.rationale}
          </p>

          <div className="favorable-window-badge">
            <Calendar size={15} color="var(--primary)" />
            <span>Potentially favorable selling window: <strong>{decision_support.favorable_window}</strong></span>
          </div>
        </div>

        {/* 2. 7-Day Forecast Grid */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-main)' }}>
              Estimated 7-Day Price Trajectory
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Expected Range: <strong>₹{expected_range.low.toLocaleString('en-IN')} – ₹{expected_range.high.toLocaleString('en-IN')}</strong> / quintal
            </span>
          </div>

          <div className="forecast-grid">
            {forecast.map((day) => (
              <div className="forecast-day-card" key={day.day}>
                <div className="forecast-date">Day {day.day} &bull; {day.display_date}</div>
                <div className="forecast-price">₹{Math.round(day.predicted_price).toLocaleString('en-IN')}</div>
                <div className="forecast-range">₹{Math.round(day.range_low)} – ₹{Math.round(day.range_high)}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Model Architecture & Transparency */}
        <div style={{ backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', padding: '0.85rem', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
          <div style={{ fontWeight: 700, color: 'var(--primary-dark)', marginBottom: '0.2rem' }}>
            Model Information:
          </div>
          <div>Algorithm: <strong>{model_info.algorithm}</strong> &bull; Evaluation $R^2$: <strong>{model_info.evaluation_r2}</strong> &bull; Holdout MAE: <strong>₹{model_info.evaluation_mae}</strong></div>
          <div style={{ marginTop: '0.25rem' }}>Method: {model_info.source}</div>
        </div>

        {/* 4. Mandatory AI Disclaimer */}
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic', borderLeft: '3px solid var(--border-medium)', paddingLeft: '0.5rem' }}>
          {disclaimer}
        </div>
      </div>
    </div>
  );
}
