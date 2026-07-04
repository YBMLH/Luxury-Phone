'use client';

import { useSettings } from '@/context/SettingsContext';
import Locations from '@/components/home/Locations';
import WhyChooseUs from '@/components/home/WhyChooseUs';
import AnimateIn from '@/components/AnimateIn';

export default function AboutPage() {
  const { settings } = useSettings();
  const about = settings.aboutContent;

  return (
    <>
      <section className="marble py-20 text-center">
        <AnimateIn className="mx-auto max-w-3xl px-4 md:px-6">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-gold-400">
            Who We Are
          </p>
          <h1 className="font-display text-4xl font-bold text-gold-gradient md:text-5xl">
            {about.title}
          </h1>
          <div className="gold-line mx-auto mt-6" />
          <p className="mt-8 whitespace-pre-line text-base leading-relaxed text-neutral-300">
            {about.text}
          </p>
        </AnimateIn>
      </section>

      <WhyChooseUs />
      <Locations />
    </>
  );
}
