'use client';

// The hero fan holds whatever the owner marks as featured, which isn't always
// a phone. Rather than force every product into an iPhone body, the frame
// adapts to the category:
//   phone  — iPhone-style body with a Dynamic Island (a floating pill inset
//            from the top edge, not the older notch that hangs off it)
//   tablet — same body, uniform bezel, a small camera dot instead of an island
//   laptop — an open laptop: lid with the photo as its screen, hinge and base.
//            Landscape, so it sits centred in the portrait slot rather than
//            filling it.
//   plain  — no device chrome; the photo is shown whole on a tinted card, for
//            things with no obvious screen shape (headphones, chargers…)
const PHONE_CATEGORIES = ['smartphones', 'phone-cases'];

export function frameVariantFor(category) {
  if (PHONE_CATEGORIES.includes(category)) return 'phone';
  if (category === 'tablets') return 'tablet';
  if (category === 'laptops') return 'laptop';
  return 'plain';
}

const GLARE =
  'pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,transparent_34%,rgba(255,255,255,0.16)_47%,transparent_58%)]';

export default function DeviceFrame({
  image,
  alt = '',
  tint,
  priority = false,
  variant = 'phone',
}) {
  const imgProps = {
    src: image,
    alt,
    loading: priority ? 'eager' : 'lazy',
    fetchPriority: priority ? 'high' : 'auto',
  };

  if (variant === 'laptop') {
    // Slightly wider than the slot so the laptop still has presence next to
    // the taller phones; the base overhangs the lid as a real one does.
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="w-[122%]">
          <div className="rounded-t-[10px] bg-gradient-to-b from-neutral-500 to-neutral-700 p-[3px] shadow-[0_18px_35px_-14px_rgba(0,0,0,0.85)]">
            <div className="relative aspect-[16/10] overflow-hidden rounded-[7px] bg-neutral-950">
              {image ? (
                <img {...imgProps} className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full" style={{ background: tint }} />
              )}
              <div className={GLARE} />
            </div>
          </div>
          {/* Hinge / base, with the trackpad cut-out at the front edge. */}
          <div className="relative mx-auto h-[8px] w-[112%] rounded-b-[7px] bg-gradient-to-b from-neutral-400 via-neutral-500 to-neutral-700 shadow-[0_10px_18px_-10px_rgba(0,0,0,0.9)]">
            <div className="absolute left-1/2 top-0 h-[3px] w-[16%] -translate-x-1/2 rounded-b-full bg-neutral-700/80" />
          </div>
        </div>
      </div>
    );
  }

  // Anything with no obvious screen shape: show the product whole, centred,
  // with no fake device body around it.
  if (variant === 'plain') {
    // The card keeps the category tint behind the photo. A wide product shown
    // whole leaves a lot of empty space in a portrait slot, and a tinted
    // ground reads as intentional where flat black just looks unfinished.
    return (
      <div className="relative h-full w-full overflow-hidden rounded-[1.75rem] border border-white/10 bg-neutral-950 shadow-[0_22px_45px_-12px_rgba(0,0,0,0.8)]">
        {/* Tint sits on an opaque base — it carries alpha, so on its own the
            cards behind would show straight through this one. */}
        <div className="absolute inset-0" style={{ background: tint }} />
        {image && (
          <img {...imgProps} className="relative h-full w-full object-contain p-2.5" />
        )}
        <div className={GLARE} />
      </div>
    );
  }

  const isTablet = variant === 'tablet';

  return (
    <div
      className={`relative h-full w-full rounded-[1.75rem] bg-gradient-to-b from-neutral-600 via-neutral-800 to-neutral-950 shadow-[0_22px_45px_-12px_rgba(0,0,0,0.8)] ${
        isTablet ? 'p-[5px]' : 'p-[3px]'
      }`}
    >
      <div className="relative h-full w-full overflow-hidden rounded-[1.6rem] bg-neutral-950">
        {image ? (
          <img {...imgProps} className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full" style={{ background: tint }} />
        )}

        {isTablet ? (
          <div className="pointer-events-none absolute left-1/2 top-[7px] h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-black/80" />
        ) : (
          <div className="pointer-events-none absolute left-1/2 top-[6px] h-[6.5%] w-[32%] -translate-x-1/2 rounded-full bg-black shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]" />
        )}

        <div className={GLARE} />
      </div>
    </div>
  );
}
