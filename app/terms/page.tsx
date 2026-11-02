import React from 'react';
import { Navbar } from '@/components/ui/Navbar';
import { Footer } from '@/components/ui/Footer';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#f8f3ec] text-[#2b1b12] flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 bg-[#fffcf7] border border-[#e4d6c6] rounded-2xl p-8 shadow-card">
          <h1 className="font-editorial text-3xl font-bold mb-4">Terms of Service</h1>
          <p className="text-xs text-[#6f5a4c] mb-6">Last updated: November 2026</p>

          <div className="space-y-4 text-xs text-[#2b1b12] leading-relaxed">
            <p>
              By signing up for or accessing Rank Monk, you agree to comply with these Terms of Service.
            </p>
            <h3 className="font-bold text-sm pt-2">1. Subscription &amp; Billing</h3>
            <p>
              Rank Monk offers three subscription tiers: Seed (₹10,000/mo), Grow (₹20,000/mo), and Scale (₹40,000/mo). All billing is handled through Razorpay. You can cancel or change your tier at any time via your dashboard settings.
            </p>
            <h3 className="font-bold text-sm pt-2">2. Acceptable Use</h3>
            <p>
              You agree not to use our autonomous engines to generate illegal, defamatory, or abusive search content.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

