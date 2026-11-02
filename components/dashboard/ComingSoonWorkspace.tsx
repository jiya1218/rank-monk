'use client';

import React from 'react';
import { Rocket, Sparkles, Bell, ArrowLeft } from 'lucide-react';

interface ComingSoonWorkspaceProps {
  moduleName: string;
  description?: string;
  onBackToDashboard: () => void;
}

export function ComingSoonWorkspace({
  moduleName,
  description,
  onBackToDashboard
}: ComingSoonWorkspaceProps) {
  const defaultDesc = `The autonomous ${moduleName} module is currently undergoing high-velocity calibration and will be available in the upcoming release.`;

  return (
    <div className="flex flex-col items-center justify-center min-h-[65vh] px-4 text-center animate-fade-in max-w-2xl mx-auto">
      {/* Top 3D-styled Badge Icon */}
      <div className="w-20 h-20 bg-gradient-to-br from-[#2b1b12] to-[#7a5242] rounded-3xl flex items-center justify-center mb-6 shadow-xl shadow-[#2b1b12]/15 transform rotate-3 hover:rotate-0 transition-transform">
        <Rocket className="w-10 h-10 text-[#fffcf7] -rotate-3 hover:rotate-0 transition-transform" />
      </div>

      {/* Title */}
      <h2 className="text-3xl sm:text-4xl font-black text-[#2b1b12] tracking-tight mb-3">
        {moduleName} is{' '}
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#c5a059] to-[#7a5242]">
          Coming Soon
        </span>
      </h2>

      {/* Subtitle */}
      <p className="text-sm sm:text-base text-[#6f5a4c] font-medium max-w-lg mb-8 leading-relaxed">
        {description || defaultDesc}
      </p>

      {/* In Active Development Pill */}
      <div className="flex items-center gap-3 bg-white border border-[#e4d6c6] shadow-sm rounded-full px-5 py-2.5 mb-8">
        <span className="flex h-2.5 w-2.5 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#c5a059] opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#c5a059]"></span>
        </span>
        <span className="text-xs font-bold text-[#2b1b12] uppercase tracking-wider">
          In Active Development
        </span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onBackToDashboard}
          className="px-5 py-2.5 bg-[#2b1b12] hover:bg-[#3b2519] text-[#fffcf7] text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer flex items-center gap-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Dashboard</span>
        </button>

        <button
          type="button"
          onClick={() => alert(`✓ You've been subscribed to notifications for the ${moduleName} release!`)}
          className="px-5 py-2.5 bg-white border border-[#e4d6c6] hover:bg-[#f8f3ec] text-[#2b1b12] text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer flex items-center gap-2"
        >
          <Bell className="w-3.5 h-3.5 text-[#c5a059]" />
          <span>Notify Me on Launch</span>
        </button>
      </div>
    </div>
  );
}

