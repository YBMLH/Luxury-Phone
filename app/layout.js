import { Inter, Space_Grotesk } from 'next/font/google';
import Script from 'next/script';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/context/AuthContext';
import { SettingsProvider } from '@/context/SettingsContext';
import { LanguageProvider } from '@/context/LanguageContext';
import { getSettingsServer } from '@/lib/serverData';
import { SITE_URL as BASE_URL, OPENING_HOURS } from '@/lib/constants';
import { safeJsonLd } from '@/lib/utils';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });
const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-display',
});

export const metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'LuxuryPhone24 — Premium Electronics Store in Guelma, Algeria',
    template: '%s | LuxuryPhone24',
  },
  description:
    'LuxuryPhone24 — premium smartphones, laptops, tablets and accessories in Guelma, Algeria. Genuine products, fast delivery to all 58 wilayas, order tracking.',
  keywords: [
    'LuxuryPhone24',
    'Guelma',
    'Algeria',
    'smartphones',
    'laptops',
    'electronics store',
  ],
  openGraph: {
    title: 'LuxuryPhone24 — Premium Electronics Store',
    description:
      'Genuine smartphones, laptops and accessories. Fast delivery across Algeria.',
    type: 'website',
  },
  // Set NEXT_PUBLIC_GSC_VERIFICATION once the owner adds the site in Google
  // Search Console (Settings → Ownership verification → HTML tag).
  verification: process.env.NEXT_PUBLIC_GSC_VERIFICATION
    ? { google: process.env.NEXT_PUBLIC_GSC_VERIFICATION }
    : undefined,
};

export default async function RootLayout({ children }) {
  const settings = await getSettingsServer();
  const locations = settings.locations || [];

  // Sitewide ElectronicsStore/LocalBusiness structured data — one entry per
  // branch so both Guelma locations can surface in Google's local pack.
  const localBusinessJsonLd = locations.map((loc, i) => ({
    '@context': 'https://schema.org',
    '@type': 'ElectronicsStore',
    '@id': `${BASE_URL}/#store-${i + 1}`,
    name: loc.name || 'LuxuryPhone24',
    image: `${BASE_URL}/images/logo-full.webp`,
    url: BASE_URL,
    telephone: loc.phone || settings.contactInfo?.phone || undefined,
    address: {
      '@type': 'PostalAddress',
      streetAddress: loc.address || undefined,
      addressLocality: loc.city || 'Guelma',
      addressCountry: 'DZ',
    },
    openingHoursSpecification: OPENING_HOURS,
    areaServed: 'DZ',
    priceRange: '$$',
  }));

  const gaId = process.env.NEXT_PUBLIC_GA_ID;

  return (
    <html lang="fr" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <head>
        {/* The homepage's hero LCP image is preloaded per-request from
            app/(store)/page.js instead (it's dynamic — the first showcased
            product's photo), not a fixed asset here. */}
        {localBusinessJsonLd.map((entry) => (
          <script
            key={entry['@id']}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: safeJsonLd(entry) }}
          />
        ))}
      </head>
      <body className="font-sans">
        {/* Set NEXT_PUBLIC_GA_ID once the owner creates a Google Analytics
            4 property — nothing loads until it's configured. */}
        {gaId && (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="afterInteractive" />
            <Script id="ga4-init" strategy="afterInteractive">
              {`window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${gaId}');`}
            </Script>
          </>
        )}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-black focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
        >
          Aller au contenu principal
        </a>
        <LanguageProvider>
          <AuthProvider>
            <SettingsProvider>
              {children}
              <Toaster
                position="top-center"
                toastOptions={{
                  style: { background: '#0C0C0E', color: '#fff' },
                  success: { iconTheme: { primary: '#C9A227', secondary: '#000' } },
                }}
              />
            </SettingsProvider>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
