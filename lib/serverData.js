// Server-side reads (Server Components only) for SEO metadata and
// structured data — the Firestore client SDK works fine for simple
// one-off reads in Node, so no separate admin SDK/service account is
// needed. Every caller should set `export const revalidate = 3600`
// (or similar) on its route so Firestore isn't hit on every request.
import { doc, getDoc, collection, getDocs, query, orderBy, limit, where } from 'firebase/firestore';
import { db } from './firebase';
import { mergeSettings } from './defaults';

export async function getSettingsServer() {
  try {
    const snap = await getDoc(doc(db, 'settings', 'site'));
    return mergeSettings(snap.exists() ? snap.data() : null);
  } catch {
    return mergeSettings(null);
  }
}

export async function getProductsServer(max = 500) {
  try {
    const snap = await getDocs(
      query(collection(db, 'products'), orderBy('createdAt', 'desc'), limit(max))
    );
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch {
    return [];
  }
}

// Targeted lookup (a single query + a fallback doc read) instead of
// pulling the whole catalog, so a product page costs at most 2 reads.
export async function getProductServer(slugOrId) {
  try {
    const bySlug = await getDocs(
      query(collection(db, 'products'), where('slug', '==', slugOrId), limit(1))
    );
    if (!bySlug.empty) {
      const d = bySlug.docs[0];
      return { id: d.id, ...d.data() };
    }
    const byId = await getDoc(doc(db, 'products', slugOrId));
    return byId.exists() ? { id: byId.id, ...byId.data() } : null;
  } catch {
    return null;
  }
}
