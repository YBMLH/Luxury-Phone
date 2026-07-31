'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import ProductCard from '@/components/ProductCard';
import OrderForm from '@/components/OrderForm';
import Breadcrumbs from '@/components/Breadcrumbs';
import ProductReviews from '@/components/ProductReviews';
import { formatPrice, discountPercent } from '@/lib/utils';
import { useLanguage } from '@/context/LanguageContext';

function ZoomableImage({ src, alt }) {
  const [zoom, setZoom] = useState(false);
  const [origin, setOrigin] = useState('center');

  function handleMove(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setOrigin(`${x}% ${y}%`);
  }

  return (
    <div
      className="relative aspect-square cursor-zoom-in overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-50"
      onMouseEnter={() => setZoom(true)}
      onMouseLeave={() => setZoom(false)}
      onMouseMove={handleMove}
    >
      <img
        src={src}
        alt={alt}
        className="h-full w-full object-contain transition-transform duration-200"
        style={{
          transform: zoom ? 'scale(2)' : 'scale(1)',
          transformOrigin: origin,
        }}
      />
    </div>
  );
}

function OptionPicker({ label, options, value, onChange }) {
  if (!options?.length) return null;
  return (
    <div>
      <p className="mb-2 text-sm font-semibold text-neutral-700">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            className={`rounded-lg border px-4 py-2 text-sm font-medium transition ${
              value === option
                ? 'border-gold bg-gold/10 text-gold-700'
                : 'border-neutral-300 text-neutral-600 hover:border-neutral-400'
            }`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function ProductDetailClient({ product, related, breadcrumbItems }) {
  const { t } = useLanguage();
  const [activeImage, setActiveImage] = useState(0);
  const [color, setColor] = useState(product.colors?.[0] || '');
  const [storageOpt, setStorageOpt] = useState(product.storageOptions?.[0] || '');
  const [ram, setRam] = useState(product.ramOptions?.[0] || '');
  const [orderOpen, setOrderOpen] = useState(false);

  const discount = discountPercent(product.price, product.oldPrice);
  const inStock = Number(product.stock) > 0;
  const images = product.images?.length ? product.images : [null];
  const specs = product.specifications || [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:px-6">
      <Breadcrumbs items={breadcrumbItems} />

      <div className="grid gap-10 lg:grid-cols-2">
        {/* Gallery */}
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          {images[activeImage] ? (
            <ZoomableImage
              src={images[activeImage]}
              alt={`${product.name}${product.brand ? ` ${product.brand}` : ''} - LuxuryPhone24 Guelma`}
            />
          ) : (
            <div className="flex aspect-square items-center justify-center rounded-2xl bg-neutral-100 text-6xl text-neutral-300">
              📷
            </div>
          )}
          {images.length > 1 && (
            <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  aria-label={`${t('productDetail.viewPhoto')} ${i + 1}`}
                  className={`h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2 transition ${
                    activeImage === i ? 'border-gold' : 'border-neutral-200 hover:border-neutral-300'
                  }`}
                >
                  <img
                    src={img}
                    alt={`${product.name} - photo ${i + 1}`}
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </motion.div>

        {/* Info */}
        <motion.div
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="space-y-6"
        >
          <div>
            <div className="flex items-center gap-3">
              <p className="text-sm font-semibold uppercase tracking-widest text-gold-700">
                {product.brand}
              </p>
              <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs text-neutral-600">
                {t(`categories.${product.category}.label`)}
              </span>
            </div>
            <h1 className="mt-2 font-display text-3xl font-bold md:text-4xl">
              {product.name}
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className="text-3xl font-bold text-neutral-900">
              {formatPrice(product.price)}
            </span>
            {discount > 0 && (
              <>
                <span className="text-lg text-neutral-400 line-through">
                  {formatPrice(product.oldPrice)}
                </span>
                <span className="rounded-full bg-red-600 px-3 py-1 text-xs font-bold text-white">
                  {t('productDetail.save', { percent: discount })}
                </span>
              </>
            )}
          </div>

          <div className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium ${
            inStock ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}>
            <span className={`h-2 w-2 rounded-full ${inStock ? 'bg-green-500' : 'bg-red-500'}`} />
            {inStock ? t('productDetail.inStock') : t('productDetail.outOfStock')}
          </div>

          <OptionPicker label={t('productDetail.color')} options={product.colors} value={color} onChange={setColor} />
          <OptionPicker label={t('productDetail.storage')} options={product.storageOptions} value={storageOpt} onChange={setStorageOpt} />
          <OptionPicker label={t('productDetail.ram')} options={product.ramOptions} value={ram} onChange={setRam} />

          <button
            onClick={() => setOrderOpen(true)}
            disabled={!inStock}
            className="btn-gold w-full !py-4 !text-base sm:w-auto sm:!px-14"
          >
            {inStock ? t('productDetail.orderNow') : t('productDetail.outOfStock')}
          </button>

          {product.description && (
            <div>
              <h2 className="mb-2 font-display text-lg font-semibold">{t('productDetail.description')}</h2>
              <p className="whitespace-pre-line text-sm leading-relaxed text-neutral-600">
                {product.description}
              </p>
            </div>
          )}

          {specs.length > 0 && (
            <div>
              <h2 className="mb-3 font-display text-lg font-semibold">{t('productDetail.specifications')}</h2>
              <div className="overflow-hidden rounded-xl border border-neutral-200">
                {specs.map((spec, i) => (
                  <div
                    key={i}
                    className={`grid grid-cols-2 gap-4 px-4 py-3 text-sm ${
                      i % 2 === 0 ? 'bg-neutral-50' : 'bg-white'
                    }`}
                  >
                    <span className="font-medium text-neutral-700">{spec.key}</span>
                    <span className="text-neutral-600">{spec.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>

      <ProductReviews product={product} />

      {/* Related products */}
      {related.length > 0 && (
        <div className="mt-20">
          <h2 className="font-display text-2xl font-bold">{t('productDetail.youMayAlsoLike')}</h2>
          <div className="gold-line mt-3" />
          <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}

      <OrderForm
        product={product}
        selection={{ color, storage: storageOpt, ram }}
        open={orderOpen}
        onClose={() => setOrderOpen(false)}
      />
    </div>
  );
}
