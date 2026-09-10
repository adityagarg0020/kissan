# 🌾 KissanSaathi

> **Agricultural Market Intelligence, Price Discovery & AI Decision Support for Indian Farmers**  
> *Developed for Smart India Hackathon (SIH Problem Statement SIH26132)*

---

## 📌 Project Overview

KissanSaathi is a multi-page agricultural market intelligence platform designed to empower Indian farmers with transparent APMC mandi auction rates, nearest-market distance matrix calculations, 10-year historical AgMarknet price benchmarks, and machine learning price prediction models.

---

## 🚀 Key Features

1. **🏠 Dashboard (`/`)**: Comprehensive summary of active reporting mandis (40,309 records loaded), 8 popular commodity price cards with live intraday movements, quick navigation to all modules, and active price alerts.
2. **📈 Live Mandi Prices (`/market`)**: Continuous RIGHT → LEFT live price ticker, cascading filters (Commodity, State, District, Mandi, Variety, Grade), search bar, Hero Price Card, and paginated official AgMarknet auction records table.
3. **📍 Nearby Mandis (`/nearby-mandis`)**: GPS ("Use My Location") and manual location selection, 60/30/10 best recommended mandi scoring, nearby mandis list with straight-line Haversine distances, and transportation burden levels (Low / Moderate / High).
4. **⚖️ Price Comparison (`/comparison`)**: Multi-mandi interactive checklist (select 2–8 mandis), highest current price, lowest current price, price spread calculations (+% and ₹/q), and side-by-side SVG comparison bar chart.
5. **📊 Historical Analysis (`/historical`)**: 10-year state-level monthly AgMarknet records (2016–2026), interactive SVG trend line chart with hover points, best historical month, 12-month price heatmap, seasonal breakdown (Kharif, Rabi, Zaid), volatility ratings (CV%), and state rankings.
6. **🤖 AI Price Prediction (`/prediction`)**: 7-day forecast trajectory SVG chart with statistical confidence ribbons, day-by-day projected rates, trend classification (*Increasing* / *Decreasing* / *Stable*), and evaluation metrics ($R^2 = 0.9279$, Holdout MAE = ₹414.52). Fallback message for insufficient data: *"Not enough historical data to generate a reliable forecast."*
7. **🌾 Sell Decision Support (`/sell-decision`)**: Data-backed guidance comparing current price strength against 10-year historical baselines and forecast direction with explicit *Why this recommendation was generated* explanation and non-guarantee decision support disclaimers.
8. **🔔 Price Alerts (`/alerts`)**: Farmer price alerts management for price ceiling breaches, floor drops, percentage volatility shifts, and AI forecast trajectory changes.

---

## 🏗️ Architecture & Technology Stack

- **Frontend**: React 19, React Router 7, Vite, Lucide Icons, Pure CSS Design System.
- **Backend API**: Node.js, Express.js, CORS, CSV Parser, Haversine Distance Engine.
- **Machine Learning**: Python, Scikit-Learn (HistGradientBoostingRegressor), Pandas, NumPy.
- **Data Sources**: Official Agmarknet daily arrival records (40,309 records) and 10-year monthly historical state-level records (38,550 observations) via Data.gov.in.

---

## 💻 Quick Start

### Prerequisites
- Node.js (v18+)
- Python (v3.9+)

### Installation & Launch

1. Clone the repository:
   ```bash
   git clone https://github.com/adityagarg0020/Kissan-Saathi.git
   cd Kissan-Saathi
   ```

2. Install dependencies:
   ```bash
   # Install frontend dependencies
   cd frontend
   npm install
   cd ..

   # Install backend dependencies
   cd backend
   npm install
   cd ..
   ```

3. Launch both frontend and backend concurrently from project root:
   ```bash
   npm run dev
   ```

- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:5050](http://localhost:5050)
