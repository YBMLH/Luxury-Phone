import { Inter, Space_Grotesk } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/context/AuthContext';
import { SettingsProvider } from '@/context/SettingsContext';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });
const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-display',
});

export const metadata = {
  metadataBase: new URL('https://luxury-phone.vercel.app'),
  title: {
    default: 'Luxury Phone — Premium Electronics Store in Guelma, Algeria',
    template: '%s | Luxury Phone',
  },
  description:
    'Luxury Phone — premium smartphones, laptops, tablets and accessories in Guelma, Algeria. Genuine products, fast delivery to all 58 wilayas, order tracking.',
  keywords: [
    'Luxury Phone',
    'Guelma',
    'Algeria',
    'smartphones',
    'laptops',
    'electronics store',
  ],
  openGraph: {
    title: 'Luxury Phone — Premium Electronics Store',
    description:
      'Genuine smartphones, laptops and accessories. Fast delivery across Algeria.',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <body className="font-sans">
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
      </body>
    </html>
  );
}
