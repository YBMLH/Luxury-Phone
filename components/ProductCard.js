'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { formatPrice, discountPercent } from '@/lib/utils';
import { useLanguage } from '@/context/LanguageContext';

// Nike-style catalogue card: no bordered/shadowed box — just a rounded
// product photo with a plain text stack underneath (tag, name, brand,
// price). Works as a clean 2-up grid on mobile.
export default function ProductCard({ product }) {
  const { t } = useLanguage();
  const discount = discountPercent(product.price, product.oldPrice);
  const image = product.images?.[0];
  const outOfStock = Number(product.stock) <= 0;

  const tag = product.newArrival
    ? { text: t('productDetail.newBadge') || 'NEW', className: 'text-gold-600' }
    : product.bestseller
    ? { text: t('productDetail.bestSellerBadge') || 'BEST SELLER', className: 'text-neutral-900' }
    : discount > 0
    ? { text: `-${discount}%`, className: 'text-red-600' }
    : null;

  return (
    <Link href={`/products/${product.id}`} className="group block">
      <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
        <div className="relative aspect-square overflow-hidden rounded-2xl bg-neutral-100">
          {image ? (
            <img
              src={image}
              alt={product.name}
              loading="lazy"
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-4xl text-neutral-300">
              📷
            </div>
          )}

          {outOfStock && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/55">
              <span className="rounded-full border border-white/40 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-white">
                {t('productDetail.outOfStock')}
              </span>
            </div>
          )}
        </div>

        <div className="pt-3">
          {tag && (
            <p className={`text-xs font-semibold uppercase tracking-wide ${tag.className}`}>
              {tag.text}
            </p>
          )}
          <h3 className="mt-1 line-clamp-2 text-sm font-medium text-neutral-900">
            {product.name}
          </h3>
          <p className="mt-0.5 text-sm text-neutral-500">{product.brand}</p>
          <div className="mt-1 flex items-center gap-2">
            <p className="text-sm font-semibold text-neutral-900">
              {formatPrice(product.price)}
            </p>
            {discount > 0 && (
              <p className="text-sm text-neutral-400 line-through">
                {formatPrice(product.oldPrice)}
              </p>
            )}
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
