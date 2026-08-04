'use client';

// The dashboard. Everything here is computed in the browser from the orders
// and products already loaded — no analytics service, no extra cost, and it
// keeps working when the shop's connection is poor.
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { getOrders, getProducts, getCustomers, getSettings, updateOrderStatus } from '@/lib/db';
import { TableSkeleton } from '@/components/Skeletons';
import { useLanguage } from '@/context/LanguageContext';
import { useOrderAlerts } from '@/context/OrderAlertContext';
import { useAuth } from '@/context/AuthContext';
import RestoreBackup from '@/components/admin/RestoreBackup';
import { ORDER_STATUSES, STATUS_COLORS, wilayaLabel } from '@/lib/constants';
import { formatPrice } from '@/lib/utils';
import { PageHeader, Card, StatCard, TabBar } from '@/components/admin/ui';
import {
  IconCash,
  IconReceipt,
  IconClock,
  IconBox,
  IconAlert,
  IconDownload,
  IconPlus,
  IconStore,
  IconUsers,
  IconSettings,
  IconArrowRight,
  IconTrendUp,
} from '@/components/admin/Icons';

// Solid fills for the pipeline bar. STATUS_COLORS is a pill treatment (pale
// background + dark text) and reads as washed-out stripes at this size.
const PIPELINE_COLORS = {
  Pending: 'bg-amber-400',
  Confirmed: 'bg-blue-500',
  Processing: 'bg-purple-500',
  Shipped: 'bg-indigo-500',
  Delivered: 'bg-green-500',
  Cancelled: 'bg-red-400',
};

const RANGES = [
  { value: 7, key: 'range7' },
  { value: 30, key: 'range30' },
  { value: 90, key: 'range90' },
  { value: 0, key: 'rangeAll' },
];

function orderDate(order) {
  return order.createdAt?.toDate?.() || null;
}

function orderValue(order) {
  return Number(order.total) || Number(order.price) * (Number(order.quantity) || 1) || 0;
}

// Revenue only counts orders that weren't cancelled — money that was actually
// (or is still going to be) collected.
function isEarning(order) {
  return order.status !== 'Cancelled';
}

function percentChange(current, previous) {
  if (!previous) return current ? 100 : null;
  return Math.round(((current - previous) / previous) * 100);
}

/* ------------------------------- Mini chart -------------------------------- */

// Six months of activity. Bars are orders; the number above each is whichever
// metric is selected, so one chart answers both "how busy" and "how much".
function ActivityChart({ months, metric, t }) {
  const values = months.map((m) => (metric === 'revenue' ? m.revenue : m.count));
  const max = Math.max(1, ...values);

  return (
    <div>
      <div className="flex h-32 items-end gap-2 sm:gap-3">
        {months.map((m, i) => (
          <div key={m.key} className="group flex flex-1 flex-col items-center justify-end gap-1.5">
            <span className="text-[11px] font-semibold tabular-nums text-neutral-700">
              {metric === 'revenue'
                ? values[i] >= 1000
                  ? `${Math.round(values[i] / 1000)}k`
                  : values[i]
                : values[i]}
            </span>
            <div
              className="w-full max-w-[52px] rounded-t-md bg-gold-500 transition group-hover:bg-gold-400"
              style={{ height: `${Math.max(3, (values[i] / max) * 96)}px` }}
              title={`${m.label}: ${
                metric === 'revenue' ? formatPrice(m.revenue) : `${m.count} ${t('admin.dashboard.orders')}`
              }`}
            />
          </div>
        ))}
      </div>
      <div className="mt-2 flex gap-2 border-t border-neutral-100 pt-2 sm:gap-3">
        {months.map((m) => (
          <span key={m.key} className="flex-1 text-center text-[11px] text-neutral-500">
            {m.label}
          </span>
        ))}
      </div>
    </div>
  );
}

/* -------------------------------- Dashboard -------------------------------- */

