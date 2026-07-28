'use client';

// Simple client-side pager for admin tables. `total` is the already
// filtered/searched count; the caller slices its own array using `page`
// and `pageSize` — this component only renders the controls.
export default function Pagination({ page, pageSize, total, onPageChange }) {
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  if (pageCount <= 1) return null;

  const from = (page - 1) * pageSize + 1;
  const to = Math.min(total, page * pageSize);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-neutral-200 px-4 py-3 text-sm text-neutral-600">
      <span>
        {from}–{to} / {total}
      </span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="rounded-lg border border-neutral-300 px-3 py-1.5 text-xs font-medium disabled:cursor-not-allowed disabled:opacity-40 hover:enabled:bg-neutral-100"
          aria-label="Previous page"
        >
          ← Précédent
        </button>
        <span className="text-xs text-neutral-500">
          {page} / {pageCount}
        </span>
        <button
          type="button"
          disabled={page >= pageCount}
          onClick={() => onPageChange(page + 1)}
          className="rounded-lg border border-neutral-300 px-3 py-1.5 text-xs font-medium disabled:cursor-not-allowed disabled:opacity-40 hover:enabled:bg-neutral-100"
          aria-label="Next page"
        >
          Suivant →
        </button>
      </div>
    </div>
  );
}
