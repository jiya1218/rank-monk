'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { UserProfile } from '@/types';
import { PricingModal } from '@/components/pricing/PricingModal';

interface NavbarProps {
  onOpenConnectModal?: () => void;
}

export function Navbar({ onOpenConnectModal }: NavbarProps) {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [pricingModalOpen, setPricingModalOpen] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('rankmonk_user') || localStorage.getItem('rankmonk_active_user_v3');
      if (raw) {
        setUser(JSON.parse(raw));
      }
    } catch (e) {}
  }, []);

  const handleDashboardClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) {
      router.push('/login');
      return;
    }

    // If unpaid and not owner, open pricing modal directly!
    const isExempt = user.email === 'founder@rankmonk.in' || user.role === 'owner';
    if (!user.paid && !isExempt) {
      setPricingModalOpen(true);
      return;
    }

    // Check if user has an active domain workspace
    const hasDomain = user.domain && user.domain.trim().length > 0;
    if (!hasDomain && onOpenConnectModal) {
      onOpenConnectModal();
    } else {
      router.push('/dashboard');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('rankmonk_user');
    localStorage.removeItem('rankmonk_active_user_v3');
    setUser(null);
    router.push('/login');
  };

  return (
    <>
      <header className="sticky top-0 z-50 bg-[#f8f3ec]/90 backdrop-blur-md border-b border-[#e4d6c6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Brand Logo - Single clean horizontal logo without duplicate text */}
          <Link href="/" className="flex items-center group">
            <img
              src="/assets/rank-monk-logo-horizontal.png"
              alt="Rank Monk"
              className="h-11 sm:h-12 w-auto object-contain transition-transform group-hover:scale-105"
            />
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-[15px] font-medium text-[#6f5a4c]">
            <Link href="/#features" className="hover:text-[#2b1b12] transition-colors">
              Engines & AEO
            </Link>
            <Link href="/pricing" className="hover:text-[#2b1b12] transition-colors">
              Pricing
            </Link>
            <Link href="/comparison" className="hover:text-[#2b1b12] transition-colors">
              Comparison
            </Link>
            <a
              href="https://calendly.com/utkarshmakwana31/demo-for-rankmonk"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#7a5242] hover:text-[#2b1b12] flex items-center gap-1.5 transition-colors"
            >
              <span>Book a Demo</span>
              <span className="text-xs bg-[#f1e8dc] px-2 py-0.5 rounded-full border border-[#e4d6c6]">Live</span>
            </a>
          </nav>

          {/* Right CTA Actions */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <button
                  onClick={handleDashboardClick}
                  className="bg-[#2b1b12] hover:bg-[#3b2519] text-[#fffcf7] px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer"
                >
                  <span>Launch Dashboard</span>
                  <span>→</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="text-xs text-[#6f5a4c] hover:text-[#2b1b12] px-2 py-1 underline font-semibold cursor-pointer"
                  title="Log out"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href="/login"
                  className="text-sm font-semibold text-[#2b1b12] hover:text-[#7a5242] px-3 py-2 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="bg-[#2b1b12] hover:bg-[#3b2519] text-[#fffcf7] px-5 py-2.5 rounded-xl font-bold text-xs shadow-sm transition-all flex items-center gap-2"
                >
                  <span>Start Free</span>
                  <span>⚡</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Pricing Popup Modal */}
      <PricingModal
        isOpen={pricingModalOpen}
        onClose={() => setPricingModalOpen(false)}
        onSuccess={() => {
          setPricingModalOpen(false);
          router.push('/dashboard');
        }}
      />
    </>
  );
}
