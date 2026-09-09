import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import PriceTicker from '../common/PriceTicker';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import MobileNavigation from './MobileNavigation';

export default function AppLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="app-shell">
      {/* 1. Global Live Price Ticker (RIGHT -> LEFT continuous marquee) */}
      <PriceTicker />

      <div className="app-body-layout">
        {/* 2. Desktop Persistent Sidebar */}
        <div className="desktop-sidebar-container">
          <Sidebar />
        </div>

        {/* 3. Main Workspace Area */}
        <div className="main-viewport-container">
          {/* Top Navbar */}
          <Navbar onToggleMobileMenu={() => setMobileMenuOpen(true)} />

          {/* Dedicated Page View Outlet */}
          <main className="content-outlet">
            <Outlet />
          </main>

          {/* Standardized Footer */}
          <footer className="global-app-footer">
            <p>
              <strong>KisanSaathi Market Intelligence System</strong> &bull; Developed under SIH Problem Statement SIH26127
            </p>
            <p style={{ marginTop: '0.25rem' }}>
              Data Source: Agmarknet via Data.gov.in &bull; Official Government Mandi Price Database
            </p>
            <p style={{ marginTop: '0.25rem', fontSize: '0.74rem' }}>
              Market prices and forecasts are indicative and do not guarantee future profit or rates.
            </p>
          </footer>
        </div>
      </div>

      {/* 4. Mobile Navigation (Drawer + Compact Bottom Bar) */}
      <MobileNavigation
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />
    </div>
  );
}
