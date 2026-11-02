'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !name) {
      setError('Please complete all required fields.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, password })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Signup failed.');
      }

      const user = data.user;
      localStorage.setItem('rankmonk_user', JSON.stringify(user));
      localStorage.setItem('rankmonk_active_user_v3', JSON.stringify(user));

      // Persist to client credentials cache for seamless multi-session login on serverless
      try {
        const raw = localStorage.getItem('rankmonk_client_accounts');
        const list = raw ? JSON.parse(raw) : [];
        const norm = email.toLowerCase().trim();
        const idx = list.findIndex((a: any) => a.email && a.email.toLowerCase().trim() === norm);
        const record = { ...user, password };
        if (idx !== -1) {
          list[idx] = record;
        } else {
          list.push(record);
        }
        localStorage.setItem('rankmonk_client_accounts', JSON.stringify(list));
      } catch (e) {}

      // Auto-login straight to onboarding/dashboard!
      router.push('/dashboard');
    } catch (err) {
      setError((err as Error).message || 'Signup failed');
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
          Create your Rank Monk account
        </h2>
        <p className="mt-2 text-xs text-[#6f5a4c]">
          Access your autonomous search & AEO growth console
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-[#fffcf7] py-8 px-6 sm:px-10 border border-[#e4d6c6] rounded-2xl shadow-card">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl p-3">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#2b1b12] uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Doe"
                className="w-full px-4 py-2.5 bg-[#f8f3ec] border border-[#e4d6c6] rounded-xl text-sm text-[#2b1b12] focus:outline-none focus:ring-2 focus:ring-[#c5a059] focus:bg-[#fffcf7] placeholder-[#a69282]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2b1b12] uppercase tracking-wider mb-1.5">
                Work Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full px-4 py-2.5 bg-[#f8f3ec] border border-[#e4d6c6] rounded-xl text-sm text-[#2b1b12] focus:outline-none focus:ring-2 focus:ring-[#c5a059] focus:bg-[#fffcf7] placeholder-[#a69282]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2b1b12] uppercase tracking-wider mb-1.5">
                Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full px-4 py-2.5 bg-[#f8f3ec] border border-[#e4d6c6] rounded-xl text-sm text-[#2b1b12] focus:outline-none focus:ring-2 focus:ring-[#c5a059] focus:bg-[#fffcf7] placeholder-[#a69282]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2b1b12] uppercase tracking-wider mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 6 characters"
                className="w-full px-4 py-2.5 bg-[#f8f3ec] border border-[#e4d6c6] rounded-xl text-sm text-[#2b1b12] focus:outline-none focus:ring-2 focus:ring-[#c5a059] focus:bg-[#fffcf7] placeholder-[#a69282]"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 mt-2 rounded-xl bg-[#2b1b12] hover:bg-[#3b2519] text-[#fffcf7] text-sm font-semibold shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <span>Creating Account...</span>
              ) : (
                <>
                  <span>Create Account</span>
                  <span>→</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-[#6f5a4c]">
              Already have an account?{' '}
              <Link href="/login" className="font-semibold text-[#7a5242] hover:text-[#2b1b12] underline">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
