import React, { useState, useEffect } from 'react';
import { Scale, CheckSquare, Square, TrendingUp, TrendingDown, ArrowUpDown, Filter } from 'lucide-react';
import { useMarket } from '../context/MarketContext';
import CropSelector from '../components/common/CropSelector';
import StateSelector from '../components/common/StateSelector';
import DistrictSelector from '../components/common/DistrictSelector';
import ComparisonChart from '../components/charts/ComparisonChart';
import LoadingState from '../components/common/LoadingState';
import EmptyState from '../components/common/EmptyState';

export default function ComparisonPage() {
  const {
    filters,
    updateFilters,
    commodities,
    states,
    districts
  } = useMarket();

  const [availableMandis, setAvailableMandis] = useState([]);
  const [selectedMandiNames, setSelectedMandiNames] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch all mandis matching commodity, state, district
  useEffect(() => {
    if (!filters.commodity) return;
    setLoading(true);

    const params = new URLSearchParams({
      commodity: filters.commodity,
      state: filters.state || '',
      district: filters.district || '',
      limit: '30'
    });

    fetch(`/api/market/search?${params.toString()}`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.records) {
          // Deduplicate by market name
          const seen = new Set();
          const unique = [];
          for (const r of data.records) {
            if (!seen.has(r.market)) {
              seen.add(r.market);
              unique.push(r);
            }
          }
          setAvailableMandis(unique);

          // By default, select first 4-5 mandis
          setSelectedMandiNames(unique.slice(0, 5).map(m => m.market));
        } else {
          setAvailableMandis([]);
          setSelectedMandiNames([]);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching mandis for comparison:', err);
        setLoading(false);
      });
  }, [filters.commodity, filters.state, filters.district]);

  const toggleMandi = (marketName) => {
    if (selectedMandiNames.includes(marketName)) {
      if (selectedMandiNames.length === 1) return; // keep at least 1
      setSelectedMandiNames(selectedMandiNames.filter(m => m !== marketName));
    } else {
      if (selectedMandiNames.length >= 8) return; // max 8 for clean comparison
      setSelectedMandiNames([...selectedMandiNames, marketName]);
    }
  };

  const selectAll = () => {
    setSelectedMandiNames(availableMandis.slice(0, 8).map(m => m.market));
  };

  const comparedMandis = availableMandis.filter(m => selectedMandiNames.includes(m.market));

  // Compute highest, lowest, price difference
  const prices = comparedMandis.map(m => Number(m.modal_price) || 0);
  const highestPrice = prices.length > 0 ? Math.max(...prices) : 0;
  const lowestPrice = prices.length > 0 ? Math.min(...prices) : 0;
  const priceSpread = highestPrice - lowestPrice;
  const spreadPercent = lowestPrice > 0 ? Math.round((priceSpread / lowestPrice) * 1000) / 10 : 0;

  const highestMandi = comparedMandis.find(m => Number(m.modal_price) === highestPrice);
  const lowestMandi = comparedMandis.find(m => Number(m.modal_price) === lowestPrice);

  return (
    <div className="comparison-page">
      {/* Page Header */}
      <div className="page-header-box">
        <h1 className="page-title">
          ⚖️ Multi-Mandi Price Comparison
        </h1>
        <p className="page-subtitle">
          Compare current auction prices across multiple mandis simultaneously to identify market price differences and maximize selling realization.
        </p>
      </div>

      {/* Filter Controls */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="card-header">
          <div className="card-title">
            <Filter size={18} color="var(--primary)" /> Filter Mandis to Compare
          </div>
        </div>

        <div className="filter-grid">
          <CropSelector
            value={filters.commodity}
            onChange={(val) => updateFilters({ commodity: val })}
            commodities={commodities}
            showAllOption={false}
          />

          <StateSelector
            value={filters.state}
            onChange={(val) => updateFilters({ state: val, district: '' })}
            states={states}
            showAllOption={true}
          />

          <DistrictSelector
            value={filters.district}
            onChange={(val) => updateFilters({ district: val })}
            districts={districts}
            disabled={!filters.state}
            showAllOption={true}
          />
        </div>
      </div>

      {loading && (
        <LoadingState message={`Finding mandis trading ${filters.commodity}...`} />
      )}

      {!loading && availableMandis.length === 0 && (
        <EmptyState
          title={`No Mandis Found for ${filters.commodity}`}
          message="Try selecting an adjoining district or state to find active markets."
        />
      )}

      {!loading && availableMandis.length > 0 && (
        <>
          {/* Mandi Multi-Selection Checklist */}
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <span style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--primary-dark)' }}>
                  Select Mandis to Compare ({selectedMandiNames.length} of {Math.min(availableMandis.length, 8)} selected)
                </span>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Check 2 to 8 markets to compare side-by-side
                </div>
              </div>

              <button
                className="btn btn-outline"
                onClick={selectAll}
                style={{ fontSize: '0.78rem', padding: '0.3rem 0.65rem' }}
              >
                Select First 8
              </button>
            </div>

            <div className="mandi-checkbox-grid">
              {availableMandis.map((m) => {
                const isChecked = selectedMandiNames.includes(m.market);
                return (
                  <button
                    key={m.market}
                    type="button"
                    className={`mandi-check-pill ${isChecked ? 'selected' : ''}`}
                    onClick={() => toggleMandi(m.market)}
                  >
                    {isChecked ? <CheckSquare size={16} color="var(--primary)" /> : <Square size={16} color="var(--text-muted)" />}
                    <span style={{ fontWeight: 600 }}>{m.market}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>({m.district})</span>
                    <span style={{ fontWeight: 700, marginLeft: 'auto', color: 'var(--primary-dark)' }}>₹{m.modal_price}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Spread Summary Highlights */}
          {comparedMandis.length > 1 && (
            <div className="comparison-stats-banner">
              {/* Highest Price */}
              <div className="comp-stat-card high">
                <div className="comp-stat-title">
                  <TrendingUp size={16} /> Highest Current Price
                </div>
                <div className="comp-stat-value">
                  ₹{highestPrice.toLocaleString('en-IN')}<span style={{ fontSize: '0.85rem', fontWeight: 500 }}>/q</span>
                </div>
                <div className="comp-stat-sub">
                  {highestMandi?.market} ({highestMandi?.district})
                </div>
              </div>

              {/* Lowest Price */}
              <div className="comp-stat-card low">
                <div className="comp-stat-title">
                  <TrendingDown size={16} /> Lowest Current Price
                </div>
                <div className="comp-stat-value">
                  ₹{lowestPrice.toLocaleString('en-IN')}<span style={{ fontSize: '0.85rem', fontWeight: 500 }}>/q</span>
                </div>
                <div className="comp-stat-sub">
                  {lowestMandi?.market} ({lowestMandi?.district})
                </div>
              </div>

              {/* Price Difference / Spread */}
              <div className="comp-stat-card spread">
                <div className="comp-stat-title">
                  <ArrowUpDown size={16} /> Current Price Difference
                </div>
                <div className="comp-stat-value">
                  ₹{priceSpread.toLocaleString('en-IN')}<span style={{ fontSize: '0.85rem', fontWeight: 500 }}>/q</span>
                </div>
                <div className="comp-stat-sub">
                  {spreadPercent > 0 ? `+${spreadPercent}% premium between markets` : 'Identical pricing'}
                </div>
              </div>
            </div>
          )}

          {/* Simple Comparison Chart */}
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <div className="card-header">
              <div className="card-title">
                📊 Modal Price Visual Comparison ({filters.commodity})
              </div>
              <span className="card-badge">{comparedMandis.length} Mandis</span>
            </div>

            <ComparisonChart mandis={comparedMandis} />
          </div>

          {/* Detailed Comparison Table */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                📋 Side-by-Side Mandi Comparison Details
              </div>
            </div>

            <div className="mandi-table-wrapper">
              <table className="mandi-table">
                <thead>
                  <tr>
                    <th>Mandi / Market</th>
                    <th>District & State</th>
                    <th style={{ textAlign: 'right' }}>Min Price</th>
                    <th style={{ textAlign: 'right' }}>Max Price</th>
                    <th style={{ textAlign: 'right' }}>Modal Price</th>
                    <th style={{ textAlign: 'right' }}>vs Lowest</th>
                    <th>Arrival Date</th>
                  </tr>
                </thead>
                <tbody>
                  {comparedMandis.map((m) => {
                    const diff = Number(m.modal_price) - lowestPrice;
                    const isHighest = Number(m.modal_price) === highestPrice && comparedMandis.length > 1;

                    return (
                      <tr key={m.market} style={{ backgroundColor: isHighest ? 'var(--primary-wash)' : 'transparent' }}>
                        <td style={{ fontWeight: 700, color: 'var(--primary-dark)' }}>
                          {m.market} {isHighest && <span className="card-badge" style={{ backgroundColor: '#d8f3dc', color: 'var(--primary-dark)', marginLeft: '0.3rem' }}>HIGHEST</span>}
                        </td>
                        <td style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                          {m.district}, {m.state}
                        </td>
                        <td style={{ textAlign: 'right', color: 'var(--text-muted)', fontSize: '0.86rem' }}>
                          ₹{m.min_price}
                        </td>
                        <td style={{ textAlign: 'right', color: 'var(--primary-dark)', fontSize: '0.86rem' }}>
                          ₹{m.max_price}
                        </td>
                        <td style={{ textAlign: 'right', fontWeight: 800, color: 'var(--primary)', fontSize: '1.1rem', fontFamily: 'var(--font-display)' }}>
                          ₹{Number(m.modal_price).toLocaleString('en-IN')}<span style={{ fontSize: '0.75rem', fontWeight: 500 }}>/q</span>
                        </td>
                        <td style={{ textAlign: 'right', fontWeight: 600, fontSize: '0.84rem', color: diff > 0 ? '#2b8a3e' : 'var(--text-muted)' }}>
                          {diff > 0 ? `+₹${diff.toLocaleString('en-IN')}` : '—'}
                        </td>
                        <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                          {m.arrival_date}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
