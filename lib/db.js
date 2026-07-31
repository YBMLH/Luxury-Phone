// All Firestore / Storage operations live in this one file so the rest of
// the app never talks to Firebase directly. If you ever need to change how
// data is stored, this is the only file to touch.
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  increment,
  onSnapshot,
} from 'firebase/firestore';
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';
import { db, storage, auth } from './firebase';
import { generateOrderNumber, normalizePhone, sanitizeText, slugify } from './utils';
import { compressImage, compressToDataUrl } from './imageCompress';

/* ---------------------------------- Products --------------------------------- */

export async function getProducts() {
  const snap = await getDocs(
    query(collection(db, 'products'), orderBy('createdAt', 'desc'))
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getProduct(id) {
  const snap = await getDoc(doc(db, 'products', id));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

// Looks a product up by its SEO-friendly slug (used for the public
// /products/[slug] page); falls back to treating the value as a raw
// document ID so old links (or admin previews) never 404.
export async function getProductBySlug(slugOrId) {
  const bySlug = await getDocs(
    query(collection(db, 'products'), where('slug', '==', slugOrId), limit(1))
  );
  if (!bySlug.empty) {
    const d = bySlug.docs[0];
    return { id: d.id, ...d.data() };
  }
  return getProduct(slugOrId);
}

async function generateUniqueSlug(name) {
  const base = slugify(name) || 'product';
  let candidate = base;
  let attempt = 1;
  // Only re-queries if the base slug is already taken — nearly always a
  // single extra read.
  while (attempt < 20) {
    const snap = await getDocs(
      query(collection(db, 'products'), where('slug', '==', candidate), limit(1))
    );
    if (snap.empty) return candidate;
    attempt += 1;
    candidate = `${base}-${attempt}`;
  }
  return `${base}-${Date.now()}`;
}

export async function addProduct(data) {
  const slug = await generateUniqueSlug(data.name);
  const docRef = await addDoc(collection(db, 'products'), {
    ...data,
    slug,
    createdAt: serverTimestamp(),
  });
  logActivity('product.create', { productId: docRef.id, name: data.name });
  return docRef.id;
}

export async function updateProduct(id, data) {
  const patch = { ...data, updatedAt: serverTimestamp() };

  // Products saved before slugs existed fall back to their database id in the
  // URL — /products/gtpmMKb8L09juVa1pEUn — which reads as broken and gives
  // Google no keywords. Fill the gap on the next save.
  //
  // Only ever *adds* a missing slug: rewriting one that already exists would
  // break every link already shared and everything Google has indexed.
  try {
    const existing = await getDoc(doc(db, 'products', id));
    if (existing.exists() && !existing.data().slug && data.name) {
      patch.slug = await generateUniqueSlug(data.name);
    }
  } catch {
    // A failed lookup must not stop the owner saving their edit.
  }

  await updateDoc(doc(db, 'products', id), patch);
  logActivity('product.update', { productId: id, name: data.name });
}

export async function deleteProduct(id, images = []) {
  await deleteDoc(doc(db, 'products', id));
  logActivity('product.delete', { productId: id });
  // Clean up Firebase Storage images so free-tier space is never wasted.
  // Images hosted elsewhere (ImgBB, pasted links) are simply left alone.
  await Promise.allSettled(
    images
      .filter((url) => String(url).includes('firebasestorage'))
      .map((url) => {
        try {
          return deleteObject(ref(storage, url));
        } catch {
          return Promise.resolve();
        }
      })
  );
}

/* ----------------------------------- Images ---------------------------------- */

const MAX_IMAGE_BYTES = 15 * 1024 * 1024; // 15 MB before compression
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

// Upload a product image. Every image is compressed in the browser first
// (see lib/imageCompress.js) so pages load fast. Where it goes depends on
// `config.imageHost` (from site settings):
//   'database'  → stored right inside Firestore as a compressed data URL
//                 (no external service, no account — the default)
//   'cloudinary'→ free Cloudinary CDN (auto-optimized delivery)
//   'imgbb'     → free ImgBB
//   'firebase'  → Firebase Storage (needs the Blaze plan)
// Legacy behaviour: if imageHost is unset, use Cloudinary/ImgBB when
// configured, otherwise fall back to the database.
export async function uploadProductImage(file, config = {}) {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error('Only JPG, PNG or WebP images are allowed.');
  }
  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error('Image is too large (max 15 MB).');
  }

  const cloud = config.cloudinary;
  const cloudReady = Boolean(cloud?.cloudName && cloud?.uploadPreset);
  const imgbbKey = config.imgbbApiKey || process.env.NEXT_PUBLIC_IMGBB_API_KEY;

  let host = config.imageHost;
  if (!host) host = cloudReady ? 'cloudinary' : imgbbKey ? 'imgbb' : 'database';

  // The database path keeps the original file (compressToDataUrl does its own
  // resizing); the hosted paths upload a compressed File.
  if (host === 'database') return compressToDataUrl(file);

  const compressed = await compressImage(file);
  if (host === 'cloudinary') {
    if (!cloudReady) throw new Error('Cloudinary is not set up in the Images tab.');
    return uploadToCloudinary(compressed, cloud);
  }
  if (host === 'imgbb') {
    if (!imgbbKey) throw new Error('No ImgBB key set in the Images tab.');
    return uploadToImgbb(compressed, imgbbKey);
  }
  return uploadToFirebase(compressed);
}

async function uploadToCloudinary(file, { cloudName, uploadPreset }) {
  const form = new FormData();
  form.append('file', file);
  form.append('upload_preset', uploadPreset);
  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    { method: 'POST', body: form }
  );
  const json = await res.json().catch(() => null);
  if (!json?.secure_url) {
    throw new Error(
      'Upload failed — check your Cloudinary cloud name and upload preset in Site Content → Images.'
    );
  }
  // f_auto,q_auto makes Cloudinary serve the smallest modern format at the
  // best quality for each visitor — the key to fast image loading.
  return json.secure_url.replace('/upload/', '/upload/f_auto,q_auto/');
}