export default function AdminDashboard() {
  const { t, locale } = useLanguage();
  const { orders: liveOrders } = useOrderAlerts();
  const { isOwner } = useAuth();
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rangeDays, setRangeDays] = useState(30);
  const [metric, setMetric] = useState('orders');

  useEffect(() => {
    Promise.all([getOrders(), getProducts()])
      .then(([o, p]) => {
        setOrders(o);
        setProducts(p);
      })
      .catch(() => toast.error(t('admin.dashboard.loadError')))
      .finally(() => setLoading(false));
  }, []);

  // A new order arriving through the live listener should appear here without
  // a refresh. The listener only carries the newest slice, so it's merged in
  // rather than swapped for the full history.
  useEffect(() => {
    if (!liveOrders.length) return;
    setOrders((prev) => {
      const byId = new Map(prev.map((o) => [o.id, o]));
      for (const o of liveOrders) byId.set(o.id, o);
      return [...byId.values()].sort(
        (a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)
      );
    });
  }, [liveOrders]);

  // productId -> cost price, so an order can be costed without another read.
  const costById = useMemo(() => {
    const map = new Map();
    for (const product of products) {
      const cost = Number(product.costPrice) || 0;
      if (cost > 0) map.set(product.id, cost);
    }
    return map;
  }, [products]);

  const stats = useMemo(() => {
    const now = Date.now();
    const windowMs = rangeDays * 24 * 60 * 60 * 1000;

    const inRange = rangeDays
      ? orders.filter((o) => {
          const d = orderDate(o);
          return d && now - d.getTime() <= windowMs;
        })
      : orders;

    // Same length of time, immediately before the current window — that's
    // what the little green/red percentages compare against.
    const previous = rangeDays
      ? orders.filter((o) => {
          const d = orderDate(o);
          if (!d) return false;
          const age = now - d.getTime();
          return age > windowMs && age <= windowMs * 2;
        })
      : [];

    const revenue = inRange.filter(isEarning).reduce((sum, o) => sum + orderValue(o), 0);
    const prevRevenue = previous.filter(isEarning).reduce((sum, o) => sum + orderValue(o), 0);
    const earning = inRange.filter(isEarning);

    // Profit is only meaningful for orders whose product has a cost price on
    // it, so the covered share is reported alongside the figure rather than
    // quietly pretending the uncosted ones were free.
    let profit = 0;
    let costedOrders = 0;
    for (const order of earning) {
      const cost = costById.get(order.productId);
      if (!cost) continue;
      costedOrders += 1;
      const quantity = Math.max(1, Number(order.quantity) || 1);
      profit += (Number(order.price) || 0) * quantity - cost * quantity;
    }

    const byWilaya = {};
    const byProduct = {};
    const byStatus = {};
    for (const order of inRange) {
      byWilaya[order.wilaya] = (byWilaya[order.wilaya] || 0) + 1;
      byProduct[order.productName] = (byProduct[order.productName] || 0) + 1;
      byStatus[order.status] = (byStatus[order.status] || 0) + 1;
    }

    // For cash on delivery the number that matters is not how many orders
    // came in, but how many of the settled ones actually got paid for.
    const deliveredCount = byStatus.Delivered || 0;
    const cancelledCount = byStatus.Cancelled || 0;
    const settled = deliveredCount + cancelledCount;

    // Money already promised but not yet in hand: everything still moving.
    const toCollect = inRange
      .filter((o) => o.status !== 'Delivered' && o.status !== 'Cancelled')
      .reduce((sum, o) => sum + orderValue(o), 0);

    // Six calendar months, always — the trend is more useful than the window.
    const months = [];
    const today = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      months.push({
        key: `${d.getFullYear()}-${d.getMonth()}`,
        label: d.toLocaleDateString(locale === 'ar' ? 'ar-DZ' : 'en-GB', { month: 'short' }),
        count: 0,
        revenue: 0,
      });
    }
    for (const order of orders) {
      const date = orderDate(order);
      if (!date) continue;
      const month = months.find((m) => m.key === `${date.getFullYear()}-${date.getMonth()}`);
      if (!month) continue;
      month.count += 1;
      if (isEarning(order)) month.revenue += orderValue(order);
    }

    return {
      inRange,
      revenue,
      revenueDelta: percentChange(revenue, prevRevenue),
      countDelta: percentChange(inRange.length, previous.length),
      avgOrder: earning.length ? Math.round(revenue / earning.length) : 0,
      profit,
      costedOrders,
      earningCount: earning.length,
      pending: orders.filter((o) => o.status === 'Pending').length,
      delivered: deliveredCount,
      byStatus,
      successRate: settled ? Math.round((deliveredCount / settled) * 100) : null,
      toCollect,
      topWilayas: Object.entries(byWilaya).sort((a, b) => b[1] - a[1]).slice(0, 5),
      topProducts: Object.entries(byProduct).sort((a, b) => b[1] - a[1]).slice(0, 5),
      months,
    };
  }, [orders, rangeDays, locale, costById]);

  const outOfStock = products.filter((p) => Number(p.stock) <= 0);
  const lowStock = products.filter((p) => Number(p.stock) > 0 && Number(p.stock) <= 3);

  // Orders left sitting on Pending for more than two days — the thing most
  // likely to cost a sale, and easy to miss in a long list.
  const stalePending = useMemo(() => {
    const cutoff = Date.now() - 2 * 24 * 60 * 60 * 1000;
    return orders.filter((o) => {
      const d = orderDate(o);
      return o.status === 'Pending' && d && d.getTime() < cutoff;
    });
  }, [orders]);

  const recent = orders.slice(0, 5);

  async function handleStatusChange(order, status) {
    const previous = order.status;
    setOrders((prev) => prev.map((o) => (o.id === order.id ? { ...o, status } : o)));
    try {
      await updateOrderStatus(order, status);
      toast.success(
        t('admin.orders.statusUpdated', {
          orderNumber: order.orderNumber,
          status: t(`statuses.${status}`),
        })
      );
    } catch {
      setOrders((prev) => prev.map((o) => (o.id === order.id ? { ...o, status: previous } : o)));
      toast.error(t('admin.orders.statusError'));
    }
  }

  // One-click safety net: everything important in a single JSON file.
  async function downloadBackup() {
    try {
      const [customers, settings] = await Promise.all([
        getCustomers().catch(() => []),
        getSettings().catch(() => null),
      ]);
      const backup = {
        exportedAt: new Date().toISOString(),
        products,
        orders,
        customers,
        settings,
      };
      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `luxuryphone24-backup-${new Date().toISOString().slice(0, 10)}.json`;
      link.click();
      URL.revokeObjectURL(link.href);
      toast.success(t('admin.dashboard.backupSuccess'));
    } catch {
      toast.error(t('admin.dashboard.backupError'));
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title={t('admin.dashboard.title')} />
        <TableSkeleton rows={5} />
      </div>
    );
  }

  const alerts = [
    outOfStock.length && {
      tone: 'red',
      href: '/admin/products',
      text: t('admin.dashboard.outOfStockWarning', {
        count: outOfStock.length,
        names: outOfStock.slice(0, 2).map((p) => p.name).join(', '),
      }),
    },
    lowStock.length && {
      tone: 'amber',
      href: '/admin/products',
      text: t('admin.dashboard.lowStockWarning', {
        count: lowStock.length,
        names:
          lowStock.slice(0, 3).map((p) => p.name).join(', ') + (lowStock.length > 3 ? '…' : ''),
      }),
    },
    stalePending.length && {
      tone: 'amber',
      href: '/admin/orders',
      text: t('admin.dashboard.stalePendingWarning', { count: stalePending.length }),
    },
  ].filter(Boolean);

  const alertTones = {
    red: 'border-red-300/50 bg-red-50/70 text-red-900 hover:bg-red-100/80',
    amber: 'border-amber-300/50 bg-amber-50/70 text-amber-900 hover:bg-amber-100/80',
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title={t('admin.dashboard.title')}
        subtitle={t('admin.dashboard.subtitle')}
        actions={
          isOwner && (
            <button
              onClick={downloadBackup}
              className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-300 bg-white px-3.5 py-2 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-100"
            >
              <IconDownload className="h-4 w-4" />
              {t('admin.dashboard.downloadBackup')}
            </button>
          )
        }
      />

      {/* Alerts sit on one wrapping line rather than one banner each — three
          stacked banners pushed the actual dashboard below the fold. */}
      {alerts.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {alerts.map((alert) => (
            <Link
              key={alert.text}
              href={alert.href}
              className={`inline-flex max-w-full items-center gap-2 rounded-full border px-3.5 py-2 text-[13px] backdrop-blur-xl transition ${alertTones[alert.tone]}`}
            >
              <IconAlert className="h-4 w-4 shrink-0" />
              <span className="truncate">{alert.text}</span>
              <IconArrowRight className="h-3.5 w-3.5 shrink-0 opacity-60" />
            </Link>
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <TabBar
          tabs={RANGES.map((r) => ({ value: r.value, label: t(`admin.dashboard.${r.key}`) }))}
          value={rangeDays}
          onChange={setRangeDays}
        />

        {/* Quick actions as a toolbar next to the range picker: the same five
            destinations, without spending a whole panel of height on them. */}
        <div className="flex flex-wrap gap-1.5">
          {[
            { href: '/admin/products/new', icon: IconPlus, label: t('admin.dashboard.qaAddProduct') },
            { href: '/admin/orders', icon: IconReceipt, label: t('admin.dashboard.qaOrders') },
            { href: '/admin/customers', icon: IconUsers, label: t('admin.dashboard.qaCustomers') },
            { href: '/admin/settings', icon: IconSettings, label: t('admin.dashboard.qaSettings') },
            { href: '/', icon: IconStore, label: t('admin.dashboard.qaViewStore'), external: true },
          ].map((action) => (
            <Link
              key={action.label}
              href={action.href}
              {...(action.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
              className="inline-flex items-center gap-1.5 rounded-full border border-neutral-900/8 bg-white/70 px-3 py-1.5 text-[13px] font-medium text-neutral-700 backdrop-blur-xl transition hover:bg-white hover:text-neutral-900"
            >
              <action.icon className="h-4 w-4 text-neutral-500" />
              {action.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Five across from the laptop breakpoint up, so the headline numbers
          never cost two rows of height on the screen most used here. */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard
          icon={IconCash}
          tone="gold"
          label={t('admin.dashboard.revenue')}
          value={formatPrice(stats.revenue)}
          delta={rangeDays ? stats.revenueDelta : null}
          hint={rangeDays ? t('admin.dashboard.vsPrevious') : null}
        />
        <StatCard
          icon={IconReceipt}
          tone="blue"
          label={t('admin.dashboard.ordersInRange')}
          value={stats.inRange.length}
          delta={rangeDays ? stats.countDelta : null}
          hint={rangeDays ? t('admin.dashboard.vsPrevious') : null}
          href="/admin/orders"
        />
        <StatCard
          icon={IconClock}
          tone={stats.pending ? 'amber' : 'neutral'}
          label={t('admin.dashboard.pendingOrders')}
          value={stats.pending}
          hint={t('admin.dashboard.needsAction')}
          href="/admin/orders"
        />
        <StatCard
          icon={IconBox}
          tone="neutral"
          label={t('admin.dashboard.avgOrder')}
          value={formatPrice(stats.avgOrder)}
          hint={t('admin.dashboard.perOrder')}
        />
        {costById.size > 0 ? (
          <StatCard
            icon={IconTrendUp}
            tone="green"
            label={t('admin.dashboard.profit')}
            value={formatPrice(stats.profit)}
            hint={
              stats.costedOrders < stats.earningCount
                ? t('admin.dashboard.profitPartial', {
                    covered: stats.costedOrders,
                    total: stats.earningCount,
                  })
                : t('admin.dashboard.profitAll')
            }
          />
        ) : (
          <Link
            href="/admin/products"
            className="flex flex-col justify-center rounded-2xl border border-dashed border-neutral-300 bg-white/60 p-4 text-center transition hover:border-gold/50 hover:bg-white"
          >
            <span className="text-[13px] font-semibold text-neutral-700">
              {t('admin.dashboard.profitSetupTitle')}
            </span>
            <span className="mt-1 text-xs text-neutral-500">
              {t('admin.dashboard.profitSetupBody')}
            </span>
          </Link>
        )}
      </div>

      <div className="grid items-start gap-4 xl:grid-cols-4">
        <Card
          className="min-w-0 xl:col-span-2"
          title={t('admin.dashboard.activity')}
          subtitle={t('admin.dashboard.lastSixMonths')}
          action={
            <div className="flex rounded-lg border border-neutral-200 p-0.5">
              {['orders', 'revenue'].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMetric(m)}
                  className={`rounded-md px-2.5 py-1 text-xs font-semibold transition ${
                    metric === m ? 'bg-neutral-900 text-white' : 'text-neutral-500 hover:text-neutral-900'
                  }`}
                >
                  {t(`admin.dashboard.metric_${m}`)}
                </button>
              ))}
            </div>
          }
        >
          <ActivityChart months={stats.months} metric={metric} t={t} />
        </Card>

        <Card title={t('admin.dashboard.pipeline')} bodyClassName="p-4">
          {stats.inRange.length === 0 ? (
            <p className="text-sm text-neutral-500">{t('admin.dashboard.noOrders')}</p>
          ) : (
            <>
              {/* One bar, split by status — how the whole period is sitting,
                  readable at a glance without counting six numbers. */}
              <div className="flex h-2.5 overflow-hidden rounded-full bg-neutral-900/6">
                {ORDER_STATUSES.map((status) => {
                  const count = stats.byStatus[status] || 0;
                  if (!count) return null;
                  return (
                    <div
                      key={status}
                      className={PIPELINE_COLORS[status]}
                      style={{ width: `${(count / stats.inRange.length) * 100}%` }}
                      title={`${t(`statuses.${status}`)}: ${count}`}
                    />
                  );
                })}
              </div>
              <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5">
                {ORDER_STATUSES.filter((s) => stats.byStatus[s]).map((status) => (
                  <li key={status} className="flex items-center gap-2 text-xs">
                    <span className={`h-2 w-2 shrink-0 rounded-full ${PIPELINE_COLORS[status]}`} />
                    <span className="flex-1 truncate text-neutral-600">{t(`statuses.${status}`)}</span>
                    <span className="font-semibold tabular-nums">{stats.byStatus[status]}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-4 grid grid-cols-2 gap-3 border-t border-neutral-900/5 pt-3">
                <div>
                  <p className="text-[10px] uppercase leading-tight tracking-wider text-neutral-400">
                    {t('admin.dashboard.successRate')}
                  </p>
                  <p className="font-display text-base font-bold tabular-nums">
                    {stats.successRate == null ? '—' : `${stats.successRate}%`}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase leading-tight tracking-wider text-neutral-400">
                    {t('admin.dashboard.toCollect')}
                  </p>
                  <p className="font-display text-base font-bold tabular-nums">
                    {formatPrice(stats.toCollect)}
                  </p>
                </div>
              </div>
            </>
          )}
        </Card>

        <Card title={t('admin.dashboard.topProducts')} bodyClassName="p-4">
          {stats.topProducts.length === 0 ? (
            <p className="text-sm text-neutral-500">{t('admin.dashboard.noOrders')}</p>
          ) : (
            <ul className="space-y-2">
              {stats.topProducts.map(([name, count], i) => (
                <li key={name} className="flex items-center gap-3 text-sm">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-neutral-100 text-xs font-bold text-neutral-500">
                    {i + 1}
                  </span>
                  <span className="flex-1 truncate">{name}</span>
                  <span className="rounded-full bg-gold/15 px-2.5 py-0.5 text-xs font-semibold text-gold-700">
                    {count}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      {/* Recent orders next to the two breakdowns rather than above them:
          stacking every panel full-width is what made this page a scroll. */}
      <div className="grid items-start gap-4 xl:grid-cols-4">
      <Card
        className="min-w-0 xl:col-span-3"
        title={t('admin.dashboard.recentOrders')}
        action={
          <Link
            href="/admin/orders"
            className="inline-flex items-center gap-1 text-xs font-semibold text-gold-700 hover:underline"
          >
            {t('admin.dashboard.viewAll')}
            <IconArrowRight className="h-3.5 w-3.5" />
          </Link>
        }
        bodyClassName="p-0"
      >
        {recent.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-neutral-500">
            {t('admin.dashboard.noOrders')}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead className="border-b border-neutral-100 text-xs uppercase tracking-wider text-neutral-400">
                <tr>
                  <th className="px-4 py-2.5 font-semibold">{t('admin.orders.orderNumber')}</th>
                  <th className="px-4 py-2.5 font-semibold">{t('admin.orders.customer')}</th>
                  <th className="px-4 py-2.5 font-semibold">{t('admin.orders.product')}</th>
                  <th className="px-4 py-2.5 text-right font-semibold">
                    {t('admin.orders.fields.total')}
                  </th>
                  <th className="px-4 py-2.5 font-semibold">{t('admin.orders.status')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-50">
                {recent.map((order) => (
                  <tr key={order.id} className="hover:bg-neutral-50">
                    <td className="px-4 py-3 font-mono text-xs font-semibold">{order.orderNumber}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium">{order.customerName}</p>
                      <p className="text-xs text-neutral-500">
                        {wilayaLabel(order.wilaya, locale)}
                      </p>
                    </td>
                    <td className="max-w-[160px] px-4 py-3">
                      <p className="truncate text-neutral-700">{order.productName}</p>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right font-semibold tabular-nums">
                      {formatPrice(orderValue(order))}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order, e.target.value)}
                        aria-label={t('admin.orders.status')}
                        className={`rounded-full border-0 px-3 py-1.5 text-xs font-semibold outline-none ${STATUS_COLORS[order.status]}`}
                      >
                        {ORDER_STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {t(`statuses.${s}`)}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

        <Card title={t('admin.dashboard.ordersByWilaya')} bodyClassName="p-4">
          {stats.topWilayas.length === 0 ? (
            <p className="text-sm text-neutral-500">{t('admin.dashboard.noOrders')}</p>
          ) : (
            <ul className="space-y-2">
              {stats.topWilayas.map(([wilaya, count]) => (
                <li key={wilaya} className="flex items-center gap-3 text-sm">
                  <span className="w-28 shrink-0 truncate font-medium">
                    {wilayaLabel(wilaya, locale)}
                  </span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-neutral-100">
                    <div
                      className="h-full rounded-full bg-gold-500"
                      style={{ width: `${(count / stats.topWilayas[0][1]) * 100}%` }}
                    />
                  </div>
                  <span className="w-7 text-right font-semibold tabular-nums">{count}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>

      </div>

      {/* Restoring a backup is a once-a-year action, so it folds away instead
          of holding a full panel of height on every visit. */}
      {isOwner && (
        <details className="glass-card group rounded-2xl">
          <summary className="flex cursor-pointer list-none items-center gap-3 px-5 py-3.5">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-neutral-100 text-neutral-600">
              <IconDownload className="h-4 w-4 rotate-180" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-display text-[15px] font-semibold text-neutral-900">
                {t('admin.restore.title')}
              </span>
              <span className="block truncate text-xs text-neutral-500">
                {t('admin.restore.subtitle')}
              </span>
            </span>
            <IconArrowRight className="h-4 w-4 shrink-0 text-neutral-400 transition group-open:rotate-90" />
          </summary>
          <div className="border-t border-neutral-100 p-5">
            <RestoreBackup onRestored={() => window.location.reload()} />
          </div>
        </details>
      )}
    </div>
  );
}
