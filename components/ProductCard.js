'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { formatPrice, discountPercent } from '@/lib/utils';
import { useLanguage } from '@/context/LanguageContext';

// Full-bleed photo card with a frosted-glass info strip overlaid at the
// bottom (App Store / Apple Music style) — the photo itself is what the
// glass blurs, so the effect actually reads instead of sitting on flat
// white. 2-up grid on mobile, 3-4 up on larger screens.
export default function ProductCard({ product }) {
  const { t } = useLanguage();
  const discount = discountPercent(product.price, product.oldPrice);
  const image = product.images?.[0];
  const outOfStock = Number(product.stock) <= 0;

  const tag = product.newArrival
    ? { text: t('productDetail.newBadge') || 'NEW', className: 'text-gold-700' }
    : product.bestseller
    ? { text: t('productDetail.bestSellerBadge') || 'BEST SELLER', className: 'text-neutral-900' }
    : discount > 0
    ? { text: `-${discount}%`, className: 'text-red-600' }
    : null;

  return (
    <Link href={`/products/${product.slug || product.id}`} className="group block">
      <motion.div
        whileHover={{ y: -4 }}
        transition={{ duration: 0.2 }}
        className="relative aspect-square overflow-hidden rounded-2xl bg-neutral-100 shadow-md transition-shadow duration-300 group-hover:shadow-xl"
      >
        {image ? (
          <img
            src={image}
            alt={`${product.name}${product.brand ? ` ${product.brand}` : ''} - LuxuryPhone24 Guelma`}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-4xl text-neutral-300">
            📷
          </div>
        )}

        {/* Subtle depth graduation so the glass strip always reads, even
            over a bright/light product photo. */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/20 to-transparent" />

        {tag && (
          <span
            className={`absolute left-3 top-3 rounded-full border border-white/50 bg-white/60 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide backdrop-blur-md backdrop-saturate-150 ${tag.className}`}
          >
            {tag.text}
          </span>
        )}

        {outOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/35 backdrop-blur-md">
            <span className="rounded-full border border-white/40 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-white">
              {t('productDetail.outOfStock')}
            </span>
          </div>
        )}

        {/* Frosted glass info strip */}
        <div className="absolute inset-x-0 bottom-0 border-t border-white/40 bg-white/60 px-3 py-2.5 backdrop-blur-xl backdrop-saturate-150">
          <h3 className="line-clamp-2 text-sm font-medium text-neutral-900">
            {product.name}
          </h3>
          <div className="mt-0.5 flex items-center justify-between gap-2">
            <p className="truncate text-xs text-neutral-600">{product.brand}</p>
            <div className="flex shrink-0 items-center gap-1.5">
              <p className="text-sm font-semibold text-neutral-900">
                {formatPrice(product.price)}
              </p>
              {discount > 0 && (
                <p className="text-xs text-neutral-500 line-through">
                  {formatPrice(product.oldPrice)}
                </p>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
