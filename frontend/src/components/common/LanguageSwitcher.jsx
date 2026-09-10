import React from 'react';
import { Globe } from 'lucide-react';
import { useTranslation, SUPPORTED_LANGUAGES } from '../../i18n';

export default function LanguageSwitcher({ compact = false, style = {} }) {
  const { language, changeLanguage } = useTranslation();

  return (
    <div
      className="language-switcher"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.35rem',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        border: '1px solid var(--border-medium)',
        borderRadius: 'var(--radius-pill)',
        padding: '0.22rem 0.4rem',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
        ...style
      }}
      role="group"
      aria-label="Select Language / भाषा चुनें"
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0 0.25rem', color: 'var(--primary-deep)' }}>
        <Globe size={14} />
        {!compact && (
          <span style={{ fontSize: '0.74rem', fontWeight: 700, letterSpacing: '0.02em', textTransform: 'uppercase' }}>
            भाषा
          </span>
        )}
      </div>

      <div style={{ display: 'inline-flex', gap: '0.2rem' }}>
        {SUPPORTED_LANGUAGES.map((lang) => {
          const isActive = language === lang.code;
          return (
            <button
              key={lang.code}
              onClick={() => changeLanguage(lang.code)}
              style={{
                border: 'none',
                backgroundColor: isActive ? 'var(--primary-deep)' : 'transparent',
                color: isActive ? '#ffffff' : 'var(--text-main)',
                borderRadius: 'var(--radius-pill)',
                padding: '0.2rem 0.6rem',
                fontSize: '0.78rem',
                fontWeight: isActive ? 700 : 500,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                outline: 'none'
              }}
              title={lang.nativeName}
              aria-pressed={isActive}
            >
              {lang.nativeName}
            </button>
          );
        })}
      </div>
    </div>
  );
}
