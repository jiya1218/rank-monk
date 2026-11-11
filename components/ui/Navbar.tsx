'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  ChevronDown,
  LayoutDashboard,
  Compass,
  LogOut,
  Menu,
  X,
  User,
  ShieldCheck
} from 'lucide-react';
import { UserProfile } from '@/types';
import { PricingModal } from '@/components/pricing/PricingModal';

interface NavbarProps {
  onOpenConnectModal?: () => void;
}

export function Navbar({ onOpenConnectModal }: NavbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [pricingModalOpen, setPricingModalOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('rankmonk_user') || localStorage.getItem('rankmonk_active_user_v3');
      if (raw) {
        setUser(JSON.parse(raw));
      }
    } catch (e) {}
  }, []);

  // Close profile dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDashboardClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) {
      router.push('/login');
      return;
    }

    // Check if user is an active / subscribed member
    const isActiveUser =
      user.paid === true ||
      user.role === 'owner' ||
      user.role === 'admin' ||
      user.email === 'founder@rankmonk.in' ||
      (user as any).is_active === true;

    if (!isActiveUser) {
      // Inactive / unpaid user -> route directly to pricing page
      router.push('/pricing');
      return;
    }

    // Active user -> proceed directly to dashboard
    router.push('/dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('rankmonk_user');
    localStorage.removeItem('rankmonk_active_user_v3');
    setUser(null);
    router.push('/login');
  };

  const navItems = [
    { label: 'Home', href: '/' },
    { label: 'Features', href: '/features' },
    { label: 'EEAT Analyzer', href: '/eeat-analyzer' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'Comparison', href: '/comparison' },
  ];

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <>
      <header className="sticky top-0 z-50 bg-[#fffcf7]/95 backdrop-blur-md border-b border-[#e4d6c6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center group">
            <img
              src="/assets/rank-monk-logo-horizontal.png"
              alt="Rank Monk"
              className="h-10 sm:h-11 w-auto object-contain transition-transform group-hover:scale-105"
            />
          </Link>

          {/* Clean Desktop Navigation Links (Uncluttered, Consistent Across All Pages) */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-semibold">
            {navItems.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`transition-colors py-1 ${
                    active
                      ? 'text-[#2b1b12] font-black border-b-2 border-[#2b1b12]'
                      : 'text-[#6f5a4c] hover:text-[#2b1b12]'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Right CTA Actions */}
          <div className="flex items-center gap-3">
            {user ? (
              /* Signed In / Subscribed State */
              <div className="flex items-center gap-3">
                {/* Launch Dashboard Button */}
                <button
                  onClick={handleDashboardClick}
                  className="bg-[#2b1b12] hover:bg-[#3b2519] text-[#fffcf7] px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-xs transition-all cursor-pointer border border-[#c5a059]/30"
                >
                  <span>Dashboard</span>
                  <span>→</span>
                </button>

                {/* Profile Button with Clean Dropdown Menu */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    type="button"
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-1.5 p-1 rounded-xl hover:bg-[#f1e8dc]/60 transition-colors cursor-pointer"
                    aria-label="User profile options"
                  >
                    <div className="w-8 h-8 rounded-full bg-[#f1e8dc] border border-[#d8c09e] flex items-center justify-center text-xs font-black text-[#2b1b12]">
                      {(user.name || user.email || 'U').charAt(0).toUpperCase()}
                    </div>
                    <ChevronDown className={`w-3.5 h-3.5 text-[#6f5a4c] transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Profile Dropdown */}
                  {dropdownOpen && (
                    <div className="absolute right-0 top-full mt-2 w-64 bg-[#fffcf7] border border-[#e4d6c6] rounded-2xl shadow-xl p-3 z-50 animate-fade-in space-y-2 text-xs">
                      {/* User Info Header */}
                      <div className="p-2.5 bg-[#f8f3ec] rounded-xl border border-[#e4d6c6]/60">
                        <div className="font-bold text-[#2b1b12] truncate">
                          {user.name || 'Rank Monk Member'}
                        </div>
                        <div className="text-[11px] text-[#6f5a4c] truncate">
                          {user.email || 'user@example.com'}
                        </div>
                      </div>

                      {/* Dropdown Options */}
                      <div className="space-y-1 pt-1 border-t border-[#e4d6c6]/50">
                        <button
                          onClick={(e) => {
                            setDropdownOpen(false);
                            handleDashboardClick(e);
                          }}
                          className="w-full text-left px-3 py-2 rounded-xl text-[#2b1b12] hover:bg-[#f8f3ec] font-bold flex items-center gap-2 cursor-pointer transition-colors"
                        >
                          <LayoutDashboard className="w-3.5 h-3.5 text-[#8a5b13]" />
                          <span>Open Dashboard</span>
                        </button>
                        <Link
                          href="/eeat-analyzer"
                          onClick={() => setDropdownOpen(false)}
                          className="w-full text-left px-3 py-2 rounded-xl text-[#2b1b12] hover:bg-[#f8f3ec] font-bold flex items-center gap-2 transition-colors"
                        >
                          <Compass className="w-3.5 h-3.5 text-[#8a5b13]" />
                          <span>E-E-A-T Quality Audit</span>
                        </Link>
                      </div>

                      {/* Sign Out Option */}
                      <div className="pt-1.5 border-t border-[#e4d6c6]">
                        <button
                          onClick={() => {
                            setDropdownOpen(false);
                            handleLogout();
                          }}
                          className="w-full text-left px-3 py-2 rounded-xl text-rose-700 hover:bg-rose-50 font-bold flex items-center gap-2 cursor-pointer transition-colors"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>Sign out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Guest Actions (Not Signed In) */
              <div className="flex items-center gap-2 sm:gap-3">
                <a
                  href="https://calendly.com/utkarshmakwana31/demo-for-rankmonk"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden sm:inline-flex px-3.5 py-2 rounded-xl border border-[#e4d6c6] hover:bg-[#f8f3ec] text-[#2b1b12] text-xs font-bold transition-all"
                >
                  Book Demo
                </a>
                <Link
                  href="/login"
                  className="text-xs sm:text-sm font-semibold text-[#2b1b12] hover:text-[#7a5242] px-2.5 py-2 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="bg-[#2b1b12] hover:bg-[#3b2519] text-[#fffcf7] px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl font-bold text-xs shadow-sm transition-all flex items-center gap-1.5"
                >
                  <span>Start Free</span>
                  <span className="text-[#c5a059]">⚡</span>
                </Link>
              </div>
            )}

            {/* Mobile Hamburger Toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-[#2b1b12] hover:bg-[#f1e8dc]/60 transition-colors cursor-pointer"
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Slide-down Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#fffcf7] border-b border-[#e4d6c6] shadow-xl p-5 space-y-4 animate-fade-in">
            <nav className="flex flex-col gap-3 font-semibold text-sm text-[#2b1b12]">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`py-1.5 transition-colors ${
                    isActive(item.href) ? 'text-[#2b1b12] font-black' : 'text-[#6f5a4c]'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="border-t border-[#e4d6c6] pt-3">
              {user ? (
                <div className="space-y-2">
                  <div className="text-xs text-[#6f5a4c]">
                    Signed in as <strong className="text-[#2b1b12]">{user.email}</strong>
                  </div>
                  <button
                    onClick={(e) => {
                      setMobileMenuOpen(false);
                      handleDashboardClick(e);
                    }}
                    className="w-full py-2.5 bg-[#2b1b12] text-white font-bold text-xs rounded-xl shadow-xs text-center"
                  >
                    Open Dashboard →
                  </button>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleLogout();
                    }}
                    className="w-full py-2 text-rose-700 font-bold text-xs text-center"
                  >
                    Sign out
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <a
                    href="https://calendly.com/utkarshmakwana31/demo-for-rankmonk"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full text-center py-2 rounded-xl border border-[#e4d6c6] text-xs font-bold text-[#2b1b12]"
                  >
                    Book Demo
                  </a>
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-2 text-xs font-bold text-[#2b1b12]"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/signup"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-2.5 bg-[#2b1b12] text-[#fffcf7] text-xs font-bold rounded-xl"
                  >
                    Start Free ⚡
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
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
