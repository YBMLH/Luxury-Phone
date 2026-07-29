import { translations } from '@/lib/i18n/translations';
import { SITE_URL as BASE_URL } from '@/lib/constants';
import { safeJsonLd } from '@/lib/utils';
import { getProductsServer } from '@/lib/serverData';
import HomeClient from './HomeClient';

export const revalidate = 3600;

const title = 'LuxuryPhone24 — Smartphones, Laptops et Tablettes | Guelma';
const description =
  'LuxuryPhone24 : smartphones, laptops, tablettes et accessoires 100% authentiques à Guelma, Algérie. Livraison dans les 58 wilayas, paiement à la livraison.';

export const metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: BASE_URL },
  openGraph: {
    title,
    description,
    url: BASE_URL,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
  },
};

export default async function HomePage() {
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: translations.fr.faq.items.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  };

  // Fetched server-side (not in HomeClient's own client fetch) so the hero
  // carousel has real images in the first render instead of waiting on a
  // client-side round trip — better for LCP. Featured products first, then
  // fill up to 6 with anything else that has a photo.
  const allProducts = await getProductsServer();
  const withImages = allProducts.filter((p) => p.images?.length);
  const featured = withImages.filter((p) => p.featured);
  const rest = withImages.filter((p) => !p.featured);
  const showcaseProducts = [...featured, ...rest].slice(0, 6);
  const heroImage = showcaseProducts[0]?.images?.[0];

  return (
    <>
      {heroImage && (
        <link rel="preload" as="image" href={heroImage} fetchPriority="high" />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(faqJsonLd) }}
      />
      <HomeClient showcaseProducts={showcaseProducts} />
    </>
  );
}
