'use client';

import React from 'react';
import { Navbar } from '@/components/ui/Navbar';
import { Footer } from '@/components/ui/Footer';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#f8f3ec] text-[#2b1b12] flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h1 className="font-editorial text-4xl sm:text-5xl font-bold tracking-tight text-[#2b1b12] mb-4">
              Get in Touch with Rank Monk
            </h1>
            <p className="text-sm text-[#6f5a4c] leading-relaxed">
              Book a live growth consultation, request a bespoke enterprise deployment, or speak directly with our engineering team.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {/* 1-on-1 Demo Card */}
            <div className="bg-[#fffcf7] border-2 border-[#c5a059] rounded-2xl p-8 shadow-editorial flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-[#fdfaf2] border border-[#c5a059]/30 flex items-center justify-center text-lg mb-4">
                  📅
                </div>
                <h3 className="font-editorial text-xl font-bold text-[#2b1b12] mb-2">
                  Book a Live Strategy Demo
                </h3>
                <p className="text-xs text-[#6f5a4c] leading-relaxed mb-6">
                  Schedule an instant 15-minute walkthrough via Calendly with our growth engineering team. We will review your domain live.
                </p>
              </div>

              <a
                href="https://calendly.com/utkarshmakwana31/demo-for-rankmonk"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 bg-[#2b1b12] hover:bg-[#3b2519] text-[#fffcf7] rounded-xl text-xs font-semibold text-center shadow-sm flex items-center justify-center gap-2 transition-all"
              >
                <span>Open Calendly Scheduler</span>
                <span>↗</span>
              </a>
            </div>

            {/* Direct Contact Card */}
            <div className="bg-[#fffcf7] border border-[#e4d6c6] rounded-2xl p-8 shadow-card flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-[#f1e8dc] border border-[#e4d6c6] flex items-center justify-center text-lg mb-4">
                  ✉️
                </div>
                <h3 className="font-editorial text-xl font-bold text-[#2b1b12] mb-2">
                  Direct Inquiries &amp; Support
                </h3>
                <p className="text-xs text-[#6f5a4c] leading-relaxed mb-4">
                  For enterprise onboarding, custom LLM models, and partnership discussions:
                </p>

                <div className="space-y-2 text-xs text-[#2b1b12]">
                  <div><strong>Email:</strong> founder@rankmonk.in</div>
                  <div><strong>Phone:</strong> +91 98253 58617</div>
                  <div><strong>Offices:</strong> Ahmedabad, Gujarat · San Francisco, CA</div>
                </div>
              </div>

              <div className="pt-6 border-t border-[#e4d6c6] text-[11px] text-[#6f5a4c]">
                Average response time: &lt; 2 business hours
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

