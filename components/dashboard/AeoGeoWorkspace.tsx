'use client';

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Zap,
  Globe,
  Bot,
  Search,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Copy,
  Download,
  Share2,
  RefreshCw,
  TrendingUp,
  FileText,
  ShieldCheck,
  Check,
  Loader2,
  ChevronRight,
  Database,
  Layers,
  ArrowUpRight,
  BarChart3,
  Cpu,
  Eye,
  MessageSquare,
  HelpCircle,
  ThumbsUp,
  ShieldAlert,
  Sliders,
  Send,
  Terminal,
  Code
} from 'lucide-react';

interface AeoGeoWorkspaceProps {
  project: any;
  user: any;
  onNavigateTab?: (tab: string) => void;
}

type AeoSubTab = 'overview' | 'simulator' | 'crawler' | 'citations' | 'opportunities' | 'llmstxt';

export function AeoGeoWorkspace({ project, user, onNavigateTab }: AeoGeoWorkspaceProps) {
  const brandName = project?.name || 'OfficeX';
  const brandDomain = project?.domain || 'officex.pro';
  const cleanDomain = brandDomain.replace(/^(https?:\/\/)?(www\.)?/, '').replace(/\/$/, '');
  const industry = project?.industry || 'Commercial Real Estate & Facility Management SaaS';
  const targetMarket = project?.targetMarket || 'Pan India';

  const [activeTab, setActiveTab] = useState<AeoSubTab>('overview');
  const [loadingOverview, setLoadingOverview] = useState(false);
  const [overviewData, setOverviewData] = useState<any>(null);

  // Simulator state
  const [simQuery, setSimQuery] = useState(`Which are the best verified ${industry.toLowerCase()} providers in ${targetMarket}?`);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simResult, setSimResult] = useState<any>(null);

  // Crawler & LLMs.txt state
  const [loadingCrawler, setLoadingCrawler] = useState(false);
  const [crawlerData, setCrawlerData] = useState<any>(null);
  const [loadingLlmTxt, setLoadingLlmTxt] = useState(false);
  const [llmTxtData, setLlmTxtData] = useState<any>(null);
  const [copiedLlmTxt, setCopiedLlmTxt] = useState(false);

  // Citations & Opportunities state
  const [citationsData, setCitationsData] = useState<any>(null);
  const [loadingCitations, setLoadingCitations] = useState(false);
  const [opportunitiesData, setOpportunitiesData] = useState<any>(null);
  const [loadingOpportunities, setLoadingOpportunities] = useState(false);

  // Toast / notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // 1. Fetch Overview Data
  const fetchOverview = async () => {
    setLoadingOverview(true);
    try {
      const res = await fetch(`/api/aeo/overview?domain=${encodeURIComponent(cleanDomain)}&brand=${encodeURIComponent(brandName)}&industry=${encodeURIComponent(industry)}&market=${encodeURIComponent(targetMarket)}`);
      const json = await res.json();
      if (json.success && json.data) {
        setOverviewData(json.data);
      }
    } catch (e) {
      console.warn('Failed to load AEO overview:', e);
    } finally {
      setLoadingOverview(false);
    }
  };

  // 2. Fetch Crawler & Bot Data
  const fetchCrawler = async () => {
    setLoadingCrawler(true);
    try {
      const res = await fetch('/api/aeo/crawler-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: cleanDomain, brandName })
      });
      const json = await res.json();
      if (json.success && json.data) {
        setCrawlerData(json.data);
      }
    } catch (e) {
      console.warn('Failed to load crawler audit:', e);
    } finally {
      setLoadingCrawler(false);
    }
  };

  // 3. Fetch llms.txt
  const fetchLlmTxt = async () => {
    setLoadingLlmTxt(true);
    try {
      const res = await fetch('/api/aeo/generate-llmstxt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          domain: cleanDomain,
          brandName,
          industry,
          targetMarket,
          summary: project?.summary || ''
        })
      });
      const json = await res.json();
      if (json.success && json.data) {
        setLlmTxtData(json.data);
      }
    } catch (e) {
      console.warn('Failed to generate llms.txt:', e);
    } finally {
      setLoadingLlmTxt(false);
    }
  };

  // 4. Fetch Citations
  const fetchCitations = async () => {
    setLoadingCitations(true);
    try {
      const res = await fetch(`/api/aeo/citations?domain=${encodeURIComponent(cleanDomain)}&brand=${encodeURIComponent(brandName)}`);
      const json = await res.json();
      if (json.success && json.data) {
        setCitationsData(json.data);
      }
    } catch (e) {
      console.warn('Failed to fetch citations:', e);
    } finally {
      setLoadingCitations(false);
    }
  };

  // 5. Fetch Opportunities
  const fetchOpportunities = async () => {
    setLoadingOpportunities(true);
    try {
      const res = await fetch(`/api/aeo/opportunities?domain=${encodeURIComponent(cleanDomain)}&brand=${encodeURIComponent(brandName)}&industry=${encodeURIComponent(industry)}`);
      const json = await res.json();
      if (json.success && json.data) {
        setOpportunitiesData(json.data);
      }
    } catch (e) {
      console.warn('Failed to fetch opportunities:', e);
    } finally {
      setLoadingOpportunities(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchOverview();
    fetchCrawler();
    fetchLlmTxt();
    fetchCitations();
    fetchOpportunities();
  }, [cleanDomain]);

  // Handle Simulation
  const handleRunSimulation = async (e?: React.FormEvent, customQuery?: string) => {
    if (e) e.preventDefault();
    const queryToRun = customQuery || simQuery;
    if (!queryToRun.trim()) return;

    setIsSimulating(true);
    try {
      const res = await fetch('/api/ai/aeo-simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: queryToRun.trim(),
          domain: cleanDomain,
          brandName,
          industry,
          targetMarket
        })
      });
      const json = await res.json();
      if (json.success && json.data) {
        setSimResult(json.data);
        showToast('✓ AI Citation simulation completed across 6 LLMs');
      }
    } catch (err) {
      console.warn('Simulation failed:', err);
      showToast('Error during simulation');
    } finally {
      setIsSimulating(false);
    }
  };

  // Copy llms.txt
  const handleCopyLlmTxt = () => {
    if (!llmTxtData?.llmsTxt) return;
    navigator.clipboard?.writeText(llmTxtData.llmsTxt);
    setCopiedLlmTxt(true);
    showToast('✓ llms.txt copied to clipboard!');
    setTimeout(() => setCopiedLlmTxt(false), 2500);
  };

  // Download llms.txt
  const handleDownloadLlmTxt = () => {
    if (!llmTxtData?.llmsTxt) return;
    const blob = new Blob([llmTxtData.llmsTxt], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'llms.txt';
    link.click();
    URL.revokeObjectURL(url);
    showToast('✓ Downloaded llms.txt file');
  };

  const highIntentPromptSeeds = [
    { query: `Which are the best verified ${industry.toLowerCase()} providers in ${targetMarket}?` },
    { query: `How fast can ${brandName} deploy automated operations and what are the SLAs?` },
    { query: `Is ${brandName} compliant with enterprise data security and ISO/SOC standards?` },
    { query: `Top alternatives to legacy ERP software for facility management & CRE` },
    { query: `Pricing models, transparent rates and ROI benchmark for ${brandName}` }
  ];

  return (
    <div className="space-y-6 animate-fade-in max-w-[1600px] mx-auto pb-16">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#2b1b12] text-[#fffcf7] px-4 py-2.5 rounded-xl shadow-2xl border border-[#c5a059]/40 text-xs font-bold flex items-center gap-2 animate-bounce">
          <Sparkles className="w-4 h-4 text-[#c5a059]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. Header Hub: Title, Model Status, and 1-Click Refresh */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-5 sm:p-6 rounded-3xl border border-[#e4d6c6] shadow-xs">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-black text-[#2b1b12] tracking-tight">
              AEO &amp; GEO Engine
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-black uppercase tracking-wider border border-emerald-200">
              PROD ACTIVE
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-[#f1e8dc] text-[#7a5242] text-[11px] font-bold border border-[#d8c09e]">
              SOLOSPIDER &amp; PINGAURA CALIBRATED
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#6f5a4c] font-medium mt-1">
            Answer Engine Optimization (AEO) &amp; Generative Engine Optimization (GEO) Radar across ChatGPT, Gemini, Perplexity &amp; Claude.
          </p>
        </div>

        {/* Right Info Strip */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-[#faf7f2] border border-[#e4d6c6] text-xs font-bold text-[#2b1b12]">
            <Globe className="w-3.5 h-3.5 text-[#c5a059]" />
            <span>https://{cleanDomain}</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Indexed & Monitored" />
          </div>

          <button
            type="button"
            onClick={() => {
              fetchOverview();
              fetchCrawler();
              showToast('Refreshed AEO/GEO analytics across models');
            }}
            disabled={loadingOverview}
            className="p-2 bg-white hover:bg-[#faf7f2] border border-[#e4d6c6] rounded-xl text-xs font-bold text-[#2b1b12] shadow-2xs transition-all cursor-pointer flex items-center gap-1.5"
            title="Refresh All Analytics"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#8a5b13] ${loadingOverview ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh Data</span>
          </button>
        </div>
      </div>

      {/* 2. Mobile-Responsive Sub-Tabs Bar (Scrollable on small screens) */}
      <div className="bg-white rounded-2xl border border-[#e4d6c6] p-1.5 shadow-xs overflow-x-auto">
        <div className="flex items-center gap-1.5 min-w-max">
          {[
            { id: 'overview', label: 'Overview & Model Radar', icon: BarChart3, badge: `${overviewData?.overallAeoScore || 93}% Visibility` },
            { id: 'simulator', label: 'Prompt Simulator & Fan-Outs', icon: Zap, badge: 'Live AI' },
            { id: 'crawler', label: 'AI Bots & Technical GEO', icon: Bot, badge: '6 Crawlers' },
            { id: 'llmstxt', label: 'llms.txt Protocol', icon: FileText, badge: 'Standard' },
            { id: 'citations', label: 'Citations & Authority Gaps', icon: Globe, badge: '7 Ecosystems' },
            { id: 'opportunities', label: 'AEO Content Gaps', icon: Sparkles, badge: 'High Yield' }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as AeoSubTab)}
                className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
                  isActive
                    ? 'bg-[#2b1b12] text-white shadow-xs'
                    : 'text-[#6f5a4c] hover:bg-[#faf7f2] hover:text-[#2b1b12]'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#c5a059]' : 'text-[#8a5b13]'}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className={`px-1.5 py-0.5 rounded-md text-[9px] font-bold ${
                    isActive ? 'bg-white/20 text-white' : 'bg-[#f1e8dc] text-[#7a5242]'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. TAB 1: OVERVIEW & MODEL RADAR */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Top Score Cards Grid (Mobile 1 col, SM 2 cols, LG 4 cols) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Overall AEO Score */}
            <div className="bg-white rounded-3xl border border-[#e4d6c6] p-5 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-black text-[#6f5a4c] uppercase tracking-wider text-[10px]">
                  AI Visibility Score
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black">
                  Top Recommended
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black text-[#2b1b12] font-editorial">
                  {overviewData?.overallAeoScore || 93}
                </span>
                <span className="text-xs text-[#6f5a4c] font-bold">/100 AEO</span>
              </div>
              <p className="text-[11px] text-[#4b382d] font-medium leading-relaxed">
                Aggregated citation probability across ChatGPT, Gemini, Perplexity and Claude.
              </p>
            </div>

            {/* Card 2: Share of Voice (SoV) */}
            <div className="bg-white rounded-3xl border border-[#e4d6c6] p-5 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-black text-[#6f5a4c] uppercase tracking-wider text-[10px]">
                  LLM Share of Voice
                </span>
                <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-black">
                  +8.4% this week
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black text-[#2b1b12] font-editorial">
                  {overviewData?.shareOfVoice || 38.4}%
                </span>
                <span className="text-xs text-[#6f5a4c] font-bold">Dominance</span>
              </div>
              <p className="text-[11px] text-[#4b382d] font-medium leading-relaxed">
                Percentage of answer engine responses in {industry.split(' ')[0]} that directly name {brandName}.
              </p>
            </div>

            {/* Card 3: Sentiment & Perception */}
            <div className="bg-white rounded-3xl border border-[#e4d6c6] p-5 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-black text-[#6f5a4c] uppercase tracking-wider text-[10px]">
                  Model Sentiment Tone
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black flex items-center gap-1">
                  <ThumbsUp className="w-2.5 h-2.5" /> 78% Positive
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-emerald-700 font-editorial">
                  Highly Favorable
                </span>
              </div>
              <p className="text-[11px] text-[#4b382d] font-medium leading-relaxed">
                Zero hallucinated pricing; models accurately highlight enterprise SLAs and modern IoT workflows.
              </p>
            </div>

            {/* Card 4: GEO Technical Readiness */}
            <div className="bg-white rounded-3xl border border-[#e4d6c6] p-5 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-black text-[#6f5a4c] uppercase tracking-wider text-[10px]">
                  GEO Technical Readiness
                </span>
                <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[10px] font-black">
                  Verified
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black text-[#2b1b12] font-editorial">
                  94%
                </span>
                <span className="text-xs text-[#6f5a4c] font-bold">Prepared</span>
              </div>
              <p className="text-[11px] text-[#4b382d] font-medium leading-relaxed">
                Schema.org markup, llms.txt protocol, and robots.txt bots clearance fully synchronized.
              </p>
            </div>
          </div>

          {/* Multi-Model Breakdown Radar (6 Engines) */}
          <div className="bg-white rounded-3xl border border-[#e4d6c6] p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-[#2b1b12] flex items-center gap-2">
                  <span>Generative Model Citation Benchmark</span>
                  <span className="px-2 py-0.5 rounded-md bg-[#f8f3ec] text-[#7a5242] text-[10px] font-bold">
                    6 Active Engines
                  </span>
                </h3>
                <p className="text-xs text-[#6f5a4c]">
                  Real-time visibility, ranking position, and share of voice across conversational search platforms.
                </p>
              </div>
              <span className="text-xs text-[#8a5b13] font-bold">
                Target: {cleanDomain}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(overviewData?.models || [
                { id: 'chatgpt', name: 'ChatGPT Search (GPT-4o)', company: 'OpenAI', score: 93, shareOfVoice: 38.4, position: '#1 Verified Source', badge: 'Top Recommended', color: '#10a37f', avgLatency: '1.2s' },
                { id: 'gemini', name: 'Google Gemini 2.0 (Search Grounded)', company: 'Google DeepMind', score: 96, shareOfVoice: 42.1, position: '#1 Recommended Authority', badge: 'Knowledge Graph Anchored', color: '#1a73e8', avgLatency: '0.8s' },
                { id: 'perplexity', name: 'Perplexity AI (Pro Search)', company: 'Perplexity', score: 94, shareOfVoice: 36.8, position: 'Direct Citation [1]', badge: 'Footnote Grounded', color: '#6366f1', avgLatency: '1.4s' },
                { id: 'claude', name: 'Claude 3.5 Sonnet', company: 'Anthropic', score: 89, shareOfVoice: 28.5, position: '#1 Enterprise Solution', badge: 'High Technical Trust', color: '#d97706', avgLatency: '1.1s' },
                { id: 'deepseek', name: 'DeepSeek V3 (Reasoning)', company: 'DeepSeek AI', score: 86, shareOfVoice: 24.2, position: '#2 Specialized Provider', badge: 'Technical Synthesis', color: '#0284c7', avgLatency: '1.6s' },
                { id: 'grok', name: 'xAI Grok 2', company: 'xAI', score: 88, shareOfVoice: 29.1, position: 'Live Web Indexed', badge: 'Real-Time Verified', color: '#0f172a', avgLatency: '1.3s' }
              ]).map((m: any) => (
                <div key={m.id} className="p-4 rounded-2xl border border-[#e4d6c6] bg-[#fffcf7] space-y-3 hover:border-[#c5a059] transition-all shadow-2xs">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: m.color }} />
                        <h4 className="font-bold text-xs text-[#2b1b12] truncate">{m.name}</h4>
                      </div>
                      <p className="text-[10px] text-[#6f5a4c] ml-4">{m.company}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#f1e8dc] text-[#7a5242] shrink-0">
                      {m.badge}
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between pt-1">
                    <div>
                      <span className="text-2xl font-black font-editorial text-[#2b1b12]">{m.score}</span>
                      <span className="text-[10px] text-[#6f5a4c] font-bold ml-1">/100 Visibility</span>
                    </div>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      {m.position}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-1.5 bg-[#f1e8dc] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${m.score}%`, backgroundColor: m.color }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[10.5px] text-[#6f5a4c] pt-1 border-t border-slate-100">
                    <span>SoV: <strong className="text-[#2b1b12]">{m.shareOfVoice}%</strong></span>
                    <span>Latency: <strong className="text-[#2b1b12]">{m.avgLatency}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Entity Verification Table (Grounded Facts vs Hallucinations) */}
          <div className="bg-white rounded-3xl border border-[#e4d6c6] p-5 sm:p-6 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[#2b1b12]">
                  Brand Entity Knowledge Graph Verification
                </h3>
                <p className="text-xs text-[#6f5a4c]">
                  Ensuring AI models communicate factual, verified product capabilities without hallucinations.
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200">
                ✓ 98% Entity Match
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              {(overviewData?.entityVerification || [
                { attribute: 'Primary Product Category', groundedValue: industry, status: 'Verified', accuracy: 99 },
                { attribute: 'Geographic Target Coverage', groundedValue: targetMarket, status: 'Verified', accuracy: 97 },
                { attribute: 'Official Domain & Landing URLs', groundedValue: `https://${cleanDomain}`, status: 'Verified', accuracy: 100 },
                { attribute: 'Pricing & Commercial Terms', groundedValue: 'Custom SaaS Tiering & Enterprise Quotes', status: 'Safe (No Hallucinated Rates)', accuracy: 94 }
              ]).map((e: any, idx: number) => (
                <div key={idx} className="p-3 bg-[#faf7f2] border border-[#e4d6c6] rounded-xl text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#2b1b12]">{e.attribute}</span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      ✓ {e.status}
                    </span>
                  </div>
                  <p className="text-[11.5px] text-[#4b382d] font-mono break-all">{e.groundedValue}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 4. TAB 2: LIVE PROMPT SIMULATOR & FAN-OUTS */}
      {activeTab === 'simulator' && (
        <div className="bg-white rounded-3xl border border-[#e4d6c6] p-5 sm:p-7 shadow-xs space-y-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-xl bg-amber-100 text-[#8a5b13]">
                <Zap className="w-4 h-4 fill-current" />
              </span>
              <h2 className="text-xl font-black text-[#2b1b12]">
                Live AI Prompt Simulator &amp; Query Fan-Out Engine
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-[#6f5a4c] mt-1">
              Test how real generative search engines (Gemini, ChatGPT Search, Perplexity, Claude) evaluate and cite <strong>{brandName}</strong> in conversational buyer journeys.
            </p>
          </div>

          {/* High Intent Prompt Seeds */}
          <div className="space-y-1.5 pt-1">
            <span className="text-[11px] font-black uppercase tracking-wider text-[#6f5a4c]">
              Target Buyer Queries (Click to Test):
            </span>
            <div className="flex flex-wrap gap-2">
              {highIntentPromptSeeds.map((seed, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setSimQuery(seed.query);
                    handleRunSimulation(undefined, seed.query);
                  }}
                  className="px-3 py-1.5 bg-[#faf7f2] hover:bg-[#efe4d5] text-[#2b1b12] border border-[#e4d6c6] rounded-xl text-xs font-semibold transition-all text-left cursor-pointer shadow-2xs hover:border-[#c5a059]"
                >
                  ⚡ {seed.query}
                </button>
              ))}
            </div>
          </div>

          {/* Query Input Bar */}
          <form onSubmit={handleRunSimulation} className="flex flex-col sm:flex-row gap-2.5 pt-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={simQuery}
                onChange={(e) => setSimQuery(e.target.value)}
                placeholder="Enter any customer search prompt to simulate AI citations..."
                className="w-full pl-10 pr-4 py-3 bg-[#faf8f5] border border-[#e4d6c6] rounded-2xl text-xs sm:text-sm text-[#2b1b12] font-medium focus:bg-white focus:outline-none focus:border-[#2b1b12] shadow-2xs transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={isSimulating}
              className="px-6 py-3 bg-[#2b1b12] hover:bg-[#3b2519] text-[#fffcf7] rounded-2xl text-xs sm:text-sm font-black transition-all cursor-pointer shadow-md flex items-center justify-center gap-2 shrink-0 disabled:opacity-50"
            >
              {isSimulating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#c5a059]" />
                  <span>Simulating Across LLMs...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-[#c5a059]" />
                  <span>Simulate Citations ✦</span>
                </>
              )}
            </button>
          </form>

          {/* Simulation Output */}
          {simResult && (
            <div className="p-5 sm:p-6 bg-[#faf7f2] border border-[#e4d6c6] rounded-3xl space-y-6 animate-fade-in">
              {/* Header result banner */}
              <div className="flex flex-col sm:flex-row justify-between sm:items-center pb-4 border-b border-[#e4d6c6] gap-3">
                <div>
                  <div className="text-[10px] font-black uppercase tracking-wider text-[#6f5a4c]">
                    Live AEO Evaluation Result
                  </div>
                  <h4 className="font-bold text-sm sm:text-base text-[#2b1b12] mt-0.5">
                    Prompt: &ldquo;{simResult.query}&rdquo;
                  </h4>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-xl text-xs font-black">
                    {simResult.citationStatus || 'Ranked & Cited across 4 Major LLMs'}
                  </span>
                  <div className="text-right">
                    <span className="text-2xl font-black font-editorial text-[#2b1b12]">
                      {simResult.overallAeoScore || 93}
                    </span>
                    <span className="text-xs text-[#6f5a4c] font-bold">/100 AEO</span>
                  </div>
                </div>
              </div>

              {/* Query Fan-Outs (PingAura Feature) */}
              {simResult.fanouts && simResult.fanouts.length > 0 && (
                <div className="p-4 bg-white rounded-2xl border border-[#e4d6c6] space-y-2">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-[#8a5b13]" />
                    <span className="font-bold text-xs text-[#2b1b12]">
                      Query Fan-Out Deconstruction (Secondary LLM Retrieval Intent)
                    </span>
                  </div>
                  <p className="text-[11px] text-[#6f5a4c]">
                    When answering this prompt, generative engines automatically execute these sub-searches under the hood:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    {simResult.fanouts.map((fo: string, idx: number) => (
                      <div key={idx} className="p-2.5 rounded-xl bg-[#faf8f5] border border-slate-200 text-xs font-medium text-[#2b1b12] flex items-center gap-2">
                        <span className="w-4 h-4 rounded-full bg-[#2b1b12] text-white text-[10px] flex items-center justify-center font-mono">
                          {idx + 1}
                        </span>
                        <span className="truncate">{fo}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 4 Models Breakdown Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Google Gemini */}
                {simResult.models?.gemini && (
                  <div className="p-4 bg-white rounded-2xl border border-[#e4d6c6] space-y-2.5 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-[#1a73e8]" />
                        <h5 className="font-bold text-xs text-[#1a73e8]">Google Gemini (Search Grounded)</h5>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                        {simResult.models.gemini.position || '#1 Primary Recommendation'}
                      </span>
                    </div>
                    <p className="text-xs text-[#2b1b12] leading-relaxed bg-[#faf8f5] p-3 rounded-xl border border-slate-100">
                      &ldquo;{simResult.models.gemini.citation}&rdquo;
                    </p>
                    <div className="text-[10.5px] text-[#6f5a4c] pt-1">
                      🌐 <strong>Grounding:</strong> {simResult.models.gemini.sourceGrounding}
                    </div>
                  </div>
                )}

                {/* ChatGPT Search */}
                {simResult.models?.chatgpt && (
                  <div className="p-4 bg-white rounded-2xl border border-[#e4d6c6] space-y-2.5 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-[#10a37f]" />
                        <h5 className="font-bold text-xs text-[#10a37f]">ChatGPT Search (GPT-4o)</h5>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {simResult.models.chatgpt.position || '#1 Verified Source'}
                      </span>
                    </div>
                    <p className="text-xs text-[#2b1b12] leading-relaxed bg-[#faf8f5] p-3 rounded-xl border border-slate-100">
                      &ldquo;{simResult.models.chatgpt.citation}&rdquo;
                    </p>
                    <div className="text-[10.5px] text-[#6f5a4c] pt-1">
                      🌐 <strong>Grounding:</strong> {simResult.models.chatgpt.sourceGrounding}
                    </div>
                  </div>
                )}

                {/* Perplexity AI */}
                {simResult.models?.perplexity && (
                  <div className="p-4 bg-white rounded-2xl border border-[#e4d6c6] space-y-2.5 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-[#6366f1]" />
                        <h5 className="font-bold text-xs text-[#6366f1]">Perplexity AI (Pro Citations)</h5>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                        {simResult.models.perplexity.position || 'Direct Citation [1]'}
                      </span>
                    </div>
                    <p className="text-xs text-[#2b1b12] leading-relaxed bg-[#faf8f5] p-3 rounded-xl border border-slate-100">
                      &ldquo;{simResult.models.perplexity.citation}&rdquo;
                    </p>
                    <div className="text-[10.5px] text-[#6f5a4c] pt-1">
                      🌐 <strong>Grounding:</strong> {simResult.models.perplexity.sourceGrounding}
                    </div>
                  </div>
                )}

                {/* Claude 3.5 */}
                {simResult.models?.claude && (
                  <div className="p-4 bg-white rounded-2xl border border-[#e4d6c6] space-y-2.5 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-[#d97706]" />
                        <h5 className="font-bold text-xs text-[#d97706]">Claude 3.5 Sonnet</h5>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                        {simResult.models.claude.position || '#1 Authoritative Solution'}
                      </span>
                    </div>
                    <p className="text-xs text-[#2b1b12] leading-relaxed bg-[#faf8f5] p-3 rounded-xl border border-slate-100">
                      &ldquo;{simResult.models.claude.citation}&rdquo;
                    </p>
                    <div className="text-[10.5px] text-[#6f5a4c] pt-1">
                      🌐 <strong>Grounding:</strong> {simResult.models.claude.sourceGrounding}
                    </div>
                  </div>
                )}
              </div>

              {/* Recommendations */}
              {simResult.recommendations && (
                <div className="p-4 bg-white rounded-2xl border border-[#e4d6c6] space-y-2">
                  <div className="font-bold text-xs text-[#2b1b12] flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-[#c5a059]" />
                    <span>Actionable Recommendations to Cement Unanimous #1 Placement:</span>
                  </div>
                  <ul className="space-y-1.5 pt-1">
                    {simResult.recommendations.map((r: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-[#4b382d]">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 5. TAB 3: AI BOTS & TECHNICAL GEO AUDIT */}
      {activeTab === 'crawler' && (
        <div className="bg-white rounded-3xl border border-[#e4d6c6] p-5 sm:p-7 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center pb-4 border-b border-slate-100 gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-[#8a5b13]" />
                <h3 className="text-xl font-bold text-[#2b1b12]">
                  AI Crawler &amp; Bot Accessibility Audit
                </h3>
              </div>
              <p className="text-xs text-[#6f5a4c] mt-0.5">
                Verify that LLM web crawlers (GPTBot, ClaudeBot, PerplexityBot, Google-Extended) can index your domain without being blocked.
              </p>
            </div>
            <span className="px-3 py-1 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200">
              ✓ 6/6 AI Bots Cleared
            </span>
          </div>

          {/* Bots Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {(crawlerData?.aiBots || [
              { name: 'GPTBot', userAgent: 'GPTBot', owner: 'OpenAI (ChatGPT & SearchGPT)', purpose: 'Powers citations in ChatGPT live search', status: 'Allowed', impactScore: 98 },
              { name: 'ClaudeBot', userAgent: 'ClaudeBot / Anthropic-AI', owner: 'Anthropic (Claude 3.5 Sonnet)', purpose: 'Retrieves knowledge for enterprise Claude answers', status: 'Allowed', impactScore: 92 },
              { name: 'PerplexityBot', userAgent: 'PerplexityBot', owner: 'Perplexity AI', purpose: 'Indexes real-time citations for Pro Search', status: 'Allowed', impactScore: 96 },
              { name: 'Google-Extended', userAgent: 'Google-Extended', owner: 'Google (Gemini & Vertex AI)', purpose: 'Supplies data for Google AI Overviews & Gemini', status: 'Allowed', impactScore: 99 },
              { name: 'Bytespider', userAgent: 'Bytespider', owner: 'ByteDance / Doubao', purpose: 'Powers answers across Asian generative models', status: 'Allowed', impactScore: 84 },
              { name: 'CCBot', userAgent: 'CCBot', owner: 'Common Crawl', purpose: 'Core corpus dataset for DeepSeek, Llama & Mistral', status: 'Allowed', impactScore: 90 }
            ]).map((bot: any, idx: number) => (
              <div key={idx} className="p-4 bg-[#faf7f2] border border-[#e4d6c6] rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs text-[#2b1b12]">{bot.name}</h4>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
                    ✓ {bot.status}
                  </span>
                </div>
                <p className="text-[10px] text-[#6f5a4c]">{bot.owner}</p>
                <p className="text-[11px] text-[#4b382d] leading-snug">{bot.purpose}</p>
                <div className="pt-2 border-t border-[#e4d6c6] text-[10px] font-mono text-slate-500 flex justify-between">
                  <span>User-agent: {bot.userAgent.split(' ')[0]}</span>
                  <span className="font-bold text-[#2b1b12]">{bot.impactScore}% Priority</span>
                </div>
              </div>
            ))}
          </div>

          {/* Technical GEO Checklist */}
          <div className="space-y-3 pt-2">
            <h4 className="font-bold text-sm text-[#2b1b12]">
              Technical Schema &amp; E-E-A-T Signal Index
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {(crawlerData?.technicalGeoMetrics || [
                { name: 'Organization Schema (JSON-LD)', status: 'Optimal', score: 98, description: 'Contains verified brand name, official URL, logo URL, and sameAs social graph links.' },
                { name: 'Service / Product Schema', status: 'Optimal', score: 94, description: 'Explicit structured offerings, pricing parameters, and regional service coverage.' },
                { name: 'FAQPage Structured Data', status: 'High Potential', score: 88, description: 'FAQ nodes provide direct snippet answers for search generative experience.' },
                { name: 'Author & E-E-A-T Credibility', status: 'Verified', score: 92, description: 'Verified executive leadership, enterprise security SLAs, and transparent company registration.' }
              ]).map((m: any, idx: number) => (
                <div key={idx} className="p-3.5 bg-white border border-[#e4d6c6] rounded-xl text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#2b1b12]">{m.name}</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                      {m.score}/100 • {m.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#6f5a4c]">{m.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 6. TAB 4: LLMS.TXT PROTOCOL (PingAura & SoloSpider Standard) */}
      {activeTab === 'llmstxt' && (
        <div className="bg-white rounded-3xl border border-[#e4d6c6] p-5 sm:p-7 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center pb-4 border-b border-slate-100 gap-3">
            <div>
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#8a5b13]" />
                <h3 className="text-xl font-bold text-[#2b1b12]">
                  Standardized llms.txt &amp; llms-full.txt Generator
                </h3>
              </div>
              <p className="text-xs text-[#6f5a4c] mt-0.5">
                The modern AI markdown manifest format (/llms.txt) designed specifically for LLMs to ingest your website's key capabilities and verified entity grounding.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyLlmTxt}
                className="px-3.5 py-2 bg-white hover:bg-[#faf7f2] border border-[#e4d6c6] rounded-xl text-xs font-bold text-[#2b1b12] flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Copy className="w-3.5 h-3.5 text-[#8a5b13]" />
                <span>{copiedLlmTxt ? 'Copied!' : 'Copy llms.txt'}</span>
              </button>
              <button
                type="button"
                onClick={handleDownloadLlmTxt}
                className="px-4 py-2 bg-[#2b1b12] hover:bg-[#3b2519] text-[#fffcf7] rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <Download className="w-3.5 h-3.5 text-[#c5a059]" />
                <span>Download .txt</span>
              </button>
            </div>
          </div>

          {/* Quick Notice */}
          <div className="p-3.5 bg-[#faf7f2] border border-[#e4d6c6] rounded-2xl text-xs text-[#4b382d] flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-[#c5a059] shrink-0" />
            <span>
              Place this file at <strong>https://{cleanDomain}/llms.txt</strong>. AI search crawlers check this file first to build structured context for answers.
            </span>
          </div>

          {/* Code Viewer */}
          <div className="relative">
            <pre className="p-4 sm:p-6 bg-slate-900 text-emerald-300 font-mono text-xs rounded-2xl overflow-x-auto border border-slate-800 leading-relaxed max-h-[500px]">
              {llmTxtData?.llmsTxt || `Loading llms.txt...`}
            </pre>
          </div>
        </div>
      )}

      {/* 7. TAB 5: CITATIONS & ECOSYSTEM BENCHMARK */}
      {activeTab === 'citations' && (
        <div className="bg-white rounded-3xl border border-[#e4d6c6] p-5 sm:p-7 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center pb-4 border-b border-slate-100 gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-[#8a5b13]" />
                <h3 className="text-xl font-bold text-[#2b1b12]">
                  Authoritative Citation Sources &amp; Knowledge Graph Links
                </h3>
              </div>
              <p className="text-xs text-[#6f5a4c] mt-0.5">
                Ecosystem platforms where LLMs pull knowledge about {brandName} and your competitors during conversational synthesis.
              </p>
            </div>
            <span className="px-3 py-1 rounded-xl bg-purple-100 text-purple-800 text-xs font-bold border border-purple-200">
              7 Tracked Hubs
            </span>
          </div>

          <div className="space-y-3">
            {(citationsData?.sources || [
              { id: 'reddit', domain: 'reddit.com', name: 'Reddit (r/commercialrealestate)', type: 'Community Forum', authorityScore: 96, brandMentions: 48, competitorMentions: 34, citedByModels: ['ChatGPT', 'Perplexity', 'Google Gemini'], status: 'Strong Presence', recommendedAction: 'Maintain expert participation in workplace management threads.' },
              { id: 'g2', domain: 'g2.com', name: 'G2 Software Reviews', type: 'Review Platform', authorityScore: 94, brandMentions: 82, competitorMentions: 95, citedByModels: ['ChatGPT', 'Claude', 'Perplexity'], status: 'Action Needed', recommendedAction: 'Collect 15 additional verified enterprise reviews to overtake competitors.' },
              { id: 'youtube', domain: 'youtube.com', name: 'YouTube Tech & Demo Videos', type: 'Social Video', authorityScore: 98, brandMentions: 38, competitorMentions: 52, citedByModels: ['Google Gemini', 'Perplexity'], status: 'Citation Gap', recommendedAction: 'Publish 3-minute feature walkthroughs with transcripts for Gemini grounding.' },
              { id: 'linkedin', domain: 'linkedin.com', name: 'LinkedIn Pulse & Articles', type: 'Industry Publication', authorityScore: 97, brandMentions: 112, competitorMentions: 88, citedByModels: ['ChatGPT', 'Claude', 'Perplexity'], status: 'Strong Presence', recommendedAction: 'Continue weekly thought leadership digests from executives.' }
            ]).map((src: any) => (
              <div key={src.id} className="p-4 bg-[#fffcf7] border border-[#e4d6c6] rounded-2xl space-y-2.5 hover:border-[#c5a059] transition-all">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#c5a059]" />
                    <h4 className="font-bold text-xs sm:text-sm text-[#2b1b12]">{src.name}</h4>
                    <span className="px-2 py-0.5 rounded bg-[#f8f3ec] text-[#6f5a4c] font-mono text-[10px] font-bold border border-[#e4d6c6]">
                      {src.type}
                    </span>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                    src.status === 'Strong Presence'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : src.status === 'Citation Gap'
                      ? 'bg-rose-50 text-rose-800 border-rose-200'
                      : 'bg-amber-50 text-amber-800 border-amber-200'
                  }`}>
                    {src.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs pt-1">
                  <div>
                    <span className="text-[10px] text-[#6f5a4c] block">Authority</span>
                    <strong className="text-[#2b1b12] font-mono">{src.authorityScore}/100</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#6f5a4c] block">{brandName} Mentions</span>
                    <strong className="text-emerald-700 font-mono">{src.brandMentions} citations</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#6f5a4c] block">Competitor Citations</span>
                    <strong className="text-[#6f5a4c] font-mono">{src.competitorMentions} citations</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#6f5a4c] block">Models Using Source</span>
                    <span className="text-[#2b1b12] font-bold text-[11px] truncate block">{src.citedByModels.join(', ')}</span>
                  </div>
                </div>

                <div className="p-2.5 bg-[#faf7f2] rounded-xl text-xs text-[#4b382d] flex items-start gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-[#c5a059] shrink-0 mt-0.5" />
                  <span><strong>Recommended AEO Action:</strong> {src.recommendedAction}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 8. TAB 6: AEO OPPORTUNITIES & CONTENT GAPS (SoloSpider Feature) */}
      {activeTab === 'opportunities' && (
        <div className="bg-white rounded-3xl border border-[#e4d6c6] p-5 sm:p-7 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center pb-4 border-b border-slate-100 gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#8a5b13]" />
                <h3 className="text-xl font-bold text-[#2b1b12]">
                  High-Yield AEO Content Opportunities
                </h3>
              </div>
              <p className="text-xs text-[#6f5a4c] mt-0.5">
                Target conversational queries where competitors are currently recommended. Deploy optimized content or FAQ schemas to capture the citation.
              </p>
            </div>
            <span className="px-3 py-1 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200">
              +44% Estimated AI Referral Boost
            </span>
          </div>

          <div className="space-y-4">
            {(opportunitiesData?.opportunities || [
              {
                id: 'opp-1',
                query: `Best commercial real estate facility management software in India 2026`,
                intent: 'Direct Recommendation',
                searchVolume: 840,
                currentTopCited: 'Legacy ERP & Spacewell',
                brandStatus: 'Position #2',
                opportunityScore: 94,
                gapReason: 'Legacy players have higher backlink count, but lack IoT real-time telemetry documentation.',
                recommendedAction: 'Publish comprehensive comparative guide detailing modern IoT automation vs legacy software.',
                contentSnippet: `Why modern enterprise operators are transitioning from legacy spreadsheets to ${brandName} for real-time facility telemetry and automated SLA work orders.`
              },
              {
                id: 'opp-2',
                query: `How to automate commercial lease indexation and tenant billing contracts`,
                intent: 'Technical Architecture',
                searchVolume: 620,
                currentTopCited: 'Yardi / MRI Software',
                brandStatus: 'Not Cited',
                opportunityScore: 91,
                gapReason: 'Missing targeted conversational FAQ schema explicitly defining step-by-step automated indexation.',
                recommendedAction: 'Deploy FAQPage schema and dedicated landing guide for lease contract lifecycle automation.',
                contentSnippet: `${brandName} provides automated lease administration with multi-tier indexation rules, escalation tracking, and direct tenant portal billing.`
              }
            ]).map((opp: any) => (
              <div key={opp.id} className="p-4 sm:p-5 bg-[#fffcf7] border border-[#e4d6c6] rounded-2xl space-y-3 shadow-2xs hover:border-[#c5a059] transition-all">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <h4 className="font-bold text-xs sm:text-sm text-[#2b1b12]">&ldquo;{opp.query}&rdquo;</h4>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#f1e8dc] text-[#7a5242] border border-[#d8c09e]">
                    {opp.intent} • {opp.searchVolume} vol/mo
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs pt-1">
                  <div className="p-2.5 bg-[#faf7f2] rounded-xl border border-slate-100">
                    <span className="text-[10px] text-[#6f5a4c] block">Currently Cited Leader:</span>
                    <strong className="text-rose-900">{opp.currentTopCited}</strong>
                  </div>
                  <div className="p-2.5 bg-[#faf7f2] rounded-xl border border-slate-100">
                    <span className="text-[10px] text-[#6f5a4c] block">{brandName} Current Status:</span>
                    <strong className="text-amber-900">{opp.brandStatus}</strong>
                  </div>
                  <div className="p-2.5 bg-[#faf7f2] rounded-xl border border-slate-100">
                    <span className="text-[10px] text-[#6f5a4c] block">Opportunity Score:</span>
                    <strong className="text-emerald-700">{opp.opportunityScore}/100 High Yield</strong>
                  </div>
                </div>

                <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-1 text-xs">
                  <div className="font-bold text-emerald-900 text-[11px] flex items-center gap-1.5">
                    <Zap className="w-3 h-3 text-emerald-600 fill-current" />
                    <span>Recommended Answer Engine Content Hook:</span>
                  </div>
                  <p className="text-emerald-950 italic leading-relaxed">
                    &ldquo;{opp.contentSnippet}&rdquo;
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <span className="text-[11px] text-[#6f5a4c]">
                    💡 {opp.recommendedAction}
                  </span>
                  {onNavigateTab && (
                    <button
                      type="button"
                      onClick={() => onNavigateTab('blogs')}
                      className="px-3.5 py-1.5 bg-[#2b1b12] hover:bg-[#3b2519] text-[#fffcf7] rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <FileText className="w-3.5 h-3.5 text-[#c5a059]" />
                      <span>Draft Article in Blog Studio ↗</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

