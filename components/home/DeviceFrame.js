'use client';

// An iPhone-style body with a Dynamic Island (a floating pill inset from the
// top edge — not the older notch that hangs off it). The product photo fills
// the screen; if a product has no photo yet, the screen falls back to a tint
// so the fan never renders an empty slab.
export default function DeviceFrame({ image, alt = '', tint, priority = false }) {
  return (
    <div className="relative h-full w-full rounded-[1.75rem] bg-gradient-to-b from-neutral-600 via-neutral-800 to-neutral-950 p-[3px] shadow-[0_22px_45px_-12px_rgba(0,0,0,0.8)]">
      <div className="relative h-full w-full overflow-hidden rounded-[1.6rem] bg-neutral-950">
        {image ? (
          <img
            src={image}
            alt={alt}
            loading={priority ? 'eager' : 'lazy'}
            fetchPriority={priority ? 'high' : 'auto'}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full" style={{ background: tint }} />
        )}

        {/* Dynamic Island */}
        <div className="pointer-events-none absolute left-1/2 top-[6px] h-[6.5%] w-[32%] -translate-x-1/2 rounded-full bg-black shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]" />

        {/* Screen glare */}
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,transparent_34%,rgba(255,255,255,0.16)_47%,transparent_58%)]" />
      </div>
    </div>
  );
}
