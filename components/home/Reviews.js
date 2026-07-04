'use client';

import SectionHeading from '@/components/SectionHeading';
import AnimateIn from '@/components/AnimateIn';
import { useSettings } from '@/context/SettingsContext';

function Stars({ count }) {
  return (
    <div className="text-gold" aria-label={`${count} out of 5 stars`}>
      {'★'.repeat(Math.min(5, count))}
      <span className="text-neutral-600">{'★'.repeat(Math.max(0, 5 - count))}</span>
    </div>
  );
}

export default function Reviews() {
  const { settings } = useSettings();
  if (!settings.reviews.length) return null;

  return (
    <section className="marble py-16">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <AnimateIn>
          <SectionHeading
            eyebrow="Testimonials"
            title="What Our Customers Say"
            dark
          />
        </AnimateIn>
        <div className="grid gap-5 md:grid-cols-3">
          {settings.reviews.map((review, i) => (
            <AnimateIn key={i} delay={i * 0.08}>
              <div className="marble-card flex h-full flex-col rounded-2xl p-6">
                <Stars count={Number(review.rating) || 5} />
                <p className="mt-4 flex-1 text-sm leading-relaxed text-neutral-200">
                  “{review.text}”
                </p>
                <div className="mt-5 border-t border-white/10 pt-4">
                  <p className="text-sm font-semibold text-white">{review.name}</p>
                  {review.city && (
                    <p className="text-xs text-neutral-400">{review.city}</p>
                  )}
                </div>
              </div>
            </AnimateIn>
          ))}
        </div>
      </div>
    </section>
  );
}
