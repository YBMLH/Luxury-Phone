'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useSettings } from '@/context/SettingsContext';

export default function Hero() {
  const { settings } = useSettings();
  const hero = settings.heroContent;

  return (
    <section className="marble relative overflow-hidden">
      {/* Decorative gold rings */}
      <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full border border-gold/15" />
      <div className="pointer-events-none absolute -right-10 -top-10 h-64 w-64 rounded-full border border-gold/10" />
      <div className="pointer-events-none absolute -bottom-32 -left-32 h-96 w-96 rounded-full border border-gold/10" />

      <div className="mx-auto flex max-w-7xl flex-col items-center px-4 py-24 text-center md:px-6 md:py-32">
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-4 rounded-full border border-gold/40 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.3em] text-gold-300"
        >
          {hero.tagline}
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="font-display text-5xl font-bold leading-tight text-gold-gradient md:text-7xl"
        >
          {hero.title}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-6 max-w-2xl text-base leading-relaxed text-neutral-300 md:text-lg"
        >
          {hero.subtitle}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.45 }}
          className="mt-10 flex flex-col gap-4 sm:flex-row"
        >
          <Link href="/products" className="btn-gold !px-8 !py-3.5">
            {hero.primaryButton} →
          </Link>
          <Link
            href="/track-order"
            className="inline-flex items-center justify-center rounded-lg border border-gold/50 px-8 py-3.5 text-sm font-semibold text-gold-200 transition hover:bg-gold/10"
          >
            {hero.secondaryButton}
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
