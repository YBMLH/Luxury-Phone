'use client';

import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { getActivityLogs } from '@/lib/db';
import { formatDate } from '@/lib/utils';
import { TableSkeleton } from '@/components/Skeletons';
import EmptyState from '@/components/EmptyState';
import Pagination from '@/components/admin/Pagination';
import { useLanguage } from '@/context/LanguageContext';

const PAGE_SIZE = 25;

// Renders a log's `details` object as a short, readable summary instead of
// raw JSON (e.g. "from Pending to Shipped" for a status change).
function summarizeDetails(log) {
  const d = log.details || {};
  switch (log.action) {
    case 'order.status_change':
      return `${d.orderNumber || ''} — ${d.from || '?'} → ${d.to || '?'}`;
    case 'order.delete':
      return d.orderNumber || '';
    case 'product.create':
    case 'product.update':
      return d.name || d.productId || '';
    case 'product.delete':
      return d.productId || '';
    default:
      return '';
  }
}

export default function AdminActivityPage() {
  const { t } = useLanguage();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    getActivityLogs()
      .then(setLogs)
      .catch(() => toast.error(t('admin.activity.loadError')))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return logs;
    return logs.filter((log) =>
      `${log.action} ${log.adminEmail} ${summarizeDetails(log)}`
        .toLowerCase()
        .includes(q)
    );
  }, [logs, search]);

  useEffect(() => setPage(1), [search]);

  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">{t('admin.activity.title')} ({logs.length})</h1>
        <p className="mt-1 text-sm text-neutral-500">{t('admin.activity.subtitle')}</p>
      </div>

      <input
        type="search"
        className="input sm:max-w-sm"
        placeholder={t('admin.activity.searchPlaceholder')}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {loading ? (
        <TableSkeleton />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon="📜"
          title={t('admin.activity.emptyTitle')}
          message={t('admin.activity.emptyMessage')}
        />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-neutral-200 bg-white shadow-card">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-neutral-200 bg-neutral-50 text-xs uppercase tracking-wider text-neutral-500">
              <tr>
                <th className="px-4 py-3">{t('admin.activity.date')}</th>
                <th className="px-4 py-3">{t('admin.activity.admin')}</th>
                <th className="px-4 py-3">{t('admin.activity.action')}</th>
                <th className="px-4 py-3">{t('admin.activity.details')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {pageItems.map((log) => (
                <tr key={log.id} className="hover:bg-neutral-50">
                  <td className="whitespace-nowrap px-4 py-3 text-xs text-neutral-500">
                    {formatDate(log.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-xs text-neutral-600">{log.adminEmail}</td>
                  <td className="px-4 py-3 font-medium">
                    {t(`admin.activity.actions.${log.action}`) || log.action}
                  </td>
                  <td className="px-4 py-3 text-xs text-neutral-500">{summarizeDetails(log)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination page={page} pageSize={PAGE_SIZE} total={filtered.length} onPageChange={setPage} />
        </div>
      )}
    </div>
  );
}
