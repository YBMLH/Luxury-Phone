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
  await updateDoc(doc(db, 'products', id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
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

export async function updateOrderStatus(order, status) {
  await updateDoc(doc(db, 'orders', order.id), { status });
  // Keep the public tracking document in sync.
  await setDoc(
    doc(db, 'tracking', `${order.orderNumber}_${order.phone}`),
    { status },
    { merge: true }
  );
  logActivity('order.status_change', {
    orderNumber: order.orderNumber,
    from: order.status,
    to: status,
  });
}

export async function deleteOrder(order) {
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

/* ----------------------------------- Admins ---------------------------------- */

export async function isAdmin(uid) {
  if (!uid) return false;
  const snap = await getDoc(doc(db, 'admins', uid));
  return snap.exists();
}
