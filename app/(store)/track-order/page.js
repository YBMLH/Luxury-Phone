'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { trackOrder } from '@/lib/db';
import { isValidPhone, formatDate } from '@/lib/utils';
import { useLanguage } from '@/context/LanguageContext';

const STATUS_STEPS = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered'];

export default function TrackOrderPage() {
  const { t } = useLanguage();
  const [orderNumber, setOrderNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [notFound, setNotFound] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!orderNumber.trim()) return toast.error(t('trackOrder.errors.orderNumber'));
    if (!isValidPhone(phone)) return toast.error(t('trackOrder.errors.phone'));

    setLoading(true);
    setResult(null);
    setNotFound(false);
    try {
      const order = await trackOrder(orderNumber, phone);
      if (order) {
        setResult(order);
      } else {
        setNotFound(true);
      }
    } catch {
      toast.error(t('trackOrder.errors.generic'));
    } finally {
      setLoading(false);
    }
  }

  const stepIndex = result ? STATUS_STEPS.indexOf(result.status) : -1;
  const cancelled = result?.status === 'Cancelled';

  return (
    <div className="mx-auto max-w-2xl px-4 py-14 md:px-6">
      <div className="mb-10 text-center">
        <h1 className="font-display text-3xl font-bold tracking-tight md:text-5xl">
          {t('trackOrder.title')}<span className="text-gold-gradient">{t('trackOrder.titleAccent')}</span>
        </h1>
        <p className="mt-4 text-sm text-neutral-500">
          {t('trackOrder.subtitle')}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-[1.75rem] border border-neutral-200 bg-white p-6 shadow-sm md:p-8">
        <div>
          <label className="label">
            {t('trackOrder.orderNumber')}
          </label>
          <input
            className="input"
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            placeholder={t('trackOrder.orderNumberPlaceholder')}
          />
        </div>
        <div>
          <label className="label">
            {t('trackOrder.phone')}
          </label>
          <input
            className="input"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="05XX XX XX XX"
          />
        </div>
        <button type="submit" disabled={loading} className="btn-gold w-full">
          {loading ? t('trackOrder.checking') : t('trackOrder.track')}
        </button>
      </form>

      {notFound && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-6 text-center"
        >
          <p className="text-3xl">😕</p>
          <h2 className="mt-2 font-semibold text-red-800">{t('trackOrder.notFoundTitle')}</h2>
          <p className="mt-1 text-sm text-red-600">
            {t('trackOrder.notFoundMessage')}
          </p>
        </motion.div>
      )}

      {result && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 rounded-2xl border border-neutral-200 bg-white p-6 shadow-card"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-widest text-neutral-400">{t('trackOrder.order')}</p>
              <p className="font-mono text-lg font-bold">{result.orderNumber}</p>
            </div>
            <span
              className={`rounded-full px-4 py-1.5 text-sm font-semibold ${
                cancelled
                  ? 'bg-red-100 text-red-700'
                  : result.status === 'Delivered'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gold/15 text-gold-700'
              }`}
            >
              {t(`statuses.${result.status}`)}
            </span>
          </div>

          <p className="mt-3 text-sm text-neutral-600">
            <span className="font-medium">{result.productName}</span>
            {result.createdAt && (
              <span className="text-neutral-400"> — {t('trackOrder.ordered')} {formatDate(result.createdAt)}</span>
            )}
          </p>

          {!cancelled && (
            <div className="mt-8">
              <div className="flex items-center">
                {STATUS_STEPS.map((step, i) => (
                  <div key={step} className="flex flex-1 items-center last:flex-none">
                    <div className="flex flex-col items-center">
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                          i <= stepIndex
                            ? 'bg-gold text-black'
                            : 'bg-neutral-200 text-neutral-500'
                        }`}
                      >
                        {i < stepIndex ? '✓' : i + 1}
                      </div>
                      <span className="mt-2 hidden text-[10px] font-medium text-neutral-600 sm:block">
                        {t(`statuses.${step}`)}
                      </span>
                    </div>
                    {i < STATUS_STEPS.length - 1 && (
                      <div
                        className={`mx-1 h-0.5 flex-1 sm:-mt-5 ${
                          i < stepIndex ? 'bg-gold' : 'bg-neutral-200'
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>
              <p className="mt-4 text-center text-xs text-neutral-500 sm:hidden">
                {t('trackOrder.currentStatus')}: <span className="font-semibold">{t(`statuses.${result.status}`)}</span>
              </p>
            </div>
          )}

          {cancelled && (
            <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
              {t('trackOrder.cancelledMessage')}
            </p>
          )}
        </motion.div>
      )}
    </div>
  );
}
