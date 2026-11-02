'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [registeredNotice, setRegisteredNotice] = useState(false);

  useEffect(() => {
    if (searchParams.get('registered') === 'true') {
      setRegisteredNotice(true);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both your work email and password.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Verification failed. Please check your credentials.');
      }

      const user = data.user;
      localStorage.setItem('rankmonk_user', JSON.stringify(user));
      localStorage.setItem('rankmonk_active_user_v3', JSON.stringify(user));
      if (!user.domain) {
        localStorage.removeItem('rankmonk_active_project');
      }

      // Redirect user to homepage
      router.push('/');
    } catch (err) {
      setError((err as Error).message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f3ec] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center gap-2 group mb-5">
          <img
            src="/assets/rank-monk-logo-horizontal.png"
            alt="Rank Monk"
            className="h-12 w-auto mx-auto object-contain"
          />
        </Link>
        <h2 className="font-editorial text-3xl font-bold tracking-tight text-[#2b1b12]">
          Sign in to Rank Monk
        </h2>
        <p className="mt-2 text-xs text-[#6f5a4c]">
          Access your autonomous organic growth console
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-[#fffcf7] py-8 px-6 sm:px-10 border border-[#e4d6c6] rounded-2xl shadow-card">
          {registeredNotice && (
            <div className="mb-6 bg-[#eef7ec] border border-[#84e1bc] text-[#03543f] text-xs font-semibold rounded-xl p-3.5">
              ✓ Account created successfully! Please sign in with your email and password to continue.
            </div>
          )}

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl p-3">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-[#2b1b12] uppercase tracking-wider mb-2">
                Work Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full px-4 py-3 bg-[#f8f3ec] border border-[#e4d6c6] rounded-xl text-sm text-[#2b1b12] focus:outline-none focus:ring-2 focus:ring-[#c5a059] focus:bg-[#fffcf7] transition-all placeholder-[#a69282]"
                required
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-bold text-[#2b1b12] uppercase tracking-wider">
                  Password
                </label>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-[#f8f3ec] border border-[#e4d6c6] rounded-xl text-sm text-[#2b1b12] focus:outline-none focus:ring-2 focus:ring-[#c5a059] focus:bg-[#fffcf7] transition-all placeholder-[#a69282]"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-[#2b1b12] hover:bg-[#3b2519] text-[#fffcf7] text-sm font-semibold shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <span>Verifying credentials...</span>
              ) : (
                <>
                  <span>Sign In to Console</span>
                  <span>→</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-[#e4d6c6] text-center">
            <p className="text-xs text-[#6f5a4c]">
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="font-semibold text-[#7a5242] hover:text-[#2b1b12] underline">
                Create Account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#f8f3ec] flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-[#c5a059] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
