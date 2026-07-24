'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import { checkRateLimit } from '@/lib/utils';
import { useLanguage } from '@/context/LanguageContext';
import LanguageSwitcher from '@/components/LanguageSwitcher';

export default function AdminLoginPage() {
  const { user, admin, loading, login } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Already signed in as an admin? Go straight to the dashboard.
  useEffect(() => {
    if (!loading && user && admin) router.replace('/admin');
  }, [loading, user, admin, router]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email.trim() || !password) {
      return toast.error(t('admin.login.errors.missing'));
    }

    // Basic rate limiting: max 1 attempt per 3 seconds from this browser.
    const rate = checkRateLimit('login', 3);
    if (!rate.allowed) return toast.error(t('admin.login.errors.rateLimit'));

    setSubmitting(true);
    try {
      await login(email.trim(), password);
      toast.success(t('admin.login.welcome'));
      router.replace('/admin');
    } catch (err) {
      // Show the real reason so problems are easy to diagnose.
      const code = err?.code || '';
      if (code.includes('unauthorized-domain')) {
        toast.error(
          `This website address is not authorized in Firebase. Add "${window.location.hostname}" in Firebase Console → Authentication → Settings → Authorized domains.`,
          { duration: 10000 }
        );
      } else if (code.includes('too-many-requests')) {
        toast.error(t('admin.login.errors.tooMany'));
      } else if (code.includes('network-request-failed')) {
        toast.error('Network error — check your internet connection.');
      } else if (
        code.includes('invalid-credential') ||
        code.includes('wrong-password') ||
        code.includes('user-not-found') ||
        code.includes('invalid-email')
      ) {
        toast.error(t('admin.login.errors.invalid'));
      } else {
        toast.error(`Login failed: ${code || 'unknown error'}`, { duration: 8000 });
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="marble flex min-h-screen items-center justify-center px-4">
      <div className="absolute right-4 top-4">
        <LanguageSwitcher dark />
      </div>
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <p className="font-display text-3xl font-bold text-gold-gradient">
            Luxury Phone
          </p>
          <p className="mt-2 text-sm uppercase tracking-[0.3em] text-neutral-400">
            {t('admin.login.title')}
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="marble-card space-y-5 rounded-2xl p-8"
        >
          <div>
            <label className="mb-1.5 block text-sm font-medium text-neutral-200">
              {t('admin.login.email')}
            </label>
            <input
              className="input"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-neutral-200">
              {t('admin.login.password')}
            </label>
            <input
              className="input"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          <button type="submit" disabled={submitting} className="btn-gold w-full">
            {submitting ? t('admin.login.signingIn') : t('admin.login.signIn')}
          </button>
          <p className="text-center text-xs text-neutral-500">
            {t('admin.login.restricted')}
          </p>
        </form>
      </div>
    </div>
  );
}
