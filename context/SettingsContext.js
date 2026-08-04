'use client';

// Loads the site content (hero text, contact info, locations, reviews…)
// once per visit and shares it with every component. Falls back to the
// defaults in lib/defaults.js until the owner saves their own content.
import { createContext, useContext, useEffect, useState } from 'react';
import { getSettings, getCategoryImages, getBranchPhotos } from '@/lib/db';
import { DEFAULT_SETTINGS, mergeSettings } from '@/lib/defaults';

const SettingsContext = createContext({
  settings: DEFAULT_SETTINGS,
  loading: true,
  loaded: false,
});

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  // True only after a read that actually reached Firestore. A failed read
  // leaves us on the defaults, which are indistinguishable from real saved
  // content — so anything server-rendered needs to know the difference.
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    Promise.all([
      getSettings(),
      getCategoryImages().catch(() => ({})),
      getBranchPhotos().catch(() => ({})),
    ])
      .then(([saved, categoryImages, branchPhotos]) => {
        const merged = mergeSettings(saved);
        // The dedicated categoryImages collection is the source of truth;
        // any legacy value still embedded in the settings document (from
        // before it moved out) is only a fallback. Branch photos work the
        // same way, keyed by the branch's position in the list.
        setSettings({
          ...merged,
          categoryImages: { ...merged.categoryImages, ...categoryImages },
          locations: merged.locations.map((loc, i) => ({
            ...loc,
            photo: branchPhotos[String(i)] || loc.photo || '',
          })),
        });
        setLoaded(true);
      })
      .catch(() => setSettings(DEFAULT_SETTINGS))
      .finally(() => setLoading(false));
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, loading, loaded }}>
      {children}
    </SettingsContext.Provider>
  );
}

export const useSettings = () => useContext(SettingsContext);