async function uploadToImgbb(file, key) {
  const form = new FormData();
  form.append('image', file);
  const res = await fetch(`https://api.imgbb.com/1/upload?key=${key}`, {
    method: 'POST',
    body: form,
  });
  const json = await res.json().catch(() => null);
  if (!json?.success || !json?.data) {
    throw new Error('Upload failed — check your ImgBB key in Site Content → Images.');
  }
  return json.data.display_url || json.data.url;
}

async function uploadToFirebase(file) {
  const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const path = `products/${Date.now()}_${safeName}`;
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file, { contentType: file.type });
  return getDownloadURL(storageRef);
}

/* ----------------------------------- Orders ---------------------------------- */

export async function createOrder(order) {
  const orderNumber = generateOrderNumber();
  const phone = normalizePhone(order.phone);

  const cleanOrder = {
    orderNumber,
    customerName: sanitizeText(order.customerName, 100),
    phone,
    secondaryPhone: normalizePhone(order.secondaryPhone) || '',
    wilaya: sanitizeText(order.wilaya, 50),
    commune: sanitizeText(order.commune, 100),
    address: sanitizeText(order.address, 300),
    productId: order.productId,
    productName: sanitizeText(order.productName, 150),
    productImage: order.productImage || '',
    price: Number(order.price) || 0,
    quantity: Math.min(99, Math.max(1, Math.round(Number(order.quantity) || 1))),
    deliveryFee: Math.max(0, Number(order.deliveryFee) || 0),
    total: Math.max(0, Number(order.total) || 0),
    color: sanitizeText(order.color, 50),
    storage: sanitizeText(order.storage, 50),
    ram: sanitizeText(order.ram, 50),
    notes: sanitizeText(order.notes, 500),
    status: 'Pending',
    createdAt: serverTimestamp(),
  };

  await addDoc(collection(db, 'orders'), cleanOrder);

  // Public tracking document: readable only by someone who knows BOTH the
  // order number and the phone number (they form the document ID).
  // It contains no address or personal details beyond the status.
  await setDoc(doc(db, 'tracking', `${orderNumber}_${phone}`), {
    orderNumber,
    productName: cleanOrder.productName,
    status: 'Pending',
    createdAt: serverTimestamp(),
  });

  // Upsert the customer record (keyed by phone number).
  await setDoc(
    doc(db, 'customers', phone),
    {
      fullName: cleanOrder.customerName,
      phone,
      wilaya: cleanOrder.wilaya,
      ordersCount: increment(1),
      lastOrderAt: serverTimestamp(),
    },
    { merge: true }
  );

  return orderNumber;
}

