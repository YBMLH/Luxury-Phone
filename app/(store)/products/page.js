import { SITE_URL as BASE_URL } from '@/lib/constants';
import ProductsClient from './ProductsClient';
const title = 'Nos Produits — Smartphones, Laptops et Accessoires';
const description =
  'Découvrez tous les produits LuxuryPhone24 : smartphones, laptops, tablettes et accessoires 100% authentiques. Livraison rapide à Guelma et dans toute l’Algérie.';

export const metadata = {
  // No brand name in the raw title — the root layout's template
  // ("%s | LuxuryPhone24") appends it automatically.
  title,
  description,
  alternates: { canonical: `${BASE_URL}/products` },
  openGraph: {
    title,
    description,
    url: `${BASE_URL}/products`,
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title,
    description,
  },
};

export default function ProductsPage() {
  return <ProductsClient />;
}
