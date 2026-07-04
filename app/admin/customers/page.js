'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { getCustomers, getOrdersByPhone } from '@/lib/db';
import { STATUS_COLORS } from '@/lib/constants';
import { formatPrice, formatDate } from '@/lib/utils';
import { TableSkeleton } from '@/components/Skeletons';
import EmptyState from '@/components/EmptyState';

function HistoryModal({ customer, onClose }) {
  const [orders, setOrders] = useState(null);

  useEffect(() => {
    getOrdersByPhone(customer.phone)
      .then(setOrders)
      .catch(() => setOrders([]));
  }, [customer.phone]);

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
          <div>
            <h2 className="font-display text-lg font-bold text-white">
              {customer.fullName}
            </h2>
            <p className="text-xs text-neutral-400">
              {customer.phone} — {customer.wilaya}
            </p>
          </div>
          <button onClick={onClose} className="text-2xl text-neutral-400 hover:text-white" aria-label="Close">×</button>
        </div>
        <div className="p-5">
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-neutral-500">
            Order History
          </h3>
          {orders === null ? (
            <TableSkeleton rows={3} />
          ) : orders.length === 0 ? (
            <p className="text-sm text-neutral-500">No orders found.</p>
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
                      {order.status}
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
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    getCustomers()
      .then(setCustomers)
      .catch(() => toast.error('Could not load customers.'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter((c) =>
      `${c.fullName} ${c.phone} ${c.wilaya}`.toLowerCase().includes(q)
    );
  }, [customers, search]);

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold">Customers ({customers.length})</h1>

      <input type="search" className="input sm:max-w-sm"
        placeholder="Search by name, phone or wilaya…"
        value={search} onChange={(e) => setSearch(e.target.value)} />

      {loading ? (
        <TableSkeleton />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon="👥"
          title={customers.length === 0 ? 'No customers yet' : 'No matching customers'}
          message="Customers are added automatically when they place their first order."
        />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-neutral-200 bg-white shadow-card">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-neutral-200 bg-neutral-50 text-xs uppercase tracking-wider text-neutral-500">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Wilaya</th>
                <th className="px-4 py-3">Orders</th>
                <th className="px-4 py-3">Last Order</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filtered.map((customer) => (
                <tr key={customer.id} className="hover:bg-neutral-50">
                  <td className="px-4 py-3 font-medium">{customer.fullName}</td>
                  <td className="px-4 py-3 text-neutral-600">{customer.phone}</td>
                  <td className="px-4 py-3 text-neutral-600">{customer.wilaya}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-gold/15 px-2.5 py-0.5 text-xs font-semibold text-gold-700">
                      {customer.ordersCount || 0}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-neutral-500">
                    {formatDate(customer.lastOrderAt)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => setSelected(customer)}
                      className="rounded-lg border border-gold/50 px-3 py-1.5 text-xs text-gold-700 hover:bg-gold/10">
                      Order History
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <AnimatePresence>
        {selected && <HistoryModal customer={selected} onClose={() => setSelected(null)} />}
      </AnimatePresence>
    </div>
  );
}
