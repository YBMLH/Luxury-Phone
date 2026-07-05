'use client';

import Link from 'next/link';
import { CATEGORIES } from '@/lib/constants';

// White category strip with product counts, shown right under the marble banner.
export default function Categories({ products = [] }) {
  const countFor = (id) => products.filter((p) => p.category === id).length;

  return (
    <section className="border-b border-neutral-200 bg-white">
      <div className="mx-auto grid max-w-7xl grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
        {CATEGORIES.map((cat) => {
          const count = countFor(cat.id);
          return (
            <Link
              key={cat.id}
              href={`/products?category=${cat.id}`}
              className="group flex items-center gap-4 border-b border-neutral-200 px-6 py-6 transition hover:bg-neutral-50 sm:border-r lg:[&:nth-child(5n)]:border-r-0"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-neutral-200 text-xl transition group-hover:border-gold/60 group-hover:bg-gold/5">
                {cat.icon}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-display text-sm font-bold transition group-hover:text-gold-600">
                  {cat.label}
                </span>
                <span className="block text-xs text-neutral-500">
                  {count > 0 ? `${count} product${count > 1 ? 's' : ''}` : 'Browse'}
                </span>
              </span>
              <span className="text-neutral-300 transition group-hover:translate-x-1 group-hover:text-gold-600">
                →
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
