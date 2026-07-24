'use client';

// Site language (French by default, switchable to English or Arabic).
// Only fixed UI text (buttons, labels, headings) is translated — see
// lib/i18n/translations.js. Product/hero/about/review content stays in
// whatever language the owner typed it in the dashboard.
import { createContext, useContext, useEffect, useState } from 'react';
import { translations, DEFAULT_LOCALE } from '@/lib/i18n/translations';

const LanguageContext = createContext({
  locale: DEFAULT_LOCALE,
  setLocale: () => {},
  t: (key) => key,
  isRtl: false,
});

function getByPath(obj, path) {
  return path.split('.').reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined), obj);
}

function interpolate(str, vars) {
  if (!vars) return str;
  return str.replace(/\{(\w+)\}/g, (match, key) => (vars[key] !== undefined ? vars[key] : match));
}

export function LanguageProvider({ children }) {
  const [locale, setLocaleState] = useState(DEFAULT_LOCALE);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('luxuryPhoneLocale');
      if (saved && translations[saved]) setLocaleState(saved);
    } catch {
      // localStorage unavailable — keep the default.
    }
  }, []);

  // Keep <html lang="…"> in sync for screen readers/SEO. Layout direction
  // itself is left as ltr everywhere (Arabic text uses dir="rtl" only on
  // the specific text elements that need it, not the whole page).
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  function setLocale(next) {
    if (!translations[next]) return;
    setLocaleState(next);
    try {
      localStorage.setItem('luxuryPhoneLocale', next);
    } catch {
      // ignore
    }
  }

  // Looks up a nested key ("nav.home"), falling back to French, then the
  // key itself, so a missing translation never breaks the page.
  function t(key, vars) {
    const value =
      getByPath(translations[locale], key) ??
      getByPath(translations[DEFAULT_LOCALE], key) ??
      key;
    return typeof value === 'string' ? interpolate(value, vars) : value;
  }

  const isRtl = locale === 'ar';

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t, isRtl }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
