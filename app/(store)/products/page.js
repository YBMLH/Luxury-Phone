'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import ProductCard from '@/components/ProductCard';
import EmptyState from '@/components/EmptyState';
import { ProductGridSkeleton } from '@/components/Skeletons';
import { getProducts } from '@/lib/db';
import { CATEGORIES } from '@/lib/constants';

const PRICE_RANGES = [
  { id: 'all', label: 'Any Price' },
  { id: '0-20000', label: 'Under 20 000 DA' },
  { id: '20000-60000', label: '20 000 — 60 000 DA' },
  { id: '60000-150000', label: '60 000 — 150 000 DA' },
  { id: '150000-99999999', label: 'Over 150 000 DA' },
];

function ProductsContent() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState(searchParams.get('category') || 'all');
  const [brand, setBrand] = useState(searchParams.get('brand') || 'all');
  const [price, setPrice] = useState('all');
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

    return products.filter((p) => {
      if (q && !`${p.name} ${p.brand}`.toLowerCase().includes(q)) return false;
      if (category !== 'all' && p.category !== category) return false;
      if (brand !== 'all' && p.brand !== brand) return false;
      if (featuredOnly && !p.featured) return false;
      const priceNum = Number(p.price) || 0;
      if (priceNum < min || priceNum > max) return false;
      return true;
    });
  }, [products, search, category, brand, price, featuredOnly]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:px-6">
      <div className="mb-8">
        <h1 className="font-display text-4xl font-bold tracking-tight md:text-5xl">
          Our <span className="text-gold-gradient">products.</span>
        </h1>
      </div>

      {/* Filters */}
      <div className="mb-8 grid gap-3 rounded-[1.75rem] border border-neutral-200 bg-white p-4 shadow-sm md:grid-cols-5">
        <input
          type="search"
          placeholder="Search products…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input md:col-span-2"
        />
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="input">
          <option value="all">All Categories</option>
          {CATEGORIES.map((c) => (
            <option key={c.id} value={c.id}>{c.label}</option>
          ))}
        </select>
        <select value={brand} onChange={(e) => setBrand(e.target.value)} className="input">
          <option value="all">All Brands</option>
          {brands.map((b) => (
            <option key={b} value={b}>{b}</option>
          ))}
        </select>
        <select value={price} onChange={(e) => setPrice(e.target.value)} className="input">
          {PRICE_RANGES.map((r) => (
            <option key={r.id} value={r.id}>{r.label}</option>
          ))}
        </select>
        <label className="flex items-center gap-2 text-sm text-neutral-700 md:col-span-5">
          <input
            type="checkbox"
            checked={featuredOnly}
            onChange={(e) => setFeaturedOnly(e.target.checked)}
            className="h-4 w-4 accent-gold"
          />
          Featured products only
        </label>
      </div>

      {loading ? (
        <ProductGridSkeleton />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon="🔍"
          title="No products found"
          message="Try a different search or remove some filters."
        />
      ) : (
        <>
          <p className="mb-4 text-sm text-neutral-500">
            {filtered.length} product{filtered.length > 1 ? 's' : ''} found
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

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-7xl px-4 py-10 md:px-6"><ProductGridSkeleton /></div>}>
      <ProductsContent />
    </Suspense>
  );
}
