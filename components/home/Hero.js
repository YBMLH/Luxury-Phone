'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useSettings } from '@/context/SettingsContext';
import { useLanguage } from '@/context/LanguageContext';
import HeroShowcase from './HeroShowcase';

// `showcaseProducts` is fetched server-side (see app/(store)/page.js) and
// passed all the way down here so the carousel has real images in the
// first render — no client-side fetch waterfall delaying it.
export default function Hero({ showcaseProducts = [] }) {
  const { settings } = useSettings();
  const { t } = useLanguage();
  const hero = settings.heroContent;

  const STATS = [
    { value: '100%', label: t('hero.stats.genuine') },
    { value: '58', label: t('hero.stats.wilayas') },
    { value: '2', label: t('hero.stats.branches') },
  ];

  return (
    <section className="marble relative overflow-hidden">
      {/* Ambient gold glows for depth — purely decorative. */}
      <div className="pointer-events-none absolute -left-24 top-1/4 h-72 w-72 rounded-full bg-gold/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 bottom-0 h-80 w-80 rounded-full bg-gold/10 blur-3xl" />

      <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 md:grid-cols-2 md:gap-6 md:px-6 md:py-24">
        <div className="text-center md:text-left">
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-white/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-gold-200 backdrop-blur-sm"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-gold" />
            {hero.tagline}
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.12 }}
            className="mt-6 font-display text-5xl font-bold leading-[1.05] tracking-tight text-white md:text-6xl lg:text-7xl"
          >
            {hero.title}
            <span className="block text-gold-gradient">{hero.titleAccent}</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.24 }}
            className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-neutral-300 md:mx-0 md:text-lg"
          >
            {hero.subtitle}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.36 }}
            className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row md:justify-start"
          >
            <Link href="/products" className="btn-gold !px-8 !py-3.5">
              {hero.primaryButton} →
            </Link>
            <Link
              href="/track-order"
              className="inline-flex items-center justify-center rounded-lg border border-white/25 px-8 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              {hero.secondaryButton}
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mx-auto mt-12 grid max-w-md grid-cols-3 gap-6 border-t border-white/10 pt-7 md:mx-0"
          >
            {STATS.map((stat) => (
              <div key={stat.label}>
                <p className="font-display text-2xl font-bold text-white md:text-3xl">{stat.value}</p>
                <p className="mt-1 text-[11px] font-medium uppercase tracking-wider text-neutral-400">
                  {stat.label}
                </p>
              </div>
            ))}
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          {showcaseProducts.length > 0 ? (
            <HeroShowcase products={showcaseProducts} />
          ) : (
            <div className="mx-auto flex h-[300px] w-full max-w-md items-center justify-center sm:h-[360px] md:h-[400px]">
              <img
                src="/images/logo-icon.webp"
                alt=""
                className="h-32 w-auto opacity-40"
              />
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}
