# LuxuryPhone24 — Production Readiness Audit

Prepared as a full-stack / security / SEO / QA / UX audit of the LuxuryPhone24
e-commerce site ahead of connecting a paid domain (**luxuryphone24.com**).
Covers what exists today, what was fixed in this pass, and what's
recommended before/after launch on the new domain.

**Stack**: Next.js 14 (App Router) · Firebase Auth + Firestore · Vercel ·
Tailwind CSS · Framer Motion. No SQL database, no Express/Node backend —
the browser talks to Firebase directly, secured by Firestore Security
Rules rather than a server-side API layer. This changes which parts of a
"standard" security checklist apply (see the Security Report for specifics).

---

## 1. Project Summary

LuxuryPhone24 is a bilingual/trilingual (French default, English, Arabic)
electronics storefront for a two-branch shop in Guelma, Algeria. Customers
browse products, place cash-on-delivery orders to any of Algeria's 58
wilayas, and track orders by order number + phone. The owner manages
everything — products, orders, customers, site content, delivery fees,
FAQ/reviews/locations — from a self-serve admin dashboard, with no code
changes required for day-to-day operation.

The entire stack runs on free tiers (Firebase Spark plan, Vercel Hobby)
and is designed to be maintained by one non-technical-to-semi-technical
owner, which shaped several architecture choices documented below (e.g.
`images.unoptimized: true`, client-Firestore instead of a custom backend).

## 2. Feature List

**Storefront**
- Home, Products (search/filter/sort), Product Detail, About, Contact,
  Track Order — all with SEO metadata, canonical URLs, and JSON-LD
- 10 product categories, per-product colors/storage/RAM/specs/stock
- Cash-on-delivery checkout with live delivery-fee lookup per wilaya
- Order tracking by order number + phone (no login required)
- FAQ section with schema markup, customer reviews, two-branch locations
- Fixed-parallax hero, horizontal featured-products carousel
- Full French/English/Arabic UI, WhatsApp floating contact button
- Mobile-first responsive design throughout

**Admin Dashboard** (`/admin`, Firebase-Auth gated)
- Dashboard home: KPIs, monthly order chart, top wilayas/products, low-stock
  banner, one-click JSON backup download
- Products: create/edit/duplicate/delete, image upload (3 hosting options),
  low-stock badges
- Orders: search, status filter, status update, CSV export, WhatsApp/call
  shortcuts, pagination
- Customers: order history per customer, search, pagination
- **Activity Log** (new): immutable audit trail of every product/order/
  settings change an admin makes — who, what, when
- Site Content: hero, contact info, social links, two branch locations,
  reviews, delivery fees per wilaya, image-hosting configuration — all
  editable without touching code

## 3. Security Report

### Architecture note
There's no SQL database (Firestore/NoSQL) and no custom backend server —
the client talks to Firebase directly. So:
- *"SQL injection"* → not applicable; the equivalent risk is unauthorized
  Firestore reads/writes, which is what **Firestore Security Rules**
  guard against (present and reviewed below).
- *"CSRF"* → not applicable in the traditional cookie-session sense;
  Firebase Auth uses bearer tokens sent explicitly by the SDK, not
  ambient cookies a third-party site could ride on.
- *"Password hashing"* → handled entirely by Firebase Auth (Google-managed,
  never touches app code).

