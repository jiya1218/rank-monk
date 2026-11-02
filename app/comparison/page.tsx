'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/ui/Navbar';
import { Footer } from '@/components/ui/Footer';
import { ConnectDomainModal } from '@/components/domain/ConnectDomainModal';

export default function ComparisonPage() {
  const [connectModalOpen, setConnectModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f8f3ec] text-[#2b1b12] flex flex-col font-sans">
      <Navbar onOpenConnectModal={() => setConnectModalOpen(true)} />

      <main className="flex-1 py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#f1e8dc] border border-[#e4d6c6] text-xs font-semibold text-[#7a5242] mb-4">
              <span>⚖️ Autonomous Platform vs Legacy Options</span>
            </div>
            <h1 className="font-editorial text-4xl sm:text-5xl font-bold tracking-tight text-[#2b1b12] mb-4">
              Rank Monk vs Traditional SEO Agencies
            </h1>
            <p className="text-sm text-[#6f5a4c] leading-relaxed">
              Why fast-growing companies are replacing manual retainers with autonomous search loop architectures.
            </p>
          </div>

          <div className="bg-[#fffcf7] border border-[#e4d6c6] rounded-2xl shadow-card overflow-hidden mb-12">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#f1e8dc] border-b border-[#e4d6c6] text-[#2b1b12]">
                    <th className="p-4 font-bold uppercase tracking-wider">Capability</th>
                    <th className="p-4 font-bold text-[#c5a059] uppercase tracking-wider bg-[#fbf6ef]">Rank Monk</th>
                    <th className="p-4 font-bold text-[#6f5a4c] uppercase tracking-wider">Legacy SEO Agency</th>
                    <th className="p-4 font-bold text-[#6f5a4c] uppercase tracking-wider">Freelancer / In-house</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e4d6c6] text-[#2b1b12]">
                  <tr>
                    <td className="p-4 font-bold">Monthly Investment</td>
                    <td className="p-4 font-bold text-[#5d7a4f] bg-[#fbf6ef]">₹10k – ₹40k / mo</td>
                    <td className="p-4 text-[#6f5a4c]">₹1.2L – ₹2.5L / mo</td>
                    <td className="p-4 text-[#6f5a4c]">₹60k – ₹90k / mo + tool costs</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-bold">Turnaround Velocity</td>
                    <td className="p-4 font-bold text-[#5d7a4f] bg-[#fbf6ef]">Instantaneous &amp; 24/7</td>
                    <td className="p-4 text-[#6f5a4c]">3–4 weeks for a single deliverable</td>
                    <td className="p-4 text-[#6f5a4c]">Dependent on individual bandwidth</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-bold">AEO / Generative Search Readiness</td>
                    <td className="p-4 font-bold text-[#5d7a4f] bg-[#fbf6ef]">Native (ChatGPT, Perplexity, Claude)</td>
                    <td className="p-4 text-[#6f5a4c]">Manual keyword stuffing for Google only</td>
                    <td className="p-4 text-[#6f5a4c]">Experimental / untracked</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-bold">Brand DNA &amp; Palette Extraction</td>
                    <td className="p-4 font-bold text-[#5d7a4f] bg-[#fbf6ef]">Autonomous on domain input</td>
                    <td className="p-4 text-[#6f5a4c]">Weeks of onboarding questionnaires</td>
                    <td className="p-4 text-[#6f5a4c]">Ad-hoc style guides</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-bold">Autonomous Code Fixes</td>
                    <td className="p-4 font-bold text-[#5d7a4f] bg-[#fbf6ef]">1-Click optimization patch</td>
                    <td className="p-4 text-[#6f5a4c]">PDF recommendations left unimplemented</td>
                    <td className="p-4 text-[#6f5a4c]">Requires developer tickets</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="text-center space-y-4">
            <button
              onClick={() => setConnectModalOpen(true)}
              className="bg-[#2b1b12] hover:bg-[#3b2519] text-[#fffcf7] px-8 py-4 rounded-xl font-semibold text-sm shadow-md transition-all"
            >
              Connect Your Website &amp; Start Growth ⚡
            </button>
          </div>
        </div>
      </main>

      <Footer />

      <ConnectDomainModal
        isOpen={connectModalOpen}
        onClose={() => setConnectModalOpen(false)}
      />
    </div>
  );
}

