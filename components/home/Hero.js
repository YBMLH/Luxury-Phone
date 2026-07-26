'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useSettings } from '@/context/SettingsContext';
import { useLanguage } from '@/context/LanguageContext';
import { formatPrice } from '@/lib/utils';

export default function Hero({ featured }) {
  const { settings } = useSettings();
  const { t } = useLanguage();
  const hero = settings.heroContent;

  const STATS = [
    { value: '100%', label: t('hero.stats.genuine') },
    { value: '58', label: t('hero.stats.wilayas') },
    { value: '2', label: t('hero.stats.branches') },
  ];

  return (
    <section
      className="relative flex min-h-[92vh] items-center overflow-hidden bg-scroll bg-cover bg-center md:min-h-screen md:bg-fixed"
      style={{ backgroundImage: "url('/images/hero-devices.webp')" }}
    >
      {/* Light white wash so the text stays readable over the photo, while
          the image itself stays pinned in place as the page scrolls. */}
      <div className="absolute inset-0 bg-white/75" />

      <div className="relative z-10 mx-auto w-full max-w-3xl px-4 py-24 text-center md:px-6">
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 rounded-full border border-neutral-300 bg-white/70 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-neutral-700 backdrop-blur-sm"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-gold" />
          {hero.tagline}
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.12 }}
          className="mt-6 font-display text-5xl font-bold leading-[1.05] tracking-tight md:text-7xl"
        >
          {hero.title}
          <span className="block text-gold-gradient">{hero.titleAccent}</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.24 }}
          className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-neutral-700 md:text-lg"
        >
          {hero.subtitle}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.36 }}
          className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row"
        >
          <Link href="/products" className="btn-dark !px-8 !py-3.5">
            {hero.primaryButton} →
          </Link>
          <Link href="/track-order" className="btn-outline !bg-white/70 !px-8 !py-3.5 backdrop-blur-sm">
            {hero.secondaryButton}
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mx-auto mt-12 grid max-w-md grid-cols-3 gap-6 border-t border-neutral-400/40 pt-7"
        >
          {STATS.map((stat) => (
            <div key={stat.label}>
              <p className="font-display text-2xl font-bold md:text-3xl">{stat.value}</p>
              <p className="mt-1 text-[11px] font-medium uppercase tracking-wider text-neutral-600">
                {stat.label}
              </p>
            </div>
          ))}
        </motion.div>

        {/* Featured product overlay card, shown once the owner marks a
            real product as featured — floats above the background image. */}
        {featured && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <Link
              href={`/products/${featured.id}`}
              className="mx-auto mt-10 flex max-w-sm items-center justify-between gap-4 rounded-2xl bg-white/90 p-5 text-left shadow-xl backdrop-blur transition hover:shadow-2xl"
            >
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gold-600">
                  Featured
                </p>
                <p className="truncate font-display text-lg font-bold">
                  {featured.name}
                </p>
              </div>
              <p className="shrink-0 font-display text-lg font-bold text-gold-600">
                {formatPrice(featured.price)}
              </p>
            </Link>
          </motion.div>
        )}
      </div>
    </section>
  );
}
