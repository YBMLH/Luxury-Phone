'use client';

// Analytics dashboard. All stats are computed in the browser from the
// orders/products collections — no extra services, no extra cost.
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { getOrders, getProducts } from '@/lib/db';
import { TableSkeleton } from '@/components/Skeletons';

function StatCard({ icon, label, value, accent = false }) {
  return (
    <div className={`rounded-2xl p-5 ${accent ? 'marble-card' : 'border border-neutral-200 bg-white shadow-card'}`}>
      <div className="flex items-center justify-between">
        <p className={`text-sm ${accent ? 'text-neutral-300' : 'text-neutral-500'}`}>{label}</p>
        <span className="text-2xl">{icon}</span>
      </div>
      <p className={`mt-2 text-3xl font-bold ${accent ? 'text-gold-300' : 'text-neutral-900'}`}>
        {value}
      </p>
    </div>
  );
}

// Simple bar chart in pure HTML/CSS — every bar carries its value label.
function MonthlyChart({ data }) {
  const max = Math.max(1, ...data.map((d) => d.count));
  return (
    <div>
      <div className="flex h-48 items-end gap-3">
        {data.map((d) => (
          <div key={d.label} className="group flex flex-1 flex-col items-center justify-end"
               title={`${d.label}: ${d.count} orders`}>
            <span className="mb-1 text-xs font-semibold text-neutral-700">{d.count}</span>
            <div
              className="w-full max-w-[48px] rounded-t bg-gold-600 transition group-hover:bg-gold-500"
              style={{ height: `${Math.max(4, (d.count / max) * 160)}px` }}
            />
          </div>
        ))}
      </div>
      <div className="mt-2 flex gap-3 border-t border-neutral-200 pt-2">
        {data.map((d) => (
          <span key={d.label} className="flex-1 text-center text-xs text-neutral-500">
            {d.label}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getOrders(), getProducts()])
      .then(([o, p]) => {
        setOrders(o);
        setProducts(p);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const stats = useMemo(() => {
    const byWilaya = {};
    const byProduct = {};
    for (const order of orders) {
      byWilaya[order.wilaya] = (byWilaya[order.wilaya] || 0) + 1;
      byProduct[order.productName] = (byProduct[order.productName] || 0) + 1;
    }

    // Last 6 months of orders.
    const months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        key: `${d.getFullYear()}-${d.getMonth()}`,
        label: d.toLocaleDateString('en-GB', { month: 'short' }),
        count: 0,
      });
    }
    for (const order of orders) {
      const date = order.createdAt?.toDate?.();
      if (!date) continue;
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      const month = months.find((m) => m.key === key);
      if (month) month.count += 1;
    }

    return {
      pending: orders.filter((o) => o.status === 'Pending').length,
      delivered: orders.filter((o) => o.status === 'Delivered').length,
      topWilayas: Object.entries(byWilaya).sort((a, b) => b[1] - a[1]).slice(0, 6),
      topProducts: Object.entries(byProduct).sort((a, b) => b[1] - a[1]).slice(0, 6),
      months,
    };
  }, [orders]);

  if (loading) {
    return (
      <div>
        <h1 className="mb-6 font-display text-2xl font-bold">Dashboard</h1>
        <TableSkeleton rows={5} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-2xl font-bold">Dashboard</h1>
        <Link href="/admin/products/new" className="btn-gold !px-5 !py-2.5">
          + Add Product
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon="📦" label="Total Products" value={products.length} accent />
        <StatCard icon="🧾" label="Total Orders" value={orders.length} />
        <StatCard icon="⏳" label="Pending Orders" value={stats.pending} />
        <StatCard icon="✅" label="Delivered Orders" value={stats.delivered} />
      </div>

      {/* Monthly chart */}
      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-card">
        <h2 className="mb-6 font-display text-lg font-semibold">
          Orders — Last 6 Months
        </h2>
        <MonthlyChart data={stats.months} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Orders by wilaya */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-card">
          <h2 className="mb-4 font-display text-lg font-semibold">Orders by Wilaya</h2>
          {stats.topWilayas.length === 0 ? (
            <p className="text-sm text-neutral-500">No orders yet.</p>
          ) : (
            <ul className="space-y-3">
              {stats.topWilayas.map(([wilaya, count]) => (
                <li key={wilaya} className="flex items-center gap-3 text-sm">
                  <span className="w-32 shrink-0 truncate font-medium">{wilaya}</span>
                  <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-neutral-100">
                    <div
                      className="h-full rounded-full bg-gold-600"
                      style={{ width: `${(count / stats.topWilayas[0][1]) * 100}%` }}
                    />
                  </div>
                  <span className="w-8 text-right font-semibold">{count}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Most ordered products */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-card">
          <h2 className="mb-4 font-display text-lg font-semibold">Most Ordered Products</h2>
          {stats.topProducts.length === 0 ? (
            <p className="text-sm text-neutral-500">No orders yet.</p>
          ) : (
            <ul className="space-y-3">
              {stats.topProducts.map(([name, count]) => (
                <li key={name} className="flex items-center justify-between gap-3 text-sm">
                  <span className="truncate">{name}</span>
                  <span className="rounded-full bg-gold/15 px-3 py-0.5 font-semibold text-gold-700">
                    {count} order{count > 1 ? 's' : ''}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
