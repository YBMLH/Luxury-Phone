import { translations } from '@/lib/i18n/translations';
import { SITE_URL as BASE_URL } from '@/lib/constants';
import { safeJsonLd, pickShowcase } from '@/lib/utils';
import { getProductsServer, getSettingsServer } from '@/lib/serverData';
import HomeClient from './HomeClient';

// Short window so the cached HTML never shows a badly outdated photo. The
// hero also refreshes itself client-side (see HomeClient), so an edit in the
// dashboard shows up immediately regardless of where this cache is at.
export const revalidate = 300;

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
  // fan has real images in the first render instead of waiting on a
  // client-side round trip — better for LCP. HomeClient swaps in fresh data
  // as soon as its own fetch lands. Settings ride along for the same reason:
  // without them the board spells out the placeholder headline and then
  // re-spells the real title once the client fetch resolves.
  const [products, settings] = await Promise.all([getProductsServer(), getSettingsServer()]);
  const showcaseProducts = pickShowcase(products);
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
      <HomeClient showcaseProducts={showcaseProducts} heroContent={settings.heroContent} />
    </>
  );
}
