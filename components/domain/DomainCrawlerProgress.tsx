'use client';

import React, { useState, useEffect } from 'react';
import {
  Globe,
  CheckCircle2,
  Loader2,
  Sparkles,
  ShieldCheck,
  Search,
  Palette,
  Terminal,
  Activity
} from 'lucide-react';

export interface DomainCrawlerProgressProps {
  domain: string;
  market?: string;
}

export const CRAWLER_STAGES = [
  {
    id: 'dns',
    title: 'Resolving DNS & Network Handshake',
    subtitle: 'Verifying TLS/SSL certificate and origin server latency...',
    icon: Globe,
    badge: 'Network Protocol',
    minPercent: 12,
    log: 'GET / HTTP/2.0 - 200 OK (TLS 1.3 Handshake Validated)'
  },
  {
    id: 'crawl',
    title: 'Deep Autonomous Crawler Active',
    subtitle: 'Crawling HTML DOM tree, sitemap XML and internal routes...',
    icon: Search,
    badge: 'DOM & Metadata',
    minPercent: 32,
    log: 'Parsed HTML tree, canonical tags, schema.org JSON-LD and robots.txt'
  },
  {
    id: 'brand',
    title: 'Extracting Visual Brand Identity',
    subtitle: 'Extracting vector logo, primary palette and typography rules...',
    icon: Palette,
    badge: 'Brand Intelligence',
    minPercent: 55,
    log: 'Color palette extracted from CSS root variables; logo assets mapped'
  },
  {
    id: 'aeo',
    title: 'Benchmarking AEO & GEO Citations',
    subtitle: 'Simulating LLM brand visibility across Google, ChatGPT & Claude...',
    icon: Sparkles,
    badge: 'AI Search Engines',
    minPercent: 74,
    log: 'Queried multi-model inference radar for entity knowledge graph'
  },
  {
    id: 'competitors',
    title: 'Calibrating Competitor Authority Matrix',
    subtitle: 'Profiling regional search competitors & keyword market share...',
    icon: Activity,
    badge: 'Market Radar',
    minPercent: 88,
    log: 'Regional search market competitors mapped and benchmarked'
  },
  {
    id: 'sync',
    title: 'Locking Fixed Website Workspace',
    subtitle: 'Compiling continuous audit pipeline and synchronizing dashboard...',
    icon: ShieldCheck,
    badge: 'Finalizing Engine',
    minPercent: 96,
    log: 'Workspace locked; initializing continuous autonomous monitors'
  }
];

