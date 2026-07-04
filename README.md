# Luxury Phone — Premium Electronics Store 🏆

A complete, production-ready e-commerce website for **Luxury Phone** (Guelma, Algeria),
built to be **free to host** and **simple enough for one person to maintain**.

- 🛍️ Storefront: home, products with search & filters, product details with image zoom,
  about, contact, order tracking
- 🧾 Ordering: cash-on-delivery order form with all 58 Algerian wilayas — **no payment gateway**
- 🔐 Admin dashboard: products, images, orders, customers, site content, analytics —
  **everything editable without touching code**
- 💰 Cost: Firebase free tier (Spark) + Netlify free tier = **0 DA / month** for a small store

## Technology

| Part | Tool | Why |
|---|---|---|
| Website | Next.js + React + Tailwind CSS | Modern, fast, free to host |
| Animations | Framer Motion | Smooth premium feel |
| Database | Firebase Firestore | Free tier, no server to maintain |
| Login | Firebase Authentication | Secure admin access |
| Images | Firebase Storage | Free tier image hosting |
| Hosting | Netlify (free) | Automatic deploys from GitHub |

There is **no backend server, no Docker, no VPS, no SQL database**. The browser talks
directly to Firebase, and Firebase security rules (included in this repo) protect the data.

---

# Beginner Setup Guide

Follow these steps in order. Total time: about 30 minutes.

## 1. Install the project on your computer

