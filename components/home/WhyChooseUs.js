'use client';

import SectionHeading from '@/components/SectionHeading';
import AnimateIn from '@/components/AnimateIn';

const FEATURES = [
  {
    icon: '✅',
    title: '100% Genuine Products',
    text: 'Every product is original and comes with its official warranty.',
  },
  {
    icon: '🚚',
    title: 'Delivery to 58 Wilayas',
    text: 'Fast and safe delivery to every wilaya in Algeria, door to door.',
  },
  {
    icon: '💰',
    title: 'Best Prices',
    text: 'Honest, competitive prices with regular offers and discounts.',
  },
  {
    icon: '🤝',
    title: 'Trusted Local Store',
    text: 'Two physical branches in Guelma — visit us any time.',
  },
];

export default function WhyChooseUs() {
  return (
    <section className="marble py-16">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <AnimateIn>
          <SectionHeading
            eyebrow="Our Promise"
            title="Why Choose Luxury Phone"
            dark
          />
        </AnimateIn>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f, i) => (
            <AnimateIn key={f.title} delay={i * 0.08}>
              <div className="marble-card h-full rounded-2xl p-6 text-center">
                <div className="mb-4 text-4xl">{f.icon}</div>
                <h3 className="font-display text-lg font-semibold text-gold-300">
                  {f.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-neutral-300">{f.text}</p>
              </div>
            </AnimateIn>
          ))}
        </div>
      </div>
    </section>
  );
}
