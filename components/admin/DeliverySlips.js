'use client';

// Printable delivery slips. One A5-ish block per order with everything the
// courier needs — who, where, what, and how much to collect — so parcels stop
// being labelled by hand off the screen.
//
// The slips live in the normal page but are hidden until printing; the print
// stylesheet in globals.css hides everything else instead of opening a new
// window, which keeps popup blockers out of it.
import { useEffect } from 'react';
import { formatPrice, formatDate } from '@/lib/utils';
import { wilayaLabel } from '@/lib/constants';

export default function DeliverySlips({ orders, shopName, shopPhone, locale, t, onDone }) {
  useEffect(() => {
    if (!orders?.length) return;

    // Let React paint the slips before the print dialog freezes the page.
    const frame = requestAnimationFrame(() => {
      window.print();
      onDone?.();
    });

    return () => cancelAnimationFrame(frame);
  }, [orders, onDone]);

  if (!orders?.length) return null;

  return (
    <div className="print-slips" aria-hidden="true">
      {orders.map((order) => {
        const amount = Number(order.total) || Number(order.price) || 0;
        return (
          <article key={order.id} className="slip">
            <header className="slip-head">
              <div>
                <p className="slip-shop">{shopName}</p>
                {shopPhone && <p className="slip-muted">{shopPhone}</p>}
              </div>
              <div className="slip-right">
                <p className="slip-number">{order.orderNumber}</p>
                <p className="slip-muted">{formatDate(order.createdAt)}</p>
              </div>
            </header>

            <section className="slip-to">
              <p className="slip-label">{t('admin.slip.deliverTo')}</p>
              <p className="slip-name">{order.customerName}</p>
              <p className="slip-line">{order.address}</p>
              <p className="slip-line">
                {order.commune}, {wilayaLabel(order.wilaya, locale)}
              </p>
              <p className="slip-phone">
                {order.phone}
                {order.secondaryPhone ? ` · ${order.secondaryPhone}` : ''}
              </p>
            </section>

            <table className="slip-table">
              <tbody>
                <tr>
                  <th>{t('admin.orders.fields.product')}</th>
                  <td>
                    {order.productName}
                    {[order.color, order.storage, order.ram].filter(Boolean).length > 0 && (
                      <span className="slip-muted">
                        {' '}
                        ({[order.color, order.storage, order.ram].filter(Boolean).join(' / ')})
                      </span>
                    )}
                  </td>
                </tr>
                <tr>
                  <th>{t('admin.orders.fields.quantity')}</th>
                  <td>{order.quantity || 1}</td>
                </tr>
                {order.courier && (
                  <tr>
                    <th>{t('admin.orders.courier')}</th>
                    <td>
                      {order.courier}
                      {order.parcelNumber ? ` · ${order.parcelNumber}` : ''}
                    </td>
                  </tr>
                )}
                {order.notes && (
                  <tr>
                    <th>{t('admin.orders.fields.notes')}</th>
                    <td>{order.notes}</td>
                  </tr>
                )}
              </tbody>
            </table>

            <footer className="slip-total">
              <span>{t('admin.slip.collect')}</span>
              <strong>{formatPrice(amount)}</strong>
            </footer>
          </article>
        );
      })}
    </div>
  );
}
