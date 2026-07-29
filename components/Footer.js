'use client';

import Link from 'next/link';
import { useSettings } from '@/context/SettingsContext';
import { useLanguage } from '@/context/LanguageContext';

export default function Footer() {
  const { settings } = useSettings();
  const { t } = useLanguage();
  const { socialLinks } = settings;

  const PERKS = [
    { icon: '🚚', title: t('footer.perks.deliveryTitle'), text: t('footer.perks.deliveryText') },
    { icon: '✅', title: t('footer.perks.genuineTitle'), text: t('footer.perks.genuineText') },
    { icon: '📦', title: t('footer.perks.trackingTitle'), text: t('footer.perks.trackingText') },
    { icon: '🏬', title: t('footer.perks.branchesTitle'), text: t('footer.perks.branchesText') },
  ];

  return (
    <footer className="border-t border-neutral-200 bg-white">
      {/* Perks strip */}
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:grid-cols-2 md:px-6 lg:grid-cols-4">
        {PERKS.map((perk) => (
          <div key={perk.title} className="flex items-start gap-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-lg">
              {perk.icon}
            </span>
            <div>
              <p className="font-display text-sm font-bold">{perk.title}</p>
              <p className="mt-1 text-xs text-neutral-500">{perk.text}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom bar */}
      <div className="border-t border-neutral-200">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-6 md:flex-row md:px-6">
          <div className="flex items-center gap-2.5">
            <img src="/images/logo-icon.webp" alt="" className="h-7 w-auto" />
            <span className="font-display text-sm font-bold">LuxuryPhone24</span>
            <span className="text-xs text-neutral-400">
              © {new Date().getFullYear()} {t('footer.rights')} — Guelma, Algeria
            </span>
          </div>

          <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs font-medium text-neutral-600">
            <Link href="/products" className="hover:text-gold-600">{t('footer.products')}</Link>
            <Link href="/track-order" className="hover:text-gold-600">{t('footer.trackOrder')}</Link>
            <Link href="/about" className="hover:text-gold-600">{t('footer.about')}</Link>
            <Link href="/contact" className="hover:text-gold-600">{t('footer.contact')}</Link>
            {socialLinks.facebook && (
              <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="text-gold-700 hover:text-gold-800">
                Facebook
              </a>
            )}
            {socialLinks.instagram && (
              <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="text-gold-700 hover:text-gold-800">
                Instagram
              </a>
            )}
            {socialLinks.tiktok && (
              <a href={socialLinks.tiktok} target="_blank" rel="noopener noreferrer" className="text-gold-700 hover:text-gold-800">
                TikTok
              </a>
            )}
          </nav>
        </div>
      </div>
    </footer>
  );
}
