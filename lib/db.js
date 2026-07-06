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
import { db, storage } from './firebase';
import { generateOrderNumber, normalizePhone, sanitizeText } from './utils';

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

export async function addProduct(data) {
  const docRef = await addDoc(collection(db, 'products'), {
    ...data,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function updateProduct(id, data) {
  await updateDoc(doc(db, 'products', id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteProduct(id, images = []) {
  await deleteDoc(doc(db, 'products', id));
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

const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

// Optional: free image hosting via ImgBB (https://api.imgbb.com) for stores
// that cannot enable Firebase Storage. If the key is set, uploads go to
// ImgBB; otherwise they go to Firebase Storage.
const IMGBB_KEY = process.env.NEXT_PUBLIC_IMGBB_API_KEY;

export async function uploadProductImage(file) {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error('Only JPG, PNG or WebP images are allowed.');
  }
  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error('Image must be smaller than 5 MB.');
  }
  return IMGBB_KEY ? uploadToImgbb(file) : uploadToFirebase(file);
}

async function uploadToImgbb(file) {
  const form = new FormData();
  form.append('image', file);
  const res = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_KEY}`, {
    method: 'POST',
    body: form,
  });
  const json = await res.json().catch(() => null);
  if (!json?.success || !json?.data?.url) {
    throw new Error('Upload failed — check your ImgBB API key.');
  }
  return json.data.url;
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
}

export async function deleteOrder(order) {
  await deleteDoc(doc(db, 'orders', order.id));
  await deleteDoc(
    doc(db, 'tracking', `${order.orderNumber}_${order.phone}`)
  ).catch(() => {});
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
}

/* ----------------------------------- Admins ---------------------------------- */

export async function isAdmin(uid) {
  if (!uid) return false;
  const snap = await getDoc(doc(db, 'admins', uid));
  return snap.exists();
}
