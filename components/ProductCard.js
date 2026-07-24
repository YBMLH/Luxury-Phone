'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { formatPrice, discountPercent } from '@/lib/utils';
import { useLanguage } from '@/context/LanguageContext';

export default function ProductCard({ product }) {
  const { t } = useLanguage();
  const discount = discountPercent(product.price, product.oldPrice);
  const image = product.images?.[0];
  const outOfStock = Number(product.stock) <= 0;

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ duration: 0.25 }}
      className="group overflow-hidden rounded-[1.75rem] border border-neutral-200/80 bg-white shadow-sm transition hover:shadow-card-hover"
    >
      <Link href={`/products/${product.id}`}>
        <div className="relative aspect-square overflow-hidden bg-neutral-100">
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

          <div className="absolute left-3 top-3 flex flex-col gap-1.5">
            {discount > 0 && (
              <span className="rounded-full bg-red-600 px-2.5 py-1 text-xs font-bold text-white">
                -{discount}%
              </span>
            )}
            {product.newArrival && (
              <span className="rounded-full bg-gold px-2.5 py-1 text-xs font-bold text-black">
                {t('productDetail.newBadge') || 'NEW'}
              </span>
            )}
            {product.bestseller && (
              <span className="rounded-full bg-neutral-950 px-2.5 py-1 text-xs font-bold text-gold-300">
                {t('productDetail.bestSellerBadge') || 'BEST SELLER'}
              </span>
            )}
          </div>

          {outOfStock && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/55">
              <span className="rounded-full border border-white/40 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-white">
                {t('productDetail.outOfStock')}
              </span>
            </div>
          )}
        </div>

        <div className="p-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-gold-600">
            {t(`categories.${product.category}.label`)}
          </p>
          <div className="mt-1.5 flex items-start justify-between gap-3">
            <h3 className="line-clamp-2 min-h-[2.6rem] font-display text-base font-bold leading-snug">
              {product.name}
            </h3>
            <div className="shrink-0 text-right">
              <p className="font-display text-base font-bold">
                {formatPrice(product.price)}
              </p>
              {discount > 0 && (
                <p className="text-xs text-neutral-400 line-through">
                  {formatPrice(product.oldPrice)}
                </p>
              )}
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <p className="text-xs text-neutral-500">{product.brand}</p>
            <span className="chip-dark">{t('productDetail.orderChip')}</span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
