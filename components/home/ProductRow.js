'use client';

// A titled row of product cards. Renders either as a grid (default) or
// as a horizontally swipeable carousel (layout="carousel") — used for
// the Featured Products row.
import { useRef } from 'react';
import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import AnimateIn from '@/components/AnimateIn';
import { useLanguage } from '@/context/LanguageContext';

export default function ProductRow({ title, subtitle, products, viewAllHref, layout = 'grid' }) {
  const { t } = useLanguage();
  const scrollerRef = useRef(null);
  if (!products.length) return null;

  const isCarousel = layout === 'carousel';

  function scrollByCards(direction) {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * el.clientWidth * 0.8, behavior: 'smooth' });
  }

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
          <div className="flex items-center gap-3">
            {viewAllHref && (
              <Link
                href={viewAllHref}
                className="text-sm font-semibold text-gold-700 transition hover:text-gold-800"
              >
                {t('common.viewAllProducts')}
              </Link>
            )}
            {isCarousel && (
              <div className="hidden gap-2 sm:flex">
                <button type="button" onClick={() => scrollByCards(-1)} aria-label="Scroll left"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-neutral-300 text-neutral-600 transition hover:border-gold hover:text-gold-700">
                  ←
                </button>
                <button type="button" onClick={() => scrollByCards(1)} aria-label="Scroll right"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-neutral-300 text-neutral-600 transition hover:border-gold hover:text-gold-700">
                  →
                </button>
              </div>
            )}
          </div>
        </div>
      </AnimateIn>

      {isCarousel ? (
        <div
          ref={scrollerRef}
          className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-4 pb-2 md:gap-6"
        >
          {products.map((product) => (
            <div key={product.id} className="w-40 shrink-0 snap-start sm:w-48 md:w-56 lg:w-60">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
          {products.slice(0, 8).map((product, i) => (
            <AnimateIn key={product.id} delay={i * 0.05}>
              <ProductCard product={product} />
            </AnimateIn>
          ))}
        </div>
      )}
    </section>
  );
}
