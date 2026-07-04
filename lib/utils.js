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
