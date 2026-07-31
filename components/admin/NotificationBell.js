'use client';

// The bell in the top bar: an unread count, the orders that arrived while
// you were working, and the sound controls. The controls live here rather
// than buried in Settings because this is where you look when the shop makes
// a noise and you want to know what it was.
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useOrderAlerts } from '@/context/OrderAlertContext';
import { useLanguage } from '@/context/LanguageContext';
import { formatPrice } from '@/lib/utils';
import { IconBell, IconVolumeOn, IconVolumeOff, IconCheck } from './Icons';

export default function NotificationBell() {
  const { t } = useLanguage();
  const {
    newOrders,
    unread,
    markAllRead,
    soundOn,
    setSoundOn,
    desktopOn,
    enableDesktop,
    testChime,
    connected,
  } = useOrderAlerts();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    function onDocClick(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    }
    function onEsc(e) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onEsc);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onEsc);
    };
  }, [open]);

  function toggle() {
    setOpen((v) => {
      if (!v) markAllRead();
      return !v;
    });
  }

  return (
    <div className="relative" ref={wrapRef}>
      <button
        type="button"
        onClick={toggle}
        aria-label={t('admin.alerts.bellLabel')}
        aria-expanded={open}
        className="relative grid h-9 w-9 place-items-center rounded-lg border border-neutral-200 text-neutral-600 transition hover:bg-neutral-100 hover:text-neutral-900"
      >
        <IconBell className="h-[18px] w-[18px]" />
        {unread > 0 && (
          <span className="absolute -right-1 -top-1 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-[min(21rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-card">
          <div className="flex items-center justify-between border-b border-neutral-100 px-4 py-3">
            <p className="font-display text-sm font-semibold">{t('admin.alerts.title')}</p>
            <span
              className={`inline-flex items-center gap-1.5 text-[11px] font-medium ${
                connected ? 'text-green-600' : 'text-neutral-400'
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  connected ? 'bg-green-500' : 'bg-neutral-300'
                }`}
              />
              {connected ? t('admin.alerts.live') : t('admin.alerts.connecting')}
            </span>
          </div>

          <div className="max-h-72 overflow-y-auto">
            {newOrders.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-neutral-500">
                {t('admin.alerts.empty')}
              </p>
            ) : (
              <ul className="divide-y divide-neutral-100">
                {newOrders.map((order) => (
                  <li key={order.id}>
                    <Link
                      href="/admin/orders"
                      onClick={() => setOpen(false)}
                      className="flex items-start gap-3 px-4 py-3 transition hover:bg-neutral-50"
                    >
                      <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-gold/10 text-gold-700">
                        <IconCheck className="h-4 w-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block font-mono text-xs font-semibold text-neutral-900">
                          {order.orderNumber}
                        </span>
                        <span className="block truncate text-sm text-neutral-700">
                          {order.customerName}
                        </span>
                        <span className="block truncate text-xs text-neutral-500">
                          {order.productName} · {formatPrice(order.total || order.price)}
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="space-y-2 border-t border-neutral-100 bg-neutral-50 px-4 py-3">
            <label className="flex cursor-pointer items-center justify-between gap-3 text-sm">
              <span className="flex items-center gap-2 text-neutral-700">
                {soundOn ? (
                  <IconVolumeOn className="h-4 w-4 text-neutral-500" />
                ) : (
                  <IconVolumeOff className="h-4 w-4 text-neutral-400" />
                )}
                {t('admin.alerts.sound')}
              </span>
              <input
                type="checkbox"
                checked={soundOn}
                onChange={(e) => setSoundOn(e.target.checked)}
                className="h-4 w-4 accent-gold-600"
              />
            </label>

            <label className="flex cursor-pointer items-center justify-between gap-3 text-sm">
              <span className="text-neutral-700">{t('admin.alerts.desktop')}</span>
              <input
                type="checkbox"
                checked={desktopOn}
                onChange={enableDesktop}
                className="h-4 w-4 accent-gold-600"
              />
            </label>

            <button
              type="button"
              onClick={testChime}
              className="w-full rounded-lg border border-neutral-300 bg-white py-1.5 text-xs font-semibold text-neutral-700 transition hover:bg-neutral-100"
            >
              {t('admin.alerts.test')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
