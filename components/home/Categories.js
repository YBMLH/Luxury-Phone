'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { CATEGORIES, CATEGORY_ACCENTS } from '@/lib/constants';
import CategoryIcon from '@/components/CategoryIcon';
import SectionHeading from '@/components/SectionHeading';
import AnimateIn from '@/components/AnimateIn';
import { useSettings } from '@/context/SettingsContext';
import { useLanguage } from '@/context/LanguageContext';
import { hexToRgba } from '@/lib/utils';

// "Backlit" cards — full-bleed photo (or a tinted wash in the category's
// own accent color when no photo is set yet) with a frosted-glass label,
// matching ProductCard. Each category gets its own colored ambient glow
// instead of one shared gold shadow, so the row reads as ten distinct
// departments rather than ten copies of the same card.
export default function Categories({ products = [] }) {
  const { settings } = useSettings();
  const { t } = useLanguage();
  const reduceMotion = useReducedMotion();
  const countFor = (id) => products.filter((p) => p.category === id).length;

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 md:px-6">
      <AnimateIn>
        <SectionHeading
          eyebrow={t('categoriesSection.eyebrow')}
          title={t('categoriesSection.title')}
          subtitle={t('categoriesSection.subtitle')}
        />
      </AnimateIn>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {CATEGORIES.map((cat, i) => {
          const count = countFor(cat.id);
          const bg = settings.categoryImages?.[cat.id];
          const accent = CATEGORY_ACCENTS[cat.id] || '#C9A227';
          const glow = hexToRgba(accent, 0.35);
          const glowStrong = hexToRgba(accent, 0.6);

          return (
            <AnimateIn key={cat.id} delay={i * 0.05}>
              <Link href={`/products?category=${cat.id}`} className="group relative block">
                <motion.div
                  whileHover={{ y: -8 }}
                  transition={{ duration: 0.25 }}
                  style={{ '--glow': glow, '--glow-strong': glowStrong }}
                  className="relative flex h-full min-h-[210px] flex-col justify-end overflow-hidden rounded-[1.75rem] shadow-[0_18px_38px_-12px_var(--glow)] transition-shadow duration-300 group-hover:shadow-[0_28px_60px_-10px_var(--glow-strong)]"
                >
                  {/* Background: real category photo if set, otherwise a
                      tinted wash in the category's own accent color. */}
                  {bg ? (
                    <img
                      src={bg}
                      alt=""
                      loading="lazy"
                      className="pointer-events-none absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div
                      className="pointer-events-none absolute inset-0 transition-transform duration-500 group-hover:scale-105"
                      style={{
                        background: `linear-gradient(155deg, #14120e 0%, ${hexToRgba(accent, 0.55)} 55%, ${hexToRgba(accent, 0.85)} 100%)`,
                      }}
                    />
                  )}

                  {/* Idle ambient glow — a slow breathing pulse, off for
                      prefers-reduced-motion. */}
                  {!reduceMotion && (
                    <motion.div
                      className="pointer-events-none absolute -right-8 -top-8 h-36 w-36 rounded-full blur-2xl"
                      style={{ background: glow }}
                      animate={{ opacity: [0.5, 0.85, 0.5] }}
                      transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: i * 0.3 }}
                    />
                  )}

                  {/* Depth graduation so the glass label always reads,
                      whatever the photo/wash looks like. */}
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/55 to-transparent" />

                  <span className="absolute left-4 top-4 flex h-11 w-11 items-center justify-center rounded-full border border-white/40 bg-white/60 text-neutral-900 backdrop-blur-md backdrop-saturate-150 transition-transform duration-300 group-hover:scale-110">
                    <CategoryIcon id={cat.id} className="h-5 w-5" />
                  </span>

                  {count > 0 && (
                    <span className="absolute right-4 top-4 rounded-full border border-white/40 bg-white/60 px-3 py-1 text-xs font-semibold text-neutral-900 backdrop-blur-md backdrop-saturate-150">
                      {t('categoriesSection.items', { count, plural: count > 1 ? 's' : '' })}
                    </span>
                  )}

                  {/* Frosted glass label */}
                  <div className="relative border-t border-white/40 bg-white/60 px-5 py-4 backdrop-blur-xl backdrop-saturate-150 transition-colors duration-300 group-hover:bg-white/75">
                    <h3 className="font-display text-lg font-bold text-neutral-900">
                      {t(`categories.${cat.id}.label`) || cat.label}
                    </h3>
                    <div className="mt-1 flex items-center justify-between gap-2">
                      <p className="truncate text-sm text-neutral-600">
                        {t(`categories.${cat.id}.subtitle`) || cat.subtitle}
                      </p>
                      <span
                        className="shrink-0 text-sm font-bold transition-transform duration-300 group-hover:translate-x-1"
                        style={{ color: accent }}
                        aria-hidden="true"
                      >
                        →
                      </span>
                    </div>
                  </div>
                </motion.div>
              </Link>
            </AnimateIn>
          );
        })}
      </div>
    </section>
  );
}
