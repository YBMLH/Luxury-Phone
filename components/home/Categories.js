'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { CATEGORIES } from '@/lib/constants';
import CategoryIcon from '@/components/CategoryIcon';
import SectionHeading from '@/components/SectionHeading';
import AnimateIn from '@/components/AnimateIn';

// Large gold-and-black luxury category cards, shown on the homepage.
export default function Categories({ products = [] }) {
  const countFor = (id) => products.filter((p) => p.category === id).length;

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 md:px-6">
      <AnimateIn>
        <SectionHeading
          eyebrow="Browse"
          title="Shop by Category"
          subtitle="Discover our full range of premium electronics."
        />
      </AnimateIn>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {CATEGORIES.map((cat, i) => {
          const count = countFor(cat.id);
          return (
            <AnimateIn key={cat.id} delay={i * 0.05}>
              <Link href={`/products?category=${cat.id}`} className="group block">
                <motion.div
                  whileHover={{ y: -6 }}
                  transition={{ duration: 0.25 }}
                  className="marble relative flex h-full min-h-[190px] flex-col justify-between overflow-hidden rounded-[1.75rem] border border-gold/20 p-6 shadow-sm transition group-hover:border-gold/50 group-hover:shadow-gold"
                >
                  {/* Soft gold glow that intensifies on hover */}
                  <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gold/10 blur-2xl transition group-hover:bg-gold/20" />

                  <div className="relative flex items-start justify-between">
                    <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-gold/30 bg-white/5 text-gold-300 backdrop-blur transition group-hover:scale-110 group-hover:border-gold/60">
                      <CategoryIcon id={cat.id} />
                    </span>
                    {count > 0 && (
                      <span className="rounded-full bg-gold/15 px-3 py-1 text-xs font-semibold text-gold-300">
                        {count} item{count > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>

                  <div className="relative mt-6">
                    <h3 className="font-display text-xl font-bold text-white">
                      {cat.label}
                    </h3>
                    <p className="mt-1 text-sm text-neutral-400">{cat.subtitle}</p>
                    <span className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-gold px-4 py-2 text-xs font-bold text-neutral-900 transition group-hover:gap-2.5">
                      Shop Now
                      <span aria-hidden="true">→</span>
                    </span>
                  </div>
                </motion.div>
              </Link>
            </AnimateIn>
          );
        })}
      </div>
    </section>
  );
}