export async function trackOrder(orderNumber, phone) {
  const id = `${String(orderNumber).trim().toUpperCase()}_${normalizePhone(phone)}`;
  const snap = await getDoc(doc(db, 'tracking', id));
  return snap.exists() ? snap.data() : null;
}

export async function getOrders() {
  const snap = await getDocs(
    query(collection(db, 'orders'), orderBy('createdAt', 'desc'))
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// Live feed of the newest orders, used by the admin to announce an order the
// moment it is placed. Returns the unsubscribe function — always call it on
// unmount, or the listener keeps billing reads in the background.
export function subscribeToOrders(onOrders, max = 60) {
  return onSnapshot(
    query(collection(db, 'orders'), orderBy('createdAt', 'desc'), limit(max)),
    (snap) => onOrders(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
    () => {
      // A dropped listener must not take the dashboard down with it; the
      // pages that need data have their own one-off reads.
    }
  );
}

export async function getOrdersByPhone(phone) {
  // Sorted in JavaScript (not in the query) so no Firestore composite
  // index needs to be created manually.
  const snap = await getDocs(
    query(collection(db, 'orders'), where('phone', '==', normalizePhone(phone)))
  );
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
}

// Statuses that mean the goods have left the shelf. Stock moves when the
// order reaches one of these, not when the customer clicks "order" — a
// browsing customer isn't signed in and can't be allowed to write to the
// product catalogue, and with cash on delivery an unconfirmed order is not
// yet a sale. `stockApplied` on the order makes this idempotent, so
// flipping Confirmed → Shipped → Confirmed never double-counts.
const COMMITTED_STATUSES = ['Confirmed', 'Processing', 'Shipped', 'Delivered'];

export async function updateOrderStatus(order, status) {
  const wasCommitted = !!order.stockApplied;
  const nowCommitted = COMMITTED_STATUSES.includes(status);
  const quantity = Math.max(1, Number(order.quantity) || 1);

  const patch = { status };
  if (order.productId && wasCommitted !== nowCommitted) {
    patch.stockApplied = nowCommitted;
    // Firestore's atomic increment means two people confirming at once can't
    // clobber each other's arithmetic.
    await updateDoc(doc(db, 'products', order.productId), {
      stock: increment(nowCommitted ? -quantity : quantity),
    }).catch(() => {
      // A product deleted since the order was placed shouldn't block the
      // status change — the order still needs to move.
      delete patch.stockApplied;
    });
  }

  await updateDoc(doc(db, 'orders', order.id), patch);

  // Keep the public tracking document in sync.
  await setDoc(
    doc(db, 'tracking', `${order.orderNumber}_${order.phone}`),
    { status },
    { merge: true }
  );

  // Per-customer delivery record, which is what makes repeat no-shows
  // visible before you send another parcel out.
  if (order.phone && status !== order.status) {
    const counters = {};
    if (status === 'Delivered') counters.deliveredCount = increment(1);
    if (status === 'Cancelled') counters.cancelledCount = increment(1);
    // Moving *away* from a final status takes the tally back with it.
    if (order.status === 'Delivered' && status !== 'Delivered') {
      counters.deliveredCount = increment(-1);
    }
    if (order.status === 'Cancelled' && status !== 'Cancelled') {
      counters.cancelledCount = increment(-1);
    }
    if (Object.keys(counters).length) {
      await setDoc(doc(db, 'customers', order.phone), counters, { merge: true }).catch(() => {});
    }
  }

  logActivity('order.status_change', {
    orderNumber: order.orderNumber,
    from: order.status,
    to: status,
  });
}

// Courier name and parcel number, filled in when the parcel is handed over.
export async function setOrderDelivery(order, { courier, parcelNumber }) {
  await updateDoc(doc(db, 'orders', order.id), {
    courier: sanitizeText(courier, 60),
    parcelNumber: sanitizeText(parcelNumber, 60),
  });
  logActivity('order.delivery_update', {
    orderNumber: order.orderNumber,
    courier,
    parcelNumber,
  });
}

export async function deleteOrder(order) {
  // Deleting a confirmed order puts its units back on the shelf, otherwise
  // the count drifts down every time an order is tidied away.
  if (order.stockApplied && order.productId) {
    await updateDoc(doc(db, 'products', order.productId), {
      stock: increment(Math.max(1, Number(order.quantity) || 1)),
    }).catch(() => {});
  }
  await deleteDoc(doc(db, 'orders', order.id));
  await deleteDoc(
    doc(db, 'tracking', `${order.orderNumber}_${order.phone}`)
  ).catch(() => {});
  logActivity('order.delete', { orderNumber: order.orderNumber });
}

/* --------------------------------- Customers --------------------------------- */

export async function getCustomers() {
  const snap = await getDocs(
    query(collection(db, 'customers'), orderBy('lastOrderAt', 'desc'))
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/* ---------------------------------- Settings --------------------------------- */

export async function getSettings() {
  const snap = await getDoc(doc(db, 'settings', 'site'));
  return snap.exists() ? snap.data() : null;
}

export async function saveSettings(data) {
  await setDoc(doc(db, 'settings', 'site'), data, { merge: true });
  logActivity('settings.update', {});
}

/* --------------------------- Category background images ------------------------ */

// Kept in their own collection (one small document per category) rather
// than inside the single settings document — that document has Firestore's
// 1 MiB size cap, and filling in a background photo for several categories
// would eventually blow past it. A separate doc per category has no such
// shared ceiling.
export async function getCategoryImages() {
  const snap = await getDocs(collection(db, 'categoryImages'));
  const map = {};
  snap.docs.forEach((d) => {
    map[d.id] = d.data().url;
  });
  return map;
}

export async function setCategoryImage(categoryId, url) {
  if (!url) {
    await deleteDoc(doc(db, 'categoryImages', categoryId));
  } else {
    await setDoc(doc(db, 'categoryImages', categoryId), { url });
  }
  logActivity('settings.category_image_update', { categoryId, cleared: !url });
}

/* ------------------------------- Activity log --------------------------------- */

// Immutable audit trail of admin actions. Writes are best-effort — a
// logging failure must never block the real action it's recording.
async function logActivity(action, details = {}) {
  try {
    await addDoc(collection(db, 'activityLogs'), {
      action,
      details,
      adminEmail: auth.currentUser?.email || 'unknown',
      adminUid: auth.currentUser?.uid || null,
      createdAt: serverTimestamp(),
    });
  } catch {
    // Ignore — never let audit logging break the admin's real action.
  }
}

// Capped at 500 to bound read cost; the admin UI paginates client-side
// over this window, which is plenty for a single-store dashboard.
export async function getActivityLogs(max = 500) {
  const snap = await getDocs(
    query(collection(db, 'activityLogs'), orderBy('createdAt', 'desc'), limit(max))
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}


/* --------------------------------- Blocklist --------------------------------- */

// A one-document-per-phone blocklist. Its documents are readable by anyone
// who already knows the phone number (the number IS the document id) but the
// collection can never be listed, so blocking someone doesn't publish a list
// of your customers. The order form checks this before writing an order.
export async function isPhoneBlocked(phone) {
  try {
    const snap = await getDoc(doc(db, 'blocklist', normalizePhone(phone)));
    return snap.exists();
  } catch {
    // Never let a failed lookup stop a genuine customer from ordering.
    return false;
  }
}

export async function setPhoneBlocked(phone, blocked, reason = '') {
  const id = normalizePhone(phone);
  if (blocked) {
    await setDoc(doc(db, 'blocklist', id), {
      phone: id,
      reason: sanitizeText(reason, 200),
      createdAt: serverTimestamp(),
    });
  } else {
    await deleteDoc(doc(db, 'blocklist', id));
  }
  await setDoc(doc(db, 'customers', id), { blocked }, { merge: true }).catch(() => {});
  logActivity(blocked ? 'customer.block' : 'customer.unblock', { phone: id, reason });
}

/* ---------------------------------- Reviews ---------------------------------- */

// Customers submit reviews unauthenticated, so every one lands as
// approved:false and stays invisible until the owner approves it. That is
// the only thing standing between the product pages and review spam.
export async function createReview({ productId, productName, name, rating, comment }) {
  await addDoc(collection(db, 'reviews'), {
    productId: sanitizeText(productId, 60),
    productName: sanitizeText(productName, 150),
    name: sanitizeText(name, 60),
    rating: Math.min(5, Math.max(1, Math.round(Number(rating) || 5))),
    comment: sanitizeText(comment, 600),
    approved: false,
    createdAt: serverTimestamp(),
  });
}

export async function getApprovedReviews(productId) {
  try {
    // Filtered on approval only, then narrowed and sorted in JavaScript, so
    // no composite Firestore index has to be created by hand.
    const snap = await getDocs(
      query(collection(db, 'reviews'), where('approved', '==', true), limit(300))
    );
    return snap.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .filter((r) => !productId || r.productId === productId)
      .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
  } catch {
    return [];
  }
}

export async function getAllReviews(max = 300) {
  const snap = await getDocs(
    query(collection(db, 'reviews'), orderBy('createdAt', 'desc'), limit(max))
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function setReviewApproved(review, approved) {
  await updateDoc(doc(db, 'reviews', review.id), { approved });
  logActivity(approved ? 'review.approve' : 'review.unapprove', {
    reviewId: review.id,
    productName: review.productName,
  });
}

export async function deleteReview(review) {
  await deleteDoc(doc(db, 'reviews', review.id));
  logActivity('review.delete', { reviewId: review.id, productName: review.productName });
}

/* ---------------------------------- Restore ---------------------------------- */

// Writes a downloaded backup file back into Firestore. Deliberately additive:
// it overwrites documents that share an id and leaves everything else alone,
// so a restore can never wipe data that isn't in the file.
export async function restoreBackup(backup, { products: doProducts, settings: doSettings, customers: doCustomers } = {}) {
  const results = { products: 0, settings: 0, customers: 0 };

  if (doProducts && Array.isArray(backup.products)) {
    for (const product of backup.products) {
      const { id, ...data } = product;
      if (!id) continue;
      await setDoc(doc(db, 'products', id), data, { merge: true });
      results.products += 1;
    }
  }

  if (doSettings && backup.settings) {
    await setDoc(doc(db, 'settings', 'site'), backup.settings, { merge: true });
    results.settings = 1;
  }

  if (doCustomers && Array.isArray(backup.customers)) {
    for (const customer of backup.customers) {
      const { id, ...data } = customer;
      if (!id) continue;
      await setDoc(doc(db, 'customers', id), data, { merge: true });
      results.customers += 1;
    }
  }

  logActivity('backup.restore', results);
  return results;
}

/* ----------------------------------- Admins ---------------------------------- */

export async function isAdmin(uid) {
  if (!uid) return false;
  const snap = await getDoc(doc(db, 'admins', uid));
  return snap.exists();
}

// Accounts created before roles existed have no role field; treating that as
// "owner" keeps the existing account working exactly as it did.
export async function getAdminRole(uid) {
  if (!uid) return null;
  try {
    const snap = await getDoc(doc(db, 'admins', uid));
    if (!snap.exists()) return null;
    return snap.data().role === 'staff' ? 'staff' : 'owner';
  } catch {
    return null;
  }
}