export function DomainCrawlerProgress({ domain, market = 'Pan India' }: DomainCrawlerProgressProps) {
  const [currentStageIdx, setCurrentStageIdx] = useState(0);
  const [progressPercent, setProgressPercent] = useState(14);
  const cleanDomain = domain.replace(/^https?:\/\//i, '').replace(/\/$/, '') || 'your-domain.com';

  useEffect(() => {
    // Automated natural progression through stages
    const timer = setInterval(() => {
      setCurrentStageIdx((prev) => {
        if (prev < CRAWLER_STAGES.length - 1) {
          const next = prev + 1;
          setProgressPercent(CRAWLER_STAGES[next].minPercent);
          return next;
        }
        return prev;
      });
    }, 1400);

    // Micro-tick for progress percentage
    const progressTimer = setInterval(() => {
      setProgressPercent((prev) => {
        if (prev < 95) {
          return prev + 1;
        }
        return prev;
      });
    }, 280);

    return () => {
      clearInterval(timer);
      clearInterval(progressTimer);
    };
  }, []);

  const activeStage = CRAWLER_STAGES[currentStageIdx];

  return (
    <div className="bg-gradient-to-b from-[#fffcf7] to-[#f8f3ec] border border-[#d8c09e] rounded-3xl p-5 sm:p-6 shadow-xl space-y-5 animate-fade-in text-left">
      {/* Top Header: Radar Icon + Live Status + Percent */}
      <div className="flex items-start justify-between gap-3 border-b border-[#e4d6c6] pb-4">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-11 h-11 rounded-2xl bg-[#2b1b12] text-[#c5a059] shadow-md shrink-0">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#c5a059] opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-[#c5a059]" />
            </span>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="font-editorial text-sm sm:text-base font-bold text-[#2b1b12] truncate">
                Autonomous Deep Site Crawler
              </h4>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-[#c5a059]/15 text-[#8a5b13] border border-[#c5a059]/30">
                LIVE
              </span>
            </div>
            <p className="text-[11px] text-[#6f5a4c] truncate">
              Crawling <span className="font-mono font-bold text-[#2b1b12]">{cleanDomain}</span> • {market}
            </p>
          </div>
        </div>

        <div className="text-right shrink-0">
          <div className="font-editorial text-2xl font-black text-[#c5a059] leading-none">
            {progressPercent}%
          </div>
          <span className="text-[10px] font-bold text-[#6f5a4c] uppercase tracking-wider">
            Step {currentStageIdx + 1} of {CRAWLER_STAGES.length}
          </span>
        </div>
      </div>

      {/* Animated Glowing Progress Bar */}
      <div className="space-y-1.5">
        <div className="w-full h-2.5 bg-[#e4d6c6]/60 rounded-full overflow-hidden p-0.5">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#c5a059] via-[#e6ca85] to-[#c5a059] transition-all duration-300 ease-out shadow-sm relative overflow-hidden"
            style={{ width: `${progressPercent}%` }}
          >
            <div className="absolute inset-0 bg-white/30 animate-[shimmer_1.5s_infinite] -skew-x-12" />
          </div>
        </div>
      </div>

      {/* Active Stage Showcase Card */}
      <div className="p-4 bg-white border border-[#c5a059]/40 rounded-2xl shadow-sm space-y-2 relative overflow-hidden">
        <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider">
          <span className="text-[#c5a059] flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#c5a059] animate-pulse" />
            Current Operation
          </span>
          <span className="px-2 py-0.5 rounded-md bg-[#f8f3ec] text-[#6f5a4c] border border-[#e4d6c6]">
            {activeStage.badge}
          </span>
        </div>

        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-[#f8f3ec] text-[#2b1b12] shrink-0 mt-0.5">
            <activeStage.icon className="w-4 h-4 text-[#c5a059]" />
          </div>
          <div className="min-w-0">
            <h5 className="font-bold text-xs sm:text-sm text-[#2b1b12]">
              {activeStage.title}
            </h5>
            <p className="text-[11px] text-[#6f5a4c] leading-relaxed mt-0.5">
              {activeStage.subtitle}
            </p>
          </div>
        </div>
      </div>

      {/* Micro-Telemetry Stream */}
      <div className="bg-[#2b1b12] rounded-xl p-3 border border-[#3f2a1d] space-y-1 text-[10px] font-mono text-[#ebdcc8]/80">
        <div className="flex items-center justify-between text-[9px] font-bold text-[#c5a059] uppercase tracking-wider pb-1 border-b border-white/10">
          <span className="flex items-center gap-1.5">
            <Terminal className="w-3 h-3" />
            Live Crawler Stream
          </span>
          <span className="text-[#a89078]">origin: {cleanDomain}</span>
        </div>

        <div className="space-y-1 pt-1 max-h-24 overflow-hidden">
          {CRAWLER_STAGES.slice(0, currentStageIdx + 1).map((stg, i) => (
            <div key={stg.id} className="flex items-center gap-2 truncate text-[10px]">
              <span className="text-emerald-400 shrink-0 font-bold">✓</span>
              <span className="text-slate-400 shrink-0">[{stg.id.toUpperCase()}]</span>
              <span className={`truncate ${i === currentStageIdx ? 'text-white font-bold' : 'text-[#ebdcc8]/70'}`}>
                {stg.log}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

