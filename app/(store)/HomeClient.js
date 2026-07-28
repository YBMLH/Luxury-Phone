'use client';

import { useEffect, useState } from 'react';
import Hero from '@/components/home/Hero';
import ProductRow from '@/components/home/ProductRow';
import Categories from '@/components/home/Categories';
import WhyChooseUs from '@/components/home/WhyChooseUs';
import Locations from '@/components/home/Locations';
import Reviews from '@/components/home/Reviews';
import ContactSection from '@/components/home/ContactSection';
import FAQ from '@/components/home/FAQ';
import { ProductGridSkeleton } from '@/components/Skeletons';
import { getProducts } from '@/lib/db';
import { useLanguage } from '@/context/LanguageContext';

export default function HomeClient() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

  useEffect(() => {
    getProducts()
      .then(setProducts)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const featured = products.filter((p) => p.featured);
  const newArrivals = products.filter((p) => p.newArrival);
  const bestSellers = products.filter((p) => p.bestseller);
  // Featured Products carousel: officially featured products, or the
  // latest ones until the owner marks some as featured.
  const essentials = featured.length ? featured : products;

  return (
    <>
      <Hero />

      {loading ? (
        <div className="mx-auto max-w-7xl px-4 py-14 md:px-6">
          <ProductGridSkeleton count={4} />
        </div>
      ) : (
        <ProductRow
          title={t('productRow.essentialsTitle')}
          products={essentials}
          viewAllHref="/products"
          layout="carousel"
        />
      )}

      <Categories products={products} />

      {!loading && (
        <ProductRow
          title={t('productRow.newArrivalsTitle')}
          subtitle={t('productRow.newArrivalsSubtitle')}
          products={newArrivals}
          viewAllHref="/products"
        />
      )}

      <WhyChooseUs />

      {!loading && (
        <ProductRow
          title={t('productRow.bestSellersTitle')}
          subtitle={t('productRow.bestSellersSubtitle')}
          products={bestSellers}
          viewAllHref="/products"
        />
      )}

      <Reviews />
      <Locations />
      <FAQ />
      <ContactSection />
    </>
  );
}
