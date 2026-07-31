'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { getCustomers, getOrdersByPhone, setPhoneBlocked } from '@/lib/db';
import { STATUS_COLORS, wilayaLabel } from '@/lib/constants';
import { formatPrice, formatDate } from '@/lib/utils';
import { TableSkeleton } from '@/components/Skeletons';
import EmptyState from '@/components/EmptyState';
import Pagination from '@/components/admin/Pagination';
import { useLanguage } from '@/context/LanguageContext';
import { PageHeader, TabBar, IconButton } from '@/components/admin/ui';
import { IconEye, IconBan, IconCheck, IconSearch } from '@/components/admin/Icons';

// Cash on delivery makes a repeat no-show expensive, so the ratio of parcels
// that actually got paid for is the number worth surfacing. Anyone with two
// or more refusals and a majority of them failing is flagged.
function reliabilityOf(customer) {
  const delivered = Number(customer.deliveredCount) || 0;
  const cancelled = Number(customer.cancelledCount) || 0;
  const settled = delivered + cancelled;
  if (customer.blocked) return { key: 'blocked', tone: 'red', delivered, cancelled, settled };
  if (settled === 0) return { key: 'new', tone: 'neutral', delivered, cancelled, settled };
  if (cancelled >= 2 && cancelled > delivered) {
    return { key: 'risky', tone: 'red', delivered, cancelled, settled };
  }
  if (cancelled >= 1 && delivered === 0) {
    return { key: 'watch', tone: 'amber', delivered, cancelled, settled };
  }
  return { key: 'good', tone: 'green', delivered, cancelled, settled };
}

const PAGE_SIZE = 25;

