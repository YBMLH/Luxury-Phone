import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

// Layout for all customer-facing pages (the admin dashboard has its own).
export default function StoreLayout({ children }) {
  return (
    <>
      <Navbar />
      <main className="min-h-[70vh]">{children}</main>
      <Footer />
    </>
  );
}
