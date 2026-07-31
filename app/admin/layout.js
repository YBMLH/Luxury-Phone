'use client';

// Admin area layout. Every page under /admin (except /admin/login) is
// protected: it requires a signed-in Firebase user whose UID exists in
// the "admins" Firestore collection.
//
// The shell is deliberately boring in a good way — the nav never moves, the
// page title is always top-left, the primary action is always top-right, and
// the bell is always in the same corner. Nothing here should make the owner
// hunt for a button.
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { OrderAlertProvider, useOrderAlerts } from '@/context/OrderAlertContext';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import NotificationBell from '@/components/admin/NotificationBell';
import {
  IconDashboard,
  IconBox,
  IconReceipt,
  IconUsers,
  IconHistory,
  IconSettings,
  IconStore,
  IconLogout,
  IconMenu,
  IconClose,
  IconPlus,
} from '@/components/admin/Icons';

function useNav(t, pendingCount) {
  return useMemo(
    () => [
      {
        heading: t('admin.layout.groupOverview'),
        items: [{ href: '/admin', label: t('admin.layout.dashboard'), icon: IconDashboard }],
      },
      {
        heading: t('admin.layout.groupSelling'),
        items: [
          {
            href: '/admin/orders',
            label: t('admin.layout.orders'),
            icon: IconReceipt,
            badge: pendingCount || null,
          },
          { href: '/admin/products', label: t('admin.layout.products'), icon: IconBox },
          { href: '/admin/customers', label: t('admin.layout.customers'), icon: IconUsers },
        ],
      },
      {
        heading: t('admin.layout.groupManage'),
        items: [
          { href: '/admin/settings', label: t('admin.layout.settings'), icon: IconSettings },
          { href: '/admin/activity', label: t('admin.layout.activity'), icon: IconHistory },
        ],
      },
    ],
    [t, pendingCount]
  );
}

// Split out so it can read the order feed — the provider sits above it.
function AdminShell({ children, user, onLogout }) {
  const { t } = useLanguage();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const { orders } = useOrderAlerts();

  const pendingCount = orders.filter((o) => o.status === 'Pending').length;
  const groups = useNav(t, pendingCount);

  // Close the drawer whenever the route changes, so a tap on a nav item on a
  // phone doesn't leave the menu covering the page you just opened.
  useEffect(() => setMenuOpen(false), [pathname]);

  const currentLabel =
    groups
      .flatMap((g) => g.items)
      .find((item) => (item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href)))
      ?.label || t('admin.layout.adminDashboard');

  return (
    <div className="flex min-h-screen bg-[#F7F7F5]">
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-[#0C0C0E] bg-gradient-to-b from-[#141319] to-[#0A0A0C] transition-transform lg:static lg:translate-x-0 ${
          menuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-gold/25 px-5">
          <Link href="/admin" className="flex items-center gap-2">
            <img src="/images/logo-icon.webp" alt="" className="h-8 w-auto" />
            <span className="font-display text-lg font-bold text-gold-gradient">LuxuryPhone24</span>
          </Link>
          <button
            className="text-neutral-400 hover:text-white lg:hidden"
            onClick={() => setMenuOpen(false)}
            aria-label={t('admin.layout.closeMenu')}
          >
            <IconClose />
          </button>
        </div>

        <nav className="flex-1 space-y-5 overflow-y-auto p-4">
          {groups.map((group) => (
            <div key={group.heading}>
              <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
                {group.heading}
              </p>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const active =
                    item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href);
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      aria-current={active ? 'page' : undefined}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                        active
                          ? 'bg-gold/15 text-gold-300'
                          : 'text-neutral-300 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <Icon className="h-[18px] w-[18px] shrink-0" />
                      <span className="flex-1 truncate">{item.label}</span>
                      {item.badge ? (
                        <span className="rounded-full bg-gold px-1.5 py-0.5 text-[10px] font-bold tabular-nums text-black">
                          {item.badge}
                        </span>
                      ) : null}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="shrink-0 space-y-1 border-t border-white/10 p-4">
          <div className="px-1 pb-2">
            <LanguageSwitcher dark />
          </div>
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-neutral-300 transition hover:bg-white/5 hover:text-white"
          >
            <IconStore className="h-[18px] w-[18px]" />
            {t('admin.layout.viewStore')}
          </Link>
          <button
            onClick={onLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-red-300 transition hover:bg-red-500/10"
          >
            <IconLogout className="h-[18px] w-[18px]" />
            {t('admin.layout.logout')}
          </button>
        </div>
      </aside>

      {menuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMenuOpen(false)}
        />
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-neutral-200 bg-white/85 px-4 backdrop-blur-xl lg:px-8">
          <button
            className="grid h-9 w-9 place-items-center rounded-lg border border-neutral-200 text-neutral-600 lg:hidden"
            onClick={() => setMenuOpen(true)}
            aria-label={t('admin.layout.menu')}
          >
            <IconMenu className="h-[18px] w-[18px]" />
          </button>

          <p className="min-w-0 flex-1 truncate font-display text-[15px] font-semibold text-neutral-900">
            {currentLabel}
          </p>

          {/* The products pages carry their own "Add product" button, and two
              identical buttons on one screen is worse than one. */}
          {!pathname.startsWith('/admin/products') && (
            <Link
              href="/admin/products/new"
              className="hidden items-center gap-1.5 rounded-lg bg-neutral-900 px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-neutral-800 sm:inline-flex"
            >
              <IconPlus className="h-4 w-4" />
              {t('admin.layout.newProduct')}
            </Link>
          )}

          <NotificationBell />

          <span className="hidden max-w-[13rem] truncate text-sm text-neutral-500 xl:block">
            {user.email}
          </span>
        </header>

        <main className="flex-1 p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }) {
  const { user, admin, loading, logout } = useAuth();
  const { t } = useLanguage();
  const pathname = usePathname();
  const router = useRouter();

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

  // The live order listener only starts once we know an admin is signed in.
  return (
    <OrderAlertProvider>
      <AdminShell user={user} onLogout={handleLogout}>
        {children}
      </AdminShell>
    </OrderAlertProvider>
  );
}
