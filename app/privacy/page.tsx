import React from 'react';
import { Navbar } from '@/components/ui/Navbar';
import { Footer } from '@/components/ui/Footer';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#f8f3ec] text-[#2b1b12] flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 bg-[#fffcf7] border border-[#e4d6c6] rounded-2xl p-8 shadow-card">
          <h1 className="font-editorial text-3xl font-bold mb-4">Privacy Policy</h1>
          <p className="text-xs text-[#6f5a4c] mb-6">Last updated: November 2026</p>

          <div className="space-y-4 text-xs text-[#2b1b12] leading-relaxed">
            <p>
              Rank Monk (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) is committed to protecting your privacy. This policy describes how we collect, store, and process your data when you use our autonomous search intelligence platform.
            </p>
            <h3 className="font-bold text-sm pt-2">1. Data We Collect</h3>
            <p>
              We collect publicly available website metadata from domains you connect (such as meta tags, headings, and color palettes) to construct your brand DNA. We do not access private customer data without authorization.
            </p>
            <h3 className="font-bold text-sm pt-2">2. AI Model Training</h3>
            <p>
              Customer data and proprietary articles generated inside Rank Monk are never used to train third-party public foundation models without explicit organizational consent.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

