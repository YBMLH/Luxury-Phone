'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { getOrders, updateOrderStatus, deleteOrder } from '@/lib/db';
import { ORDER_STATUSES, STATUS_COLORS, wilayaLabel } from '@/lib/constants';
import { formatPrice, formatDate } from '@/lib/utils';
import { TableSkeleton } from '@/components/Skeletons';
import EmptyState from '@/components/EmptyState';
import Pagination from '@/components/admin/Pagination';
import { useLanguage } from '@/context/LanguageContext';
import { useOrderAlerts } from '@/context/OrderAlertContext';
import { PageHeader, TabBar, IconButton } from '@/components/admin/ui';
import {
  IconDownload,
  IconEye,
  IconTrash,
  IconPhone,
  IconWhatsApp,
  IconSearch,
} from '@/components/admin/Icons';

const PAGE_SIZE = 25;

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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-white/50 bg-white/80 shadow-2xl backdrop-blur-2xl backdrop-saturate-150"
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
          <div className="mb-4 flex gap-2">
            <a href={`tel:${order.phone}`}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-neutral-300 bg-white py-2 text-sm font-semibold text-neutral-700 hover:bg-neutral-100">
              <IconPhone className="h-4 w-4" /> {t('admin.orders.call')}
            </a>
            <a href={`https://wa.me/${String(order.phone).replace(/^0/, '213')}`}
              target="_blank" rel="noopener noreferrer"
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-green-300 bg-green-50 py-2 text-sm font-semibold text-green-800 hover:bg-green-100">
              <IconWhatsApp className="h-4 w-4" /> WhatsApp
            </a>
          </div>
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
  const { orders: liveOrders } = useOrderAlerts();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [rangeDays, setRangeDays] = useState(0);
  const [sort, setSort] = useState('newest');
  const [selected, setSelected] = useState(null);
  const [checked, setChecked] = useState(() => new Set());
  const [page, setPage] = useState(1);

  useEffect(() => {
    getOrders()
      .then(setOrders)
      .catch(() => toast.error(t('admin.orders.loadError')))
      .finally(() => setLoading(false));
  }, []);

  // Fold in anything the live listener has seen since the page loaded, so a
  // new order shows up in the table without a manual refresh.
  useEffect(() => {
    if (!liveOrders.length) return;
    setOrders((prev) => {
      const byId = new Map(prev.map((o) => [o.id, o]));
      for (const o of liveOrders) byId.set(o.id, o);
      return [...byId.values()];
    });
  }, [liveOrders]);

  const statusCounts = useMemo(() => {
    const counts = { all: orders.length };
    for (const status of ORDER_STATUSES) counts[status] = 0;
    for (const order of orders) counts[order.status] = (counts[order.status] || 0) + 1;
    return counts;
  }, [orders]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const cutoff = rangeDays ? Date.now() - rangeDays * 24 * 60 * 60 * 1000 : 0;

    const list = orders.filter((order) => {
      if (statusFilter !== 'all' && order.status !== statusFilter) return false;
      if (cutoff) {
        const d = order.createdAt?.toDate?.();
        if (!d || d.getTime() < cutoff) return false;
      }
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

    const value = (o) => Number(o.total) || Number(o.price) || 0;
    const time = (o) => o.createdAt?.seconds || 0;
    const sorters = {
      newest: (a, b) => time(b) - time(a),
      oldest: (a, b) => time(a) - time(b),
      highest: (a, b) => value(b) - value(a),
      lowest: (a, b) => value(a) - value(b),
    };
    return [...list].sort(sorters[sort]);
  }, [orders, search, statusFilter, rangeDays, sort]);

  useEffect(() => setPage(1), [search, statusFilter, rangeDays, sort]);
  useEffect(() => setChecked(new Set()), [search, statusFilter, rangeDays, sort]);

  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const allOnPageChecked = pageItems.length > 0 && pageItems.every((o) => checked.has(o.id));

  function toggleRow(id) {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function togglePage() {
    setChecked((prev) => {
      const next = new Set(prev);
      if (allOnPageChecked) for (const o of pageItems) next.delete(o.id);
      else for (const o of pageItems) next.add(o.id);
      return next;
    });
  }

  async function handleStatusChange(order, status) {
    const previous = order.status;
    setOrders((prev) => prev.map((o) => (o.id === order.id ? { ...o, status } : o)));
    try {
      await updateOrderStatus(order, status);
      toast.success(t('admin.orders.statusUpdated', { orderNumber: order.orderNumber, status: t(`statuses.${status}`) }));
    } catch {
      setOrders((prev) => prev.map((o) => (o.id === order.id ? { ...o, status: previous } : o)));
      toast.error(t('admin.orders.statusError'));
    }
  }

  // Marking a whole delivery run at once — the single most repetitive job in
  // the dashboard. Failures are counted rather than swallowed.
  async function bulkStatus(status) {
    const targets = orders.filter((o) => checked.has(o.id) && o.status !== status);
    if (targets.length === 0) return;
    const previous = new Map(targets.map((o) => [o.id, o.status]));
    setOrders((prev) => prev.map((o) => (checked.has(o.id) ? { ...o, status } : o)));

    const results = await Promise.allSettled(
      targets.map((order) => updateOrderStatus(order, status))
    );
    const failed = results.filter((r) => r.status === 'rejected').length;

    if (failed) {
      setOrders((prev) =>
        prev.map((o) => (previous.has(o.id) ? { ...o, status: previous.get(o.id) } : o))
      );
      toast.error(t('admin.orders.bulkError', { count: failed }));
    } else {
      toast.success(
        t('admin.orders.bulkSuccess', { count: targets.length, status: t(`statuses.${status}`) })
      );
      setChecked(new Set());
    }
  }

  // WhatsApp link for an Algerian number: replace the leading 0 with 213.
  function waLink(phone) {
    return `https://wa.me/${String(phone).replace(/^0/, '213')}`;
  }

  // Neutralizes CSV/formula injection: a customer-entered name/address/note
  // starting with =, +, -, @ (or tab/CR) would run as a formula when the
  // exported file is opened in Excel/Sheets, so prefix it with a plain
  // apostrophe to force it back to text.
  function csvSafe(value) {
    const str = String(value ?? '');
    return /^[=+\-@\t\r]/.test(str) ? `'${str}` : str;
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
        row.map((cell) => `"${csvSafe(cell).replace(/"/g, '""')}"`).join(',')
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

  const revenueShown = filtered
    .filter((o) => o.status !== 'Cancelled')
    .reduce((sum, o) => sum + (Number(o.total) || Number(o.price) || 0), 0);

  return (
    <div className="space-y-5">
      <PageHeader
        title={t('admin.orders.title')}
        count={orders.length}
        subtitle={t('admin.orders.subtitle', {
          count: filtered.length,
          total: formatPrice(revenueShown),
        })}
        actions={
          filtered.length > 0 && (
            <button
              onClick={exportCsv}
              className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-300 bg-white px-3.5 py-2 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-100"
            >
              <IconDownload className="h-4 w-4" />
              {t('admin.orders.exportCsv')} ({filtered.length})
            </button>
          )
        }
      />

      <TabBar
        tabs={[
          { value: 'all', label: t('admin.orders.allStatuses'), count: statusCounts.all },
          ...ORDER_STATUSES.map((s) => ({
            value: s,
            label: t(`statuses.${s}`),
            count: statusCounts[s],
          })),
        ]}
        value={statusFilter}
        onChange={setStatusFilter}
      />

      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative sm:max-w-sm sm:flex-1">
          <IconSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <input
            type="search"
            className="input !pl-9"
            placeholder={t('admin.orders.searchPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="input sm:max-w-[11rem]"
          value={rangeDays}
          onChange={(e) => setRangeDays(Number(e.target.value))}
          aria-label={t('admin.orders.dateRange')}
        >
          <option value={0}>{t('admin.orders.anyDate')}</option>
          <option value={1}>{t('admin.orders.today')}</option>
          <option value={7}>{t('admin.dashboard.range7')}</option>
          <option value={30}>{t('admin.dashboard.range30')}</option>
        </select>
        <select
          className="input sm:max-w-[12rem]"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          aria-label={t('admin.orders.sort')}
        >
          <option value="newest">{t('admin.orders.sortNewest')}</option>
          <option value="oldest">{t('admin.orders.sortOldest')}</option>
          <option value="highest">{t('admin.orders.sortHighest')}</option>
          <option value="lowest">{t('admin.orders.sortLowest')}</option>
        </select>
      </div>

      {checked.size > 0 && (
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-neutral-900/10 bg-neutral-900 px-4 py-2.5 text-sm text-white">
          <span className="font-semibold">
            {t('admin.orders.selected', { count: checked.size })}
          </span>
          <span className="flex-1" />
          {['Confirmed', 'Shipped', 'Delivered'].map((s) => (
            <button
              key={s}
              onClick={() => bulkStatus(s)}
              className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-semibold transition hover:bg-white/20"
            >
              {t(`statuses.${s}`)}
            </button>
          ))}
          <button
            onClick={() => setChecked(new Set())}
            className="rounded-lg px-3 py-1.5 text-xs font-semibold text-neutral-300 hover:text-white"
          >
            {t('admin.orders.clearSelection')}
          </button>
        </div>
      )}

      {loading ? (
        <TableSkeleton />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon="🧾"
          title={orders.length === 0 ? t('admin.orders.noOrdersTitle') : t('admin.orders.noMatchTitle')}
          message={orders.length === 0 ? t('admin.orders.noOrdersMessage') : t('admin.orders.noMatchMessage')}
        />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-neutral-200 bg-white shadow-[0_1px_2px_rgba(16,15,14,0.05)]">
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead className="border-b border-neutral-200 bg-neutral-50 text-xs uppercase tracking-wider text-neutral-500">
              <tr>
                <th className="w-10 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={allOnPageChecked}
                    onChange={togglePage}
                    aria-label={t('admin.orders.selectAll')}
                    className="h-4 w-4 accent-gold-600"
                  />
                </th>
                <th className="px-4 py-3">{t('admin.orders.orderNumber')}</th>
                <th className="px-4 py-3">{t('admin.orders.customer')}</th>
                <th className="px-4 py-3">{t('admin.orders.wilaya')}</th>
                <th className="px-4 py-3">{t('admin.orders.product')}</th>
                <th className="px-4 py-3 text-right">{t('admin.orders.fields.total')}</th>
                <th className="px-4 py-3">{t('admin.orders.date')}</th>
                <th className="px-4 py-3">{t('admin.orders.status')}</th>
                <th className="px-4 py-3 text-right">{t('admin.orders.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {pageItems.map((order) => (
                <tr
                  key={order.id}
                  className={checked.has(order.id) ? 'bg-gold/5' : 'hover:bg-neutral-50'}
                >
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={checked.has(order.id)}
                      onChange={() => toggleRow(order.id)}
                      aria-label={order.orderNumber}
                      className="h-4 w-4 accent-gold-600"
                    />
                  </td>
                  <td className="px-4 py-3 font-mono text-xs font-semibold">
                    {order.orderNumber}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium">{order.customerName}</p>
                    <div className="mt-0.5 flex items-center gap-1.5">
                      <span className="text-xs text-neutral-500">{order.phone}</span>
                      <a href={`tel:${order.phone}`} title={t('admin.orders.call')}
                        className="grid h-6 w-6 place-items-center rounded border border-neutral-200 text-neutral-500 hover:bg-neutral-100">
                        <IconPhone className="h-3.5 w-3.5" />
                      </a>
                      <a href={waLink(order.phone)} target="_blank" rel="noopener noreferrer"
                        title="WhatsApp"
                        className="grid h-6 w-6 place-items-center rounded border border-green-200 text-green-700 hover:bg-green-50">
                        <IconWhatsApp className="h-3.5 w-3.5" />
                      </a>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-neutral-600">{wilayaLabel(order.wilaya, locale)}</td>
                  <td className="max-w-[180px] px-4 py-3">
                    <p className="truncate">{order.productName}</p>
                    <p className="truncate text-xs text-neutral-400">
                      {[order.color, order.storage, order.ram].filter(Boolean).join(' · ') || '—'}
                      {(order.quantity || 1) > 1 && (
                        <span className="ml-1 font-semibold text-gold-700">× {order.quantity}</span>
                      )}
                    </p>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right font-semibold tabular-nums">
                    {formatPrice(Number(order.total) || Number(order.price) || 0)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-xs text-neutral-500">
                    {formatDate(order.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order, e.target.value)}
                      aria-label={t('admin.orders.status')}
                      className={`rounded-full border-0 px-3 py-1.5 text-xs font-semibold outline-none ${STATUS_COLORS[order.status]}`}
                    >
                      {ORDER_STATUSES.map((s) => (
                        <option key={s} value={s}>{t(`statuses.${s}`)}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1.5">
                      <IconButton
                        icon={IconEye}
                        label={t('admin.orders.view')}
                        onClick={() => setSelected(order)}
                      />
                      <IconButton
                        icon={IconTrash}
                        tone="red"
                        label={t('admin.orders.delete')}
                        onClick={() => handleDelete(order)}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination page={page} pageSize={PAGE_SIZE} total={filtered.length} onPageChange={setPage} />
        </div>
      )}

      <AnimatePresence>
        {selected && <OrderDetailModal order={selected} onClose={() => setSelected(null)} t={t} locale={locale} />}
      </AnimatePresence>
    </div>
  );
}
