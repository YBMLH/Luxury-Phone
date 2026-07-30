'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useSettings } from '@/context/SettingsContext';
import { useLanguage } from '@/context/LanguageContext';
import HeroShowcase from './HeroShowcase';
import SplitFlapTitle from './SplitFlapTitle';

// `showcaseProducts` is fetched server-side (see app/(store)/page.js) and
// passed down so the fan has real images in the first render — no client-side
// fetch waterfall delaying the largest thing on the screen.
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
    <section className="aurora-bg relative overflow-hidden">
      {/* Drifting colour clouds. Violet is pulled from the logo artwork so the
          brand reads as more than black-and-gold. */}
      <div className="aurora-blob aurora-1 -left-24 -top-28 h-80 w-80 bg-[#6B3FA0] opacity-80" />
      <div className="aurora-blob aurora-2 -right-24 top-1/3 h-72 w-72 bg-gold opacity-60" />
      <div className="aurora-blob aurora-3 -bottom-28 left-1/4 h-72 w-72 bg-[#A8377E] opacity-70" />
      <div className="aurora-grain pointer-events-none absolute inset-0 opacity-60" />

      <div className="relative z-10 mx-auto flex max-w-7xl flex-col gap-7 px-4 py-14 md:grid md:grid-cols-2 md:items-center md:gap-12 md:px-6 md:py-24">
        {/* Headline — first on mobile, top-left on desktop */}
        <div className="order-1 text-center md:col-start-1 md:row-start-1 md:text-left">
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/80 backdrop-blur-sm"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-gold" />
            {hero.tagline}
          </motion.p>

          {/* The board's own flip is the entrance animation, so there's no
              fade wrapper here competing with it. */}
          <SplitFlapTitle
            lines={[hero.title, hero.titleAccent]}
            className="mt-5 block font-display text-[clamp(1.35rem,5.2vw,2.6rem)] font-bold leading-none tracking-tight text-[#FFF6E6]"
          />
        </div>

        {/* Device fan — sits directly under the headline on mobile so a phone
            visitor sees a product without scrolling. */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="order-2 md:col-start-2 md:row-span-2 md:row-start-1 md:self-center"
        >
          {showcaseProducts.length > 0 ? (
            <HeroShowcase products={showcaseProducts} />
          ) : (
            <div className="mx-auto flex h-[300px] w-full max-w-md items-center justify-center md:h-[370px]">
              <img src="/images/logo-icon.webp" alt="" className="h-32 w-auto opacity-30" />
            </div>
          )}
        </motion.div>

        {/* Supporting copy + actions */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="order-3 text-center md:col-start-1 md:row-start-2 md:text-left"
        >
          {hero.subtitle && (
            <p className="mx-auto line-clamp-2 max-w-md text-sm leading-relaxed text-white/60 md:mx-0 md:line-clamp-none md:text-base">
              {hero.subtitle}
            </p>
          )}

          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row md:justify-start">
            <Link href="/products" className="btn-gold w-full !py-3.5 sm:w-auto sm:!px-9">
              {hero.primaryButton} →
            </Link>
            <Link
              href="/track-order"
              className="inline-flex w-full items-center justify-center rounded-full border border-white/25 px-9 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10 sm:w-auto"
            >
              {hero.secondaryButton}
            </Link>
          </div>

          <div className="mx-auto mt-8 grid max-w-sm grid-cols-3 gap-4 border-t border-white/10 pt-6 md:mx-0">
            {STATS.map((stat) => (
              <div key={stat.label}>
                <p className="font-display text-xl font-bold text-white md:text-2xl">{stat.value}</p>
                <p className="mt-0.5 text-[10px] font-medium uppercase leading-tight tracking-wider text-white/45">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
