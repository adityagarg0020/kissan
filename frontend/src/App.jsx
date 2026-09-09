import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MarketProvider } from './context/MarketContext';
import AppLayout from './components/layout/AppLayout';

// 8 Dedicated Route Pages
import DashboardPage from './pages/DashboardPage';
import LiveMarketPage from './pages/LiveMarketPage';
import NearbyMandisPage from './pages/NearbyMandisPage';
import ComparisonPage from './pages/ComparisonPage';
import HistoricalPage from './pages/HistoricalPage';
import PredictionPage from './pages/PredictionPage';
import SellDecisionPage from './pages/SellDecisionPage';
import AlertsPage from './pages/AlertsPage';

export default function App() {
  return (
    <MarketProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AppLayout />}>
            {/* 1. Dashboard */}
            <Route index element={<DashboardPage />} />

            {/* 2. Live Mandi Prices */}
            <Route path="market" element={<LiveMarketPage />} />

            {/* 3. Nearby Mandis */}
            <Route path="nearby-mandis" element={<NearbyMandisPage />} />

            {/* 4. Price Comparison */}
            <Route path="comparison" element={<ComparisonPage />} />

            {/* 5. Historical Analysis */}
            <Route path="historical" element={<HistoricalPage />} />

            {/* 6. AI Price Prediction */}
            <Route path="prediction" element={<PredictionPage />} />

            {/* 7. Sell Decision */}
            <Route path="sell-decision" element={<SellDecisionPage />} />

            {/* 8. Price Alerts */}
            <Route path="alerts" element={<AlertsPage />} />

            {/* Catch-all redirect to Dashboard */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </MarketProvider>
  );
}