### What's in place
| Control | Status |
|---|---|
| Firestore Security Rules | ✅ Field-level `hasOnly()` allowlists + type/length/range validation on every public write path (orders, tracking, customers) |
| Admin RBAC | ✅ `admins/{uid}` collection gate, checked both client-side (UX) and in Firestore rules (real enforcement) |
| Rate limiting | ✅ Client-side throttle on login (1/3s) and order submission (1/60s); Firebase Auth's own backend also throttles repeated bad passwords |
| Input sanitization | ✅ `sanitizeText()` strips `<`/`>` before any Firestore write; React escapes all rendered output by default |
| **XSS in JSON-LD (fixed this pass)** | Admin-entered text (product name/description) could contain `</script><script>…` and break out of a structured-data `<script>` tag under raw `JSON.stringify`. Fixed with a `safeJsonLd()` helper that escapes `<` before injection. |
| **CSV/formula injection (fixed this pass)** | Order export now neutralizes any customer-entered field starting with `=`, `+`, `-`, `@` so it can't execute as a formula when opened in Excel/Sheets. |
| Secrets | ✅ Firebase web config is intentionally public (client identifiers, not secrets); real access control is Firestore Rules. Cloudinary/ImgBB keys stay in `.env*` files, which are gitignored. |
| Security headers | ✅ `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`, and now `Strict-Transport-Security` (added this pass), mirrored in both `vercel.json` and `netlify.toml` |
| File upload validation | ✅ Type allowlist (JPEG/PNG/WebP) + 15MB cap before any upload/compression |
| Audit trail | ✅ New immutable `activityLogs` collection — no update/delete allowed by rules, so it can't be tampered with after the fact |
| Secure error pages | ✅ Custom `error.js`/`global-error.js`/`not-found.js` — no stack traces or default Next.js error screens ever reach a visitor |

### Recommended before/after going live on luxuryphone24.com
1. **Content-Security-Policy**: not added this pass. A CSP for this stack
   needs to allowlist Firebase's auth/Firestore domains, Google Fonts (if
   not self-hosted — this app self-hosts via `next/font`, so that's fine),
   the Google Maps embed iframe, and GA4's script domain if analytics is
   enabled. Getting this exactly right requires testing against the *live*
   Firebase backend, which wasn't reachable from the sandbox this work was
   done in — shipping an untested CSP risks silently breaking login or
   checkout. Recommended policy to add via `vercel.json` once you can test it:
   ```
   default-src 'self';
   script-src 'self' 'unsafe-inline' https://www.googletagmanager.com;
   connect-src 'self' https://*.googleapis.com https://firestore.googleapis.com https://identitytoolkit.googleapis.com https://www.google-analytics.com;
   img-src 'self' data: https:;
   frame-src https://www.google.com;
   style-src 'self' 'unsafe-inline';
   ```
2. **Firebase Console → Authentication → Authorized domains**: add
   `luxuryphone24.com` and `www.luxuryphone24.com` the day you connect the
   domain — logins will fail with `auth/unauthorized-domain` until you do.
3. **Rotate/limit the ImgBB key** if it's ever used — it's a low-sensitivity
   key but still shouldn't be shared publicly.
4. Consider Firebase App Check (free) at some point to stop non-browser
   scripts from hammering your Firestore quota — not urgent at current
   scale, worth it if traffic grows a lot.

## 4. SEO Report

(Full per-page keyword/intent breakdown was delivered in the previous SEO
pass — summarized here for completeness.)

- Unique, length-tuned title tags and meta descriptions on every page
- Canonical URLs everywhere, now driven by a single `SITE_URL` constant —
  **when you buy luxuryphone24.com, set `NEXT_PUBLIC_SITE_URL` in Vercel
  and every canonical/OG/sitemap/JSON-LD URL updates automatically**, no
  code changes needed
- Open Graph + Twitter Card metadata on every page
- JSON-LD: `ElectronicsStore`/LocalBusiness (both branches, sitewide),
  `Product` + `BreadcrumbList` (product pages), `FAQPage` (home)
- SEO-friendly product URLs (`/products/iphone-16-pro-max`) with automatic
  slug generation and ID fallback (old links never 404)
- `sitemap.xml` includes every product URL automatically; `robots.txt`
  disallows only `/admin`
- Hero LCP image preloaded; lazy-loading on all below-the-fold images
- Descriptive, non-stuffed alt text throughout
- Google Search Console / GA4 integration points wired but inactive until
  you set `NEXT_PUBLIC_GSC_VERIFICATION` / `NEXT_PUBLIC_GA_ID`

**Next SEO step after the domain switch**: submit the new domain to Google
Search Console, submit `luxuryphone24.com/sitemap.xml`, and set up a 301
redirect from the old `luxury-phone.vercel.app` (Vercel does this
automatically once you assign the new domain as primary).

## 5. Performance Report

- Static generation for all storefront pages except the product detail
  route (server-rendered per slug, `revalidate = 3600` — Firestore is hit
  at most once an hour per product, not per visit)