You need [Node.js](https://nodejs.org) (version 18 or newer). Then:

```bash
# download the code
git clone <your-repo-url>
cd Luxury-Phone

# install the dependencies
npm install

# create your environment file (you will fill it in step 2)
cp .env.local.example .env.local
```

## 2. Create the Firebase project

1. Go to [console.firebase.google.com](https://console.firebase.google.com) and sign in with a Google account.
2. Click **Add project** → name it `luxury-phone` → you can disable Google Analytics → **Create project**.
3. On the project home page, click the **Web** icon (`</>`) to register a web app.
   Name it `luxury-phone-web` and click **Register app**.
4. Firebase shows you a `firebaseConfig` code block. Copy each value into your
   `.env.local` file:

```
NEXT_PUBLIC_FIREBASE_API_KEY=             ← apiKey
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=         ← authDomain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=          ← projectId
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=      ← storageBucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID= ← messagingSenderId
NEXT_PUBLIC_FIREBASE_APP_ID=              ← appId
```

> These values are safe to expose in the browser — real protection comes from the
> security rules you will install below. Just never commit `.env.local` to GitHub
> (it is already in `.gitignore`).

## 3. Configure Firebase Authentication (admin login)

1. In the Firebase Console: **Build → Authentication → Get started**.
2. Under **Sign-in method**, enable **Email/Password** (the first option only). Save.
3. Go to the **Users** tab → **Add user** → enter YOUR email and a strong password.
   This will be the store owner's dashboard login.
4. After creating the user, **copy its UID** (the long code in the User UID column).
   You need it in the next step.

## 4. Configure Firestore (the database)

1. **Build → Firestore Database → Create database**.
2. Choose a location close to Algeria (e.g. `europe-west1`) → start in **production mode**.
3. **Install the security rules**: open the **Rules** tab, delete everything there,
   paste the full content of the file [`firestore.rules`](./firestore.rules) from this
   repo, and click **Publish**.
4. **Make yourself an admin**: in the **Data** tab → **Start collection** →
   Collection ID: `admins` → for Document ID, paste **the UID you copied in step 3.4**
   → add these fields:

   | Field | Type | Value |
   |---|---|---|
   | `email` | string | your email |
   | `username` | string | your name |
   | `role` | string | `owner` |
   | `createdAt` | timestamp | (today) |

   Click **Save**. That's it — this user can now access the dashboard.

> To add another admin later: create the user in Authentication, then add a new
> document in the `admins` collection with that user's UID as the Document ID.

You do **not** need to create the other collections (`products`, `orders`,
`customers`, `settings`, `tracking`) — the website creates them automatically.

## 5. Product images — two options

### Option A: Firebase Storage (needs a payment card)

Since 2024, Google requires the Blaze (pay-as-you-go) plan to enable Storage on
new projects. Blaze still has generous free quotas — a small store pays ~$0 —
but it requires adding a card. If you can:

1. **Build → Storage → Get started** → keep the default bucket → **Done**.
2. Open the **Rules** tab, delete everything there, paste the full content of
   [`storage.rules`](./storage.rules) from this repo, and click **Publish**.
3. Set a budget alert of $1 during the upgrade to be safe.

### Option B: Free image links — no card needed (ImgBB)

Skip Firebase Storage entirely. The admin product form accepts **image links**:

1. Create a free account at [imgbb.com](https://imgbb.com).
2. Upload your product photo there → copy the **Direct link** (`https://i.ibb.co/…`).
3. Paste it in the product form's image field and click **Add**.

Even better — enable **direct uploads from the dashboard**: get a free API key at
[api.imgbb.com](https://api.imgbb.com) and add it to `.env.local` (and to Netlify's
environment variables) as:

```
NEXT_PUBLIC_IMGBB_API_KEY=your-imgbb-key
```

With the key set, the "click to upload" box in the product form sends images
straight to your ImgBB account — same experience, zero cost, no card.

## 6. Test locally, then deploy to Netlify

Test on your computer first:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you should see the store.
Open [http://localhost:3000/admin](http://localhost:3000/admin) and log in with the
email/password from step 3. Add a test product with an image to verify everything works.

### Deploy

1. Push this project to a GitHub repository (private is fine).
2. Go to [netlify.com](https://netlify.com) → sign up with GitHub (free).
3. **Add new site → Import an existing project → GitHub** → pick your repository.
4. Netlify detects Next.js automatically — leave the build settings as they are.
5. Before deploying, open **Site configuration → Environment variables** and add the
   **same 6 variables** from your `.env.local` file (same names, same values).
6. Click **Deploy site**. After 2–3 minutes your store is live on a
   `something.netlify.app` address.

From now on, every `git push` to your main branch automatically redeploys the site.

## 7. Connect a custom domain (optional)

1. Buy a domain (e.g. `luxuryphone-dz.com`) from any registrar (Namecheap, Hostinger…).
2. In Netlify: **Domain management → Add a domain** → enter your domain.
3. Follow Netlify's instructions to point the domain's DNS to Netlify
   (usually changing the nameservers at your registrar).
4. Netlify issues a free HTTPS certificate automatically.

---

# Daily use (for the store owner)

Everything is managed at **`yoursite.com/admin`** — no code, ever:

| Task | Where |
|---|---|
| Add / edit / delete products, upload images, set colors/storage/RAM, specs, stock, prices, Featured/Best Seller/New badges | **Products** |
| See new orders instantly, search/filter them, change status (Pending → Confirmed → … → Delivered), view full details, delete | **Orders** |
| See customers and their order history | **Customers** |
| Edit hero banner text, contact info, WhatsApp, social links, store locations + Google Maps, customer reviews, About page | **Site Content** |
| Sales stats: totals, pending/delivered, orders by wilaya, top products, monthly chart | **Dashboard** |

Customers order by filling a form (name, phone, wilaya, commune, address) — they pay
on delivery. They can check their order status on the **Track Order** page using
their order number + phone number.

## How to add a Google Map to a branch

1. Open [Google Maps](https://maps.google.com) and find the store.
2. Click **Share → Embed a map → Copy HTML**.
3. From the copied code, keep **only the link inside** `src="…"` (it starts with
   `https://www.google.com/maps/embed?...`).
4. Paste that link in **Admin → Site Content → Store Locations → Google Maps Embed URL** and save.

---

# Security — how it works

- **Admin-only dashboard**: `/admin` requires a Firebase login **and** the user's UID
  must exist in the `admins` Firestore collection. Adding admins is done only from
  the Firebase Console.
- **Firestore rules** (in `firestore.rules`): customers can only *create* orders
  (with field validation); reading, updating and deleting orders/customers is
  admin-only. Products and site content are publicly readable but admin-writable.
- **Order tracking privacy**: the tracking lookup requires both the order number and
  the phone number, and exposes only the status — never the address.
- **Image uploads** (in `storage.rules`): admin-only, images only (JPG/PNG/WebP),
  max 5 MB.
- **Input handling**: all forms are validated, text is sanitized before saving, and
  React escapes all output (XSS protection).
- **Rate limiting**: order submission and login attempts are throttled in the
  browser, and Firebase Authentication adds its own server-side lockout after
  repeated failed logins.
- **Secrets**: Firebase config lives in environment variables; nothing sensitive is
  committed to the repository.

# Staying inside the free tier

- Firestore free quota: 50,000 reads / 20,000 writes per day — a small store uses a
  tiny fraction of this.
- Storage free quota: 5 GB — compress product photos before uploading
  (use [squoosh.app](https://squoosh.app), aim for < 300 KB per image, WebP format).
- Netlify free tier: 100 GB bandwidth / month — far more than a small store needs.
- The site reads the product list once per page visit and caches nothing on a
  server, so there are no hidden costs anywhere.

# Project structure

```
app/
  (store)/           ← customer-facing pages (home, products, about, contact, track-order)
  admin/             ← protected dashboard (login, products, orders, customers, settings)
  layout.js          ← fonts, SEO metadata, toast notifications
components/          ← reusable UI (product cards, order form, skeletons, home sections…)
context/             ← shared state (admin auth session, site content)
lib/
  firebase.js        ← Firebase initialization (reads .env.local)
  db.js              ← ALL database operations in one file
  constants.js       ← categories, order statuses, the 58 wilayas
  defaults.js        ← default site content (before the owner edits it)
  utils.js           ← formatting, validation, order number generator
firestore.rules      ← database security rules (paste into Firebase Console)
storage.rules        ← image storage security rules (paste into Firebase Console)
netlify.toml         ← Netlify deployment configuration
```
