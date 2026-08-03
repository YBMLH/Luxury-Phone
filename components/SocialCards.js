'use client';

// Instagram and Facebook cards for the contact section.
//
// Each card wears its platform's own colours, because that recognition is the
// whole point — someone scanning the page should spot Instagram before they
// read a single word. The URLs come from Settings → Social links so the owner
// can change them without touching code; the constants are only a fallback so
// the cards are never blank.
import AnimateIn from '@/components/AnimateIn';
import { useSettings } from '@/context/SettingsContext';
import { useLanguage } from '@/context/LanguageContext';
import { SOCIAL_FALLBACK } from '@/lib/constants';

function InstagramGlyph({ className = 'h-7 w-7' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
      className={className} aria-hidden="true">
      <rect x="2.5" y="2.5" width="19" height="19" rx="5.5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.6" cy="6.4" r="1.25" fill="currentColor" stroke="none" />
    </svg>
  );
}

function TikTokGlyph({ className = 'h-7 w-7' }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M16.5 2h-3v13.1a2.6 2.6 0 1 1-2.2-2.57V9.4a5.75 5.75 0 1 0 5.2 5.72V8.9a6.6 6.6 0 0 0 3.9 1.27V7.1A3.72 3.72 0 0 1 16.5 2Z" />
    </svg>
  );
}

function FacebookGlyph({ className = 'h-7 w-7' }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.5-3.89 3.77-3.89 1.1 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.45 2.89h-2.33v6.99A10 10 0 0 0 22 12Z" />
    </svg>
  );
}

function SocialCard({ href, platform, glyph: Glyph, handle, label, cta }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`social-card social-card--${platform} group relative block overflow-hidden rounded-[1.75rem] p-6 text-left text-white sm:p-7`}
      aria-label={`${label} — ${handle}`}
    >
      {/* Gloss sweep, driven by hover rather than looping — a card that
          shimmers forever competes with the products for attention. */}
      <span className="social-sheen pointer-events-none absolute inset-0" aria-hidden="true" />

      <div className="relative flex items-center gap-4">
        <span className="social-badge grid h-14 w-14 shrink-0 place-items-center rounded-2xl">
          <Glyph className="h-7 w-7" />
        </span>
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/70">
            {label}
          </p>
          <p className="truncate font-display text-xl font-bold">{handle}</p>
        </div>
      </div>

      <div className="relative mt-6 flex items-center justify-between">
        <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-semibold backdrop-blur-sm transition group-hover:bg-white/25">
          {cta}
        </span>
        <svg
          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round"
          className="h-5 w-5 shrink-0 transition-transform duration-300 group-hover:translate-x-1"
          aria-hidden="true"
        >
          <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
      </div>
    </a>
  );
}

export default function SocialCards() {
  const { settings } = useSettings();
  const { t } = useLanguage();
  const social = settings.socialLinks || {};

  const instagram = social.instagram || SOCIAL_FALLBACK.instagram;
  const facebook = social.facebook || SOCIAL_FALLBACK.facebook;
  const tiktok = social.tiktok || '';

  const cards = [
    instagram && {
      key: 'instagram',
      href: instagram,
      glyph: InstagramGlyph,
      handle: '@luxury.phone24',
      label: 'Instagram',
      cta: t('contactSection.followCta'),
    },
    facebook && {
      key: 'facebook',
      href: facebook,
      glyph: FacebookGlyph,
      handle: 'Luxury Phone 24',
      label: 'Facebook',
      cta: t('contactSection.pageCta'),
    },
    tiktok && {
      key: 'tiktok',
      href: tiktok,
      glyph: TikTokGlyph,
      handle: '@luxuryphone24',
      label: 'TikTok',
      cta: t('contactSection.followCta'),
    },
  ].filter(Boolean);

  if (cards.length === 0) return null;

  return (
    <AnimateIn>
      <div className={`grid gap-4 ${cards.length > 2 ? 'sm:grid-cols-3' : 'sm:grid-cols-2'}`}>
        {cards.map((card) => (
          <SocialCard
            key={card.key}
            href={card.href}
            platform={card.key}
            glyph={card.glyph}
            handle={card.handle}
            label={card.label}
            cta={card.cta}
          />
        ))}
      </div>
    </AnimateIn>
  );
}
