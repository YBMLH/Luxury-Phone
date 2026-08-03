'use client';

// The About page used to end with the same "Why choose us" panel and the same
// branch cards the visitor had already scrolled past on the homepage and the
// contact page. Repeating those made the page feel empty and gave Google two
// near-identical pages to choose between.
//
// It now answers the one question a contact page cannot: why trust this shop
// with cash on delivery. Everything factual here is either derived from the
// settings (how many branches, which wilayas) or written by the owner in
// Admin → Site content → About, and every owner-written block stays hidden
// until it has been filled in — a visitor never reads a placeholder.
import Link from 'next/link';
import { useSettings } from '@/context/SettingsContext';
import { useLanguage } from '@/context/LanguageContext';
import AnimateIn from '@/components/AnimateIn';
import Breadcrumbs from '@/components/Breadcrumbs';
import { WILAYAS } from '@/lib/constants';

function StoreIcon({ className = 'h-6 w-6' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"
      strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M3.5 9.5 5 4.5h14l1.5 5" />
      <path d="M4.5 9.5v10h15v-10" />
      <path d="M3.5 9.5a2.6 2.6 0 0 0 4.25.6 2.6 2.6 0 0 0 4.25.6 2.6 2.6 0 0 0 4.25-.6 2.6 2.6 0 0 0 4.25-.6" />
      <path d="M9.5 19.5v-5h5v5" />
    </svg>
  );
}

function CashIcon({ className = 'h-6 w-6' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"
      strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <rect x="2.5" y="6" width="19" height="12" rx="2.5" />
      <circle cx="12" cy="12" r="2.6" />
      <path d="M6 10v4M18 10v4" />
    </svg>
  );
}

function ShieldIcon({ className = 'h-6 w-6' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"
      strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M12 3 5 6v5.5c0 4.4 3 8 7 9.5 4-1.5 7-5.1 7-9.5V6l-7-3Z" />
      <path d="m9 12 2.2 2.2L15.5 10" />
    </svg>
  );
}

export default function AboutClient() {
  const { settings } = useSettings();
  const { t } = useLanguage();
  const about = settings.aboutContent || {};
  const branches = (settings.locations || []).length;

  const stats = [
    branches > 0 && { value: String(branches), label: t('about.stats.branches') },
    { value: String(WILAYAS.length), label: t('about.stats.wilayas') },
    about.founded && { value: about.founded, label: t('about.stats.since') },
  ].filter(Boolean);

  const pillars = [
    {
      icon: StoreIcon,
      title: t('about.pillars.shopsTitle'),
      text: t('about.pillars.shopsText'),
    },
    {
      icon: CashIcon,
      title: t('about.pillars.codTitle'),
      text: t('about.pillars.codText'),
    },
    {
      icon: ShieldIcon,
      title: t('about.pillars.warrantyTitle'),
      text: t('about.pillars.warrantyText'),
    },
  ];

  return (
    <>
      <section className="border-b border-neutral-200 bg-white py-16 md:py-20">
        <div className="mx-auto max-w-3xl px-4 md:px-6">
          <Breadcrumbs items={[{ name: 'Accueil', href: '/' }, { name: 'À propos', href: '/about' }]} />
        </div>
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

        {stats.length > 0 && (
          <AnimateIn className="mx-auto mt-12 max-w-3xl px-4 md:px-6" delay={0.1}>
            <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-neutral-200 bg-neutral-50/70 px-4 py-6 text-center"
                >
                  <dt className="sr-only">{stat.label}</dt>
                  <dd>
                    <span className="block font-display text-3xl font-bold text-gold-gradient md:text-4xl">
                      {stat.value}
                    </span>
                    <span className="mt-1.5 block text-xs uppercase tracking-widest text-neutral-500">
                      {stat.label}
                    </span>
                  </dd>
                </div>
              ))}
            </dl>
          </AnimateIn>
        )}
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 md:px-6">
        <AnimateIn>
          <h2 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
            {t('about.pillars.heading')}
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-neutral-500">
            {t('about.pillars.subtitle')}
          </p>
        </AnimateIn>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {pillars.map((pillar, i) => (
            <AnimateIn key={pillar.title} delay={i * 0.08}>
              <div className="h-full rounded-[1.5rem] border border-neutral-200 bg-white p-7 shadow-sm transition hover:border-gold/60 hover:shadow-card-hover">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gold/10 text-gold-600">
                  <pillar.icon />
                </span>
                <h3 className="mt-5 font-display text-lg font-bold">{pillar.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-neutral-600">{pillar.text}</p>
              </div>
            </AnimateIn>
          ))}
        </div>
      </section>

      {about.story && (
        <section className="border-y border-neutral-200 bg-neutral-50/60 py-16">
          <AnimateIn className="mx-auto max-w-3xl px-4 md:px-6">
            <h2 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
              {t('about.story.heading')}
            </h2>
            <p className="mt-5 whitespace-pre-line text-base leading-relaxed text-neutral-600">
              {about.story}
            </p>
          </AnimateIn>
        </section>
      )}

      <section className="mx-auto max-w-6xl px-4 py-16 md:px-6">
        <AnimateIn>
          <div className="marble overflow-hidden rounded-[2rem] px-8 py-12 text-center md:px-14">
            <h2 className="font-display text-3xl font-bold leading-tight text-white md:text-4xl">
              {t('about.cta.title')}
              <span className="block text-gold-gradient">{t('about.cta.titleAccent')}</span>
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-neutral-300 md:text-base">
              {t('about.cta.text')}
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link href="/products" className="btn-gold !px-8 !py-3.5">
                {t('about.cta.primary')}
              </Link>
              <Link
                href="/contact"
                className="rounded-full border border-white/25 px-8 py-3.5 text-sm font-semibold text-white transition hover:border-gold/70 hover:text-gold-300"
              >
                {t('about.cta.secondary')}
              </Link>
            </div>
          </div>
        </AnimateIn>
      </section>
    </>
  );
}
