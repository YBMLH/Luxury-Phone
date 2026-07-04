'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import { checkRateLimit } from '@/lib/utils';

export default function AdminLoginPage() {
  const { user, admin, loading, login } = useAuth();
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
      return toast.error('Please enter your email and password.');
    }

    // Basic rate limiting: max 1 attempt per 3 seconds from this browser.
    const rate = checkRateLimit('login', 3);
    if (!rate.allowed) return toast.error('Too many attempts. Please wait.');

    setSubmitting(true);
    try {
      await login(email.trim(), password);
      toast.success('Welcome back!');
      router.replace('/admin');
    } catch (err) {
      const code = err?.code || '';
      if (code.includes('too-many-requests')) {
        toast.error('Too many failed attempts. Try again later.');
      } else {
        toast.error('Invalid email or password.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="marble flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <p className="font-display text-3xl font-bold text-gold-gradient">
            Luxury Phone
          </p>
          <p className="mt-2 text-sm uppercase tracking-[0.3em] text-neutral-400">
            Admin Dashboard
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="marble-card space-y-5 rounded-2xl p-8"
        >
          <div>
            <label className="mb-1.5 block text-sm font-medium text-neutral-200">
              Email
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
              Password
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
            {submitting ? 'Signing in…' : 'Sign In'}
          </button>
          <p className="text-center text-xs text-neutral-500">
            Access is restricted to registered administrators.
          </p>
        </form>
      </div>
    </div>
  );
}
