import { translations } from '@/lib/i18n/translations';
import HomeClient from './HomeClient';

const BASE_URL = 'https://luxury-phone.vercel.app';

const title = 'Luxury Phone — Smartphones, Laptops et Tablettes | Guelma';
const description =
  'Luxury Phone : smartphones, laptops, tablettes et accessoires 100% authentiques à Guelma, Algérie. Livraison dans les 58 wilayas, paiement à la livraison.';

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

export default function HomePage() {
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: translations.fr.faq.items.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <HomeClient />
    </>
  );
}
