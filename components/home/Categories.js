'use client';

import Link from 'next/link';
import SectionHeading from '@/components/SectionHeading';
import AnimateIn from '@/components/AnimateIn';
import { CATEGORIES } from '@/lib/constants';

export default function Categories() {
  return (
    <section className="marble py-16">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <AnimateIn>
          <SectionHeading
            eyebrow="Browse"
            title="Product Categories"
            subtitle="Everything you need — from flagship phones to the smallest accessory."
            dark
          />
        </AnimateIn>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {CATEGORIES.map((cat, i) => (
            <AnimateIn key={cat.id} delay={i * 0.04}>
              <Link
                href={`/products?category=${cat.id}`}
                className="marble-card group flex flex-col items-center gap-3 rounded-2xl px-4 py-8 text-center transition hover:border-gold/60 hover:shadow-gold"
              >
                <span className="text-4xl transition group-hover:scale-110">{cat.icon}</span>
                <span className="text-sm font-medium text-neutral-200 group-hover:text-gold-300">
                  {cat.label}
                </span>
              </Link>
            </AnimateIn>
          ))}
        </div>
      </div>
    </section>
  );
}
