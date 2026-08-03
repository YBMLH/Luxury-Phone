'use client';

// The two Guelma branches, as cards you can actually act on.
//
// Each card carries a photo of the shopfront (so someone recognises the place
// from the street), a switchable map view, and a directions link that opens
// Google Maps. The directions link never depends on the owner filling in a
// field: when no explicit link is saved, one is built from the branch name and
// address, which is what a customer would have typed into Maps anyway.
import { useState } from 'react';
import AnimateIn from '@/components/AnimateIn';
import { useSettings } from '@/context/SettingsContext';
import { useLanguage } from '@/context/LanguageContext';

function directionsUrl(loc) {
  if (loc.mapLink) return loc.mapLink;
  const query = [loc.name, loc.address, loc.city, 'Algérie'].filter(Boolean).join(', ');
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

function PinIcon({ className = 'h-4 w-4' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M20 10c0 5.5-8 12-8 12s-8-6.5-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="2.6" />
    </svg>
  );
}

function PhoneIcon({ className = 'h-4 w-4' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M6.2 3h3l1.5 4-2 1.4a12.5 12.5 0 0 0 5.9 5.9l1.4-2 4 1.5v3a1.6 1.6 0 0 1-1.8 1.6C10.7 18.6 5.4 13.3 4.6 4.8A1.6 1.6 0 0 1 6.2 3Z" />
    </svg>
  );
}

function ClockIcon({ className = 'h-4 w-4' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5.2l3.2 2" />
    </svg>
  );
}

function BranchCard({ loc }) {
  const { t } = useLanguage();
  const hasPhoto = Boolean(loc.photo);
  const hasMap = Boolean(loc.mapEmbedUrl);

  // Start on whichever view exists; the map iframe is only created once it is
  // asked for, so two embedded maps never load on a page nobody scrolled to.
  const [view, setView] = useState(hasPhoto ? 'photo' : 'map');
  const [mapMounted, setMapMounted] = useState(!hasPhoto && hasMap);

  const href = directionsUrl(loc);
  const showToggle = hasPhoto && hasMap;

  function show(next) {
    if (next === 'map') setMapMounted(true);
    setView(next);
  }

  return (
    <article className="branch-card group relative overflow-hidden rounded-[1.75rem] border border-neutral-200/80 bg-white shadow-sm">
      <div className="relative h-56 overflow-hidden sm:h-64">
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="block h-full w-full"
          aria-label={`${t('locations.directions')} — ${loc.name}`}
        >
          {hasPhoto ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={loc.photo}
              alt={`${loc.name} — ${loc.city}`}
              className="branch-photo h-full w-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="marble flex h-full w-full items-center justify-center">
              <PinIcon className="h-12 w-12 text-gold-300" />
            </div>
          )}
        </a>

        {mapMounted && (
          <iframe
            src={loc.mapEmbedUrl}
            className="branch-map absolute inset-0 h-full w-full border-0"
            style={{
              opacity: view === 'map' ? 1 : 0,
              pointerEvents: view === 'map' ? 'auto' : 'none',
            }}
            loading="lazy"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
            title={`${t('locations.mapView')} — ${loc.name}`}
          />
        )}

        {/* The name sits above both layers rather than inside the photo, so
            switching to the map never leaves the card without a title. */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[5]">
          <span className="branch-scrim absolute inset-x-0 bottom-0 h-32" aria-hidden="true" />
          <div className="relative p-5">
            <h3 className="font-display text-xl font-bold text-white drop-shadow-sm sm:text-2xl">
              {loc.name}
            </h3>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-white/85">
              <PinIcon className="h-3.5 w-3.5" />
              {loc.city}
            </p>
          </div>
        </div>

        {showToggle && (
          <div className="absolute right-3 top-3 z-10 flex rounded-full bg-black/45 p-1 backdrop-blur-sm">
            {[
              ['photo', t('locations.photoView')],
              ['map', t('locations.mapView')],
            ].map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => show(id)}
                aria-pressed={view === id}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                  view === id ? 'bg-white text-neutral-900' : 'text-white/80 hover:text-white'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="p-6">
        <ul className="space-y-2.5 text-sm text-neutral-600">
          <li className="flex items-start gap-2.5">
            <PinIcon className="mt-0.5 h-4 w-4 shrink-0 text-gold-500" />
            <span>{loc.address}</span>
          </li>
          {loc.phone && (
            <li className="flex items-start gap-2.5">
              <PhoneIcon className="mt-0.5 h-4 w-4 shrink-0 text-gold-500" />
              <a href={`tel:${loc.phone.replace(/\s/g, '')}`} className="hover:text-neutral-900 hover:underline">
                {loc.phone}
              </a>
            </li>
          )}
          {loc.workingHours && (
            <li className="flex items-start gap-2.5">
              <ClockIcon className="mt-0.5 h-4 w-4 shrink-0 text-gold-500" />
              <span>{loc.workingHours}</span>
            </li>
          )}
        </ul>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-gold inline-flex items-center gap-2 !px-6 !py-2.5"
          >
            {t('locations.directions')}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round"
              className="branch-arrow h-4 w-4" aria-hidden="true">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </a>
          {loc.phone && (
            // btn-outline is built for the dark panels — its white border
            // vanishes on this white card, so this one carries its own.
            <a
              href={`tel:${loc.phone.replace(/\s/g, '')}`}
              className="inline-flex items-center gap-2 rounded-full border border-neutral-300 px-6 py-2.5 text-sm font-semibold text-neutral-800 transition hover:border-gold hover:text-gold-600"
            >
              <PhoneIcon />
              {t('locations.call')}
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

export default function Locations() {
  const { settings } = useSettings();
  const { t } = useLanguage();

  return (
    <section className="mx-auto max-w-7xl px-4 py-14 md:px-6">
      <AnimateIn>
        <h2 className="mb-2 font-display text-3xl font-bold tracking-tight md:text-4xl">
          {t('locations.heading')}
        </h2>
        <p className="mb-8 text-sm text-neutral-500">
          {t('locations.subtitle')}
        </p>
      </AnimateIn>
      <div className="grid gap-6 md:grid-cols-2">
        {settings.locations.map((loc, i) => (
          <AnimateIn key={i} delay={i * 0.1}>
            <BranchCard loc={loc} />
          </AnimateIn>
        ))}
      </div>
    </section>
  );
}
