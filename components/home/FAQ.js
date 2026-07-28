'use client';

// Local-search-friendly Q&A accordion. The FAQPage JSON-LD for this same
// content is injected server-side in app/(store)/page.js (from the fr
// strings, since that's the default/crawled language) — keep the two in
// sync if the questions change.
import { useState } from 'react';
import AnimateIn from '@/components/AnimateIn';
import { useLanguage } from '@/context/LanguageContext';

export default function FAQ() {
  const { t } = useLanguage();
  const items = t('faq.items') || [];
  const [open, setOpen] = useState(0);

  if (!items.length) return null;

  return (
    <section className="mx-auto max-w-3xl px-4 py-14 md:px-6">
      <AnimateIn className="text-center">
        <p className="inline-flex items-center gap-2 rounded-full border border-neutral-300 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-neutral-600">
          <span className="h-1.5 w-1.5 rounded-full bg-gold" />
          {t('faq.eyebrow')}
        </p>
        <h2 className="mt-5 font-display text-3xl font-bold tracking-tight md:text-4xl">
          {t('faq.title')}
        </h2>
        <p className="mt-3 text-sm text-neutral-500">{t('faq.subtitle')}</p>
      </AnimateIn>

      <div className="mt-8 space-y-3">
        {items.map((item, i) => {
          const expanded = open === i;
          return (
            <AnimateIn key={item.q} delay={i * 0.05}>
              <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
                <button
                  type="button"
                  onClick={() => setOpen(expanded ? -1 : i)}
                  aria-expanded={expanded}
                  aria-controls={`faq-answer-${i}`}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                >
                  <span className="font-medium text-neutral-900">{item.q}</span>
                  <span
                    className={`shrink-0 text-gold-700 transition-transform ${expanded ? 'rotate-45' : ''}`}
                    aria-hidden="true"
                  >
                    +
                  </span>
                </button>
                {expanded && (
                  <p
                    id={`faq-answer-${i}`}
                    className="px-5 pb-4 text-sm leading-relaxed text-neutral-600"
                  >
                    {item.a}
                  </p>
                )}
              </div>
            </AnimateIn>
          );
        })}
      </div>
    </section>
  );
}
