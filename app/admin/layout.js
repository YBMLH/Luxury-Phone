'use client';

// Admin area layout. Every page under /admin (except /admin/login) is
// protected: it requires a signed-in Firebase user whose UID exists in
// the "admins" Firestore collection.
import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';

const NAV = [
  { href: '/admin', label: 'Dashboard', icon: '📊' },
  { href: '/admin/products', label: 'Products', icon: '📦' },
  { href: '/admin/orders', label: 'Orders', icon: '🧾' },
  { href: '/admin/customers', label: 'Customers', icon: '👥' },
  { href: '/admin/settings', label: 'Site Content', icon: '✏️' },
];

export default function AdminLayout({ children }) {
  const { user, admin, loading, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const isLoginPage = pathname === '/admin/login';

  async function handleLogout() {
    await logout();
    toast.success('Logged out');
    router.push('/admin/login');
  }

  // The login page manages its own redirect logic.
  if (isLoginPage) return <>{children}</>;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-100">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-gold border-t-transparent" />
      </div>
    );
  }

  if (!user || !admin) {
    return (
      <div className="marble flex min-h-screen flex-col items-center justify-center px-4 text-center">
        <p className="text-5xl">🔒</p>
        <h1 className="mt-4 font-display text-2xl font-bold text-white">
          Admin Access Only
        </h1>
        <p className="mt-2 max-w-sm text-sm text-neutral-400">
          {user
            ? 'Your account is not registered as an administrator.'
            : 'Please sign in to access the dashboard.'}
        </p>
        <div className="mt-6 flex gap-3">
          {user ? (
            <button onClick={handleLogout} className="btn-gold">Sign Out</button>
          ) : (
            <Link href="/admin/login" className="btn-gold">Go to Login</Link>
          )}
          <Link
            href="/"
            className="inline-flex items-center rounded-lg border border-gold/50 px-6 py-3 text-sm font-semibold text-gold-300 hover:bg-gold/10"
          >
            Back to Store
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-neutral-100">
      {/* Sidebar */}
      <aside
        className={`marble fixed inset-y-0 left-0 z-40 w-64 transform transition-transform lg:static lg:translate-x-0 ${
          menuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-gold/25 px-5">
          <span className="font-display text-lg font-bold text-gold-gradient">
            Luxury Phone
          </span>
          <button className="text-neutral-400 lg:hidden" onClick={() => setMenuOpen(false)}>
            ✕
          </button>
        </div>
        <nav className="space-y-1 p-4">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition ${
                pathname === item.href
                  ? 'bg-gold/15 text-gold-300'
                  : 'text-neutral-300 hover:bg-white/5 hover:text-white'
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="absolute bottom-0 w-full space-y-1 border-t border-white/10 p-4">
          <Link
            href="/"
            className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm text-neutral-300 hover:bg-white/5"
          >
            🏬 View Store
          </Link>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm text-red-300 hover:bg-red-500/10"
          >
            🚪 Logout
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* Content */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b border-neutral-200 bg-white px-4 lg:px-8">
          <button
            className="rounded-lg border border-neutral-300 px-3 py-1.5 text-sm lg:hidden"
            onClick={() => setMenuOpen(true)}
          >
            ☰ Menu
          </button>
          <div className="hidden text-sm text-neutral-500 lg:block">
            Admin Dashboard
          </div>
          <div className="text-sm text-neutral-600">{user.email}</div>
        </header>
        <main className="flex-1 p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
