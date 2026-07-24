'use client';

import AnimateIn from '@/components/AnimateIn';
import { useSettings } from '@/context/SettingsContext';
import { useLanguage } from '@/context/LanguageContext';

function Stars({ count }) {
  return (
    <div className="text-gold" aria-label={`${count} out of 5 stars`}>
      {'★'.repeat(Math.min(5, count))}
      <span className="text-neutral-200">{'★'.repeat(Math.max(0, 5 - count))}</span>
    </div>
  );
}

export default function Reviews() {
  const { settings } = useSettings();
  const { t } = useLanguage();
  if (!settings.reviews.length) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-14 md:px-6">
      <AnimateIn>
        <h2 className="mb-8 font-display text-3xl font-bold tracking-tight md:text-4xl">
          {t('reviews.heading')}
        </h2>
      </AnimateIn>
      <div className="grid gap-5 md:grid-cols-3">
        {settings.reviews.map((review, i) => (
          <AnimateIn key={i} delay={i * 0.08}>
            <div className="flex h-full flex-col rounded-[1.75rem] border border-neutral-200/80 bg-white p-6 shadow-sm">
              <Stars count={Number(review.rating) || 5} />
              <p className="mt-4 flex-1 text-sm leading-relaxed text-neutral-600">
                “{review.text}”
              </p>
              <div className="mt-5 border-t border-neutral-100 pt-4">
                <p className="font-display text-sm font-bold">{review.name}</p>
                {review.city && (
                  <p className="text-xs text-neutral-500">{review.city}</p>
                )}
              </div>
            </div>
          </AnimateIn>
        ))}
      </div>
    </section>
  );
}
