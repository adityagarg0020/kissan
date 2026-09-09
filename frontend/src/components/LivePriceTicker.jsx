import React, { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function LivePriceTicker() {
  const [tickerItems, setTickerItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/market/ticker')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.ticker) {
          setTickerItems(data.ticker);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch ticker:', err);
        setLoading(false);
      });
  }, []);

  if (loading && tickerItems.length === 0) {
    return (
      <div className="ticker-bar">
        <div style={{ padding: '0.6rem 1rem', fontSize: '0.85rem', color: '#a3b899' }}>
          Loading live Agmarknet market prices...
        </div>
      </div>
    );
  }

  if (tickerItems.length === 0) {
    return null;
  }

  // Duplicate items for seamless continuous looping
  const displayItems = [...tickerItems, ...tickerItems];

  return (
    <div className="ticker-bar" aria-label="Live Market Price Ticker">
      <div className="ticker-track-wrapper">
        <div className="ticker-track">
          {displayItems.map((item, idx) => (
            <div className="ticker-item" key={`${item.commodity}-${idx}`}>
              <span className="ticker-crop">🌾 {item.commodity}</span>
              <span className="ticker-price">₹{item.modal_price.toLocaleString('en-IN')}{item.unit}</span>
              
              {item.movement === 'up' && (
                <span className="ticker-badge up">
                  <TrendingUp size={13} /> +₹{Math.abs(item.change)}
                </span>
              )}
              {item.movement === 'down' && (
                <span className="ticker-badge down">
                  <TrendingDown size={13} /> -₹{Math.abs(item.change)}
                </span>
              )}
              {item.movement === 'neutral' && (
                <span className="ticker-badge neutral">
                  <Minus size={13} /> Steady
                </span>
              )}
              {(item.movement === 'none' || !item.movement) && (
                <span className="ticker-badge neutral" title="Insufficient previous session data">
                  —
                </span>
              )}

              <span className="ticker-date">{item.date}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
