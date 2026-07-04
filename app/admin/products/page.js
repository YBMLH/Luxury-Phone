'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { getProducts, deleteProduct } from '@/lib/db';
import { CATEGORIES, categoryLabel } from '@/lib/constants';
import { formatPrice } from '@/lib/utils';
import { TableSkeleton } from '@/components/Skeletons';
import EmptyState from '@/components/EmptyState';

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    getProducts()
      .then(setProducts)
      .catch(() => toast.error('Could not load products.'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter((p) => {
      if (q && !`${p.name} ${p.brand}`.toLowerCase().includes(q)) return false;
      if (category !== 'all' && p.category !== category) return false;
      return true;
    });
  }, [products, search, category]);

  async function handleDelete(product) {
    if (!confirm(`Delete "${product.name}"? This cannot be undone.`)) return;
    setDeleting(product.id);
    try {
      await deleteProduct(product.id, product.images);
      setProducts((prev) => prev.filter((p) => p.id !== product.id));
      toast.success('Product deleted.');
    } catch {
      toast.error('Could not delete the product.');
    } finally {
      setDeleting(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-2xl font-bold">Products ({products.length})</h1>
        <Link href="/admin/products/new" className="btn-gold !px-5 !py-2.5">
          + Add Product
        </Link>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <input type="search" className="input sm:max-w-xs" placeholder="Search products…"
          value={search} onChange={(e) => setSearch(e.target.value)} />
        <select className="input sm:max-w-xs" value={category}
          onChange={(e) => setCategory(e.target.value)}>
          <option value="all">All Categories</option>
          {CATEGORIES.map((c) => (
            <option key={c.id} value={c.id}>{c.label}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <TableSkeleton />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon="📦"
          title={products.length === 0 ? 'No products yet' : 'No matching products'}
          message={products.length === 0
            ? 'Add your first product to start selling.'
            : 'Try a different search or category.'}
          action={products.length === 0 && (
            <Link href="/admin/products/new" className="btn-gold">+ Add Product</Link>
          )}
        />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-neutral-200 bg-white shadow-card">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-neutral-200 bg-neutral-50 text-xs uppercase tracking-wider text-neutral-500">
              <tr>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Stock</th>
                <th className="px-4 py-3">Tags</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filtered.map((product) => (
                <tr key={product.id} className="hover:bg-neutral-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {product.images?.[0] ? (
                        <img src={product.images[0]} alt=""
                          className="h-11 w-11 rounded-lg border border-neutral-200 object-cover" />
                      ) : (
                        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-neutral-100">📷</div>
                      )}
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-xs text-neutral-500">{product.brand}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-neutral-600">
                    {categoryLabel(product.category)}
                  </td>
                  <td className="px-4 py-3 font-semibold">{formatPrice(product.price)}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      Number(product.stock) > 0
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {Number(product.stock) > 0 ? `${product.stock} in stock` : 'Out of stock'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      {product.featured && <span title="Featured">⭐</span>}
                      {product.bestseller && <span title="Best Seller">🏆</span>}
                      {product.newArrival && <span title="New Arrival">🆕</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={`/products/${product.id}`} target="_blank"
                        className="rounded-lg border border-neutral-300 px-3 py-1.5 text-xs hover:bg-neutral-100">
                        View
                      </Link>
                      <Link href={`/admin/products/${product.id}`}
                        className="rounded-lg border border-gold/50 px-3 py-1.5 text-xs text-gold-700 hover:bg-gold/10">
                        Edit
                      </Link>
                      <button onClick={() => handleDelete(product)}
                        disabled={deleting === product.id}
                        className="rounded-lg border border-red-200 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 disabled:opacity-50">
                        {deleting === product.id ? '…' : 'Delete'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
