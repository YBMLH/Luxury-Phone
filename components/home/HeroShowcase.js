'use client';

// A 3D "coverflow" style carousel of real product photos — the active
// card sits forward and centered, side cards tilt away in perspective.
// Auto-advances, and can be driven by drag, arrows, or the dots.
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { formatPrice } from '@/lib/utils';
import { useLanguage } from '@/context/LanguageContext';

const AUTO_ADVANCE_MS = 3200;

// Shortest signed distance from `index` to `active` around a circle of
// size `count` — e.g. with 5 items, the item one-before-active wraps to
// offset -1 instead of +4, so it tilts the natural way on either side.
function signedOffset(index, active, count) {
  let offset = index - active;
  if (offset > count / 2) offset -= count;
  if (offset < -count / 2) offset += count;
  return offset;
}

export default function HeroShowcase({ products }) {
  const { t } = useLanguage();
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const dragStartX = useRef(null);
  const count = products.length;

  useEffect(() => {
    if (paused || count <= 1) return;
    const id = setInterval(() => {
      setActive((a) => (a + 1) % count);
    }, AUTO_ADVANCE_MS);
    return () => clearInterval(id);
  }, [paused, count]);

  if (!count) return null;

  function go(delta) {
    setActive((a) => (a + delta + count) % count);
  }

  function handlePointerDown(e) {
    dragStartX.current = e.clientX;
    setPaused(true);
  }
  function handlePointerUp(e) {
    if (dragStartX.current === null) return;
    const delta = e.clientX - dragStartX.current;
    if (delta > 40) go(-1);
    else if (delta < -40) go(1);
    dragStartX.current = null;
    setPaused(false);
  }

  return (
    <div
      className="relative mx-auto h-[300px] w-full max-w-md select-none sm:h-[360px] md:h-[400px] md:max-w-lg"
      style={{ perspective: '1400px' }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
    >
      {/* Soft gold glow behind the stack */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-52 w-52 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold/25 blur-3xl" />

      <div className="relative h-full w-full" style={{ transformStyle: 'preserve-3d' }}>
        {products.map((product, i) => {
          const offset = signedOffset(i, active, count);
          const isActive = offset === 0;
          const abs = Math.abs(offset);
          if (abs > 2) return null;

          const image = product.images?.[0];

          return (
            <motion.div
              key={product.id}
              className="absolute left-1/2 top-1/2 h-[230px] w-[230px] sm:h-[280px] sm:w-[280px] md:h-[300px] md:w-[300px]"
              style={{ transformStyle: 'preserve-3d' }}
              animate={{
                x: '-50%',
                y: '-50%',
                translateX: offset * 92,
                translateZ: -abs * 110,
                rotateY: offset * -32,
                scale: isActive ? 1 : 0.76,
                opacity: 1,
                zIndex: 100 - abs,
              }}
              transition={{ type: 'spring', stiffness: 260, damping: 28 }}
            >
              <Link
                href={`/products/${product.slug || product.id}`}
                aria-hidden={!isActive}
                tabIndex={isActive ? 0 : -1}
                onClick={(e) => {
                  if (!isActive) {
                    e.preventDefault();
                    setActive(i);
                  }
                }}
                className="block h-full w-full"
              >
                <motion.div
                  animate={isActive ? { y: [0, -10, 0] } : { y: 0 }}
                  transition={isActive ? { duration: 3.2, repeat: Infinity, ease: 'easeInOut' } : {}}
                  className="flex h-full w-full flex-col overflow-hidden rounded-[1.75rem] bg-white shadow-2xl ring-1 ring-black/5"
                >
                  <div className="relative flex-1 overflow-hidden bg-neutral-50">
                    {image ? (
                      <img
                        src={image}
                        alt={`${product.name} - LuxuryPhone24`}
                        loading={isActive ? 'eager' : 'lazy'}
                        fetchPriority={isActive ? 'high' : 'auto'}
                        className="h-full w-full object-contain p-6"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-5xl text-neutral-300">
                        📱
                      </div>
                    )}
                  </div>
                  {isActive && (
                    <div className="border-t border-white/50 bg-white/55 px-4 py-3 text-center backdrop-blur-xl backdrop-saturate-150">
                      <p className="truncate text-sm font-semibold text-neutral-900">{product.name}</p>
                      <p className="text-sm font-bold text-gold-700">{formatPrice(product.price)}</p>
                    </div>
                  )}
                </motion.div>
              </Link>
            </motion.div>
          );
        })}
      </div>

      {count > 1 && (
        <>
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label={t('hero.showcase.previous')}
            className="glass absolute left-0 top-1/2 z-20 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full text-neutral-700 transition hover:text-gold-700 sm:flex"
          >
            ←
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            aria-label={t('hero.showcase.next')}
            className="glass absolute right-0 top-1/2 z-20 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full text-neutral-700 transition hover:text-gold-700 sm:flex"
          >
            →
          </button>

          <div className="absolute -bottom-2 left-1/2 z-20 flex -translate-x-1/2 gap-1.5">
            {products.map((product, i) => (
              <button
                key={product.id}
                type="button"
                onClick={() => setActive(i)}
                aria-label={`${t('hero.showcase.goTo')} ${i + 1}`}
                aria-current={i === active ? 'true' : undefined}
                className={`h-1.5 rounded-full transition-all ${
                  i === active ? 'w-5 bg-gold' : 'w-1.5 bg-neutral-300'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
