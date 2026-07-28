import { SITE_URL as BASE_URL } from '@/lib/constants';
import ContactClient from './ContactClient';
const title = 'Contactez Luxury Phone — Magasins à Guelma, Algérie';
const description =
  'Contactez Luxury Phone à Guelma : téléphone, WhatsApp, email et adresses de nos deux magasins. Nous répondons vite pour toute question sur nos produits.';

export const metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: `${BASE_URL}/contact` },
  openGraph: {
    title,
    description,
    url: `${BASE_URL}/contact`,
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title,
    description,
  },
};

export default function ContactPage() {
  return <ContactClient />;
}
