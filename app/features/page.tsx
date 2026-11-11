'use client';

import React from 'react';
import Link from 'next/link';
import {
  Compass,
  Search,
  Zap,
  Globe,
  Bot,
  Sparkles,
  ShieldCheck,
  FileText,
  Share2,
  TrendingUp,
  Cpu,
  BarChart3,
  Layers,
  CheckCircle2,
  ArrowRight,
  Code2,
  Flame,
  Check
} from 'lucide-react';
import { Navbar } from '@/components/ui/Navbar';

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-[#fffcf7] text-[#2b1b12] font-sans antialiased selection:bg-[#c5a059]/20 selection:text-[#2b1b12]">
      {/* 1. Global Navigation */}
      <Navbar />

      {/* 2. Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 md:pt-18 md:pb-24 border-b border-[#e4d6c6]/60 bg-gradient-to-b from-[#f8f3ec]/60 via-[#fffcf7] to-[#fffcf7]">
        {/* Ambient subtle glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-[#c5a059]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#e4d6c6] shadow-xs animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-black uppercase tracking-wider text-[#2b1b12]">
              Rank Monk Autonomous Operating System
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#c5a059]/20 text-[#8a5b13] font-bold border border-[#c5a059]/30">
              Complete Feature Suite
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-[#2b1b12] tracking-tight font-editorial leading-[1.1]">
            Everything You Need to Dominate <br className="hidden sm:block" />
            <span className="italic text-[#8a5b13]">Traditional Search &amp; AI Engines</span>
          </h1>

          <p className="text-xs sm:text-base text-[#6f5a4c] font-medium max-w-2xl mx-auto leading-relaxed">
            Rank Monk replaces fragmented agencies, disjointed keyword tools, and manual content workflows with a single autonomous platform that writes, optimizes, crawls, self-heals, and cites your brand across modern search.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              href="/signup"
              className="px-6 py-3.5 bg-[#2b1b12] hover:bg-[#3b2519] text-[#fffcf7] font-black text-xs sm:text-sm rounded-2xl shadow-md transition-all flex items-center gap-2 cursor-pointer border border-[#c5a059]/40"
            >
              <span>Start Free Trial</span>
              <span className="text-[#c5a059]">⚡</span>
            </Link>

            <Link
              href="/eeat-analyzer"
              className="px-6 py-3.5 bg-white hover:bg-[#faf7f2] border border-[#e4d6c6] text-[#2b1b12] font-black text-xs sm:text-sm rounded-2xl shadow-xs transition-all flex items-center gap-2 cursor-pointer"
            >
              <Compass className="w-4 h-4 text-[#8a5b13]" />
              <span>Launch Free EEAT Audit</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 3. CORE FEATURES GRID */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 space-y-20">
        {/* FEATURE 1: MULTI-MODEL AEO / GEO ENGINE */}
        <div id="engines" className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-4">
          <div className="lg:col-span-6 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-800 text-[11px] font-black uppercase tracking-wider border border-blue-200">
              <Bot className="w-3.5 h-3.5 text-blue-600" />
              <span>AI Search Grounding &amp; Citation Engine</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-[#2b1b12] font-editorial">
              Generative Engine Optimization (GEO) &amp; AEO Radar
            </h2>
            <p className="text-xs sm:text-sm text-[#6f5a4c] leading-relaxed">
              When buyers ask conversational questions on <strong>Google Gemini</strong>, <strong>ChatGPT Search</strong>, <strong>Perplexity</strong>, or <strong>Claude</strong>, Rank Monk ensures your brand is cited as the primary recommendation with verified footnotes and source links.
            </p>

            <div className="space-y-2.5 pt-2">
              {[
                'Multi-hop Query Fan-Out Simulator mimicking real AI retrieval plans',
                'Live citation tracking across ChatGPT, Gemini, Perplexity, Claude, DeepSeek & Grok',
                'Automated llms.txt & llms-full.txt generation and live bot crawler inspector',
                'Share of Voice (SoV) benchmark tracking your brand vs competitors'
              ].map((point, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs text-[#2b1b12]">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{point}</span>
                </div>
              ))}
            </div>

            <div className="pt-3">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#8a5b13] hover:text-[#2b1b12] underline underline-offset-4"
              >
                <span>Explore AEO Radar in Dashboard</span>
                <span>→</span>
              </Link>
            </div>
          </div>

          <div className="lg:col-span-6 bg-white rounded-3xl border border-[#e4d6c6] p-6 shadow-card space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#e4d6c6]">
              <span className="font-bold text-xs text-[#2b1b12]">AI Engine Benchmark (Live Telemetry)</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-extrabold">Active</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { name: 'Google Gemini 2.0', score: 96, badge: 'Recommended Authority', color: '#1a73e8' },
                { name: 'ChatGPT Search (GPT-4o)', score: 93, badge: '#1 Verified Source', color: '#10a37f' },
                { name: 'Perplexity AI', score: 95, badge: 'Direct Footnote [1]', color: '#6366f1' },
                { name: 'Claude 3.5 Sonnet', score: 90, badge: 'Executive Synthesis', color: '#d97706' }
              ].map((m, i) => (
                <div key={i} className="p-3.5 bg-[#f8f3ec] rounded-2xl border border-[#e4d6c6] space-y-1">
                  <div className="text-xs font-bold text-[#2b1b12]">{m.name}</div>
                  <div className="text-lg font-black text-[#2b1b12] font-editorial">{m.score}%</div>
                  <span className="text-[9px] font-bold text-[#8a5b13]">{m.badge}</span>
                </div>
              ))}
            </div>
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-[11px] text-emerald-950">
              ⚡ <strong>Multi-Model Citation:</strong> Your brand is verified across 4 major LLMs with active grounding footnotes.
            </div>
          </div>
        </div>

        {/* FEATURE 2: E-E-A-T QUALITY ENGINE */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center border-t border-[#e4d6c6] pt-16">
          <div className="lg:col-span-6 order-2 lg:order-1 bg-white rounded-3xl border border-[#e4d6c6] p-6 shadow-card space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#e4d6c6]">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-[#8a5b13]" />
                <span className="font-bold text-xs text-[#2b1b12]">4-Axis E-E-A-T Quality Radar</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#c5a059]/20 text-[#8a5b13] font-bold">New Tool</span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-[#faf7f2] rounded-xl border border-[#e4d6c6]">
                <span className="text-[10px] uppercase font-bold text-[#6f5a4c] block">Experience</span>
                <span className="text-lg font-black text-emerald-700 font-editorial">88%</span>
                <p className="text-[10px] text-[#6f5a4c]">Case studies &amp; execution proof</p>
              </div>
              <div className="p-3 bg-[#faf7f2] rounded-xl border border-[#e4d6c6]">
                <span className="text-[10px] uppercase font-bold text-[#6f5a4c] block">Expertise</span>
                <span className="text-lg font-black text-emerald-700 font-editorial">92%</span>
                <p className="text-[10px] text-[#6f5a4c]">Author bios &amp; technical depth</p>
              </div>
              <div className="p-3 bg-[#faf7f2] rounded-xl border border-[#e4d6c6]">
                <span className="text-[10px] uppercase font-bold text-[#6f5a4c] block">Authority</span>
                <span className="text-lg font-black text-amber-700 font-editorial">78%</span>
                <p className="text-[10px] text-[#6f5a4c]">G2, Reddit &amp; media citations</p>
              </div>
              <div className="p-3 bg-[#faf7f2] rounded-xl border border-[#e4d6c6]">
                <span className="text-[10px] uppercase font-bold text-[#6f5a4c] block">Trust</span>
                <span className="text-lg font-black text-emerald-700 font-editorial">94%</span>
                <p className="text-[10px] text-[#6f5a4c]">SSL, schema &amp; contact info</p>
              </div>
            </div>
            <Link
              href="/eeat-analyzer"
              className="block w-full text-center py-2.5 bg-[#2b1b12] text-white font-bold text-xs rounded-xl shadow-xs hover:bg-[#3b2519] transition-all cursor-pointer"
            >
              Run Free E-E-A-T Audit On Your Site →
            </Link>
          </div>

          <div className="lg:col-span-6 order-1 lg:order-2 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 text-purple-800 text-[11px] font-black uppercase tracking-wider border border-purple-200">
              <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
              <span>Search Quality Rater Architecture</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-[#2b1b12] font-editorial">
              Automated E-E-A-T Quality Engine
            </h2>
            <p className="text-xs sm:text-sm text-[#6f5a4c] leading-relaxed">
              Google algorithms and LLMs demand verified human experience and corporate trust. Rank Monk audits 14 deterministic technical signals and generates an executive vector radar diamond with immediate remediation steps.
            </p>

            <div className="space-y-2.5 pt-2">
              {[
                '14-Point Deterministic Technical Signals Audit (SSL, Schema, Authors, G2, Reddit, etc.)',
                'Interactive SVG 4-Axis Radar Chart dynamically mapping Experience, Expertise, Authority & Trust',
                '1-Click Executive PDF Export for stakeholders and executive review',
                'Priority remediation roadmap eliminating generative hallucination barriers'
              ].map((point, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs text-[#2b1b12]">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{point}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* FEATURE 3: AUTONOMOUS SEO SELF-HEALING */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center border-t border-[#e4d6c6] pt-16">
          <div className="lg:col-span-6 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-black uppercase tracking-wider border border-emerald-200">
              <Zap className="w-3.5 h-3.5 text-emerald-600" />
              <span>Edge Ingestion &amp; 0ms DOM Healing</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-[#2b1b12] font-editorial">
              1-Click Autonomous SEO Self-Healing
            </h2>
            <p className="text-xs sm:text-sm text-[#6f5a4c] leading-relaxed">
              Never wait weeks for developers to update meta tags, missing titles, or JSON-LD schema. Rank Monk automatically detects defects across your site and deploys instant fixes via our lightweight edge self-healing script (<code className="bg-[#f8f3ec] px-1 py-0.5 rounded text-[11px]">heal.js</code>).
            </p>

            <div className="space-y-2.5 pt-2">
              {[
                'Instant DOM healing on page load with 0ms performance overhead',
                'Automated generation of missing meta descriptions, title tags, and canonical directives',
                'Optional GitHub GitOps PR creation or WordPress / CMS REST API automatic syncing',
                '100% autonomous — review and confirm, everything else happens by itself'
              ].map((point, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs text-[#2b1b12]">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{point}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-6 bg-gradient-to-br from-[#2b1b12] via-[#3a2518] to-[#1c120b] text-[#fffcf7] rounded-3xl p-6 sm:p-7 shadow-card space-y-4 border border-[#c5a059]/40">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <span className="font-bold text-xs text-white">Edge Self-Healing Protocol</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-black">heal.js Active</span>
            </div>
            <div className="p-3 bg-white/5 rounded-2xl border border-white/10 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-emerald-400">
                <span>Rule: Auto-Inject Organization Schema</span>
                <span className="text-[10px] text-white/60">0ms injection</span>
              </div>
              <pre className="text-[10px] text-emerald-300 font-mono bg-black/40 p-2.5 rounded-xl overflow-x-auto">
{`<script src="https://rankmonk.in/heal.js" data-site="yourdomain.com" async></script>`}
              </pre>
            </div>
            <p className="text-xs text-[#e4d6c6]/80 leading-relaxed">
              When search bots or users request your page, the script executes before render, guaranteeing 100% technical audit compliance.
            </p>
          </div>
        </div>

        {/* FEATURE 4: AUTONOMOUS BLOG PIPELINE & SOCIAL STUDIO */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 border-t border-[#e4d6c6] pt-16">
          <div className="p-6 bg-white rounded-3xl border border-[#e4d6c6] shadow-card space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-[#f8f3ec] border border-[#e4d6c6] text-[#8a5b13] flex items-center justify-center font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-[#2b1b12] font-editorial">Autonomous Blog Engine</h3>
            <p className="text-xs text-[#6f5a4c] leading-relaxed">
              Researches competitor keyword gaps, generates comprehensive 2,500+ word articles with verified footnotes, creates AI visuals, and syncs directly to WordPress, Webflow, and Shopify.
            </p>
          </div>

          <div className="p-6 bg-white rounded-3xl border border-[#e4d6c6] shadow-card space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-[#f8f3ec] border border-[#e4d6c6] text-[#8a5b13] flex items-center justify-center font-bold">
              <Share2 className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-[#2b1b12] font-editorial">Omnichannel Social Studio</h3>
            <p className="text-xs text-[#6f5a4c] leading-relaxed">
              Turns long-form content into high-converting posts for LinkedIn, X/Twitter, Instagram, and Facebook with automated multi-channel scheduling and native preview cards.
            </p>
          </div>

          <div className="p-6 bg-white rounded-3xl border border-[#e4d6c6] shadow-card space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-[#f8f3ec] border border-[#e4d6c6] text-[#8a5b13] flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-[#2b1b12] font-editorial">AI Media &amp; Poster Studio</h3>
            <p className="text-xs text-[#6f5a4c] leading-relaxed">
              Generates branded marketing posters, square promo creatives, and 9:16 story formats with automated brand typography, logos, and service layouts.
            </p>
          </div>
        </div>
      </section>

      {/* 4. BOTTOM CTA */}
      <section className="bg-gradient-to-r from-[#2b1b12] via-[#3a2518] to-[#20140d] text-white py-16 border-t border-[#c5a059]/40">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-black font-editorial text-white">
            Ready to Accelerate Your Organic &amp; AI Search Footprint?
          </h2>
          <p className="text-xs sm:text-sm text-[#e4d6c6]/80 max-w-xl mx-auto leading-relaxed">
            Join enterprise founders and marketing teams dominating both Google PageRank and Generative AI citations with Rank Monk.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              href="/signup"
              className="px-6 py-3.5 bg-[#c5a059] hover:bg-[#b38e47] text-[#2b1b12] font-black text-xs sm:text-sm rounded-2xl shadow-md transition-all cursor-pointer"
            >
              Start Free Trial →
            </Link>
            <Link
              href="/eeat-analyzer"
              className="px-6 py-3.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs sm:text-sm rounded-2xl transition-all cursor-pointer"
            >
              Run Free E-E-A-T Audit
            </Link>
          </div>
        </div>
      </section>

      {/* 5. Footer */}
      <footer className="border-t border-[#e4d6c6] py-8 bg-[#f8f3ec]/60 text-center text-xs text-[#6f5a4c] space-y-2">
        <p className="font-semibold text-[#2b1b12]">
          Rank Monk Autonomous Growth Engine • rankmonk.in
        </p>
        <p className="text-[11px]">
          Unified Organic OS for Traditional PageRank &amp; Generative AI Search
        </p>
      </footer>
    </div>
  );
}

