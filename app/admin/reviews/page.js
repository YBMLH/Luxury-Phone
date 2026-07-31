'use client';

// Review moderation. Everything a customer submits lands here unapproved and
// stays invisible on the storefront until it is approved from this page —
// that queue is the only thing standing between the product pages and spam.
import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { getAllReviews, setReviewApproved, deleteReview } from '@/lib/db';
import { formatDate } from '@/lib/utils';
import { TableSkeleton } from '@/components/Skeletons';
import EmptyState from '@/components/EmptyState';
import { useLanguage } from '@/context/LanguageContext';
import { PageHeader, TabBar, IconButton } from '@/components/admin/ui';
import { IconCheck, IconTrash, IconBan, IconStar } from '@/components/admin/Icons';

function Stars({ rating }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${rating}/5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <IconStar
          key={n}
          className={`h-3.5 w-3.5 ${n <= rating ? 'text-gold-500' : 'text-neutral-300'}`}
        />
      ))}
    </span>
  );
}

export default function AdminReviewsPage() {
  const { t } = useLanguage();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('pending');
  const [busy, setBusy] = useState(null);

  useEffect(() => {
    getAllReviews()
      .then(setReviews)
      .catch(() => toast.error(t('admin.reviews.loadError')))
      .finally(() => setLoading(false));
  }, []);

  const counts = useMemo(
    () => ({
      pending: reviews.filter((r) => !r.approved).length,
      approved: reviews.filter((r) => r.approved).length,
      all: reviews.length,
    }),
    [reviews]
  );

  const filtered = useMemo(() => {
    if (view === 'pending') return reviews.filter((r) => !r.approved);
    if (view === 'approved') return reviews.filter((r) => r.approved);
    return reviews;
  }, [reviews, view]);

  async function toggleApproval(review, approved) {
    setBusy(review.id);
    try {
      await setReviewApproved(review, approved);
      setReviews((prev) => prev.map((r) => (r.id === review.id ? { ...r, approved } : r)));
      toast.success(approved ? t('admin.reviews.approved') : t('admin.reviews.hidden'));
    } catch {
      toast.error(t('admin.reviews.actionError'));
    } finally {
      setBusy(null);
    }
  }

  async function remove(review) {
    if (!confirm(t('admin.reviews.confirmDelete'))) return;
    setBusy(review.id);
    try {
      await deleteReview(review);
      setReviews((prev) => prev.filter((r) => r.id !== review.id));
      toast.success(t('admin.reviews.deleted'));
    } catch {
      toast.error(t('admin.reviews.actionError'));
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title={t('admin.reviews.title')}
        count={reviews.length}
        subtitle={t('admin.reviews.subtitle')}
      />

      <TabBar
        tabs={[
          { value: 'pending', label: t('admin.reviews.tabPending'), count: counts.pending },
          { value: 'approved', label: t('admin.reviews.tabApproved'), count: counts.approved },
          { value: 'all', label: t('admin.reviews.tabAll'), count: counts.all },
        ]}
        value={view}
        onChange={setView}
      />

      {loading ? (
        <TableSkeleton />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon="⭐"
          title={t('admin.reviews.emptyTitle')}
          message={t('admin.reviews.emptyMessage')}
        />
      ) : (
        <div className="grid gap-3">
          {filtered.map((review) => (
            <article
              key={review.id}
              className={`rounded-2xl border bg-white p-4 shadow-[0_1px_2px_rgba(16,15,14,0.05)] ${
                review.approved ? 'border-neutral-200' : 'border-amber-300 bg-amber-50/40'
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Stars rating={Number(review.rating) || 0} />
                    <span className="font-semibold text-neutral-900">{review.name}</span>
                    {!review.approved && (
                      <span className="rounded-full bg-amber-200 px-2 py-0.5 text-[11px] font-semibold text-amber-900">
                        {t('admin.reviews.pendingBadge')}
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 truncate text-xs text-neutral-500">
                    {review.productName} · {formatDate(review.createdAt)}
                  </p>
                </div>
                <div className="flex gap-1.5">
                  {review.approved ? (
                    <IconButton
                      icon={IconBan}
                      label={t('admin.reviews.hide')}
                      disabled={busy === review.id}
                      onClick={() => toggleApproval(review, false)}
                    />
                  ) : (
                    <IconButton
                      icon={IconCheck}
                      tone="green"
                      label={t('admin.reviews.approve')}
                      disabled={busy === review.id}
                      onClick={() => toggleApproval(review, true)}
                    />
                  )}
                  <IconButton
                    icon={IconTrash}
                    tone="red"
                    label={t('admin.reviews.delete')}
                    disabled={busy === review.id}
                    onClick={() => remove(review)}
                  />
                </div>
              </div>
              {review.comment && (
                <p className="mt-2 whitespace-pre-line text-sm text-neutral-700">
                  {review.comment}
                </p>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
