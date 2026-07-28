import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import WhatsAppButton from '@/components/WhatsAppButton';

// Layout for all customer-facing pages (the admin dashboard has its own).
export default function StoreLayout({ children }) {
  return (
    <>
      <Navbar />
      <main id="main-content" className="min-h-[70vh]">{children}</main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}
