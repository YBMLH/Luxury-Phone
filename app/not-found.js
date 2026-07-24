'use client';

import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';

export default function NotFound() {
  const { t } = useLanguage();

  return (
    <div className="marble flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <p className="font-display text-8xl font-bold text-gold-gradient">404</p>
      <h1 className="mt-4 font-display text-2xl font-semibold text-white">
        {t('notFound.title')}
      </h1>
      <p className="mt-2 max-w-sm text-sm text-neutral-400">
        {t('notFound.message')}
      </p>
      <div className="mt-8 flex gap-4">
        <Link href="/" className="btn-gold">{t('notFound.backHome')}</Link>
        <Link
          href="/products"
          className="inline-flex items-center rounded-lg border border-gold/50 px-6 py-3 text-sm font-semibold text-gold-300 hover:bg-gold/10"
        >
          {t('notFound.browseProducts')}
        </Link>
      </div>
    </div>
  );
}
