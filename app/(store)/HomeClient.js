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
import { getProducts } from '@/lib/db';
import { pickShowcase } from '@/lib/utils';
import { useLanguage } from '@/context/LanguageContext';

export default function HomeClient({ showcaseProducts = [] }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

  useEffect(() => {
    getProducts()
      .then(setProducts)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const newArrivals = products.filter((p) => p.newArrival);
  const bestSellers = products.filter((p) => p.bestseller);

  // The hero fan is the featured section — there's no separate featured row
  // below it any more.
  //
  // The server-rendered list paints instantly (good for LCP), then the live
  // fetch takes over — otherwise the hero would keep showing whatever photos
  // were cached when the page was last rebuilt, even after an edit.
  //
  // Only swap when the live fetch actually yields something: offline, the
  // Firestore SDK resolves from an empty local cache instead of throwing, and
  // an empty result there would blank the hero. The server list came from a
  // real read, so it's the safer thing to keep. A genuinely emptied shop
  // corrects itself on the next revalidate.
  const liveShowcase = pickShowcase(products);
  const heroProducts = liveShowcase.length ? liveShowcase : showcaseProducts;

  return (
    <>
      <Hero showcaseProducts={heroProducts} />

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
