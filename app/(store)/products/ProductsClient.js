'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import ProductCard from '@/components/ProductCard';
import EmptyState from '@/components/EmptyState';
import Breadcrumbs from '@/components/Breadcrumbs';
import { ProductGridSkeleton } from '@/components/Skeletons';
import { getProducts } from '@/lib/db';
import { CATEGORIES } from '@/lib/constants';
import { useLanguage } from '@/context/LanguageContext';

function ProductsContent() {
  const searchParams = useSearchParams();
  const { t } = useLanguage();

  const PRICE_RANGES = [
    { id: 'all', label: t('productsPage.anyPrice') },
    { id: '0-20000', label: t('productsPage.priceRanges.under20') },
    { id: '20000-60000', label: t('productsPage.priceRanges.r20to60') },
    { id: '60000-150000', label: t('productsPage.priceRanges.r60to150') },
    { id: '150000-99999999', label: t('productsPage.priceRanges.over150') },
  ];
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState(searchParams.get('category') || 'all');
  const [brand, setBrand] = useState(searchParams.get('brand') || 'all');
  const [price, setPrice] = useState('all');
  const [sort, setSort] = useState('newest');
  const [featuredOnly, setFeaturedOnly] = useState(searchParams.get('featured') === '1');

  useEffect(() => {
    getProducts()
      .then(setProducts)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const brands = useMemo(
    () => [...new Set(products.map((p) => p.brand).filter(Boolean))].sort(),
    [products]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const [min, max] =
      price === 'all' ? [0, Infinity] : price.split('-').map(Number);

    const result = products.filter((p) => {
      if (q && !`${p.name} ${p.brand}`.toLowerCase().includes(q)) return false;
      if (category !== 'all' && p.category !== category) return false;
      if (brand !== 'all' && p.brand !== brand) return false;
      if (featuredOnly && !p.featured) return false;
      const priceNum = Number(p.price) || 0;
      if (priceNum < min || priceNum > max) return false;
      return true;
    });

    if (sort === 'price-asc') {
      result.sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0));
    } else if (sort === 'price-desc') {
      result.sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0));
    }
    // "newest" keeps the default order (already sorted by createdAt desc).
    return result;
  }, [products, search, category, brand, price, sort, featuredOnly]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:px-6">
      <Breadcrumbs items={[{ name: 'Accueil', href: '/' }, { name: 'Produits', href: '/products' }]} />

      <div className="mb-8">
        <h1 className="font-display text-4xl font-bold tracking-tight md:text-5xl">
          {t('productsPage.title')}<span className="text-gold-gradient">{t('productsPage.titleAccent')}</span>
        </h1>
      </div>

      {/* Filters */}
      <div className="mb-8 grid gap-3 rounded-[1.75rem] border border-neutral-200 bg-white p-4 shadow-sm md:grid-cols-5">
        <input
          type="search"
          placeholder={t('productsPage.searchPlaceholder')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input md:col-span-2"
          aria-label={t('productsPage.searchPlaceholder')}
        />
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="input" aria-label={t('productsPage.allCategories')}>
          <option value="all">{t('productsPage.allCategories')}</option>
          {CATEGORIES.map((c) => (
            <option key={c.id} value={c.id}>{t(`categories.${c.id}.label`)}</option>
          ))}
        </select>
        <select value={brand} onChange={(e) => setBrand(e.target.value)} className="input" aria-label={t('productsPage.allBrands')}>
          <option value="all">{t('productsPage.allBrands')}</option>
          {brands.map((b) => (
            <option key={b} value={b}>{b}</option>
          ))}
        </select>
        <select value={price} onChange={(e) => setPrice(e.target.value)} className="input" aria-label={t('productsPage.anyPrice')}>
          {PRICE_RANGES.map((r) => (
            <option key={r.id} value={r.id}>{r.label}</option>
          ))}
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value)} className="input md:col-span-2" aria-label={t('productsPage.sortNewest')}>
          <option value="newest">{t('productsPage.sortNewest')}</option>
          <option value="price-asc">{t('productsPage.sortPriceAsc')}</option>
          <option value="price-desc">{t('productsPage.sortPriceDesc')}</option>
        </select>
        <label className="flex items-center gap-2 text-sm text-neutral-700 md:col-span-3">
          <input
            type="checkbox"
            checked={featuredOnly}
            onChange={(e) => setFeaturedOnly(e.target.checked)}
            className="h-4 w-4 accent-gold"
          />
          {t('productsPage.featuredOnly')}
        </label>
      </div>

      {loading ? (
        <ProductGridSkeleton />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon="🔍"
          title={t('productsPage.emptyTitle')}
          message={t('productsPage.emptyMessage')}
        />
      ) : (
        <>
          <p className="mb-4 text-sm text-neutral-500">
            {t('productsPage.resultsCount', { count: filtered.length, plural: filtered.length > 1 ? 's' : '' })}
          </p>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function ProductsClient() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-7xl px-4 py-10 md:px-6"><ProductGridSkeleton /></div>}>
      <ProductsContent />
    </Suspense>
  );
}
