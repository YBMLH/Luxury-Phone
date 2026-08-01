// Pushes a "new order" message to the owner's Telegram the instant an order
// is placed, so orders are not missed when the dashboard tab is closed.
//
// Why Telegram and not email or push: it is free, it arrives instantly on a
// phone, it needs no Apple/Google push certificates, and it works on Algerian
// mobile networks. Setup is two environment variables — see docs below.
//
// Security notes, because this endpoint is public by necessity (the customer
// placing the order is not signed in):
//   * The request carries only an order number and a phone number. The
//     message is built from the *tracking* document those two values unlock,
//     never from the request body, so nobody can push arbitrary text to the
//     owner's Telegram by calling this endpoint.
//   * The tracking document holds no address, no name and no total, so no
//     personal data travels through Telegram. The owner opens the dashboard
//     for the details.
//   * An unknown order number simply returns "ignored".
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { SITE_URL } from '@/lib/constants';

export const runtime = 'nodejs';
// Every call must hit Firestore for a fresh check — never serve this cached.
export const dynamic = 'force-dynamic';

const TELEGRAM_API = 'https://api.telegram.org';

function clean(value, max = 40) {
  return String(value ?? '').trim().slice(0, max);
}

export async function POST(request) {
  const token = process.env.TELEGRAM_BOT_TOKEN;

  // One or several recipients, comma-separated, so the shop owner and whoever
  // else answers the phone can both be pinged without any code change:
  //   TELEGRAM_CHAT_ID=728019731,987654321
  // A group chat id (a negative number) works here too, and is the easier
  // option once more than two people need the alerts.
  const chatIds = String(process.env.TELEGRAM_CHAT_ID || '')
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean);

  // Not configured yet is a normal state, not an error — the store works
  // perfectly well without it, so don't make the order form look broken.
  if (!token || chatIds.length === 0) {
    return Response.json({ ok: true, sent: false, reason: 'not-configured' });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: 'bad-request' }, { status: 400 });
  }

  const orderNumber = clean(body.orderNumber, 20).toUpperCase();
  const phone = clean(body.phone, 15);
  if (!orderNumber || !phone) {
    return Response.json({ ok: false, error: 'bad-request' }, { status: 400 });
  }

  // The tracking document id is "orderNumber_phone", so this both proves the
  // order exists and proves the caller knew both halves of the pair.
  let tracking;
  try {
    const snap = await getDoc(doc(db, 'tracking', `${orderNumber}_${phone}`));
    if (!snap.exists()) {
      return Response.json({ ok: true, sent: false, reason: 'ignored' });
    }
    tracking = snap.data();
  } catch {
    return Response.json({ ok: false, error: 'lookup-failed' }, { status: 502 });
  }

  const text = [
    '🔔 *New order — LuxuryPhone24*',
    '',
    `*Order:* \`${orderNumber}\``,
    `*Product:* ${clean(tracking.productName, 150)}`,
    '',
    `[Open the dashboard](${SITE_URL}/admin/orders)`,
  ].join('\n');

  // Every recipient is attempted; one blocked or mistyped id must not stop
  // the others from being told about the order.
  const results = await Promise.allSettled(
    chatIds.map((chatId) =>
      fetch(`${TELEGRAM_API}/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          parse_mode: 'Markdown',
          disable_web_page_preview: true,
        }),
      }).then((response) => {
        if (!response.ok) throw new Error('telegram-rejected');
        return true;
      })
    )
  );

  const delivered = results.filter((r) => r.status === 'fulfilled').length;
  if (delivered === 0) {
    return Response.json({ ok: false, error: 'telegram-failed' }, { status: 502 });
  }

  return Response.json({ ok: true, sent: true, delivered, of: chatIds.length });
}
