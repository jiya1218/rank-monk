'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/ui/Navbar';
import { Footer } from '@/components/ui/Footer';
import { PricingSection } from '@/components/pricing/PricingSection';
import { ConnectDomainModal } from '@/components/domain/ConnectDomainModal';

export default function PricingPage() {
  const [connectModalOpen, setConnectModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f8f3ec] text-[#2b1b12] flex flex-col font-sans">
      <Navbar onOpenConnectModal={() => setConnectModalOpen(true)} />

      <main className="flex-1 py-10">
        <PricingSection />
      </main>

      <Footer />

      <ConnectDomainModal
        isOpen={connectModalOpen}
        onClose={() => setConnectModalOpen(false)}
      />
    </div>
  );
}

