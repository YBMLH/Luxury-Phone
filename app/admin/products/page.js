'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { getProducts, deleteProduct, addProduct } from '@/lib/db';
import { CATEGORIES } from '@/lib/constants';
import { formatPrice } from '@/lib/utils';
import { TableSkeleton } from '@/components/Skeletons';
import EmptyState from '@/components/EmptyState';
import { useLanguage } from '@/context/LanguageContext';

export default function AdminProductsPage() {
  const { t } = useLanguage();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    getProducts()
      .then(setProducts)
      .catch(() => toast.error(t('admin.products.loadError')))
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

  async function handleDuplicate(product) {
    try {
      const { id, createdAt, updatedAt, ...data } = product;
      await addProduct({
        ...data,
        name: `${product.name} ${t('admin.products.copySuffix')}`,
        featured: false,
        bestseller: false,
        newArrival: false,
      });
      setProducts(await getProducts());
      toast.success(t('admin.products.duplicateSuccess'));
    } catch {
      toast.error(t('admin.products.duplicateError'));
    }
  }

  async function handleDelete(product) {
    if (!confirm(t('admin.products.confirmDelete', { name: product.name }))) return;
    setDeleting(product.id);
    try {
      await deleteProduct(product.id, product.images);
      setProducts((prev) => prev.filter((p) => p.id !== product.id));
      toast.success(t('admin.products.deleteSuccess'));
    } catch {
      toast.error(t('admin.products.deleteError'));
    } finally {
      setDeleting(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-2xl font-bold">{t('admin.products.title')} ({products.length})</h1>
        <Link href="/admin/products/new" className="btn-gold !px-5 !py-2.5">
          {t('admin.products.addProduct')}
        </Link>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <input type="search" className="input sm:max-w-xs" placeholder={t('admin.products.searchPlaceholder')}
          value={search} onChange={(e) => setSearch(e.target.value)} />
        <select className="input sm:max-w-xs" value={category}
          onChange={(e) => setCategory(e.target.value)}>
          <option value="all">{t('admin.products.allCategories')}</option>
          {CATEGORIES.map((c) => (
            <option key={c.id} value={c.id}>{t(`categories.${c.id}.label`)}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <TableSkeleton />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon="📦"
          title={products.length === 0 ? t('admin.products.noProductsTitle') : t('admin.products.noMatchTitle')}
          message={products.length === 0 ? t('admin.products.noProductsMessage') : t('admin.products.noMatchMessage')}
          action={products.length === 0 && (
            <Link href="/admin/products/new" className="btn-gold">{t('admin.products.addProduct')}</Link>
          )}
        />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-neutral-200 bg-white shadow-card">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-neutral-200 bg-neutral-50 text-xs uppercase tracking-wider text-neutral-500">
              <tr>
                <th className="px-4 py-3">{t('admin.products.product')}</th>
                <th className="px-4 py-3">{t('admin.products.category')}</th>
                <th className="px-4 py-3">{t('admin.products.price')}</th>
                <th className="px-4 py-3">{t('admin.products.stock')}</th>
                <th className="px-4 py-3">{t('admin.products.tags')}</th>
                <th className="px-4 py-3 text-right">{t('admin.products.actions')}</th>
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
                    {t(`categories.${product.category}.label`)}
                  </td>
                  <td className="px-4 py-3 font-semibold">{formatPrice(product.price)}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      Number(product.stock) <= 0
                        ? 'bg-red-100 text-red-700'
                        : Number(product.stock) <= 3
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-green-100 text-green-700'
                    }`}>
                      {Number(product.stock) <= 0
                        ? t('admin.products.outOfStock')
                        : Number(product.stock) <= 3
                        ? t('admin.products.lowStock', { count: product.stock })
                        : t('admin.products.inStock', { count: product.stock })}
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
                      <Link href={`/products/${product.slug || product.id}`} target="_blank"
                        className="rounded-lg border border-neutral-300 px-3 py-1.5 text-xs hover:bg-neutral-100">
                        {t('admin.products.view')}
                      </Link>
                      <Link href={`/admin/products/${product.id}`}
                        className="rounded-lg border border-gold/50 px-3 py-1.5 text-xs text-gold-700 hover:bg-gold/10">
                        {t('admin.products.edit')}
                      </Link>
                      <button onClick={() => handleDuplicate(product)}
                        title="Create a copy of this product"
                        className="rounded-lg border border-neutral-300 px-3 py-1.5 text-xs hover:bg-neutral-100">
                        {t('admin.products.duplicate')}
                      </button>
                      <button onClick={() => handleDelete(product)}
                        disabled={deleting === product.id}
                        className="rounded-lg border border-red-200 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 disabled:opacity-50">
                        {deleting === product.id ? '…' : t('admin.products.delete')}
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
