'use client';

// The order form shown when a customer clicks "Order Now".
// No payment — the order is saved to Firestore and the store owner
// contacts the customer to confirm.
import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { createOrder } from '@/lib/db';
import { WILAYAS } from '@/lib/constants';
import { formatPrice, isValidPhone, checkRateLimit } from '@/lib/utils';

export default function OrderForm({ product, selection, open, onClose }) {
  const [form, setForm] = useState({
    customerName: '',
    phone: '',
    secondaryPhone: '',
    wilaya: '',
    commune: '',
    address: '',
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [orderNumber, setOrderNumber] = useState(null);

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  async function handleSubmit(e) {
    e.preventDefault();

    if (!form.customerName.trim() || form.customerName.trim().length < 3) {
      return toast.error('Please enter your full name.');
    }
    if (!isValidPhone(form.phone)) {
      return toast.error('Please enter a valid Algerian phone number.');
    }
    if (form.secondaryPhone && !isValidPhone(form.secondaryPhone)) {
      return toast.error('The secondary phone number is not valid.');
    }
    if (!form.wilaya) return toast.error('Please select your wilaya.');
    if (!form.commune.trim()) return toast.error('Please enter your commune.');
    if (!form.address.trim()) return toast.error('Please enter your full address.');

    // Basic anti-spam: one order per browser per 60 seconds.
    const rate = checkRateLimit('order', 60);
    if (!rate.allowed) {
      return toast.error(`Please wait ${rate.wait}s before ordering again.`);
    }

    setSubmitting(true);
    try {
      const number = await createOrder({
        ...form,
        productId: product.id,
        productName: product.name,
        productImage: product.images?.[0] || '',
        price: product.price,
        color: selection.color,
        storage: selection.storage,
        ram: selection.ram,
      });
      setOrderNumber(number);
      toast.success('Order placed successfully!');
    } catch (err) {
      console.error(err);
      toast.error('Something went wrong. Please try again.');
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
                <h2 className="font-display text-2xl font-bold">Order Received!</h2>
                <p className="mt-2 text-sm text-neutral-600">
                  Thank you, {form.customerName.split(' ')[0]}. We will call you
                  shortly to confirm your order.
                </p>
                <div className="marble mt-6 rounded-xl p-5">
                  <p className="text-xs uppercase tracking-widest text-neutral-400">
                    Your order number
                  </p>
                  <p className="mt-1 font-mono text-2xl font-bold text-gold-300">
                    {orderNumber}
                  </p>
                </div>
                <p className="mt-3 text-xs text-neutral-500">
                  Save this number — you can use it with your phone number to
                  track your order at any time.
                </p>
                <div className="mt-6 flex flex-col gap-3">
                  <Link href="/track-order" className="btn-gold w-full">
                    Track My Order
                  </Link>
                  <button onClick={onClose} className="btn-outline w-full">
                    Continue Shopping
                  </button>
                </div>
              </div>
            ) : (
              /* --------------------------- Order form -------------------------- */
              <form onSubmit={handleSubmit}>
                <div className="marble flex items-start justify-between rounded-t-2xl p-5">
                  <div>
                    <h2 className="font-display text-xl font-bold text-white">
                      Complete Your Order
                    </h2>
                    <p className="mt-1 text-xs text-neutral-400">
                      Pay on delivery — no online payment required.
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
                        .join(' · ') || 'Standard'}
                    </p>
                    <p className="text-sm font-bold text-gold-700">
                      {formatPrice(product.price)}
                    </p>
                  </div>
                </div>

                <div className="space-y-4 p-5">
                  <div>
                    <label className="label">Full Name *</label>
                    <input className="input" value={form.customerName}
                      onChange={set('customerName')} placeholder="e.g. Mohamed Benali" required />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="label">Phone Number *</label>
                      <input className="input" type="tel" value={form.phone}
                        onChange={set('phone')} placeholder="05XX XX XX XX" required />
                    </div>
                    <div>
                      <label className="label">Second Phone (optional)</label>
                      <input className="input" type="tel" value={form.secondaryPhone}
                        onChange={set('secondaryPhone')} placeholder="06XX XX XX XX" />
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="label">Wilaya *</label>
                      <select className="input" value={form.wilaya} onChange={set('wilaya')} required>
                        <option value="">Select wilaya…</option>
                        {WILAYAS.map((w, i) => (
                          <option key={w} value={w}>{String(i + 1).padStart(2, '0')} — {w}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="label">Commune *</label>
                      <input className="input" value={form.commune}
                        onChange={set('commune')} placeholder="Your commune" required />
                    </div>
                  </div>
                  <div>
                    <label className="label">Full Address *</label>
                    <input className="input" value={form.address}
                      onChange={set('address')} placeholder="Street, building, landmarks…" required />
                  </div>
                  <div>
                    <label className="label">Notes (optional)</label>
                    <textarea className="input" rows={2} value={form.notes}
                      onChange={set('notes')} placeholder="Anything we should know?" />
                  </div>

                  <button type="submit" disabled={submitting} className="btn-gold w-full !py-3.5">
                    {submitting ? 'Placing order…' : `Confirm Order — ${formatPrice(product.price)}`}
                  </button>
                  <p className="text-center text-xs text-neutral-400">
                    We will call you to confirm before shipping. Payment on delivery.
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
