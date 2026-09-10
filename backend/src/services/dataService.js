const fs = require('fs');
const path = require('path');
const readline = require('readline');

const DATA_DIR = fs.existsSync(path.join(process.cwd(), 'Data'))
  ? path.join(process.cwd(), 'Data')
  : path.resolve(__dirname, '../../../Data');
const PROCESSED_DIR = path.join(DATA_DIR, 'processed');

// Canonical state mappings to bridge naming variations
const STATE_ALIASES = {
  'andaman and nicobar': 'Andaman And Nicobar Islands',
  'andaman and nicobar islands': 'Andaman And Nicobar Islands',
  'chattisgarh': 'Chhattisgarh',
  'chhattisgarh': 'Chhattisgarh',
  'jammu and kashmir': 'Jammu And Kashmir',
  'keralam': 'Kerala',
  'kerala': 'Kerala',
  'nct of delhi': 'Delhi',
  'delhi': 'Delhi',
  'pondicherry': 'Puducherry',
  'puducherry': 'Puducherry'
};

function canonicalState(state) {
  if (!state) return state;
  const key = state.trim().toLowerCase();
  return STATE_ALIASES[key] || state.trim();
}

class DataService {
  constructor() {
    this.mandiRecords = [];
    this.historicalRecords = [];
    this.cropCrosswalk = {};
    this.districtCoordinates = {};
    this.isLoaded = false;
  }

  async initialize() {
    if (this.isLoaded) return;
    console.log('[DataService] Loading datasets into memory...');

    // 1. Load Crop Crosswalk
    try {
      const cwPath = path.join(PROCESSED_DIR, 'crop_crosswalk.json');
      if (fs.existsSync(cwPath)) {
        this.cropCrosswalk = JSON.parse(fs.readFileSync(cwPath, 'utf8'));
      }
    } catch (e) {
      console.error('[DataService] Failed to load crop_crosswalk.json:', e);
    }

    // 2. Load District Coordinates
    try {
      const coordPath = path.join(PROCESSED_DIR, 'district_coordinates.json');
      if (fs.existsSync(coordPath)) {
        this.districtCoordinates = JSON.parse(fs.readFileSync(coordPath, 'utf8'));
      }
    } catch (e) {
      console.error('[DataService] Failed to load district_coordinates.json:', e);
    }

    // 3. Load Clean Mandi Prices
    await this.loadMandiData();

    // 4. Load Clean Historical Prices
    await this.loadHistoricalData();

    this.isLoaded = true;
    console.log(`[DataService] Datasets loaded: ${this.mandiRecords.length} mandi records, ${this.historicalRecords.length} historical records.`);
  }

  async reloadMandiData() {
    this.mandiRecords = [];
    await this.loadMandiData();
    console.log(`[DataService] Mandi dataset reloaded: ${this.mandiRecords.length} records in memory.`);
    return this.mandiRecords.length;
  }

  async loadMandiData() {
    const filePath = path.join(PROCESSED_DIR, 'mandi_prices_clean.csv');
    if (!fs.existsSync(filePath)) {
      console.error('[DataService] mandi_prices_clean.csv not found at:', filePath);
      return;
    }

    const fileStream = fs.createReadStream(filePath);
    const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

    let headers = null;
    for await (const line of rl) {
      if (!headers) {
        headers = line.split(',').map(h => h.trim());
        continue;
      }
      if (!line.trim()) continue;

      // Handle simple CSV parsing
      const values = this.parseCSVLine(line);
      const row = {};
      headers.forEach((h, i) => {
        row[h] = values[i] !== undefined ? values[i].trim() : '';
      });

      const minPrice = parseFloat(row.min_price) || 0;
      const maxPrice = parseFloat(row.max_price) || 0;
      const modalPrice = parseFloat(row.modal_price) || 0;

      if (modalPrice > 0) {
        this.mandiRecords.push({
          state: row.state,
          canonical_state: canonicalState(row.state),
          district: row.district,
          market: row.market,
          commodity: row.commodity,
          variety: row.variety,
          grade: row.grade,
          arrival_date: row.arrival_date,
          min_price: minPrice,
          max_price: maxPrice,
          modal_price: modalPrice,
          price_spread: parseFloat(row.price_spread) || (maxPrice - minPrice),
          spread_ratio: parseFloat(row.spread_ratio) || 0
        });
      }
    }
  }

