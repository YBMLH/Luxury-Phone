import { SITE_URL as BASE_URL } from '@/lib/constants';
import TrackOrderClient from './TrackOrderClient';
const title = 'Suivre ma Commande en Ligne — LuxuryPhone24 Guelma';
const description =
  'Suivez votre commande LuxuryPhone24 en temps réel avec votre numéro de commande et téléphone. Livraison partout en Algérie, statut mis à jour à chaque étape.';

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
