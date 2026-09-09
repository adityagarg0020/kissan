const express = require('express');
const router = express.Router();
const dataService = require('../services/dataService');
const distanceService = require('../services/distanceService');
const recommendationService = require('../services/recommendationService');
const historicalService = require('../services/historicalService');
const predictionService = require('../services/predictionService');
const alertService = require('../services/alertService');

// 1. Live Price Ticker
router.get('/ticker', (req, res) => {
  try {
    const ticker = dataService.getLiveTicker();
    res.json({ success: true, count: ticker.length, ticker });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2. Cascading Search Filters
router.get('/filters', (req, res) => {
  try {
    const { commodity, state, district } = req.query;
    const filterOptions = dataService.getFilterOptions(commodity, state, district);
    res.json({ success: true, ...filterOptions });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. Search Mandi Prices
router.get('/search', (req, res) => {
  try {
    const { commodity, state, district, market, variety, grade, limit, page } = req.query;
    const result = dataService.searchMandiPrices({
      commodity,
      state,
      district,
      market,
      variety,
      grade,
      limit: limit ? parseInt(limit, 10) : 50,
      page: page ? parseInt(page, 10) : 1
    });
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. Current Price Details
router.get('/current-price', (req, res) => {
  try {
    const { commodity, state, district, market } = req.query;
    if (!commodity) {
      return res.status(400).json({ success: false, error: 'commodity query parameter is required' });
    }
    const details = dataService.getCurrentPriceDetails({ commodity, state, district, market });
    if (!details) {
      return res.status(404).json({
        success: false,
        message: 'No current mandi record found matching criteria.'
      });
    }
    res.json({ success: true, data: details });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 5. Nearby Mandis (Haversine Straight-line Distance)
router.get('/nearby', (req, res) => {
  try {
    const { commodity, lat, lng, district, max_radius, limit } = req.query;
    const nearby = distanceService.findNearbyMandis({
      commodity: commodity || 'Wheat',
      userLat: lat ? parseFloat(lat) : null,
      userLng: lng ? parseFloat(lng) : null,
      userDistrict: district || null,
      maxRadiusKm: max_radius ? parseFloat(max_radius) : 150,
      limit: limit ? parseInt(limit, 10) : 15
    });
    res.json({ success: true, ...nearby });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 6. Compare Nearby Mandis & Price Spread
router.get('/compare', (req, res) => {
  try {
    const { commodity, lat, lng, district } = req.query;
    const comparison = recommendationService.getBestNearbyMandi({
      commodity: commodity || 'Wheat',
      userLat: lat ? parseFloat(lat) : null,
      userLng: lng ? parseFloat(lng) : null,
      userDistrict: district || null
    });
    res.json({ success: true, ...comparison });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 7. Best Nearby Mandi Recommendation
router.get('/best-nearby', (req, res) => {
  try {
    const { commodity, lat, lng, district } = req.query;
    const result = recommendationService.getBestNearbyMandi({
      commodity: commodity || 'Wheat',
      userLat: lat ? parseFloat(lat) : null,
      userLng: lng ? parseFloat(lng) : null,
      userDistrict: district || null
    });
    res.json({ success: true, best_mandi: result.best_mandi });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 8. 10-Year Historical Price Trend
router.get('/history', (req, res) => {
  try {
    const { commodity, state } = req.query;
    const trend = historicalService.getHistoricalTrend(commodity || 'Wheat', state || 'All India');
    res.json({ success: true, ...trend });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 9. Comprehensive Historical Intelligence (Best Month, State Ranking, Heatmap, Season, Volatility, Anomaly)
router.get('/historical-analysis', (req, res) => {
  try {
    const { commodity, state, current_price, sort_by } = req.query;
    const crop = commodity || 'Wheat';
    const st = state || 'All India';
    const cPrice = current_price ? parseFloat(current_price) : null;

    const trend = historicalService.getHistoricalTrend(crop, st);
    const bestMonth = historicalService.getBestHistoricalMonth(crop, st);
    const stateRanking = historicalService.getStateWiseAnalysis(crop, sort_by || 'highest_average');
    const seasonal = historicalService.getSeasonalAnalysis(crop, st);
    const volatilityAnomaly = historicalService.getVolatilityAndAnomaly(crop, st, cPrice);

    res.json({
      success: true,
      commodity: crop,
      state: st,
      trend,
      best_month: bestMonth,
      state_ranking: stateRanking,
      seasonal,
      volatility: volatilityAnomaly.volatility,
      anomaly: volatilityAnomaly.anomaly,
      disclaimers: {
        historical: 'Historical patterns do not guarantee future prices.',
        indicative: 'Market prices are indicative and may vary depending on quality, grade, quantity, arrivals and market conditions.'
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 10. AI Price Prediction & Sell Now / Wait Decision Support
router.post('/predict-price', async (req, res) => {
  try {
    const { commodity, state, current_price, horizon_days } = req.body;
    const forecast = await predictionService.getPrediction({
      commodity: commodity || 'Wheat',
      state: state || 'Uttar Pradesh',
      currentPrice: current_price ? parseFloat(current_price) : null,
      horizonDays: horizon_days ? parseInt(horizon_days, 10) : 7
    });
    res.json({ success: true, ...forecast });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/forecast', async (req, res) => {
  try {
    const { commodity, state, current_price, horizon_days } = req.query;
    const forecast = await predictionService.getPrediction({
      commodity: commodity || 'Wheat',
      state: state || 'Uttar Pradesh',
      currentPrice: current_price ? parseFloat(current_price) : null,
      horizonDays: horizon_days ? parseInt(horizon_days, 10) : 7
    });
    res.json({ success: true, ...forecast });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 11. Alerts Endpoints
router.get('/alerts', (req, res) => {
  res.json({ success: true, alerts: alertService.getAlerts() });
});

router.post('/alerts', (req, res) => {
  try {
    const newAlert = alertService.createAlert(req.body);
    res.json({ success: true, alert: newAlert });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete('/alerts/:id', (req, res) => {
  try {
    const result = alertService.deleteAlert(req.params.id);
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
