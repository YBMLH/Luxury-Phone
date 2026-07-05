'use client';

import { useEffect, useState } from 'react';
import Hero from '@/components/home/Hero';
import MarbleBanner from '@/components/home/MarbleBanner';
import ProductRow from '@/components/home/ProductRow';
import Categories from '@/components/home/Categories';
import WhyChooseUs from '@/components/home/WhyChooseUs';
import Locations from '@/components/home/Locations';
import Reviews from '@/components/home/Reviews';
import ContactSection from '@/components/home/ContactSection';
import { ProductGridSkeleton } from '@/components/Skeletons';
import { getProducts } from '@/lib/db';

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProducts()
      .then(setProducts)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const featured = products.filter((p) => p.featured);
  const newArrivals = products.filter((p) => p.newArrival);
  const bestSellers = products.filter((p) => p.bestseller);
  // "This season's essentials": featured products, or the latest ones
  // until the owner marks some as featured.
  const essentials = featured.length ? featured : products;

  return (
    <>
      <Hero featured={featured[0] || products[0] || null} />
      <MarbleBanner />
      <Categories products={products} />

      {loading ? (
        <div className="mx-auto max-w-7xl px-4 py-14 md:px-6">
          <ProductGridSkeleton count={4} />
        </div>
      ) : (
        <>
          <ProductRow
            title="This season's essentials"
            products={essentials}
            viewAllHref="/products"
          />
          <ProductRow
            title="New arrivals"
            subtitle="The latest releases, fresh in our showroom."
            products={newArrivals}
            viewAllHref="/products"
          />
        </>
      )}

      <WhyChooseUs />

      {!loading && (
        <ProductRow
          title="Best sellers"
          subtitle="The products our customers love the most."
          products={bestSellers}
          viewAllHref="/products"
        />
      )}

      <Reviews />
      <Locations />
      <ContactSection />
    </>
  );
}
