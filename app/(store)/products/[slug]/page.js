import { notFound } from 'next/navigation';
import { getProductServer, getProductsServer } from '@/lib/serverData';
import { formatPrice, safeJsonLd } from '@/lib/utils';
import { translations } from '@/lib/i18n/translations';
import { SITE_URL as BASE_URL } from '@/lib/constants';
import ProductDetailClient from './ProductDetailClient';

// This page is fully server-rendered, so this window is how long an edited
// photo or price can take to appear here.
//
// It was five minutes, which is what pushed the project to 75% of Vercel's
// free ISR write allowance in its first weeks. Every distinct product URL is
// its own cache entry with its own clock, so the cost is (products + 1) × the
// number of windows in a day — and a single crawler request per window is
// enough to trigger a rewrite. At five minutes that is 288 rewrites per page
// per day; at an hour it is 24. An hour is still well inside how quickly a
// price change needs to reach a customer, and the owner can force it sooner
// by redeploying, which clears the cache outright.
export const revalidate = 3600;

const CATEGORY_LABELS = translations.fr.categories;

// Keeps titles within Google's ~60-char display limit even for long
// product names.
function buildTitle(name) {
  const suffix = ' | LuxuryPhone24 Guelma';
  const budget = 60 - suffix.length;
  const trimmed = name.length > budget ? `${name.slice(0, budget - 1).trimEnd()}…` : name;
  return `${trimmed}${suffix}`;
}

// Assembles a natural 140-160 char description from real product data
// (never keyword-stuffed boilerplate) with a location-aware close.
function buildDescription(product, categoryLabel) {
  const brand = product.brand ? `${product.brand} ` : '';
  const price = formatPrice(product.price);
  const opening = `${brand}${product.name} au meilleur prix en Algérie (${price}).`;
  const middle = product.description
    ? ` ${product.description.replace(/\s+/g, ' ').trim()}`
    : categoryLabel
    ? ` ${categoryLabel} 100% authentique, garantie officielle.`
    : ' Produit 100% authentique, garantie officielle.';
  const closing = ' Livraison rapide à Guelma et dans les 58 wilayas, paiement à la livraison.';

  let desc = `${opening}${middle}${closing}`;
  if (desc.length > 160) {
    const room = 160 - opening.length - closing.length - 1;
    const trimmedMiddle = room > 20 ? `${middle.slice(0, room).trimEnd()}…` : '';
    desc = `${opening}${trimmedMiddle}${closing}`;
  }
  return desc.slice(0, 160);
}

export async function generateMetadata({ params }) {
  const product = await getProductServer(params.slug);
  if (!product) {
    return { title: { absolute: 'Produit introuvable | LuxuryPhone24' } };
  }

  const categoryLabel = CATEGORY_LABELS[product.category]?.label;
  const title = buildTitle(product.name);
  const description = buildDescription(product, categoryLabel);
  const url = `${BASE_URL}/products/${product.slug || product.id}`;
  const image = product.images?.[0];

  return {
    title: { absolute: title },
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: 'website',
      images: image ? [{ url: image }] : undefined,
    },
    twitter: {
      card: image ? 'summary_large_image' : 'summary',
      title,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export default async function ProductDetailPage({ params }) {
  const product = await getProductServer(params.slug);
  if (!product) notFound();

  const all = await getProductsServer();
  const related = all
    .filter((p) => p.id !== product.id && p.category === product.category)
    .slice(0, 4);

  const url = `${BASE_URL}/products/${product.slug || product.id}`;
  const categoryLabel = CATEGORY_LABELS[product.category]?.label;

  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: product.images || [],
    description: product.description || `${product.name} — ${categoryLabel || ''}`.trim(),
    brand: product.brand ? { '@type': 'Brand', name: product.brand } : undefined,
    sku: product.id,
    offers: {
      '@type': 'Offer',
      url,
      priceCurrency: 'DZD',
      price: Number(product.price) || 0,
      availability:
        Number(product.stock) > 0
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
      areaServed: 'DZ',
      seller: { '@type': 'Organization', name: 'LuxuryPhone24' },
    },
  };

  const breadcrumbItems = [
    { name: 'Accueil', href: '/' },
    { name: 'Produits', href: '/products' },
    ...(categoryLabel ? [{ name: categoryLabel, href: `/products?category=${product.category}` }] : []),
    { name: product.name, href: `/products/${product.slug || product.id}` },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(productJsonLd) }}
      />
      <ProductDetailClient
        product={product}
        related={related}
        breadcrumbItems={breadcrumbItems}
      />
    </>
  );
}
