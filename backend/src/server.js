require('dotenv').config();
const express = require('express');
const cors = require('cors');
const marketRoutes = require('./routes/marketRoutes');
const dataService = require('./services/dataService');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*', // Allow local frontend dev server
  methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Request logger (safe, no keys)
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[HTTP] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// Health check
const healthHandler = (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'KisanSaathi Market Intelligence API',
    data_loaded: dataService.isLoaded,
    mandi_records_count: dataService.mandiRecords.length,
    historical_records_count: dataService.historicalRecords.length
  });
};
app.get('/api/health', healthHandler);
app.get('/health', healthHandler);

// Mount Routes (with and without /api prefix for Vercel serverless rewrite compatibility)
app.use('/api/market', marketRoutes);
app.use('/market', marketRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Endpoint not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('[ServerError]', err);
  res.status(500).json({ success: false, error: 'Internal server error' });
});

// Start Server after Data Initialization
async function startServer() {
  try {
    await dataService.initialize();
    app.listen(PORT, () => {
      console.log(`======================================================================`);
      console.log(`🚀 KisanSaathi Backend Server running on http://localhost:${PORT}`);
      console.log(`🌱 Market Intelligence & Price Discovery Module Active`);
      console.log(`📁 Data: ${dataService.mandiRecords.length} mandi records, ${dataService.historicalRecords.length} 10-year records`);
      console.log(`🔒 Data.gov.in API Key is securely protected in backend .env`);
      console.log(`======================================================================`);
    });
  } catch (e) {
    console.error('[Fatal Error] Failed to start backend:', e);
    process.exit(1);
  }
}

if (!process.env.VERCEL && require.main === module) {
  startServer();
}

module.exports = app;
module.exports.startServer = startServer;
