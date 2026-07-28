import AboutClient from './AboutClient';

const BASE_URL = 'https://luxury-phone.vercel.app';
const title = 'À propos de Luxury Phone — Boutique High-Tech Guelma';
const description =
  'Luxury Phone est une boutique high-tech à Guelma, Algérie, avec deux magasins. Smartphones, laptops et accessoires 100% authentiques, garantie officielle.';

export const metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: `${BASE_URL}/about` },
  openGraph: {
    title,
    description,
    url: `${BASE_URL}/about`,
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title,
    description,
  },
};

export default function AboutPage() {
  return <AboutClient />;
}
