'use client';

import Link from 'next/link';
import AnimateIn from '@/components/AnimateIn';

const FEATURES = [
  {
    icon: '✅',
    title: '100% Genuine',
    text: 'Original products with their official warranty.',
  },
  {
    icon: '🚚',
    title: '58 Wilayas',
    text: 'Fast, safe delivery everywhere in Algeria.',
  },
  {
    icon: '💰',
    title: 'Best Prices',
    text: 'Honest prices with regular offers.',
  },
  {
    icon: '🤝',
    title: 'Local & Trusted',
    text: 'Two physical branches in Guelma.',
  },
];

// Large rounded marble panel with gold veins — like the reference's
// dark promo section.
export default function WhyChooseUs() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-14 md:px-6">
      <AnimateIn>
        <div className="marble grid items-center gap-10 overflow-hidden rounded-[2rem] p-8 md:p-14 lg:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold-400">
              Why Luxury Phone
            </p>
            <h2 className="mt-4 font-display text-3xl font-bold leading-tight text-white md:text-4xl">
              Genuine products.
              <span className="block text-gold-gradient">Real peace of mind.</span>
            </h2>
            <p className="mt-5 max-w-md text-sm leading-relaxed text-neutral-300 md:text-base">
              Every device we sell is original, covered by its official
              warranty, and delivered to your door anywhere in Algeria — or
              pick it up at one of our two branches in Guelma.
            </p>
            <Link href="/contact" className="btn-gold mt-8 !px-8 !py-3.5">
              Visit our stores →
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur"
              >
                <div className="text-2xl">{f.icon}</div>
                <h3 className="mt-3 font-display text-sm font-bold text-gold-300">
                  {f.title}
                </h3>
                <p className="mt-1.5 text-xs leading-relaxed text-neutral-300">
                  {f.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </AnimateIn>
    </section>
  );
}
