import React, { useState, useEffect } from 'react';
import { Search, RotateCcw, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { useMarket } from '../context/MarketContext';
import PriceCard from '../components/common/PriceCard';
import CropSelector from '../components/common/CropSelector';
import StateSelector from '../components/common/StateSelector';
import DistrictSelector from '../components/common/DistrictSelector';
import MandiSelector from '../components/common/MandiSelector';
import LoadingState from '../components/common/LoadingState';
import EmptyState from '../components/common/EmptyState';
import DataSourceBadge from '../components/common/DataSourceBadge';

export default function LiveMarketPage() {
  const {
    filters,
    updateFilters,
    commodities,
    states,
    districts,
    markets
  } = useMarket();

  // Local filter states for variety and grade
  const [variety, setVariety] = useState('');
  const [grade, setGrade] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Current price details for hero card
  const [currentPriceData, setCurrentPriceData] = useState(null);
  const [loadingHero, setLoadingHero] = useState(false);

  // Search results list
  const [searchResults, setSearchResults] = useState([]);
  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingResults, setLoadingResults] = useState(false);

  // Available varieties and grades collected from results
  const [availableVarieties, setAvailableVarieties] = useState([]);
  const [availableGrades, setAvailableGrades] = useState([]);

  // Fetch hero current price details
  useEffect(() => {
    if (!filters.commodity) return;
    setLoadingHero(true);

    const params = new URLSearchParams({
      commodity: filters.commodity,
      state: filters.state || '',
      district: filters.district || '',
      market: filters.market || ''
    });

    fetch(`/api/market/current-price?${params.toString()}`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          setCurrentPriceData(data.data);
        } else {
          setCurrentPriceData(null);
        }
        setLoadingHero(false);
      })
      .catch(err => {
        console.error('Error fetching current price:', err);
        setLoadingHero(false);
      });
  }, [filters.commodity, filters.state, filters.district, filters.market]);

  // Fetch paginated mandi search results
  useEffect(() => {
    setLoadingResults(true);

    const params = new URLSearchParams({
      commodity: searchQuery || filters.commodity || '',
      state: filters.state || '',
      district: filters.district || '',
      market: filters.market || '',
      variety: variety || '',
      grade: grade || '',
      page: currentPage.toString(),
      limit: '15'
    });

    fetch(`/api/market/search?${params.toString()}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setSearchResults(data.records || []);
          setTotalResults(data.total || 0);
          setTotalPages(data.total_pages || 1);

          // Extract unique varieties and grades from records
          if (data.records) {
            const vList = [...new Set(data.records.map(r => r.variety).filter(Boolean))].sort();
            const gList = [...new Set(data.records.map(r => r.grade).filter(Boolean))].sort();
            setAvailableVarieties(vList);
            setAvailableGrades(gList);
          }
        } else {
          setSearchResults([]);
          setTotalResults(0);
        }
        setLoadingResults(false);
      })
      .catch(err => {
        console.error('Error searching mandi prices:', err);
        setLoadingResults(false);
      });
  }, [filters.commodity, filters.state, filters.district, filters.market, variety, grade, searchQuery, currentPage]);

  const handleResetFilters = () => {
    updateFilters({
      commodity: 'Wheat',
      state: 'Uttar Pradesh',
      district: 'Agra',
      market: ''
    });
    setVariety('');
    setGrade('');
    setSearchQuery('');
    setCurrentPage(1);
  };

  return (
    <div className="live-market-page">
      {/* Page Header */}
      <div className="page-header-box">
        <h1 className="page-title">
          📈 Live Mandi Prices & Arrivals
        </h1>
        <p className="page-subtitle">
          Real-time auction rates, min/max spreads, and official arrival logs reported directly from Agmarknet APMC markets across India.
        </p>
      </div>

      {/* Cascading Search & Filters Bar */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="card-header">
          <div className="card-title">
            <Filter size={18} color="var(--primary)" /> Filter Market Auctions
          </div>
          <button
            className="btn btn-outline"
            onClick={handleResetFilters}
            style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
            title="Reset filters to default"
          >
            <RotateCcw size={14} /> Reset Filters
          </button>
        </div>

        {/* Free text search input */}
        <div style={{ marginBottom: '1rem' }}>
          <div className="search-input-wrapper">
            <Search size={18} color="var(--text-muted)" />
            <input
              type="text"
              className="search-input-field"
              placeholder="Search by crop name (e.g. Wheat, Tomato, Mustard, Onion, Rice)..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
            />
            {searchQuery && (
              <button
                className="btn-clear"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
              >
                &times;
              </button>
            )}
          </div>
        </div>

        {/* Cascading Filter Selectors Grid */}
        <div className="filter-grid">
          {/* 1. Crop / Commodity */}
          <CropSelector
            value={filters.commodity}
            onChange={(val) => {
              updateFilters({ commodity: val, market: '' });
              setCurrentPage(1);
            }}
            commodities={commodities}
            showAllOption={true}
          />

          {/* 2. State */}
          <StateSelector
            value={filters.state}
            onChange={(val) => {
              updateFilters({ state: val, district: '', market: '' });
              setCurrentPage(1);
            }}
            states={states}
            showAllOption={true}
          />

          {/* 3. District */}
          <DistrictSelector
            value={filters.district}
            onChange={(val) => {
              updateFilters({ district: val, market: '' });
              setCurrentPage(1);
            }}
            districts={districts}
            disabled={!filters.state}
            showAllOption={true}
          />

          {/* 4. Mandi / Market */}
          <MandiSelector
            value={filters.market}
            onChange={(val) => {
              updateFilters({ market: val });
              setCurrentPage(1);
            }}
            markets={markets}
            disabled={!filters.district}
            showAllOption={true}
          />

          {/* 5. Variety Filter */}
          <div className="form-group">
            <label className="form-label" htmlFor="variety-filter">5. Variety</label>
            <select
              id="variety-filter"
              className="form-select"
              value={variety}
              onChange={(e) => {
                setVariety(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="">-- All Varieties --</option>
              {availableVarieties.map(v => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          </div>

          {/* 6. Grade Filter */}
          <div className="form-group">
            <label className="form-label" htmlFor="grade-filter">6. Grade</label>
            <select
              id="grade-filter"
              className="form-select"
              value={grade}
              onChange={(e) => {
                setGrade(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="">-- All Grades --</option>
              {availableGrades.map(g => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Hero Current Mandi Price Card */}
      <div style={{ marginBottom: '1.5rem' }}>
        {loadingHero ? (
          <LoadingState message="Fetching official mandi price details..." />
        ) : currentPriceData ? (
          <PriceCard priceData={currentPriceData} />
        ) : (
          <div className="card" style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)' }}>
            Select a specific crop and mandi from the filters above to view its hero price card.
          </div>
        )}
      </div>

      {/* Mandi Auction Records Table & List */}
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">
              📋 Official Mandi Auction Records
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
              Showing {searchResults.length} of {totalResults.toLocaleString('en-IN')} matching Agmarknet records
            </div>
          </div>
          <DataSourceBadge source="Agmarknet Data.gov.in" verified={true} />
        </div>

        {loadingResults ? (
          <LoadingState message="Searching mandi records..." />
        ) : searchResults.length === 0 ? (
          <EmptyState
            title="No Mandi Records Match Your Filters"
            message="Try clearing your variety or district filter to view broader market records."
            action={
              <button className="btn btn-outline" onClick={handleResetFilters}>
                Reset All Filters
              </button>
            }
          />
        ) : (
          <>
            <div className="mandi-table-wrapper">
              <table className="mandi-table">
                <thead>
                  <tr>
                    <th>Mandi / Market</th>
                    <th>Location</th>
                    <th>Commodity</th>
                    <th>Variety / Grade</th>
                    <th style={{ textAlign: 'right' }}>Min Price</th>
                    <th style={{ textAlign: 'right' }}>Max Price</th>
                    <th style={{ textAlign: 'right' }}>Modal Price</th>
                    <th>Arrival Date</th>
                  </tr>
                </thead>
                <tbody>
                  {searchResults.map((row, idx) => (
                    <tr key={`${row.market}-${row.commodity}-${idx}`}>
                      <td style={{ fontWeight: 700, color: 'var(--primary-dark)' }}>
                        {row.market}
                      </td>
                      <td style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                        {row.district}, {row.state}
                      </td>
                      <td style={{ fontWeight: 600 }}>
                        🌾 {row.commodity}
                      </td>
                      <td>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-main)' }}>
                          {row.variety || 'Standard'}
                        </span>
                        {row.grade && (
                          <span className="card-badge" style={{ marginLeft: '0.35rem', fontSize: '0.7rem' }}>
                            {row.grade}
                          </span>
                        )}
                      </td>
                      <td style={{ textAlign: 'right', color: 'var(--text-muted)', fontSize: '0.86rem' }}>
                        ₹{row.min_price}
                      </td>
                      <td style={{ textAlign: 'right', color: 'var(--primary-dark)', fontSize: '0.86rem' }}>
                        ₹{row.max_price}
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 800, color: 'var(--primary)', fontSize: '1.05rem', fontFamily: 'var(--font-display)' }}>
                        ₹{row.modal_price.toLocaleString('en-IN')}<span style={{ fontSize: '0.75rem', fontWeight: 500 }}>/q</span>
                      </td>
                      <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                        {row.arrival_date}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="pagination-bar">
                <button
                  className="btn btn-outline"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage <= 1}
                  style={{ padding: '0.4rem 0.8rem', fontSize: '0.82rem' }}
                >
                  <ChevronLeft size={16} /> Previous
                </button>

                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                  Page {currentPage} of {totalPages}
                </span>

                <button
                  className="btn btn-outline"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage >= totalPages}
                  style={{ padding: '0.4rem 0.8rem', fontSize: '0.82rem' }}
                >
                  Next <ChevronRight size={16} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
