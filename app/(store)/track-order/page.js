'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { trackOrder } from '@/lib/db';
import { ORDER_STATUSES } from '@/lib/constants';
import { isValidPhone, formatDate } from '@/lib/utils';

const STATUS_STEPS = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered'];

export default function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [notFound, setNotFound] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!orderNumber.trim()) return toast.error('Please enter your order number.');
    if (!isValidPhone(phone)) return toast.error('Please enter a valid phone number.');

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
      toast.error('Could not check the order right now. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const stepIndex = result ? STATUS_STEPS.indexOf(result.status) : -1;
  const cancelled = result?.status === 'Cancelled';

  return (
    <div className="mx-auto max-w-2xl px-4 py-14 md:px-6">
      <div className="mb-10 text-center">
        <h1 className="font-display text-3xl font-bold md:text-4xl">Track Your Order</h1>
        <div className="gold-line mx-auto mt-4" />
        <p className="mt-4 text-sm text-neutral-600">
          Enter the order number you received and the phone number you ordered with.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="marble-card space-y-4 rounded-2xl p-6">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-neutral-200">
            Order Number
          </label>
          <input
            className="input"
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            placeholder="e.g. LP-260704-4831"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-neutral-200">
            Phone Number
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
          {loading ? 'Checking…' : 'Track Order'}
        </button>
      </form>

      {notFound && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-6 text-center"
        >
          <p className="text-3xl">😕</p>
          <h2 className="mt-2 font-semibold text-red-800">Order not found</h2>
          <p className="mt-1 text-sm text-red-600">
            Double-check the order number and make sure the phone number is the
            same one used when ordering.
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
              <p className="text-xs uppercase tracking-widest text-neutral-400">Order</p>
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
              {result.status}
            </span>
          </div>

          <p className="mt-3 text-sm text-neutral-600">
            <span className="font-medium">{result.productName}</span>
            {result.createdAt && (
              <span className="text-neutral-400"> — ordered {formatDate(result.createdAt)}</span>
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
                        {step}
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
                Current status: <span className="font-semibold">{result.status}</span>
              </p>
            </div>
          )}

          {cancelled && (
            <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
              This order was cancelled. Contact us if you believe this is a mistake.
            </p>
          )}
        </motion.div>
      )}
    </div>
  );
}
