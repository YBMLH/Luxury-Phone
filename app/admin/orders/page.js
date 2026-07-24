'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { getOrders, updateOrderStatus, deleteOrder } from '@/lib/db';
import { ORDER_STATUSES, STATUS_COLORS, wilayaLabel } from '@/lib/constants';
import { formatPrice, formatDate } from '@/lib/utils';
import { TableSkeleton } from '@/components/Skeletons';
import EmptyState from '@/components/EmptyState';
import { useLanguage } from '@/context/LanguageContext';

function OrderDetailModal({ order, onClose, t, locale }) {
  if (!order) return null;
  const rows = [
    [t('admin.orders.fields.orderNumber'), order.orderNumber],
    [t('admin.orders.fields.customer'), order.customerName],
    [t('admin.orders.fields.phone'), order.phone],
    [t('admin.orders.fields.secondaryPhone'), order.secondaryPhone || '—'],
    [t('admin.orders.fields.wilaya'), wilayaLabel(order.wilaya, locale)],
    [t('admin.orders.fields.commune'), order.commune],
    [t('admin.orders.fields.address'), order.address],
    [t('admin.orders.fields.product'), order.productName],
    [t('admin.orders.fields.price'), formatPrice(order.price)],
    [t('admin.orders.fields.quantity'), order.quantity || 1],
    [t('admin.orders.fields.deliveryFee'), order.deliveryFee != null ? formatPrice(order.deliveryFee) : '—'],
    [t('admin.orders.fields.total'), order.total ? formatPrice(order.total) : formatPrice(order.price)],
    [t('admin.orders.fields.color'), order.color || '—'],
    [t('admin.orders.fields.storage'), order.storage || '—'],
    [t('admin.orders.fields.ram'), order.ram || '—'],
    [t('admin.orders.fields.notes'), order.notes || '—'],
    [t('admin.orders.fields.date'), formatDate(order.createdAt)],
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl"
      >
        <div className="marble flex items-center justify-between rounded-t-2xl p-5">
          <div className="flex items-center gap-3">
            <h2 className="font-display text-lg font-bold text-white">{t('admin.orders.detailsTitle')}</h2>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_COLORS[order.status]}`}>
              {t(`statuses.${order.status}`)}
            </span>
          </div>
          <button onClick={onClose} className="text-2xl text-neutral-400 hover:text-white" aria-label="Close">×</button>
        </div>
        <div className="p-5">
          {order.productImage && (
            <img src={order.productImage} alt=""
              className="mb-4 h-24 w-24 rounded-xl border border-neutral-200 object-cover" />
          )}
          <dl className="divide-y divide-neutral-100">
            {rows.map(([label, value]) => (
              <div key={label} className="grid grid-cols-3 gap-3 py-2.5 text-sm">
                <dt className="font-medium text-neutral-500">{label}</dt>
                <dd className="col-span-2 break-words text-neutral-800">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function AdminOrdersPage() {
  const { t, locale } = useLanguage();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    getOrders()
      .then(setOrders)
      .catch(() => toast.error(t('admin.orders.loadError')))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return orders.filter((order) => {
      if (statusFilter !== 'all' && order.status !== statusFilter) return false;
      if (
        q &&
        !`${order.orderNumber} ${order.customerName} ${order.phone} ${order.productName} ${order.wilaya}`
          .toLowerCase()
          .includes(q)
      ) {
        return false;
      }
      return true;
    });
  }, [orders, search, statusFilter]);

  async function handleStatusChange(order, status) {
    const previous = order.status;
    setOrders((prev) =>
      prev.map((o) => (o.id === order.id ? { ...o, status } : o))
    );
    try {
      await updateOrderStatus(order, status);
      toast.success(t('admin.orders.statusUpdated', { orderNumber: order.orderNumber, status: t(`statuses.${status}`) }));
    } catch {
      setOrders((prev) =>
        prev.map((o) => (o.id === order.id ? { ...o, status: previous } : o))
      );
      toast.error(t('admin.orders.statusError'));
    }
  }

  // WhatsApp link for an Algerian number: replace the leading 0 with 213.
  function waLink(phone) {
    return `https://wa.me/${String(phone).replace(/^0/, '213')}`;
  }

  function exportCsv() {
    const header = [
      'Order #', 'Customer', 'Phone', 'Wilaya', 'Commune', 'Address',
      'Product', 'Variant', 'Qty', 'Total (DA)', 'Status', 'Date',
    ];
    const rows = filtered.map((o) => [
      o.orderNumber,
      o.customerName,
      o.phone,
      o.wilaya,
      o.commune,
      o.address,
      o.productName,
      [o.color, o.storage, o.ram].filter(Boolean).join(' / '),
      o.quantity || 1,
      o.total || o.price || 0,
      o.status,
      formatDate(o.createdAt),
    ]);
    const csv = [header, ...rows]
      .map((row) =>
        row.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(',')
      )
      .join('\n');
    // ﻿ (BOM) makes Excel open the file with correct accents.
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `orders-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  }

  async function handleDelete(order) {
    if (!confirm(t('admin.orders.confirmDelete', { orderNumber: order.orderNumber }))) return;
    try {
      await deleteOrder(order);
      setOrders((prev) => prev.filter((o) => o.id !== order.id));
      toast.success(t('admin.orders.deleteSuccess'));
    } catch {
      toast.error(t('admin.orders.deleteError'));
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-2xl font-bold">{t('admin.orders.title')} ({orders.length})</h1>
        {filtered.length > 0 && (
          <button onClick={exportCsv} className="btn-outline !px-5 !py-2 !text-xs">
            {t('admin.orders.exportCsv')} ({filtered.length})
          </button>
        )}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <input type="search" className="input sm:max-w-sm"
          placeholder={t('admin.orders.searchPlaceholder')}
          value={search} onChange={(e) => setSearch(e.target.value)} />
        <select className="input sm:max-w-xs" value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">{t('admin.orders.allStatuses')}</option>
          {ORDER_STATUSES.map((s) => (
            <option key={s} value={s}>{t(`statuses.${s}`)}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <TableSkeleton />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon="🧾"
          title={orders.length === 0 ? t('admin.orders.noOrdersTitle') : t('admin.orders.noMatchTitle')}
          message={orders.length === 0 ? t('admin.orders.noOrdersMessage') : t('admin.orders.noMatchMessage')}
        />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-neutral-200 bg-white shadow-card">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="border-b border-neutral-200 bg-neutral-50 text-xs uppercase tracking-wider text-neutral-500">
              <tr>
                <th className="px-4 py-3">{t('admin.orders.orderNumber')}</th>
                <th className="px-4 py-3">{t('admin.orders.customer')}</th>
                <th className="px-4 py-3">{t('admin.orders.wilaya')}</th>
                <th className="px-4 py-3">{t('admin.orders.product')}</th>
                <th className="px-4 py-3">{t('admin.orders.variant')}</th>
                <th className="px-4 py-3">{t('admin.orders.date')}</th>
                <th className="px-4 py-3">{t('admin.orders.status')}</th>
                <th className="px-4 py-3 text-right">{t('admin.orders.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filtered.map((order) => (
                <tr key={order.id} className="hover:bg-neutral-50">
                  <td className="px-4 py-3 font-mono text-xs font-semibold">
                    {order.orderNumber}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium">{order.customerName}</p>
                    <div className="mt-0.5 flex items-center gap-2">
                      <span className="text-xs text-neutral-500">{order.phone}</span>
                      <a href={`tel:${order.phone}`} title="Call customer"
                        className="rounded bg-neutral-100 px-1.5 py-0.5 text-xs hover:bg-neutral-200">
                        📞
                      </a>
                      <a href={waLink(order.phone)} target="_blank" rel="noopener noreferrer"
                        title="WhatsApp customer"
                        className="rounded bg-green-100 px-1.5 py-0.5 text-xs hover:bg-green-200">
                        💬
                      </a>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-neutral-600">{wilayaLabel(order.wilaya, locale)}</td>
                  <td className="max-w-[180px] px-4 py-3">
                    <p className="truncate">{order.productName}</p>
                    {(order.quantity || 1) > 1 && (
                      <p className="text-xs font-semibold text-gold-700">× {order.quantity}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-neutral-500">
                    {[order.color, order.storage, order.ram].filter(Boolean).join(' · ') || '—'}
                  </td>
                  <td className="px-4 py-3 text-xs text-neutral-500">
                    {formatDate(order.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order, e.target.value)}
                      className={`rounded-full border-0 px-3 py-1.5 text-xs font-semibold outline-none ${STATUS_COLORS[order.status]}`}
                    >
                      {ORDER_STATUSES.map((s) => (
                        <option key={s} value={s}>{t(`statuses.${s}`)}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => setSelected(order)}
                        className="rounded-lg border border-neutral-300 px-3 py-1.5 text-xs hover:bg-neutral-100">
                        {t('admin.orders.view')}
                      </button>
                      <button onClick={() => handleDelete(order)}
                        className="rounded-lg border border-red-200 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50">
                        {t('admin.orders.delete')}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <AnimatePresence>
        {selected && <OrderDetailModal order={selected} onClose={() => setSelected(null)} t={t} locale={locale} />}
      </AnimatePresence>
    </div>
  );
}