function HistoryModal({ customer, onClose, t, locale }) {
  const [orders, setOrders] = useState(null);

  useEffect(() => {
    getOrdersByPhone(customer.phone)
      .then(setOrders)
      .catch(() => setOrders([]));
  }, [customer.phone]);

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
          <div>
            <h2 className="font-display text-lg font-bold text-white">
              {customer.fullName}
            </h2>
            <p className="text-xs text-neutral-400">
              {customer.phone} — {wilayaLabel(customer.wilaya, locale)}
            </p>
          </div>
          <button onClick={onClose} className="text-2xl text-neutral-400 hover:text-white" aria-label="Close">×</button>
        </div>
        <div className="p-5">
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-neutral-500">
            {t('admin.customers.orderHistory')}
          </h3>
          {orders === null ? (
            <TableSkeleton rows={3} />
          ) : orders.length === 0 ? (
            <p className="text-sm text-neutral-500">{t('admin.customers.noOrders')}</p>
          ) : (
            <ul className="space-y-3">
              {orders.map((order) => (
                <li key={order.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-neutral-200 p-3 text-sm">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{order.productName}</p>
                    <p className="text-xs text-neutral-500">
                      {order.orderNumber} — {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="font-semibold">{formatPrice(order.price)}</p>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${STATUS_COLORS[order.status]}`}>
                      {t(`statuses.${order.status}`)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function AdminCustomersPage() {
  const { t, locale } = useLanguage();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [page, setPage] = useState(1);
  const [view, setView] = useState('all');
  const [busy, setBusy] = useState(null);

  useEffect(() => {
    getCustomers()
      .then(setCustomers)
      .catch(() => toast.error(t('admin.customers.loadError')))
      .finally(() => setLoading(false));
  }, []);

  const counts = useMemo(() => {
    const out = { all: customers.length, risky: 0, blocked: 0, good: 0 };
    for (const c of customers) {
      const r = reliabilityOf(c);
      if (r.key === 'blocked') out.blocked += 1;
      else if (r.key === 'risky' || r.key === 'watch') out.risky += 1;
      else if (r.key === 'good') out.good += 1;
    }
    return out;
  }, [customers]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return customers.filter((c) => {
      if (q && !`${c.fullName} ${c.phone} ${c.wilaya}`.toLowerCase().includes(q)) return false;
      const r = reliabilityOf(c);
      if (view === 'risky' && r.key !== 'risky' && r.key !== 'watch') return false;
      if (view === 'blocked' && r.key !== 'blocked') return false;
      if (view === 'good' && r.key !== 'good') return false;
      return true;
    });
  }, [customers, search, view]);

  async function toggleBlock(customer) {
    const blocking = !customer.blocked;
    if (blocking && !confirm(t('admin.customers.confirmBlock', { name: customer.fullName }))) {
      return;
    }
    setBusy(customer.id);
    try {
      await setPhoneBlocked(customer.phone, blocking);
      setCustomers((prev) =>
        prev.map((c) => (c.id === customer.id ? { ...c, blocked: blocking } : c))
      );
      toast.success(blocking ? t('admin.customers.blocked') : t('admin.customers.unblocked'));
    } catch {
      toast.error(t('admin.customers.blockError'));
    } finally {
      setBusy(null);
    }
  }

  useEffect(() => setPage(1), [search, view]);
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('admin.customers.title')}
        count={customers.length}
        subtitle={t('admin.customers.subtitle')}
      />

      <TabBar
        tabs={[
          { value: 'all', label: t('admin.customers.tabAll'), count: counts.all },
          { value: 'good', label: t('admin.customers.tabGood'), count: counts.good },
          { value: 'risky', label: t('admin.customers.tabRisky'), count: counts.risky },
          { value: 'blocked', label: t('admin.customers.tabBlocked'), count: counts.blocked },
        ]}
        value={view}
        onChange={setView}
      />

      <div className="relative sm:max-w-sm">
        <IconSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
        <input type="search" className="input !pl-9"
          placeholder={t('admin.customers.searchPlaceholder')}
          value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {loading ? (
        <TableSkeleton />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon="👥"
          title={customers.length === 0 ? t('admin.customers.noCustomersTitle') : t('admin.customers.noMatchTitle')}
          message={t('admin.customers.noCustomersMessage')}
        />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-neutral-200 bg-white shadow-card">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-neutral-200 bg-neutral-50 text-xs uppercase tracking-wider text-neutral-500">
              <tr>
                <th className="px-4 py-3">{t('admin.customers.name')}</th>
                <th className="px-4 py-3">{t('admin.customers.phone')}</th>
                <th className="px-4 py-3">{t('admin.customers.wilaya')}</th>
                <th className="px-4 py-3">{t('admin.customers.orders')}</th>
                <th className="px-4 py-3">{t('admin.customers.reliability')}</th>
                <th className="px-4 py-3">{t('admin.customers.lastOrder')}</th>
                <th className="px-4 py-3 text-right">{t('admin.customers.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {pageItems.map((customer) => {
                const reliability = reliabilityOf(customer);
                const toneClass = {
                  green: 'bg-green-100 text-green-700',
                  amber: 'bg-amber-100 text-amber-800',
                  red: 'bg-red-100 text-red-700',
                  neutral: 'bg-neutral-100 text-neutral-600',
                }[reliability.tone];
                return (
                <tr key={customer.id} className={customer.blocked ? 'bg-red-50/60' : 'hover:bg-neutral-50'}>
                  <td className="px-4 py-3 font-medium">{customer.fullName}</td>
                  <td className="px-4 py-3 text-neutral-600">{customer.phone}</td>
                  <td className="px-4 py-3 text-neutral-600">{wilayaLabel(customer.wilaya, locale)}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-gold/15 px-2.5 py-0.5 text-xs font-semibold text-gold-700">
                      {customer.ordersCount || 0}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${toneClass}`}>
                      {t(`admin.customers.reliability_${reliability.key}`)}
                    </span>
                    {reliability.settled > 0 && (
                      <p className="mt-0.5 text-[11px] tabular-nums text-neutral-400">
                        {t('admin.customers.deliveredOf', {
                          delivered: reliability.delivered,
                          total: reliability.settled,
                        })}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-neutral-500">
                    {formatDate(customer.lastOrderAt)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1.5">
                      <IconButton
                        icon={IconEye}
                        label={t('admin.customers.orderHistory')}
                        onClick={() => setSelected(customer)}
                      />
                      <IconButton
                        icon={customer.blocked ? IconCheck : IconBan}
                        tone={customer.blocked ? 'green' : 'red'}
                        label={customer.blocked ? t('admin.customers.unblock') : t('admin.customers.block')}
                        disabled={busy === customer.id}
                        onClick={() => toggleBlock(customer)}
                      />
                    </div>
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
          <Pagination page={page} pageSize={PAGE_SIZE} total={filtered.length} onPageChange={setPage} />
        </div>
      )}

      <AnimatePresence>
        {selected && <HistoryModal customer={selected} onClose={() => setSelected(null)} t={t} locale={locale} />}
      </AnimatePresence>
    </div>
  );
}