  async loadHistoricalData() {
    const filePath = path.join(PROCESSED_DIR, 'historical_prices_clean.csv');
    if (!fs.existsSync(filePath)) {
      console.error('[DataService] historical_prices_clean.csv not found at:', filePath);
      return;
    }

    const fileStream = fs.createReadStream(filePath);
    const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

    let headers = null;
    for await (const line of rl) {
      if (!headers) {
        headers = line.split(',').map(h => h.trim());
        continue;
      }
      if (!line.trim()) continue;

      const values = this.parseCSVLine(line);
      const row = {};
      headers.forEach((h, i) => {
        row[h] = values[i] !== undefined ? values[i].trim() : '';
      });

      const price = parseFloat(row['Mandi Modal Price (AgMarknet)']) || 0;
      if (price > 0) {
        this.historicalRecords.push({
          state: row.State,
          canonical_state: canonicalState(row.State),
          crop: row.Crop,
          calendar: row.Calendar,
          modal_price: price,
          month: parseInt(row.month, 10) || 1,
          month_name: row.month_name || '',
          year: parseInt(row.year, 10) || 2020,
          date: row.date,
          season: row.season || ''
        });
      }
    }
  }

  parseCSVLine(text) {
    const result = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if (c === '"') {
        inQuotes = !inQuotes;
      } else if (c === ',' && !inQuotes) {
        result.push(cur);
        cur = '';
      } else {
        cur += c;
      }
    }
    result.push(cur);
    return result;
  }

  // Find historical crop name corresponding to a mandi commodity
  matchHistoricalCrop(commodity) {
    if (!commodity) return null;
    const cLower = commodity.trim().toLowerCase();

    // Direct match check against crop crosswalk
    for (const histCrop of Object.keys(this.cropCrosswalk)) {
      if (histCrop.toLowerCase() === cLower) {
        return histCrop;
      }
      const mappedList = this.cropCrosswalk[histCrop] || [];
      for (const m of mappedList) {
        if (m.toLowerCase() === cLower || cLower.includes(m.toLowerCase()) || m.toLowerCase().includes(cLower)) {
          return histCrop;
        }
      }
    }

    // Substring fallback
    const allHistCrops = [...new Set(this.historicalRecords.map(r => r.crop))];
    for (const hc of allHistCrops) {
      if (cLower.includes(hc.toLowerCase()) || hc.toLowerCase().includes(cLower)) {
        return hc;
      }
    }
    return null; // Return null when crop is unmapped or unknown
  }

  // Cascading Filter Options
  getFilterOptions(selectedCommodity = null, selectedState = null, selectedDistrict = null) {
    // Unique commodities sorted
    const commodities = [...new Set(this.mandiRecords.map(r => r.commodity))].sort();

    let filtered = this.mandiRecords;
    if (selectedCommodity) {
      filtered = filtered.filter(r => r.commodity.toLowerCase() === selectedCommodity.toLowerCase());
    }

    const states = [...new Set(filtered.map(r => r.state))].sort();

    if (selectedState) {
      filtered = filtered.filter(r => r.state.toLowerCase() === selectedState.toLowerCase());
    }

    const districts = [...new Set(filtered.map(r => r.district))].sort();

    if (selectedDistrict) {
      filtered = filtered.filter(r => r.district.toLowerCase() === selectedDistrict.toLowerCase());
    }

    const markets = [...new Set(filtered.map(r => r.market))].sort();

    return {
      commodities,
      states,
      districts,
      markets,
      counts: {
        records: filtered.length,
        commodities: commodities.length,
        states: states.length,
        districts: districts.length,
        markets: markets.length
      }
    };
  }

  // Live Price Ticker Data (popular commodities with latest modal prices)
  getLiveTicker() {
    const popular = ['Wheat', 'Tomato', 'Onion', 'Potato', 'Rice', 'Paddy(Common)', 'Maize', 'Banana'];
    const tickerItems = [];

    // Dynamically discover latest available dates across mandi records
    const dates = [...new Set(this.mandiRecords.map(r => r.arrival_date))].filter(Boolean).sort().reverse();
    const latestDate = dates[0] || '2026-09-09';
    const prevDate = dates[1] || '2026-09-08';

    // Format DD/MM/YYYY for latest date
    const [ly, lm, ld] = latestDate.split('-');
    const defaultDateFormatted = (ly && lm && ld) ? `${ld}/${lm}/${ly}` : '09/09/2026';

    for (const crop of popular) {
      let latestRows = this.mandiRecords.filter(r => r.commodity.toLowerCase() === crop.toLowerCase() && r.arrival_date === latestDate);
      let targetDateStr = defaultDateFormatted;

      // If popular crop not present on the absolute latest date, fallback to its latest available date
      if (latestRows.length === 0) {
        const cropDates = [...new Set(this.mandiRecords.filter(r => r.commodity.toLowerCase() === crop.toLowerCase()).map(r => r.arrival_date))].filter(Boolean).sort().reverse();
        if (cropDates.length > 0) {
          latestRows = this.mandiRecords.filter(r => r.commodity.toLowerCase() === crop.toLowerCase() && r.arrival_date === cropDates[0]);
          const [cy, cm, cd] = cropDates[0].split('-');
          targetDateStr = (cy && cm && cd) ? `${cd}/${cm}/${cy}` : defaultDateFormatted;
        }
      }

      const prevRows = this.mandiRecords.filter(r => r.commodity.toLowerCase() === crop.toLowerCase() && r.arrival_date === prevDate);

      if (latestRows.length > 0) {
        const avgLatest = Math.round(latestRows.reduce((sum, r) => sum + r.modal_price, 0) / latestRows.length);
        let movement = 'none'; // Default to 'none' if no comparison basis exists
        let diff = null;

        if (prevRows.length > 0) {
          const avgPrev = Math.round(prevRows.reduce((sum, r) => sum + r.modal_price, 0) / prevRows.length);
          diff = avgLatest - avgPrev;
          if (diff > 10) movement = 'up';
          else if (diff < -10) movement = 'down';
          else movement = 'neutral';
        }

        tickerItems.push({
          commodity: crop,
          modal_price: avgLatest,
          unit: '₹/q',
          date: targetDateStr,
          movement: movement, // 'up' | 'down' | 'neutral' | 'none'
          change: diff,
          markets_count: latestRows.length
        });
      }
    }
    return tickerItems;
  }

  // Search Mandi Prices
  searchMandiPrices({ commodity, state, district, market, variety, grade, limit = 50, page = 1 }) {
    let results = this.mandiRecords;

    if (commodity) {
      const q = commodity.trim().toLowerCase();
      results = results.filter(r => r.commodity.toLowerCase().includes(q));
    }
    if (state) {
      const q = state.trim().toLowerCase();
      results = results.filter(r => r.state.toLowerCase() === q || r.canonical_state.toLowerCase() === q);
    }
    if (district) {
      const q = district.trim().toLowerCase();
      results = results.filter(r => r.district.toLowerCase() === q);
    }
    if (market) {
      const q = market.trim().toLowerCase();
      results = results.filter(r => r.market.toLowerCase().includes(q));
    }
    if (variety) {
      const q = variety.trim().toLowerCase();
      results = results.filter(r => r.variety.toLowerCase().includes(q));
    }
    if (grade) {
      const q = grade.trim().toLowerCase();
      results = results.filter(r => r.grade.toLowerCase() === q);
    }

    // Sort by latest arrival date descending, then modal price descending
    results.sort((a, b) => b.arrival_date.localeCompare(a.arrival_date) || b.modal_price - a.modal_price);

    const total = results.length;
    const startIndex = (page - 1) * limit;
    const paginated = results.slice(startIndex, startIndex + limit);

    return {
      total,
      page,
      limit,
      total_pages: Math.ceil(total / limit),
      records: paginated
    };
  }

  // Get Detailed Price for a specific selection
  getCurrentPriceDetails({ commodity, state, district, market }) {
    let matches = this.mandiRecords;

    if (commodity) {
      matches = matches.filter(r => r.commodity.toLowerCase() === commodity.toLowerCase());
    }
    if (state) {
      matches = matches.filter(r => r.state.toLowerCase() === state.toLowerCase() || r.canonical_state.toLowerCase() === canonicalState(state).toLowerCase());
    }
    if (district) {
      const districtMatches = matches.filter(r => r.district.toLowerCase() === district.toLowerCase());
      if (districtMatches.length > 0) {
        matches = districtMatches;
      }
    }
    if (market) {
      const marketMatches = matches.filter(r => r.market.toLowerCase() === market.toLowerCase());
      if (marketMatches.length > 0) {
        matches = marketMatches;
      }
    }

    if (matches.length === 0) {
      return null;
    }

    // Latest observation
    matches.sort((a, b) => b.arrival_date.localeCompare(a.arrival_date));
    const primary = matches[0];

    // Data freshness calculation
    // Snapshot date vs current/reference
    const refDate = new Date('2026-09-08');
    const arrivalParts = primary.arrival_date.split('-'); // YYYY-MM-DD
    const arrivalDateObj = new Date(primary.arrival_date);
    const diffDays = Math.round((refDate - arrivalDateObj) / (1000 * 60 * 60 * 24));

    let freshnessStatus = 'fresh';
    let freshnessMessage = 'Data updated from latest market session';
    if (diffDays > 3) {
      freshnessStatus = 'outdated';
      freshnessMessage = '⚠️ Market data may be outdated (> 3 days old)';
    }

    return {
      commodity: primary.commodity,
      variety: primary.variety,
      grade: primary.grade,
      market: primary.market,
      district: primary.district,
      state: primary.state,
      canonical_state: primary.canonical_state,
      min_price: primary.min_price,
      max_price: primary.max_price,
      modal_price: primary.modal_price,
      price_spread: primary.price_spread,
      unit: '₹/quintal',
      arrival_date: primary.arrival_date,
      display_date: arrivalDateObj.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }),
      freshness: {
        status: freshnessStatus,
        days_ago: diffDays,
        message: freshnessMessage
      },
      source: 'Government mandi data (Data.gov.in / Agmarknet)',
      disclaimer: 'Market prices are indicative and may vary depending on quality, grade, quantity, arrivals and market conditions.'
    };
  }
}

module.exports = new DataService();
