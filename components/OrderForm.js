'use client';

// The order form shown when a customer clicks "Order Now".
// No payment — the order is saved to Firestore and the store owner
// contacts the customer to confirm.
import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { createOrder } from '@/lib/db';
import { WILAYAS, wilayaLabel } from '@/lib/constants';
import { useSettings } from '@/context/SettingsContext';
import { useLanguage } from '@/context/LanguageContext';
import {
  formatPrice,
  isValidPhone,
  checkRateLimit,
  deliveryFeeFor,
} from '@/lib/utils';

export default function OrderForm({ product, selection, open, onClose }) {
  const { settings } = useSettings();
  const { t, locale } = useLanguage();
  const [form, setForm] = useState({
    customerName: '',
    phone: '',
    secondaryPhone: '',
    wilaya: '',
    commune: '',
    address: '',
    notes: '',
  });
  const [quantity, setQuantity] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [orderNumber, setOrderNumber] = useState(null);

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const subtotal = (Number(product.price) || 0) * quantity;
  const deliveryFee = form.wilaya
    ? deliveryFeeFor(settings.delivery, form.wilaya)
    : null;
  const total = subtotal + (deliveryFee || 0);

  async function handleSubmit(e) {
    e.preventDefault();

    if (!form.customerName.trim() || form.customerName.trim().length < 3) {
      return toast.error(t('orderForm.errors.name'));
    }
    if (!isValidPhone(form.phone)) {
      return toast.error(t('orderForm.errors.phone'));
    }
    if (form.secondaryPhone && !isValidPhone(form.secondaryPhone)) {
      return toast.error(t('orderForm.errors.secondaryPhone'));
    }
    if (!form.wilaya) return toast.error(t('orderForm.errors.wilaya'));
    if (!form.commune.trim()) return toast.error(t('orderForm.errors.commune'));
    if (!form.address.trim()) return toast.error(t('orderForm.errors.address'));

    // Basic anti-spam: one order per browser per 60 seconds.
    const rate = checkRateLimit('order', 60);
    if (!rate.allowed) {
      return toast.error(t('orderForm.errors.rateLimit', { seconds: rate.wait }));
    }

    setSubmitting(true);
    try {
      const number = await createOrder({
        ...form,
        productId: product.id,
        productName: product.name,
        productImage: product.images?.[0] || '',
        price: product.price,
        quantity,
        deliveryFee: deliveryFee || 0,
        total,
        color: selection.color,
        storage: selection.storage,
        ram: selection.ram,
      });
      setOrderNumber(number);
      toast.success(t('orderForm.success'));
    } catch (err) {
      console.error(err);
      toast.error(t('orderForm.errors.generic'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-end justify-center bg-black/70 p-0 sm:items-center sm:p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 60, opacity: 0 }}
            transition={{ type: 'spring', damping: 26, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl"
          >
            {orderNumber ? (
              /* ------------------------- Confirmation ------------------------- */
              <div className="p-8 text-center">
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl">
                  ✓
                </div>
                <h2 className="font-display text-2xl font-bold">{t('orderForm.successTitle')}</h2>
                <p className="mt-2 text-sm text-neutral-600">
                  {t('orderForm.successMessage', { name: form.customerName.split(' ')[0] })}
                </p>
                <div className="marble mt-6 rounded-xl p-5">
                  <p className="text-xs uppercase tracking-widest text-neutral-400">
                    {t('orderForm.orderNumberLabel')}
                  </p>
                  <p className="mt-1 font-mono text-2xl font-bold text-gold-300">
                    {orderNumber}
                  </p>
                </div>
                <p className="mt-3 text-xs text-neutral-500">
                  {t('orderForm.saveNumber')}
                </p>
                <div className="mt-6 flex flex-col gap-3">
                  <Link href="/track-order" className="btn-gold w-full">
                    {t('orderForm.trackMyOrder')}
                  </Link>
                  <button onClick={onClose} className="btn-outline w-full">
                    {t('orderForm.continueShopping')}
                  </button>
                </div>
              </div>
            ) : (
              /* --------------------------- Order form -------------------------- */
              <form onSubmit={handleSubmit}>
                <div className="marble flex items-start justify-between rounded-t-2xl p-5">
                  <div>
                    <h2 className="font-display text-xl font-bold text-white">
                      {t('orderForm.title')}
                    </h2>
                    <p className="mt-1 text-xs text-neutral-400">
                      {t('orderForm.subtitle')}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={onClose}
                    className="text-2xl leading-none text-neutral-400 hover:text-white"
                    aria-label="Close"
                  >
                    ×
                  </button>
                </div>

                {/* Product summary */}
                <div className="flex items-center gap-4 border-b border-neutral-100 p-5">
                  {product.images?.[0] && (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="h-16 w-16 rounded-lg border border-neutral-200 object-cover"
                    />
                  )}
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{product.name}</p>
                    <p className="text-xs text-neutral-500">
                      {[selection.color, selection.storage, selection.ram]
                        .filter(Boolean)
                        .join(' · ') || t('orderForm.standard')}
                    </p>
                    <p className="text-sm font-bold text-gold-700">
                      {formatPrice(product.price)}
                    </p>
                  </div>
                </div>

                <div className="space-y-4 p-5">
                  <div>
                    <label className="label">{t('orderForm.fullName')} *</label>
                    <input className="input" value={form.customerName}
                      onChange={set('customerName')} placeholder={t('orderForm.fullNamePlaceholder')} required />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="label">{t('orderForm.phone')} *</label>
                      <input className="input" type="tel" value={form.phone}
                        onChange={set('phone')} placeholder="05XX XX XX XX" required />
                    </div>
                    <div>
                      <label className="label">{t('orderForm.secondaryPhone')}</label>
                      <input className="input" type="tel" value={form.secondaryPhone}
                        onChange={set('secondaryPhone')} placeholder="06XX XX XX XX" />
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="label">{t('orderForm.wilaya')} *</label>
                      <select className="input" value={form.wilaya} onChange={set('wilaya')} required>
                        <option value="">{t('orderForm.selectWilaya')}</option>
                        {WILAYAS.map((w, i) => (
                          <option key={w} value={w}>
                            {String(i + 1).padStart(2, '0')} — {wilayaLabel(w, locale)}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="label">{t('orderForm.commune')} *</label>
                      <input className="input" value={form.commune}
                        onChange={set('commune')} placeholder={t('orderForm.communePlaceholder')} required />
                    </div>
                  </div>
                  <div>
                    <label className="label">{t('orderForm.address')} *</label>
                    <input className="input" value={form.address}
                      onChange={set('address')} placeholder={t('orderForm.addressPlaceholder')} required />
                  </div>
                  <div>
                    <label className="label">{t('orderForm.notes')}</label>
                    <textarea className="input" rows={2} value={form.notes}
                      onChange={set('notes')} placeholder={t('orderForm.notesPlaceholder')} />
                  </div>

                  {/* Quantity */}
                  <div>
                    <label className="label">{t('orderForm.quantity')}</label>
                    <div className="inline-flex items-center gap-1 rounded-xl border border-neutral-300 p-1">
                      <button type="button" aria-label="Decrease quantity"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="h-9 w-9 rounded-lg text-lg font-bold text-neutral-600 transition hover:bg-neutral-100">
                        −
                      </button>
                      <span className="w-10 text-center font-display text-base font-bold">
                        {quantity}
                      </span>
                      <button type="button" aria-label="Increase quantity"
                        onClick={() => setQuantity(Math.min(10, quantity + 1))}
                        className="h-9 w-9 rounded-lg text-lg font-bold text-neutral-600 transition hover:bg-neutral-100">
                        +
                      </button>
                    </div>
                  </div>

                  {/* Order summary */}
                  <div className="space-y-2 rounded-xl bg-neutral-50 p-4 text-sm">
                    <div className="flex justify-between text-neutral-600">
                      <span>{t('orderForm.subtotal')} ({quantity} × {formatPrice(product.price)})</span>
                      <span className="font-medium">{formatPrice(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-neutral-600">
                      <span>{t('orderForm.delivery')}{form.wilaya ? ` — ${wilayaLabel(form.wilaya, locale)}` : ''}</span>
                      <span className="font-medium">
                        {deliveryFee === null ? t('orderForm.selectWilayaFirst') : formatPrice(deliveryFee)}
                      </span>
                    </div>
                    <div className="flex justify-between border-t border-neutral-200 pt-2 font-display text-base font-bold">
                      <span>{t('orderForm.total')}</span>
                      <span className="text-gold-700">{formatPrice(total)}</span>
                    </div>
                  </div>

                  <button type="submit" disabled={submitting} className="btn-gold w-full !py-3.5">
                    {submitting ? t('orderForm.placing') : `${t('orderForm.confirmOrder')} — ${formatPrice(total)}`}
                  </button>
                  <p className="text-center text-xs text-neutral-400">
                    {t('orderForm.disclaimer')}
                  </p>
                </div>
              </form>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
