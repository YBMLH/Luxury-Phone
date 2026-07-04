'use client';

import SectionHeading from '@/components/SectionHeading';
import AnimateIn from '@/components/AnimateIn';
import { useSettings } from '@/context/SettingsContext';

export default function Locations({ dark = false }) {
  const { settings } = useSettings();

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 md:px-6">
      <AnimateIn>
        <SectionHeading
          eyebrow="Visit Us"
          title="Our Store Locations"
          subtitle="Two branches in Guelma, ready to welcome you."
          dark={dark}
        />
      </AnimateIn>
      <div className="grid gap-6 md:grid-cols-2">
        {settings.locations.map((loc, i) => (
          <AnimateIn key={i} delay={i * 0.1}>
            <div className="marble-card overflow-hidden rounded-2xl">
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
                <div className="flex h-56 w-full items-center justify-center bg-black/30 text-5xl">
                  📍
                </div>
              )}
              <div className="p-6">
                <h3 className="font-display text-xl font-semibold text-gold-300">
                  {loc.name}
                </h3>
                <ul className="mt-4 space-y-2 text-sm text-neutral-300">
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
