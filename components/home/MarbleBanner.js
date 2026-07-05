'use client';

import Link from 'next/link';
import AnimateIn from '@/components/AnimateIn';

// Full-width black marble strip with gold veins, like the reference design.
export default function MarbleBanner() {
  return (
    <section className="marble">
      <AnimateIn className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 px-4 py-16 md:flex-row md:items-center md:px-6">
        <h2 className="font-display text-3xl font-bold leading-snug md:text-4xl">
          <span className="text-white">Crafted like </span>
          <span className="text-gold-gradient">fine marble.</span>
          <span className="block text-neutral-400">
            Engineered like nothing else.
          </span>
        </h2>
        <Link href="/products" className="btn-gold shrink-0 !px-8 !py-3.5">
          Explore the collection →
        </Link>
      </AnimateIn>
    </section>
  );
}
