'use client';

import Link from 'next/link';
import { useSettings } from '@/context/SettingsContext';

const PERKS = [
  {
    icon: '🚚',
    title: 'Delivery to 58 wilayas',
    text: 'Fast shipping, pay on delivery.',
  },
  {
    icon: '✅',
    title: '100% genuine products',
    text: 'Official warranty on every device.',
  },
  {
    icon: '📦',
    title: 'Order tracking',
    text: 'Follow your order at every step.',
  },
  {
    icon: '🏬',
    title: '2 branches in Guelma',
    text: 'Visit us — advice in person, free.',
  },
];

export default function Footer() {
  const { settings } = useSettings();
  const { socialLinks } = settings;

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
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-950 font-display text-xs font-bold text-gold-300">
              L
            </span>
            <span className="font-display text-sm font-bold">Luxury Phone</span>
            <span className="text-xs text-neutral-400">
              © {new Date().getFullYear()} — Guelma, Algeria
            </span>
          </div>

          <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs font-medium text-neutral-600">
            <Link href="/products" className="hover:text-gold-600">Products</Link>
            <Link href="/track-order" className="hover:text-gold-600">Track Order</Link>
            <Link href="/about" className="hover:text-gold-600">About Us</Link>
            <Link href="/contact" className="hover:text-gold-600">Contact</Link>
            {socialLinks.facebook && (
              <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="text-gold-600 hover:text-gold-700">
                Facebook
              </a>
            )}
            {socialLinks.instagram && (
              <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="text-gold-600 hover:text-gold-700">
                Instagram
              </a>
            )}
            {socialLinks.tiktok && (
              <a href={socialLinks.tiktok} target="_blank" rel="noopener noreferrer" className="text-gold-600 hover:text-gold-700">
                TikTok
              </a>
            )}
          </nav>
        </div>
      </div>
    </footer>
  );
}
