import TrackOrderClient from './TrackOrderClient';

const BASE_URL = 'https://luxury-phone.vercel.app';
const title = 'Suivre ma Commande en Ligne — Luxury Phone Guelma';
const description =
  'Suivez votre commande Luxury Phone en temps réel avec votre numéro de commande et téléphone. Livraison partout en Algérie, statut mis à jour à chaque étape.';

export const metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: `${BASE_URL}/track-order` },
  openGraph: {
    title,
    description,
    url: `${BASE_URL}/track-order`,
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title,
    description,
  },
};

export default function TrackOrderPage() {
  return <TrackOrderClient />;
}
