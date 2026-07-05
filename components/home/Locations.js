'use client';

import AnimateIn from '@/components/AnimateIn';
import { useSettings } from '@/context/SettingsContext';

export default function Locations() {
  const { settings } = useSettings();

  return (
    <section className="mx-auto max-w-7xl px-4 py-14 md:px-6">
      <AnimateIn>
        <h2 className="mb-2 font-display text-3xl font-bold tracking-tight md:text-4xl">
          Our store locations
        </h2>
        <p className="mb-8 text-sm text-neutral-500">
          Two branches in Guelma, ready to welcome you.
        </p>
      </AnimateIn>
      <div className="grid gap-6 md:grid-cols-2">
        {settings.locations.map((loc, i) => (
          <AnimateIn key={i} delay={i * 0.1}>
            <div className="overflow-hidden rounded-[1.75rem] border border-neutral-200/80 bg-white shadow-sm">
              {loc.mapEmbedUrl ? (
                <iframe
                  src={loc.mapEmbedUrl}
                  className="h-56 w-full border-0"
                  loading="lazy"
                  allowFullScreen
                  referrerPolicy="no-referrer-when-downgrade"
                  title={`Map — ${loc.name}`}
                />
              ) : (
                <div className="marble flex h-56 w-full items-center justify-center text-5xl">
                  📍
                </div>
              )}
              <div className="p-6">
                <h3 className="font-display text-xl font-bold">{loc.name}</h3>
                <ul className="mt-4 space-y-2 text-sm text-neutral-600">
                  <li>📍 {loc.city} — {loc.address}</li>
                  {loc.phone && <li>📞 {loc.phone}</li>}
                  {loc.workingHours && <li>🕐 {loc.workingHours}</li>}
                </ul>
              </div>
            </div>
          </AnimateIn>
        ))}
      </div>
    </section>
  );
}
