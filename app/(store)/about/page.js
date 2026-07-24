'use client';

import { useSettings } from '@/context/SettingsContext';
import { useLanguage } from '@/context/LanguageContext';
import Locations from '@/components/home/Locations';
import WhyChooseUs from '@/components/home/WhyChooseUs';
import AnimateIn from '@/components/AnimateIn';

export default function AboutPage() {
  const { settings } = useSettings();
  const { t } = useLanguage();
  const about = settings.aboutContent;

  return (
    <>
      <section className="border-b border-neutral-200 bg-white py-16 md:py-20">
        <AnimateIn className="mx-auto max-w-3xl px-4 text-center md:px-6">
          <p className="inline-flex items-center gap-2 rounded-full border border-neutral-300 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-neutral-600">
            <span className="h-1.5 w-1.5 rounded-full bg-gold" />
            {t('about.eyebrow')}
          </p>
          <h1 className="mt-6 font-display text-4xl font-bold tracking-tight md:text-6xl">
            <span className="text-gold-gradient">{about.title}</span>
          </h1>
          <p className="mt-7 whitespace-pre-line text-base leading-relaxed text-neutral-600">
            {about.text}
          </p>
        </AnimateIn>
      </section>

      <WhyChooseUs />
      <Locations />
    </>
  );
}
