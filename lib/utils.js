// Small shared helpers.

export function formatPrice(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return '—';
  return `${n.toLocaleString('fr-DZ')} DA`;
}

export function discountPercent(price, oldPrice) {
  const p = Number(price);
  const o = Number(oldPrice);
  if (!o || !p || o <= p) return 0;
  return Math.round(((o - p) / o) * 100);
}

// Generates a human-friendly unique order number like "LP-260704-4831".
export function generateOrderNumber() {
  const d = new Date();
  const date = [
    String(d.getFullYear()).slice(2),
    String(d.getMonth() + 1).padStart(2, '0'),
    String(d.getDate()).padStart(2, '0'),
  ].join('');
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `LP-${date}-${rand}`;
}

// Keep only digits (Algerian phone numbers), used to normalise phone input.
export function normalizePhone(phone) {
  return String(phone || '').replace(/\D/g, '');
}

export function isValidPhone(phone) {
  const digits = normalizePhone(phone);
  return /^0(5|6|7)\d{8}$/.test(digits) || /^0(2|3|4)\d{7}$/.test(digits);
}

// Strip characters that have meaning in HTML. React already escapes output,
// this is an extra layer for values stored in Firestore.
export function sanitizeText(value, maxLength = 500) {
  return String(value || '')
    .replace(/[<>]/g, '')
    .trim()
    .slice(0, maxLength);
}

export function formatDate(timestamp) {
  if (!timestamp) return '—';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Delivery fee for a wilaya: per-wilaya override, or the default fee.
export function deliveryFeeFor(delivery, wilaya) {
  const override = Number(delivery?.fees?.[wilaya]);
  if (Number.isFinite(override) && override >= 0 && delivery?.fees?.[wilaya] !== '') {
    return override;
  }
  return Number(delivery?.defaultFee) || 0;
}

// Safely serializes an object for a <script type="application/ld+json">
// tag rendered via dangerouslySetInnerHTML. Plain JSON.stringify does not
// escape "<", so admin-entered text containing "</script><script>…" could
// break out of the tag and execute — escaping it to < closes that off
// without changing how any JSON-LD consumer (Google, validators) reads it.
export function safeJsonLd(value) {
  return JSON.stringify(value).replace(/</g, '\\u003c');
}

// Turns a product name into a clean URL segment, e.g.
// "iPhone 16 Pro Max — 256GB" -> "iphone-16-pro-max-256gb".
// Handles Arabic/French accented input by stripping anything that isn't
// a plain ASCII letter/number after normalizing diacritics.
export function slugify(text) {
  return String(text || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // strip accents (é -> e)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

// Very small client-side rate limiter using localStorage.
// Blocks repeated submissions from the same browser within `seconds`.
export function checkRateLimit(key, seconds = 60) {
  if (typeof window === 'undefined') return { allowed: true };
  try {
    const last = Number(localStorage.getItem(`rl_${key}`) || 0);
    const now = Date.now();
    if (now - last < seconds * 1000) {
      const wait = Math.ceil((seconds * 1000 - (now - last)) / 1000);
      return { allowed: false, wait };
    }
    localStorage.setItem(`rl_${key}`, String(now));
    return { allowed: true };
  } catch {
    return { allowed: true };
  }
}
