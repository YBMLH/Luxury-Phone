'use client';

import { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { LOCALES, LOCALE_LABELS } from '@/lib/i18n/translations';

// Small language picker (FR / EN / AR), used in the storefront navbar and
// the admin dashboard header. `dark` switches text color for dark navbars.
export default function LanguageSwitcher({ dark = false }) {
  const { locale, setLocale } = useLanguage();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
          dark
            ? 'border-gold/40 text-gold-200 hover:bg-gold/10'
            : 'border-neutral-300 text-neutral-700 hover:border-neutral-400'
        }`}
        aria-label="Change language"
      >
        🌐 {locale.toUpperCase()}
      </button>
      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-36 overflow-hidden rounded-xl border border-neutral-200 bg-white py-1 shadow-xl">
          {LOCALES.map((code) => (
            <button
              key={code}
              onMouseDown={() => {
                setLocale(code);
                setOpen(false);
              }}
              className={`block w-full px-4 py-2 text-left text-sm hover:bg-neutral-50 ${
                locale === code ? 'font-semibold text-gold-700' : 'text-neutral-700'
              }`}
            >
              {LOCALE_LABELS[code]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
