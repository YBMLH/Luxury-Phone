'use client';

// A titled row of product cards, used for Featured / New Arrivals / Best Sellers.
import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import SectionHeading from '@/components/SectionHeading';
import AnimateIn from '@/components/AnimateIn';

export default function ProductRow({ eyebrow, title, subtitle, products, viewAllHref }) {
  if (!products.length) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 md:px-6">
      <AnimateIn>
        <SectionHeading eyebrow={eyebrow} title={title} subtitle={subtitle} />
      </AnimateIn>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
        {products.slice(0, 8).map((product, i) => (
          <AnimateIn key={product.id} delay={i * 0.05}>
            <ProductCard product={product} />
          </AnimateIn>
        ))}
      </div>
      {viewAllHref && (
        <div className="mt-10 text-center">
          <Link href={viewAllHref} className="btn-outline">
            View All →
          </Link>
        </div>
      )}
    </section>
  );
}
