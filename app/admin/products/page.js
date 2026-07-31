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
import { PageHeader, TabBar, IconButton, LinkButton } from '@/components/admin/ui';
import {
  IconPlus,
  IconSearch,
  IconEye,
  IconEdit,
  IconCopy,
  IconTrash,
} from '@/components/admin/Icons';

export default function AdminProductsPage() {
  const { t } = useLanguage();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [stockView, setStockView] = useState('all');
  const [sort, setSort] = useState('newest');
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    getProducts()
      .then(setProducts)
      .catch(() => toast.error(t('admin.products.loadError')))
      .finally(() => setLoading(false));
  }, []);

  const stockCounts = useMemo(
    () => ({
      all: products.length,
      out: products.filter((p) => Number(p.stock) <= 0).length,
      low: products.filter((p) => Number(p.stock) > 0 && Number(p.stock) <= 3).length,
      featured: products.filter((p) => p.featured).length,
    }),
    [products]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = products.filter((p) => {
      if (q && !`${p.name} ${p.brand}`.toLowerCase().includes(q)) return false;
      if (category !== 'all' && p.category !== category) return false;
      if (stockView === 'out' && Number(p.stock) > 0) return false;
      if (stockView === 'low' && !(Number(p.stock) > 0 && Number(p.stock) <= 3)) return false;
      if (stockView === 'featured' && !p.featured) return false;
      return true;
    });

    const sorters = {
      newest: (a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0),
      nameAsc: (a, b) => String(a.name).localeCompare(String(b.name)),
      priceHigh: (a, b) => Number(b.price) - Number(a.price),
      priceLow: (a, b) => Number(a.price) - Number(b.price),
      stockLow: (a, b) => Number(a.stock) - Number(b.stock),
    };
    return [...list].sort(sorters[sort]);
  }, [products, search, category, stockView, sort]);

  const inventoryValue = useMemo(
    () =>
      products.reduce(
        (sum, p) => sum + Number(p.price || 0) * Math.max(0, Number(p.stock || 0)),
        0
      ),
    [products]
  );

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
    <div className="space-y-5">
      <PageHeader
        title={t('admin.products.title')}
        count={products.length}
        subtitle={t('admin.products.subtitle', { value: formatPrice(inventoryValue) })}
        actions={
          <Link
            href="/admin/products/new"
            className="inline-flex items-center gap-1.5 rounded-lg bg-gold-500 px-3.5 py-2 text-sm font-semibold text-black transition hover:bg-gold-400"
          >
            <IconPlus className="h-4 w-4" />
            {t('admin.products.addProduct')}
          </Link>
        }
      />

      <TabBar
        tabs={[
          { value: 'all', label: t('admin.products.tabAll'), count: stockCounts.all },
          { value: 'low', label: t('admin.products.tabLow'), count: stockCounts.low },
          { value: 'out', label: t('admin.products.tabOut'), count: stockCounts.out },
          { value: 'featured', label: t('admin.products.tabFeatured'), count: stockCounts.featured },
        ]}
        value={stockView}
        onChange={setStockView}
      />

      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative sm:max-w-xs sm:flex-1">
          <IconSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <input
            type="search"
            className="input !pl-9"
            placeholder={t('admin.products.searchPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="input sm:max-w-xs"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          aria-label={t('admin.products.category')}
        >
          <option value="all">{t('admin.products.allCategories')}</option>
          {CATEGORIES.map((c) => (
            <option key={c.id} value={c.id}>{t(`categories.${c.id}.label`)}</option>
          ))}
        </select>
        <select
          className="input sm:max-w-[12rem]"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          aria-label={t('admin.products.sort')}
        >
          <option value="newest">{t('admin.products.sortNewest')}</option>
          <option value="nameAsc">{t('admin.products.sortName')}</option>
          <option value="priceHigh">{t('admin.products.sortPriceHigh')}</option>
          <option value="priceLow">{t('admin.products.sortPriceLow')}</option>
          <option value="stockLow">{t('admin.products.sortStockLow')}</option>
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
        <div className="overflow-x-auto rounded-2xl border border-neutral-200 bg-white shadow-[0_1px_2px_rgba(16,15,14,0.05)]">
          <table className="w-full min-w-[780px] text-left text-sm">
            <thead className="border-b border-neutral-200 bg-neutral-50 text-xs uppercase tracking-wider text-neutral-500">
              <tr>
                <th className="px-4 py-3">{t('admin.products.product')}</th>
                <th className="px-4 py-3">{t('admin.products.category')}</th>
                <th className="px-4 py-3 text-right">{t('admin.products.price')}</th>
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
                        <div className="grid h-11 w-11 place-items-center rounded-lg bg-neutral-100 text-neutral-400">
                          —
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="truncate font-medium">{product.name}</p>
                        <p className="truncate text-xs text-neutral-500">{product.brand}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-neutral-600">
                    {t(`categories.${product.category}.label`)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right font-semibold tabular-nums">
                    {formatPrice(product.price)}
                  </td>
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
                    <div className="flex flex-wrap gap-1">
                      {product.featured && (
                        <span className="rounded bg-gold/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-gold-700">
                          {t('admin.products.tagFeatured')}
                        </span>
                      )}
                      {product.bestseller && (
                        <span className="rounded bg-purple-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-purple-700">
                          {t('admin.products.tagBestseller')}
                        </span>
                      )}
                      {product.newArrival && (
                        <span className="rounded bg-blue-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-blue-700">
                          {t('admin.products.tagNew')}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1.5">
                      <LinkButton
                        icon={IconEye}
                        label={t('admin.products.view')}
                        href={`/products/${product.slug || product.id}`}
                        external
                      />
                      <LinkButton
                        icon={IconEdit}
                        tone="gold"
                        label={t('admin.products.edit')}
                        href={`/admin/products/${product.id}`}
                      />
                      <IconButton
                        icon={IconCopy}
                        label={t('admin.products.duplicate')}
                        onClick={() => handleDuplicate(product)}
                      />
                      <IconButton
                        icon={IconTrash}
                        tone="red"
                        label={t('admin.products.delete')}
                        disabled={deleting === product.id}
                        onClick={() => handleDelete(product)}
                      />
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
