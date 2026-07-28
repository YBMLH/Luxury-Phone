'use client';

// Route-level error boundary: catches any runtime error thrown while
// rendering a page and shows a branded fallback instead of a blank screen
// or Next's default error overlay. `reset()` re-renders the segment.
import { useEffect } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';

export default function ErrorBoundary({ error, reset }) {
  const { t } = useLanguage();

  useEffect(() => {
    // Logged to the browser console so a report from a customer ("the site
    // broke") can be cross-checked against real error details if needed.
    console.error(error);
  }, [error]);

  return (
    <div className="marble flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <p className="text-6xl">⚠️</p>
      <h1 className="mt-4 font-display text-2xl font-semibold text-white">
        {t('errorPage.title')}
      </h1>
      <p className="mt-2 max-w-sm text-sm text-neutral-400">
        {t('errorPage.message')}
      </p>
      <div className="mt-8 flex gap-4">
        <button onClick={() => reset()} className="btn-gold">
          {t('errorPage.retry')}
        </button>
        <Link
          href="/"
          className="inline-flex items-center rounded-lg border border-gold/50 px-6 py-3 text-sm font-semibold text-gold-300 hover:bg-gold/10"
        >
          {t('errorPage.backHome')}
        </Link>
      </div>
    </div>
  );
}
