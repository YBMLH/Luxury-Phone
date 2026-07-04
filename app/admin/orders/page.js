'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { getOrders, updateOrderStatus, deleteOrder } from '@/lib/db';
import { ORDER_STATUSES, STATUS_COLORS } from '@/lib/constants';
import { formatPrice, formatDate } from '@/lib/utils';
import { TableSkeleton } from '@/components/Skeletons';
import EmptyState from '@/components/EmptyState';

function OrderDetailModal({ order, onClose }) {
  if (!order) return null;
  const rows = [
    ['Order Number', order.orderNumber],
    ['Customer', order.customerName],
    ['Phone', order.phone],
    ['Second Phone', order.secondaryPhone || '—'],
    ['Wilaya', order.wilaya],
    ['Commune', order.commune],
    ['Address', order.address],
    ['Product', order.productName],
    ['Price', formatPrice(order.price)],
    ['Color', order.color || '—'],
    ['Storage', order.storage || '—'],
    ['RAM', order.ram || '—'],
    ['Notes', order.notes || '—'],
    ['Date', formatDate(order.createdAt)],
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
            <h2 className="font-display text-lg font-bold text-white">Order Details</h2>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_COLORS[order.status]}`}>
              {order.status}
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
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    getOrders()
      .then(setOrders)
      .catch(() => toast.error('Could not load orders.'))
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
      toast.success(`Order ${order.orderNumber} → ${status}`);
    } catch {
      setOrders((prev) =>
        prev.map((o) => (o.id === order.id ? { ...o, status: previous } : o))
      );
      toast.error('Could not update the status.');
    }
  }

  async function handleDelete(order) {
    if (!confirm(`Delete order ${order.orderNumber}? This cannot be undone.`)) return;
    try {
      await deleteOrder(order);
      setOrders((prev) => prev.filter((o) => o.id !== order.id));
      toast.success('Order deleted.');
    } catch {
      toast.error('Could not delete the order.');
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold">Orders ({orders.length})</h1>

      <div className="flex flex-col gap-3 sm:flex-row">
        <input type="search" className="input sm:max-w-sm"
          placeholder="Search by order #, name, phone, product…"
          value={search} onChange={(e) => setSearch(e.target.value)} />
        <select className="input sm:max-w-xs" value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">All Statuses</option>
          {ORDER_STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <TableSkeleton />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon="🧾"
          title={orders.length === 0 ? 'No orders yet' : 'No matching orders'}
          message={orders.length === 0
            ? 'Orders placed by customers will appear here instantly.'
            : 'Try a different search or status filter.'}
        />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-neutral-200 bg-white shadow-card">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="border-b border-neutral-200 bg-neutral-50 text-xs uppercase tracking-wider text-neutral-500">
              <tr>
                <th className="px-4 py-3">Order #</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Wilaya</th>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Variant</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
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
                    <p className="text-xs text-neutral-500">{order.phone}</p>
                  </td>
                  <td className="px-4 py-3 text-neutral-600">{order.wilaya}</td>
                  <td className="max-w-[180px] truncate px-4 py-3">{order.productName}</td>
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
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => setSelected(order)}
                        className="rounded-lg border border-neutral-300 px-3 py-1.5 text-xs hover:bg-neutral-100">
                        View
                      </button>
                      <button onClick={() => handleDelete(order)}
                        className="rounded-lg border border-red-200 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50">
                        Delete
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
        {selected && <OrderDetailModal order={selected} onClose={() => setSelected(null)} />}
      </AnimatePresence>
    </div>
  );
}