- `next/font` self-hosts fonts (no external font request/render-blocking)
- Images are compressed client-side before upload (`lib/imageCompress.js`)
  and served as WebP data URLs or via a CDN (Cloudinary), with
  `images.unoptimized: true` — a deliberate tradeoff to stay on Vercel's
  free tier rather than pay for its image optimization quota
- Admin tables now paginate (25/page) instead of rendering unbounded lists
  — keeps the dashboard fast as order/customer history grows
- No unnecessary client-side re-fetching: product detail page fetches
  once, server-side, and passes data down as props instead of double
  fetching client + server

**Not done / acceptable tradeoff**: no CDN-level caching layer beyond
Vercel's own edge network, no Redis/query cache — unnecessary at this
traffic scale and would add operational complexity a solo owner doesn't
need.

## 6. Testing Report

**Verified this pass**:
- `npx next build` passes cleanly after every change (no type/syntax
  errors, no broken imports)
- All new/changed routes return correct HTTP status codes (200 for real
  pages, real 404 — not a soft 404 — for a non-existent product slug)
- JSON-LD blocks confirmed to still parse as valid JSON after the XSS
  escaping fix (checked with `JSON.parse` against the rendered HTML)
- Admin activity/orders/customers pagination renders and paginates correctly

**Known limitation**: this working environment has no network access to
the live Firestore backend or to Vercel — confirmed repeatedly via
`ERR_CONNECTION_RESET`/`ERR_TUNNEL_CONNECTION_FAILED` and Firestore's own
"could not reach backend" warning. That means real end-to-end flows
(placing a live order, logging in as the real admin, uploading a real
image) could **not** be exercised in this session. They were verified
architecturally (rules match the exact fields the app writes, functions
call the right Firestore paths) but **you should manually smoke-test the
following on the live site after this deploy**:
- [ ] Place a real test order and confirm it appears in Admin → Orders
- [ ] Change an order's status and confirm the tracking page reflects it
- [ ] Log into `/admin`, add a product, confirm it appears on the storefront
- [ ] Confirm the new Admin → Activity Log page shows those actions
- [ ] Export Orders as CSV and open it in Excel — confirm accents render
      correctly and no cell shows a security warning
- [ ] Test the order form and login form on an actual mobile device

## 7. Deployment Checklist

- [ ] Buy `luxuryphone24.com`
- [ ] In Vercel → Project → Domains, add `luxuryphone24.com` (and `www`),
      follow Vercel's DNS instructions with your registrar
- [ ] In Vercel → Project → Environment Variables, set
      `NEXT_PUBLIC_SITE_URL=https://luxuryphone24.com` and redeploy
- [ ] In Firebase Console → Authentication → Settings → Authorized
      domains, add `luxuryphone24.com` and `www.luxuryphone24.com`
- [ ] Re-publish `firestore.rules` in Firebase Console (this pass added
      the `activityLogs` rules — old rules would reject the new writes)
- [ ] Verify `https://luxuryphone24.com/sitemap.xml` and `/robots.txt`
      resolve correctly once DNS propagates
- [ ] Submit the new domain + sitemap to Google Search Console
- [ ] Run through the manual smoke-test checklist in section 6
- [ ] Optional: set `NEXT_PUBLIC_GA_ID` for Google Analytics once ready

## 8. Maintenance Recommendations

- **Weekly**: glance at Admin → Activity Log to spot anything unexpected
  (unexpected deletes, off-hours changes)
- **Monthly**: download a backup from Admin → Dashboard and store it
  somewhere outside Firebase (Google Drive, email to yourself)
- **As the catalog grows past a few hundred products**: consider adding
  server-side pagination (Firestore cursors) instead of the current
  fetch-all-then-paginate-client-side approach used on Orders/Customers —
  fine today, would start costing more reads at real scale
- **If traffic grows significantly**: enable Firebase App Check (free) and
  revisit the Firestore free-tier read/write quotas
- **Revisit the CSP** recommendation in section 3 once you can test
  against the live domain
- Keep dependencies current: `npm outdated` every few months, since this
  is a small, actively-maintained dependency set (Next.js, Firebase,
  Framer Motion, Tailwind) with no exotic packages to worry about
