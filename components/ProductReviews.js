'use client';

// Customer reviews on a product page: the approved ones, and a form to add
// another. Submitting needs no account — the review simply arrives unapproved
// and shows up only once the shop owner has read it.
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { getApprovedReviews, createReview } from '@/lib/db';
import { useLanguage } from '@/context/LanguageContext';
import { checkRateLimit } from '@/lib/utils';

function Stars({ rating, className = 'h-4 w-4' }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${rating} / 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <svg
          key={n}
          viewBox="0 0 24 24"
          className={`${className} ${n <= Math.round(rating) ? 'text-gold-500' : 'text-neutral-300'}`}
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="m12 3.6 2.6 5.3 5.8.8-4.2 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8L3.6 9.7l5.8-.8L12 3.6Z" />
        </svg>
      ))}
    </span>
  );
}

export default function ProductReviews({ product }) {
  const { t } = useLanguage();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: '', rating: 5, comment: '' });

  useEffect(() => {
    getApprovedReviews(product.id)
      .then(setReviews)
      .catch(() => setReviews([]))
      .finally(() => setLoading(false));
  }, [product.id]);

  const average = reviews.length
    ? reviews.reduce((sum, r) => sum + (Number(r.rating) || 0), 0) / reviews.length
    : 0;

  async function submit(event) {
    event.preventDefault();
    if (form.name.trim().length < 2) return toast.error(t('reviews.errors.name'));
    if (form.comment.trim().length < 5) return toast.error(t('reviews.errors.comment'));

    // Same throttle the order form uses — one review per browser per minute.
    const rate = checkRateLimit('review', 60);
    if (!rate.allowed) return toast.error(t('reviews.errors.rateLimit', { seconds: rate.wait }));

    setSubmitting(true);
    try {
      await createReview({
        productId: product.id,
        productName: product.name,
        name: form.name,
        rating: form.rating,
        comment: form.comment,
      });
      setSubmitted(true);
      setOpen(false);
      setForm({ name: '', rating: 5, comment: '' });
      toast.success(t('reviews.thanks'));
    } catch {
      toast.error(t('reviews.errors.generic'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="mt-12" aria-labelledby="reviews-heading">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 id="reviews-heading" className="font-display text-2xl font-bold">
            {t('reviews.title')}
          </h2>
          {reviews.length > 0 && (
            <div className="mt-1 flex items-center gap-2 text-sm text-neutral-600">
              <Stars rating={average} />
              <span className="font-semibold text-neutral-900">{average.toFixed(1)}</span>
              <span>{t('reviews.count', { count: reviews.length })}</span>
            </div>
          )}
        </div>
        {!submitted && (
          <button type="button" onClick={() => setOpen((v) => !v)} className="btn-outline !px-5 !py-2.5">
            {open ? t('common.cancel') : t('reviews.writeOne')}
          </button>
        )}
      </div>

      {submitted && (
        <p className="mt-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          {t('reviews.pendingNotice')}
        </p>
      )}

      {open && (
        <form onSubmit={submit} className="mt-5 space-y-3 rounded-2xl border border-neutral-200 bg-white p-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="review-name">{t('reviews.yourName')}</label>
              <input
                id="review-name"
                className="input"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                maxLength={60}
              />
            </div>
            <div>
              <label className="label" htmlFor="review-rating">{t('reviews.rating')}</label>
              <select
                id="review-rating"
                className="input"
                value={form.rating}
                onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}
              >
                {[5, 4, 3, 2, 1].map((n) => (
                  <option key={n} value={n}>
                    {n} / 5
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="label" htmlFor="review-comment">{t('reviews.comment')}</label>
            <textarea
              id="review-comment"
              className="input"
              rows={4}
              value={form.comment}
              onChange={(e) => setForm({ ...form, comment: e.target.value })}
              maxLength={600}
              placeholder={t('reviews.commentPlaceholder')}
            />
          </div>
          <div className="flex items-center gap-3">
            <button type="submit" disabled={submitting} className="btn-gold !px-6 !py-2.5">
              {submitting ? '…' : t('reviews.submit')}
            </button>
            <p className="text-xs text-neutral-500">{t('reviews.moderationNote')}</p>
          </div>
        </form>
      )}

      {!loading && reviews.length === 0 && !open && (
        <p className="mt-4 text-sm text-neutral-500">{t('reviews.empty')}</p>
      )}

      {reviews.length > 0 && (
        <ul className="mt-5 grid gap-3 sm:grid-cols-2">
          {reviews.slice(0, 10).map((review) => (
            <li key={review.id} className="rounded-2xl border border-neutral-200 bg-white p-4">
              <div className="flex items-center gap-2">
                <Stars rating={Number(review.rating) || 0} className="h-3.5 w-3.5" />
                <span className="text-sm font-semibold">{review.name}</span>
              </div>
              <p className="mt-1.5 whitespace-pre-line text-sm text-neutral-700">{review.comment}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
