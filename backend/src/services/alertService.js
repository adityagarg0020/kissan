class AlertService {
  constructor() {
    this.alerts = [
      {
        id: 'alert-1',
        commodity: 'Wheat',
        state: 'Uttar Pradesh',
        market: 'Agra',
        alert_type: 'above',
        target_price: 2500,
        current_price: 2450,
        status: 'Active',
        created_at: '2026-09-08'
      },
      {
        id: 'alert-2',
        commodity: 'Tomato',
        state: 'Maharashtra',
        market: 'Pune',
        alert_type: 'movement',
        threshold_pct: 10,
        current_price: 2100,
        status: 'Triggered',
        message: 'Price moved +14.2% over the last 2 recorded market days.',
        created_at: '2026-09-07'
      }
    ];
  }

  getAlerts() {
    return this.alerts;
  }

  createAlert({ commodity, state, market, alert_type, target_price, threshold_pct, current_price }) {
    const newAlert = {
      id: `alert-${Date.now()}`,
      commodity: commodity || 'Wheat',
      state: state || 'All India',
      market: market || 'Any',
      alert_type: alert_type || 'above', // 'above' | 'below' | 'movement' | 'forecast'
      target_price: target_price ? parseFloat(target_price) : null,
      threshold_pct: threshold_pct ? parseFloat(threshold_pct) : 5,
      current_price: current_price ? parseFloat(current_price) : null,
      status: 'Active',
      created_at: new Date().toISOString().split('T')[0]
    };
    this.alerts.unshift(newAlert);
    return newAlert;
  }

  deleteAlert(alertId) {
    this.alerts = this.alerts.filter(a => a.id !== alertId);
    return { success: true, remaining: this.alerts.length };
  }
}

module.exports = new AlertService();
