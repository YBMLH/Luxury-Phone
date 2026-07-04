'use client';

import { useEffect, useState } from 'react';
import Hero from '@/components/home/Hero';
import ProductRow from '@/components/home/ProductRow';
import Categories from '@/components/home/Categories';
import Brands from '@/components/home/Brands';
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

  return (
    <>
      <Hero />

      {loading ? (
        <div className="mx-auto max-w-7xl px-4 py-16 md:px-6">
          <ProductGridSkeleton count={4} />
        </div>
      ) : (
        <>
          <ProductRow
            eyebrow="Handpicked"
            title="Featured Products"
            subtitle="Our selection of the finest devices in store right now."
            products={featured}
            viewAllHref="/products?featured=1"
          />
          <ProductRow
            eyebrow="Just In"
            title="New Arrivals"
            subtitle="The latest releases, fresh in our showroom."
            products={newArrivals}
            viewAllHref="/products"
          />
        </>
      )}

      <Categories />

      {!loading && (
        <ProductRow
          eyebrow="Customer Favorites"
          title="Best Sellers"
          subtitle="The products our customers love the most."
          products={bestSellers}
          viewAllHref="/products"
        />
      )}

      <Brands products={products} />
      <WhyChooseUs />
      <Locations />
      <Reviews />
      <ContactSection />
    </>
  );
}
