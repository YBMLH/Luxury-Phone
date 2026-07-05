'use client';

// A titled row of product cards with a left-aligned heading and a
// "View all" link, matching the reference design.
import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import AnimateIn from '@/components/AnimateIn';

export default function ProductRow({ title, subtitle, products, viewAllHref }) {
  if (!products.length) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-14 md:px-6">
      <AnimateIn>
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
              {title}
            </h2>
            {subtitle && <p className="mt-2 text-sm text-neutral-500">{subtitle}</p>}
          </div>
          {viewAllHref && (
            <Link
              href={viewAllHref}
              className="text-sm font-semibold text-gold-600 transition hover:text-gold-700"
            >
              View all products →
            </Link>
          )}
        </div>
      </AnimateIn>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
        {products.slice(0, 8).map((product, i) => (
          <AnimateIn key={product.id} delay={i * 0.05}>
            <ProductCard product={product} />
          </AnimateIn>
        ))}
      </div>
    </section>
  );
}
