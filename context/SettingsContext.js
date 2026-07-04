'use client';

// Loads the site content (hero text, contact info, locations, reviews…)
// once per visit and shares it with every component. Falls back to the
// defaults in lib/defaults.js until the owner saves their own content.
import { createContext, useContext, useEffect, useState } from 'react';
import { getSettings } from '@/lib/db';
import { DEFAULT_SETTINGS, mergeSettings } from '@/lib/defaults';

const SettingsContext = createContext({
  settings: DEFAULT_SETTINGS,
  loading: true,
});

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSettings()
      .then((saved) => setSettings(mergeSettings(saved)))
      .catch(() => setSettings(DEFAULT_SETTINGS))
      .finally(() => setLoading(false));
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, loading }}>
      {children}
    </SettingsContext.Provider>
  );
}

export const useSettings = () => useContext(SettingsContext);
