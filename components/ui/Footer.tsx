import React from 'react';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-[#f1e8dc] border-t border-[#e4d6c6] pt-16 pb-12 text-[#6f5a4c]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand Info */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <span className="font-editorial text-2xl font-bold text-[#2b1b12]">Rank Monk</span>
            </div>
            <p className="text-sm leading-relaxed mb-4 text-[#6f5a4c]">
              The Zen OS for Autonomous Organic Growth. Continuously crawls your site, writes authoritative articles, and secures citations on Google, ChatGPT, and Perplexity.
            </p>
            <div className="text-xs text-[#6f5a4c]">
              © {new Date().getFullYear()} Rank Monk Inc. All rights reserved.
            </div>
          </div>

          {/* Platform Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#2b1b12] mb-4">Platform</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/#features" className="hover:text-[#2b1b12] transition-colors">Autonomous SEO Engine</Link></li>
              <li><Link href="/#engines" className="hover:text-[#2b1b12] transition-colors">AEO / GEO Radar</Link></li>
              <li><Link href="/pricing" className="hover:text-[#2b1b12] transition-colors">Plans & Pricing</Link></li>
              <li><Link href="/comparison" className="hover:text-[#2b1b12] transition-colors">Rank Monk vs Agencies</Link></li>
            </ul>
          </div>

          {/* Solutions */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#2b1b12] mb-4">Solutions</h4>
            <ul className="space-y-2.5 text-sm">
              <li><span className="text-[#2b1b12] font-medium">B2B SaaS & Tech</span></li>
              <li><span className="text-[#2b1b12] font-medium">AI Automation Agencies</span></li>
              <li><span className="text-[#2b1b12] font-medium">E-Commerce & Brands</span></li>
              <li><span className="text-[#2b1b12] font-medium">Multi-Domain Enterprises</span></li>
            </ul>
          </div>

          {/* Direct Demo Booking */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#2b1b12] mb-4">Book Consultation</h4>
            <p className="text-xs leading-relaxed mb-4">
              Schedule a 1-on-1 strategy walkthrough with our growth architecture team.
            </p>
            <a
              href="https://calendly.com/utkarshmakwana31/demo-for-rankmonk"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#2b1b12] hover:bg-[#3b2519] text-[#fffcf7] px-4 py-2.5 rounded-lg text-xs font-semibold shadow-sm transition-all"
            >
              <span>Schedule 15-Min Demo</span>
              <span>→</span>
            </a>
          </div>
        </div>

        <div className="pt-8 border-t border-[#e4d6c6] flex flex-col sm:flex-row items-center justify-between text-xs text-[#6f5a4c] gap-4">
          <p>Ahmedabad · Bangalore · San Francisco</p>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-[#2b1b12]">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-[#2b1b12]">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

