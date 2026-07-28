'use client';

// Admin area layout. Every page under /admin (except /admin/login) is
// protected: it requires a signed-in Firebase user whose UID exists in
// the "admins" Firestore collection.
import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import LanguageSwitcher from '@/components/LanguageSwitcher';

export default function AdminLayout({ children }) {
  const { user, admin, loading, logout } = useAuth();
  const { t } = useLanguage();
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const NAV = [
    { href: '/admin', label: t('admin.layout.dashboard'), icon: '📊' },
    { href: '/admin/products', label: t('admin.layout.products'), icon: '📦' },
    { href: '/admin/orders', label: t('admin.layout.orders'), icon: '🧾' },
    { href: '/admin/customers', label: t('admin.layout.customers'), icon: '👥' },
    { href: '/admin/activity', label: t('admin.layout.activity'), icon: '📜' },
    { href: '/admin/settings', label: t('admin.layout.settings'), icon: '✏️' },
  ];

  const isLoginPage = pathname === '/admin/login';

  async function handleLogout() {
    await logout();
    toast.success(t('admin.layout.loggedOut'));
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
        <div className="absolute right-4 top-4">
          <LanguageSwitcher dark />
        </div>
        <p className="text-5xl">🔒</p>
        <h1 className="mt-4 font-display text-2xl font-bold text-white">
          {t('admin.layout.adminOnly')}
        </h1>
        <p className="mt-2 max-w-sm text-sm text-neutral-400">
          {user ? t('admin.layout.notAdmin') : t('admin.layout.pleaseSignIn')}
        </p>
        <div className="mt-6 flex gap-3">
          {user ? (
            <button onClick={handleLogout} className="btn-gold">{t('admin.layout.signOut')}</button>
          ) : (
            <Link href="/admin/login" className="btn-gold">{t('admin.layout.goToLogin')}</Link>
          )}
          <Link
            href="/"
            className="inline-flex items-center rounded-lg border border-gold/50 px-6 py-3 text-sm font-semibold text-gold-300 hover:bg-gold/10"
          >
            {t('admin.layout.backToStore')}
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
          <div className="px-4 pb-2">
            <LanguageSwitcher dark />
          </div>
          <Link
            href="/"
            className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm text-neutral-300 hover:bg-white/5"
          >
            🏬 {t('admin.layout.viewStore')}
          </Link>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm text-red-300 hover:bg-red-500/10"
          >
            🚪 {t('admin.layout.logout')}
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
            ☰ {t('admin.layout.menu')}
          </button>
          <div className="hidden text-sm text-neutral-500 lg:block">
            {t('admin.layout.adminDashboard')}
          </div>
          <div className="flex items-center gap-3">
            <div className="text-sm text-neutral-600">{user.email}</div>
          </div>
        </header>
        <main className="flex-1 p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
