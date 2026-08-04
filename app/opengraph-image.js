// The picture that shows up when the shop's link is pasted into Facebook,
// Instagram, WhatsApp or TikTok. Without one, a shared link is a bare line of
// text — which for a shop that sells through those channels is most of the
// first impression.
//
// It is drawn here rather than shipped as a file so it can never fall out of
// step with the brand, and so there is no binary to keep in the repo.
import { ImageResponse } from 'next/og';

export const alt = 'LuxuryPhone24 — Boutique high-tech à Guelma';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '0 88px',
          backgroundColor: '#08080A',
          // Two soft gold pools over near-black — the marble panels the site
          // uses, flattened to what an OG renderer can actually draw. Satori
          // only understands the `circle at x y` form, not the two-radius one.
          backgroundImage:
            'radial-gradient(circle at 10% 0%, rgba(201,162,39,0.32), transparent 55%),' +
            'radial-gradient(circle at 100% 100%, rgba(201,162,39,0.24), transparent 55%)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            fontSize: 22,
            letterSpacing: 4,
            textTransform: 'uppercase',
            color: '#E2C86C',
          }}
        >
          <div style={{ width: 10, height: 10, borderRadius: 10, background: '#C9A227' }} />
          Guelma · Algérie
        </div>

        <div
          style={{
            marginTop: 26,
            fontSize: 96,
            fontWeight: 700,
            lineHeight: 1.04,
            color: '#FFFFFF',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <span>LuxuryPhone24</span>
          {/* Smaller than the name so the whole line stays on one row —
              wrapped, it crowds out everything below it. */}
          <span style={{ fontSize: 52, marginTop: 10, color: '#E2C86C' }}>
            Smartphones · Laptops · Accessoires
          </span>
        </div>

        <div style={{ marginTop: 34, fontSize: 30, color: '#B9B6AE', display: 'flex' }}>
          Produits 100% authentiques · Paiement à la livraison · 58 wilayas
        </div>

        <div
          style={{
            marginTop: 42,
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            fontSize: 26,
            color: '#E9E7E1',
          }}
        >
          <div
            style={{
              display: 'flex',
              padding: '12px 26px',
              borderRadius: 999,
              background: 'linear-gradient(100deg, #A88420, #E2C86C 55%, #C9A227)',
              color: '#100F0C',
              fontWeight: 700,
            }}
          >
            luxuryphone24.com
          </div>
        </div>
      </div>
    ),
    size
  );
}
