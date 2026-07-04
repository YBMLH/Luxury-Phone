'use client';

import Link from 'next/link';
import { useSettings } from '@/context/SettingsContext';
import { CATEGORIES } from '@/lib/constants';

export default function Footer() {
  const { settings } = useSettings();
  const { contactInfo, socialLinks, locations } = settings;

  return (
    <footer className="marble border-t border-gold/25 text-neutral-300">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 md:grid-cols-4 md:px-6">
        <div>
          <p className="font-display text-2xl font-bold text-gold-gradient">
            Luxury Phone
          </p>
          <p className="mt-4 text-sm leading-relaxed text-neutral-400">
            Premium electronics store in Guelma, Algeria. Genuine products,
            honest prices and fast delivery to all 58 wilayas.
          </p>
          <div className="mt-5 flex gap-3">
            {socialLinks.facebook && (
              <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer"
                 className="rounded-full border border-gold/40 px-3 py-1.5 text-xs text-gold-300 hover:bg-gold/10">
                Facebook
              </a>
            )}
            {socialLinks.instagram && (
              <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer"
                 className="rounded-full border border-gold/40 px-3 py-1.5 text-xs text-gold-300 hover:bg-gold/10">
                Instagram
              </a>
            )}
            {socialLinks.tiktok && (
              <a href={socialLinks.tiktok} target="_blank" rel="noopener noreferrer"
                 className="rounded-full border border-gold/40 px-3 py-1.5 text-xs text-gold-300 hover:bg-gold/10">
                TikTok
              </a>
            )}
          </div>
        </div>

        <div>
          <h4 className="mb-4 text-sm font-semibold uppercase tracking-widest text-gold-400">
            Quick Links
          </h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/products" className="hover:text-gold-300">All Products</Link></li>
            <li><Link href="/track-order" className="hover:text-gold-300">Track My Order</Link></li>
            <li><Link href="/about" className="hover:text-gold-300">About Us</Link></li>
            <li><Link href="/contact" className="hover:text-gold-300">Contact</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="mb-4 text-sm font-semibold uppercase tracking-widest text-gold-400">
            Categories
          </h4>
          <ul className="space-y-2 text-sm">
            {CATEGORIES.slice(0, 6).map((cat) => (
              <li key={cat.id}>
                <Link href={`/products?category=${cat.id}`} className="hover:text-gold-300">
                  {cat.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="mb-4 text-sm font-semibold uppercase tracking-widest text-gold-400">
            Our Stores
          </h4>
          <ul className="space-y-4 text-sm">
            {locations.map((loc, i) => (
              <li key={i}>
                <p className="font-medium text-white">{loc.name}</p>
                <p className="text-neutral-400">{loc.city} — {loc.address}</p>
                {loc.phone && <p className="text-gold-300">{loc.phone}</p>}
              </li>
            ))}
            {contactInfo.phone && (
              <li className="text-gold-300">📞 {contactInfo.phone}</li>
            )}
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10 py-5 text-center text-xs text-neutral-500">
        © {new Date().getFullYear()} Luxury Phone — Guelma, Algeria. All rights reserved.
      </div>
    </footer>
  );
}
