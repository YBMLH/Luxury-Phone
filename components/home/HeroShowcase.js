'use client';

// A fanned trio of devices that continuously rotates: the centre device slides
// back to one side while the next one swings forward. Each device also floats
// on its own slow cycle so the group is never completely still.
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import DeviceFrame from './DeviceFrame';
import { formatPrice, hexToRgba } from '@/lib/utils';
import { CATEGORY_ACCENTS } from '@/lib/constants';
import { useLanguage } from '@/context/LanguageContext';

const AUTO_ADVANCE_MS = 3400;

// Only the three nearest devices are drawn; anything further is hidden so the
// fan stays clean no matter how many products are featured.
const FAN = {
  '-1': { rotateY: 30, rotate: -8, y: 18, scale: 0.86, z: -130, opacity: 1 },
  '0': { rotateY: 0, rotate: 0, y: 0, scale: 1, z: 0, opacity: 1 },
  '1': { rotateY: -30, rotate: 8, y: 18, scale: 0.86, z: -130, opacity: 1 },
};

// Shortest signed distance around the ring, so the item just before the active
// one sits on the left rather than wrapping all the way around to the right.
function signedOffset(index, active, count) {
  let offset = index - active;
  if (offset > count / 2) offset -= count;
  if (offset < -count / 2) offset += count;
  return offset;
}

export default function HeroShowcase({ products }) {
  const { t } = useLanguage();
  const reduceMotion = useReducedMotion();
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [compact, setCompact] = useState(true);
  const dragStartX = useRef(null);
  const count = products.length;

  // Two sizes rather than a continuous measure — the fan only needs to fit a
  // phone screen or a desktop column, nothing in between matters.
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    const apply = () => setCompact(!mq.matches);
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);

  useEffect(() => {
    if (paused || count <= 1 || reduceMotion) return;
    const id = setInterval(() => setActive((a) => (a + 1) % count), AUTO_ADVANCE_MS);
    return () => clearInterval(id);
  }, [paused, count, reduceMotion]);

  if (!count) return null;

  const spread = compact ? 74 : 104;
  const deviceW = compact ? 116 : 150;
  const deviceH = compact ? 232 : 300;

  const go = (delta) => setActive((a) => (a + delta + count) % count);

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

  const activeProduct = products[active];

  return (
    <div
      className="relative mx-auto w-full max-w-md select-none"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
    >
      <div
        className="relative"
        style={{ perspective: '1100px', height: deviceH + 70 }}
      >
        {products.map((product, i) => {
          const offset = signedOffset(i, active, count);
          if (Math.abs(offset) > 1) return null;

          const pose = FAN[String(offset)];
          const isActive = offset === 0;
          const accent = CATEGORY_ACCENTS[product.category] || '#C9A227';

          return (
            <motion.div
              key={product.id}
              className="absolute left-1/2 top-1/2"
              style={{ width: deviceW, height: deviceH, transformStyle: 'preserve-3d' }}
              animate={{
                x: offset * spread - deviceW / 2,
                y: pose.y - deviceH / 2,
                z: pose.z,
                rotateY: pose.rotateY,
                rotate: pose.rotate,
                scale: pose.scale,
                zIndex: 10 - Math.abs(offset),
              }}
              transition={{ type: 'spring', stiffness: 190, damping: 26 }}
            >
              {/* Inner wrapper owns the idle float so it doesn't fight the
                  position spring on the outer one. */}
              <motion.div
                className="h-full w-full"
                animate={reduceMotion ? {} : { y: [0, isActive ? -12 : -7, 0] }}
                transition={
                  reduceMotion
                    ? {}
                    : {
                        duration: isActive ? 4.2 : 5.4,
                        repeat: Infinity,
                        ease: 'easeInOut',
                        delay: i * 0.4,
                      }
                }
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
                  className="block h-full w-full rounded-[1.75rem]"
                  style={{ boxShadow: `0 30px 60px -22px ${hexToRgba(accent, 0.75)}` }}
                >
                  <DeviceFrame
                    image={product.images?.[0]}
                    alt={isActive ? `${product.name} — LuxuryPhone24` : ''}
                    tint={`linear-gradient(155deg, #17131f, ${hexToRgba(accent, 0.75)})`}
                    priority={i === 0}
                  />
                </Link>
              </motion.div>
            </motion.div>
          );
        })}
      </div>

      {/* Name + price for whichever device is forward */}
      {activeProduct && (
        <motion.div
          key={activeProduct.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="mt-1 text-center"
        >
          <p className="truncate text-sm font-medium text-white/90">{activeProduct.name}</p>
          <p className="font-display text-base font-bold text-gold-300">
            {formatPrice(activeProduct.price)}
          </p>
        </motion.div>
      )}

      {count > 1 && (
        <>
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label={t('hero.showcase.previous')}
            className="absolute -left-3 top-1/2 z-20 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-white/10 text-white backdrop-blur-md transition hover:bg-white/20 sm:flex"
          >
            ←
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            aria-label={t('hero.showcase.next')}
            className="absolute -right-3 top-1/2 z-20 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-white/10 text-white backdrop-blur-md transition hover:bg-white/20 sm:flex"
          >
            →
          </button>

          <div className="mt-3 flex justify-center gap-1.5">
            {products.map((product, i) => (
              <button
                key={product.id}
                type="button"
                onClick={() => setActive(i)}
                aria-label={`${t('hero.showcase.goTo')} ${i + 1}`}
                aria-current={i === active ? 'true' : undefined}
                className={`h-1.5 rounded-full transition-all ${
                  i === active ? 'w-5 bg-gold' : 'w-1.5 bg-white/30'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
