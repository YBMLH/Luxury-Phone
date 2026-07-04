'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { formatPrice, discountPercent } from '@/lib/utils';

export default function ProductCard({ product }) {
  const discount = discountPercent(product.price, product.oldPrice);
  const image = product.images?.[0];
  const outOfStock = Number(product.stock) <= 0;

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ duration: 0.25 }}
      className="group overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-card transition hover:border-gold/50 hover:shadow-card-hover"
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
                NEW
              </span>
            )}
            {product.bestseller && (
              <span className="rounded-full bg-marble px-2.5 py-1 text-xs font-bold text-gold-300">
                BEST SELLER
              </span>
            )}
          </div>

          {outOfStock && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/55">
              <span className="rounded-full border border-white/40 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-white">
                Out of stock
              </span>
            </div>
          )}
        </div>

        <div className="p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-gold-600">
            {product.brand}
          </p>
          <h3 className="mt-1 line-clamp-2 min-h-[2.5rem] text-sm font-medium text-neutral-800 group-hover:text-black">
            {product.name}
          </h3>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-lg font-bold text-neutral-900">
              {formatPrice(product.price)}
            </span>
            {discount > 0 && (
              <span className="text-xs text-neutral-400 line-through">
                {formatPrice(product.oldPrice)}
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
