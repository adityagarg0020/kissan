import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';

// Import English Locales
import enCommon from './locales/en/common.json';
import enDashboard from './locales/en/dashboard.json';
import enMarket from './locales/en/market.json';
import enNearby from './locales/en/nearby.json';
import enComparison from './locales/en/comparison.json';
import enHistorical from './locales/en/historical.json';
import enPrediction from './locales/en/prediction.json';
import enSellDecision from './locales/en/sellDecision.json';
import enExpenses from './locales/en/expenses.json';
import enWeather from './locales/en/weather.json';
import enAlerts from './locales/en/alerts.json';
import enAssistant from './locales/en/assistant.json';
import enLanding from './locales/en/landing.json';

// Import Hindi Locales
import hiCommon from './locales/hi/common.json';
import hiDashboard from './locales/hi/dashboard.json';
import hiMarket from './locales/hi/market.json';
import hiNearby from './locales/hi/nearby.json';
import hiComparison from './locales/hi/comparison.json';
import hiHistorical from './locales/hi/historical.json';
import hiPrediction from './locales/hi/prediction.json';
import hiSellDecision from './locales/hi/sellDecision.json';
import hiExpenses from './locales/hi/expenses.json';
import hiWeather from './locales/hi/weather.json';
import hiAlerts from './locales/hi/alerts.json';
import hiAssistant from './locales/hi/assistant.json';
import hiLanding from './locales/hi/landing.json';

const RESOURCES = {
  en: {
    common: enCommon,
    dashboard: enDashboard,
    market: enMarket,
    nearby: enNearby,
    comparison: enComparison,
    historical: enHistorical,
    prediction: enPrediction,
    sellDecision: enSellDecision,
    expenses: enExpenses,
    weather: enWeather,
    alerts: enAlerts,
    assistant: enAssistant,
    landing: enLanding
  },
  hi: {
    common: hiCommon,
    dashboard: hiDashboard,
    market: hiMarket,
    nearby: hiNearby,
    comparison: hiComparison,
    historical: hiHistorical,
    prediction: hiPrediction,
    sellDecision: hiSellDecision,
    expenses: hiExpenses,
    weather: hiWeather,
    alerts: hiAlerts,
    assistant: hiAssistant,
    landing: hiLanding
  }
};

export const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'hi', label: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' }
];

const HINDI_MONTHS = [
  'जनवरी', 'फरवरी', 'मार्च', 'अप्रैल', 'मई', 'जून',
  'जुलाई', 'अगस्त', 'सितंबर', 'अक्टूबर', 'नवंबर', 'दिसंबर'
];

const ENGLISH_MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

const STORAGE_KEY = 'kissansaathi_lang';

const I18nContext = createContext(null);

export function I18nProvider({ children }) {
  // Initialize from localStorage or default to 'en'
  const [language, setLanguage] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && RESOURCES[saved]) {
        return saved;
      }
    } catch (e) {
      console.warn('Could not read saved language from localStorage:', e);
    }
    return 'en';
  });

  // Keep <html> lang attribute synchronized for screen-readers and CSS
  useEffect(() => {
    document.documentElement.lang = language;
    try {
      localStorage.setItem(STORAGE_KEY, language);
    } catch (e) {
      console.warn('Could not persist language to localStorage:', e);
    }
  }, [language]);

  const changeLanguage = useCallback((newLang) => {
    if (RESOURCES[newLang]) {
      setLanguage(newLang);
    }
  }, []);

  // Translation resolver supporting namespaced dot notation (e.g., 'dashboard.welcomeTitle' or 'common.actions.search')
  const t = useCallback((key, params = {}) => {
    if (!key) return '';

    const parts = key.split('.');
    let value = null;

    // 1. Try current language
    const currentRes = RESOURCES[language] || {};
    let curr = currentRes;
    for (const part of parts) {
      if (curr && typeof curr === 'object' && part in curr) {
        curr = curr[part];
      } else {
        curr = null;
        break;
      }
    }
    if (curr !== null && curr !== undefined) {
      value = curr;
    }

    // 2. Fallback to English if not found in current language
    if ((value === null || value === undefined) && language !== 'en') {
      let fallback = RESOURCES.en || {};
      for (const part of parts) {
        if (fallback && typeof fallback === 'object' && part in fallback) {
          fallback = fallback[part];
        } else {
          fallback = null;
          break;
        }
      }
      if (fallback !== null && fallback !== undefined) {
        value = fallback;
      }
    }

    // If still missing, return the last key segment as readable fallback
    if (value === null || value === undefined) {
      return parts[parts.length - 1];
    }

    // If string, handle variable interpolation e.g. {{count}} or {count}
    if (typeof value === 'string') {
      let formatted = value;
      for (const [pKey, pVal] of Object.entries(params)) {
        formatted = formatted.replace(new RegExp(`{{\\s*${pKey}\\s*}}`, 'g'), String(pVal));
        formatted = formatted.replace(new RegExp(`{\\s*${pKey}\\s*}`, 'g'), String(pVal));
      }
      return formatted;
    }

    return value;
  }, [language]);

  // Locale-aware date formatter
  const formatDate = useCallback((dateInput, formatType = 'medium') => {
    if (!dateInput) return '';

    let d;
    if (typeof dateInput === 'string' && /^\d{2}\/\d{2}\/\d{4}$/.test(dateInput)) {
      const [day, month, year] = dateInput.split('/');
      d = new Date(`${year}-${month}-${day}`);
    } else {
      d = new Date(dateInput);
    }

    if (isNaN(d.getTime())) return String(dateInput);

    const day = d.getDate();
    const monthIdx = d.getMonth();
    const year = d.getFullYear();

    if (language === 'hi') {
      const hiMonth = HINDI_MONTHS[monthIdx] || '';
      return `${day} ${hiMonth} ${year}`;
    }

    // English format: 10 Sep 2026
    const enMonth = ENGLISH_MONTHS[monthIdx] || '';
    return `${day} ${enMonth} ${year}`;
  }, [language]);

  // Indian currency / numerical formatter
  const formatNumber = useCallback((num) => {
    if (num === null || num === undefined || isNaN(Number(num))) return '—';
    return Number(num).toLocaleString('en-IN');
  }, []);

  const value = useMemo(() => ({
    language,
    changeLanguage,
    setLanguage: changeLanguage,
    t,
    formatDate,
    formatNumber,
    supportedLanguages: SUPPORTED_LANGUAGES,
    isHindi: language === 'hi'
  }), [language, changeLanguage, t, formatDate, formatNumber]);

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useTranslation must be used within an I18nProvider');
  }
  return context;
}
