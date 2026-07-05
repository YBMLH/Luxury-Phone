'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useSettings } from '@/context/SettingsContext';
import { formatPrice } from '@/lib/utils';

const STATS = [
  { value: '100%', label: 'Genuine products' },
  { value: '58', label: 'Wilayas delivered' },
  { value: '2', label: 'Branches in Guelma' },
];

export default function Hero({ featured }) {
  const { settings } = useSettings();
  const hero = settings.heroContent;

  return (
    <section className="overflow-hidden">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-14 md:px-6 lg:grid-cols-2 lg:py-20">
        {/* Left: headline */}
        <div>
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full border border-neutral-300 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-neutral-600"
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
            className="mt-6 max-w-xl text-base leading-relaxed text-neutral-600 md:text-lg"
          >
            {hero.subtitle}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.36 }}
            className="mt-9 flex flex-col gap-3 sm:flex-row"
          >
            <Link href="/products" className="btn-dark !px-8 !py-3.5">
              {hero.primaryButton} →
            </Link>
            <Link href="/track-order" className="btn-outline !px-8 !py-3.5">
              {hero.secondaryButton}
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-12 grid max-w-md grid-cols-3 gap-6 border-t border-neutral-200 pt-7"
          >
            {STATS.map((stat) => (
              <div key={stat.label}>
                <p className="font-display text-2xl font-bold md:text-3xl">{stat.value}</p>
                <p className="mt-1 text-[11px] font-medium uppercase tracking-wider text-neutral-500">
                  {stat.label}
                </p>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Right: featured product visual */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="relative"
        >
          <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-neutral-100 sm:aspect-square lg:aspect-[4/5]">
            {featured?.images?.[0] ? (
              <img
                src={featured.images[0]}
                alt={featured.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="marble flex h-full w-full items-center justify-center">
                <span className="font-display text-7xl font-bold text-gold-gradient">
                  LP
                </span>
              </div>
            )}

            {/* Floating featured card */}
            {featured && (
              <Link
                href={`/products/${featured.id}`}
                className="absolute inset-x-4 bottom-4 flex items-center justify-between gap-4 rounded-2xl bg-white/95 p-5 shadow-xl backdrop-blur transition hover:shadow-2xl"
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
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
