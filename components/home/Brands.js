'use client';

import Link from 'next/link';
import SectionHeading from '@/components/SectionHeading';
import AnimateIn from '@/components/AnimateIn';

// Brands are computed from the products currently in the store, so this
// section always stays up to date automatically.
export default function Brands({ products }) {
  const brands = [...new Set(products.map((p) => p.brand).filter(Boolean))];
  if (!brands.length) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 md:px-6">
      <AnimateIn>
        <SectionHeading
          eyebrow="Official"
          title="Top Brands"
          subtitle="Genuine products from the world's leading manufacturers."
        />
      </AnimateIn>
      <div className="flex flex-wrap items-center justify-center gap-4">
        {brands.map((brand, i) => (
          <AnimateIn key={brand} delay={i * 0.05}>
            <Link
              href={`/products?brand=${encodeURIComponent(brand)}`}
              className="rounded-full border border-neutral-200 bg-white px-8 py-3 font-display text-lg font-semibold text-neutral-700 shadow-card transition hover:border-gold hover:text-gold-700 hover:shadow-card-hover"
            >
              {brand}
            </Link>
          </AnimateIn>
        ))}
      </div>
    </section>
  );
}
