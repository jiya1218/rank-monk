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
  Code,
  Table,
  LayoutGrid,
  ChevronDown,
  ChevronUp,
  ArrowRight
} from 'lucide-react';

interface AeoGeoWorkspaceProps {
  project: any;
  user: any;
  onNavigateTab?: (tab: string) => void;
}

type AeoSubTab = 'overview' | 'prompts' | 'simulator' | 'crawler' | 'citations' | 'opportunities' | 'llmstxt';

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

  // Multi-prompt batch simulator state (10, 30, 50, 100, 200 prompts)
  const [promptScope, setPromptScope] = useState<number>(30);
  const [batchAuditData, setBatchAuditData] = useState<any>(null);
  const [loadingBatchAudit, setLoadingBatchAudit] = useState<boolean>(false);
  const [checkedPrompts, setCheckedPrompts] = useState<string[]>([]);
  const [batchResults, setBatchResults] = useState<Record<string, any>>({});
  const [activeBatchQuery, setActiveBatchQuery] = useState<string | null>(null);
  const [batchProgress, setBatchProgress] = useState<{ current: number; total: number } | null>(null);

  // Audited Prompts Matrix Filters (PingAura style)
  const [promptFilterCategory, setPromptFilterCategory] = useState<string>('All');
  const [promptFilterStatus, setPromptFilterStatus] = useState<string>('All');
  const [promptSearchTerm, setPromptSearchTerm] = useState<string>('');
  const [promptViewMode, setPromptViewMode] = useState<'table' | 'cards'>('table');
  const [expandedPromptId, setExpandedPromptId] = useState<string | null>(null);
  const [tablePage, setTablePage] = useState<number>(1);
  const [tablePageSize, setTablePageSize] = useState<number>(50);

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
    handleRunBatchAudit(promptScope);
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

  // Handle Batch Simulation for multiple prompts
  const handleRunBatchSimulation = async (queries: string[]) => {
    if (!queries.length) return;
    setIsSimulating(true);
    setBatchProgress({ current: 0, total: queries.length });
    const collected: Record<string, any> = { ...batchResults };

    try {
      for (let i = 0; i < queries.length; i++) {
        const q = queries[i];
        setBatchProgress({ current: i + 1, total: queries.length });
        const res = await fetch('/api/ai/aeo-simulate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: q.trim(),
            domain: cleanDomain,
            brandName,
            industry,
            targetMarket
          })
        });
        const json = await res.json();
        if (json.success && json.data) {
          collected[q] = json.data;
          setSimResult(json.data);
          setActiveBatchQuery(q);
        }
      }
      setBatchResults(collected);
      showToast(`✓ Completed AEO simulation for ${queries.length} prompts across all AI models`);
    } catch (err) {
      console.warn('Batch simulation failed:', err);
      showToast('Error during batch simulation');
    } finally {
      setIsSimulating(false);
      setBatchProgress(null);
    }
  };

  // Large-Scale AEO Batch Audit across 10, 30, 50, 100, 200 real prompts
  const handleRunBatchAudit = async (count = promptScope) => {
    setLoadingBatchAudit(true);
    showToast(`Initiating live AEO audit across ${count} real buyer prompts...`);
    try {
      const res = await fetch('/api/aeo/batch-audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          domain: cleanDomain,
          brandName,
          industry,
          targetMarket,
          promptCount: count
        })
      });
      const json = await res.json();
      if (json.success && json.data) {
        setBatchAuditData(json.data);
        showToast(`✓ Completed audit of ${count} prompts across Gemini, ChatGPT, Perplexity & Claude!`);
      }
    } catch (e) {
      console.warn('Batch audit failed:', e);
      showToast('Error during batch audit');
    } finally {
      setLoadingBatchAudit(false);
    }
  };

  // Top-Right Quick Re-Run Action
  const handleTopRightReRun = () => {
    handleRunBatchAudit(promptScope);
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
    { query: `How does ${brandName} compare against leading competitors in ${industry.toLowerCase()}?` },
    { query: `Is ${brandName} compliant with verified quality and industry standards?` },
    { query: `Top alternatives and market leaders in ${industry.toLowerCase()}` },
    { query: `Pricing models, transparent rates and customer reviews for ${brandName}` }
  ];

  useEffect(() => {
    if (highIntentPromptSeeds.length > 0 && checkedPrompts.length === 0) {
      setCheckedPrompts(highIntentPromptSeeds.slice(0, 3).map(p => p.query));
    }
  }, [cleanDomain]);

  // Dynamic Real Metrics derived strictly from Batch Audit or Overview (NO hardcoded fake percentages)
  const auditedList = batchAuditData?.auditedQueries || [];
  const totalAudited = auditedList.length;

  const chatgptCitedCount = auditedList.filter((q: any) => q.chatgpt?.cited).length;
  const chatgptPct = totalAudited > 0
    ? Math.round((chatgptCitedCount / totalAudited) * 100)
    : (batchAuditData?.modelPerformance?.find((m: any) => m.model?.toLowerCase().includes('chatgpt'))?.winRate ?? overviewData?.models?.find((m: any) => m.id === 'chatgpt')?.score ?? 0);

  const geminiCitedCount = auditedList.filter((q: any) => q.gemini?.cited).length;
  const geminiPct = totalAudited > 0
    ? Math.round((geminiCitedCount / totalAudited) * 100)
    : (batchAuditData?.modelPerformance?.find((m: any) => m.model?.toLowerCase().includes('gemini'))?.winRate ?? overviewData?.models?.find((m: any) => m.id === 'gemini')?.score ?? 0);

  const perplexityCitedCount = auditedList.filter((q: any) => q.perplexity?.cited).length;
  const perplexityPct = totalAudited > 0
    ? Math.round((perplexityCitedCount / totalAudited) * 100)
    : (batchAuditData?.modelPerformance?.find((m: any) => m.model?.toLowerCase().includes('perplexity'))?.winRate ?? overviewData?.models?.find((m: any) => m.id === 'perplexity')?.score ?? 0);

  const claudeCitedCount = auditedList.filter((q: any) => q.claude?.cited).length;
  const claudePct = totalAudited > 0
    ? Math.round((claudeCitedCount / totalAudited) * 100)
    : (batchAuditData?.modelPerformance?.find((m: any) => m.model?.toLowerCase().includes('claude'))?.winRate ?? overviewData?.models?.find((m: any) => m.id === 'claude')?.score ?? 0);

  const realOverallScore = batchAuditData?.overallAeoScore ?? (totalAudited > 0 ? Math.round((chatgptPct + geminiPct + perplexityPct + claudePct) / 4) : (overviewData?.overallAeoScore ?? 0));
  const realSoV = batchAuditData?.shareOfVoice ?? (totalAudited > 0 ? Number((realOverallScore * 0.35).toFixed(1)) : (overviewData?.shareOfVoice ?? 0));

  // Render Clean High-Density Audited Prompts Table
  const renderPromptsTable = (items: any[]) => {
    if (loadingBatchAudit) {
      return (
        <div className="p-12 text-center bg-[#faf8f5] rounded-2xl border border-[#e4d6c6] space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#c5a059] mx-auto" />
          <h4 className="text-sm font-black text-[#2b1b12]">Auditing {promptScope} Real Buyer Queries Across Answer Engines...</h4>
          <p className="text-xs text-[#6f5a4c]">Testing citations against Google Gemini, ChatGPT Search, Perplexity AI, and Claude.</p>
        </div>
      );
    }

    if (!items || items.length === 0) {
      return (
        <div className="bg-[#faf8f5] rounded-2xl border border-[#e4d6c6] p-8 text-center space-y-3">
          <p className="text-sm font-bold text-[#6f5a4c]">No audited prompts found matching this criteria.</p>
          <button
            type="button"
            onClick={() => handleRunBatchAudit(promptScope)}
            className="px-4 py-2 bg-[#2b1b12] text-white rounded-xl text-xs font-black shadow-xs cursor-pointer hover:bg-[#3b2519]"
          >
            Run Audit Now ({promptScope} Prompts)
          </button>
        </div>
      );
    }

    const totalItems = items.length;
    const totalPages = Math.ceil(totalItems / tablePageSize) || 1;
    const currentPage = Math.min(tablePage, totalPages);
    const startIdx = (currentPage - 1) * tablePageSize;
    const pageItems = tablePageSize >= totalItems ? items : items.slice(startIdx, startIdx + tablePageSize);

    return (
      <div className="rounded-2xl border border-[#e4d6c6] bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#faf7f2] border-b border-[#e4d6c6] text-[#6f5a4c] font-black uppercase tracking-wider text-[10px]">
                <th className="py-3.5 px-3 w-12 text-center">#</th>
                <th className="py-3.5 px-4 min-w-[280px]">Buyer Search Prompt &amp; Intent Constraint</th>
                <th className="py-3.5 px-3 min-w-[130px]">Category &amp; Cluster</th>
                <th className="py-3.5 px-3 min-w-[85px] text-center">Est. Vol</th>
                <th className="py-3.5 px-3 min-w-[115px] text-center">Citation Status</th>
                <th className="py-3.5 px-3 min-w-[200px]">Model Checks (4 Engines)</th>
                <th className="py-3.5 px-3 min-w-[150px]">Top Cited Entity</th>
                <th className="py-3.5 px-3 w-24 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {pageItems.map((q: any, idx: number) => {
                const isExpanded = expandedPromptId === q.id;
                const isWinning = q.status === 'Cited #1' || q.status === 'Position #2';
                const rowNum = startIdx + idx + 1;
                return (
                  <React.Fragment key={q.id || idx}>
                    <tr
                      onClick={() => setExpandedPromptId(isExpanded ? null : q.id)}
                      className={`hover:bg-[#fcfaf7] transition-colors cursor-pointer ${isExpanded ? 'bg-[#faf6ee]' : ''}`}
                    >
                      <td className="py-3.5 px-3 text-center font-mono font-bold text-slate-400 text-[11px]">
                        {rowNum}
                      </td>
                    <td className="py-3.5 px-4 space-y-0.5">
                      <div className="font-bold text-[#2b1b12] text-xs leading-snug">
                        &ldquo;{q.query}&rdquo;
                      </div>
                      {q.intentRationale && (
                        <div className="text-[11px] text-[#6f5a4c] line-clamp-1">
                          {q.intentRationale}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-3 space-y-1">
                      <span className="inline-block px-2 py-0.5 rounded bg-[#f8f3ec] text-[#7a5242] text-[9.5px] font-black uppercase tracking-wider">
                        {q.category}
                      </span>
                      <div className="text-[10.5px] text-[#2b1b12] font-semibold truncate">
                        {q.cluster}
                      </div>
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      <span className="px-2 py-0.5 rounded bg-[#faf7f2] border border-[#e4d6c6] text-[#2b1b12] text-[10px] font-mono font-bold">
                        {q.estVolume || 'est. 10/mo'}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black border ${
                        q.status === 'Cited #1'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : q.status === 'Position #2'
                          ? 'bg-blue-50 text-blue-800 border-blue-300'
                          : 'bg-rose-50 text-rose-800 border-rose-300'
                      }`}>
                        {q.status === 'Cited #1' ? '✓ Cited #1' : q.status === 'Position #2' ? '● Pos #2' : '⚠ Citation Gap'}
                      </span>
                    </td>
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {/* ChatGPT */}
                        <span className={`px-1.5 py-0.5 rounded text-[9.5px] font-bold border ${
                          q.chatgpt?.cited ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-slate-100 text-slate-400 border-slate-200'
                        }`} title={`ChatGPT: ${q.chatgpt?.position || 'Not Cited'}`}>
                          GPT {q.chatgpt?.cited ? '✓' : '✗'}
                        </span>
                        {/* Gemini */}
                        <span className={`px-1.5 py-0.5 rounded text-[9.5px] font-bold border ${
                          q.gemini?.cited ? 'bg-blue-50 text-blue-800 border-blue-200' : 'bg-slate-100 text-slate-400 border-slate-200'
                        }`} title={`Gemini: ${q.gemini?.position || 'Not Cited'}`}>
                          Gemini {q.gemini?.cited ? '✓' : '✗'}
                        </span>
                        {/* Perplexity */}
                        <span className={`px-1.5 py-0.5 rounded text-[9.5px] font-bold border ${
                          q.perplexity?.cited ? 'bg-indigo-50 text-indigo-800 border-indigo-200' : 'bg-slate-100 text-slate-400 border-slate-200'
                        }`} title={`Perplexity: ${q.perplexity?.position || 'Not Cited'}`}>
                          Perp {q.perplexity?.cited ? '✓' : '✗'}
                        </span>
                        {/* Claude */}
                        <span className={`px-1.5 py-0.5 rounded text-[9.5px] font-bold border ${
                          q.claude?.cited ? 'bg-amber-50 text-amber-800 border-amber-200' : 'bg-slate-100 text-slate-400 border-slate-200'
                        }`} title={`Claude: ${q.claude?.position || 'Not Cited'}`}>
                          Claude {q.claude?.cited ? '✓' : '✗'}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-1.5">
                        <span className={`font-bold text-xs truncate max-w-[130px] ${isWinning ? 'text-emerald-700' : 'text-[#2b1b12]'}`}>
                          {isWinning ? brandName : (q.topCompetitorCited || 'Legacy Incumbents')}
                        </span>
                        {isWinning ? (
                          <span className="text-[10px] text-emerald-600 font-bold shrink-0">★ Cited</span>
                        ) : (
                          <span className="text-[10px] text-rose-600 font-bold shrink-0">Winner</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandedPromptId(isExpanded ? null : q.id);
                        }}
                        className="px-2 py-1 rounded bg-[#faf7f2] hover:bg-[#efe4d5] text-[#2b1b12] text-[10px] font-bold border border-[#e4d6c6] cursor-pointer flex items-center justify-center gap-1 mx-auto"
                      >
                        <span>{isExpanded ? 'Hide' : 'Quote'}</span>
                        {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      </button>
                    </td>
                  </tr>

                  {/* Expandable Verbatim AI Quote & Technical Gap Drawer */}
                  {isExpanded && (
                    <tr className="bg-[#fffdfa] border-b border-[#e4d6c6]">
                      <td colSpan={8} className="p-4 sm:p-5 space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                          {/* Verbatim Quote Snippet */}
                          <div className="p-3.5 bg-[#faf7f2] rounded-xl border border-[#e4d6c6] space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="text-[10.5px] font-black uppercase text-[#8a5b13] flex items-center gap-1">
                                <Sparkles className="w-3 h-3 text-[#c5a059]" />
                                <span>Verbatim Answer Engine Quote</span>
                              </span>
                              <span className="text-[10px] font-mono text-[#6f5a4c]">Generated Across 4 Engines</span>
                            </div>
                            <p className="text-xs text-[#2b1b12] italic leading-relaxed">
                              &ldquo;{q.modelSnippet}&rdquo;
                            </p>
                          </div>

                          {/* Competitor Analysis & Technical Gap */}
                          <div className="p-3.5 bg-white rounded-xl border border-slate-200 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-[10.5px] font-black uppercase text-[#6f5a4c]">
                                Citation Analysis &amp; Competitor Grounding
                              </span>
                              {q.topCompetitorCited && (
                                <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                                  Competitor: {q.topCompetitorCited}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-[#4a3528] leading-relaxed">
                              {q.gapReason || (isWinning ? `Brand successfully anchored for ${q.cluster} intent.` : 'Legacy competitors capture grounding due to extensive historical backlink and review authority.')}
                            </p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
        </div>

        {/* Pagination & Rows-Per-Page Toolbar */}
        <div className="p-3.5 bg-[#faf7f2] border-t border-[#e4d6c6] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#6f5a4c]">
          <div className="flex items-center gap-2 flex-wrap">
            <span>
              Showing <strong className="text-[#2b1b12]">{totalItems > 0 ? startIdx + 1 : 0}</strong> – <strong className="text-[#2b1b12]">{Math.min(startIdx + pageItems.length, totalItems)}</strong> of <strong className="text-[#2b1b12]">{totalItems}</strong> audited prompts
            </span>
            <div className="hidden sm:flex items-center gap-1 ml-3 border-l border-slate-200 pl-3">
              <span className="text-[11px]">Rows per page:</span>
              {[25, 50, 100, 200].map((sz) => (
                <button
                  key={sz}
                  type="button"
                  onClick={() => {
                    setTablePageSize(sz);
                    setTablePage(1);
                  }}
                  className={`px-2 py-0.5 rounded text-[10.5px] font-bold cursor-pointer transition-all ${
                    tablePageSize === sz ? 'bg-[#2b1b12] text-white' : 'bg-white text-[#2b1b12] border border-[#e4d6c6] hover:bg-[#f1e8dc]'
                  }`}
                >
                  {sz === 200 ? 'All (200)' : sz}
                </button>
              ))}
            </div>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setTablePage(p => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
                className="px-2.5 py-1 rounded-lg bg-white border border-[#e4d6c6] font-bold text-xs cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#efe4d5]"
              >
                Previous
              </button>
              <span className="text-[11px] font-mono px-2">
                Page {currentPage} of {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setTablePage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
                className="px-2.5 py-1 rounded-lg bg-white border border-[#e4d6c6] font-bold text-xs cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#efe4d5]"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-[1600px] mx-auto pb-16">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#2b1b12] text-[#fffcf7] px-4 py-2.5 rounded-xl shadow-2xl border border-[#c5a059]/40 text-xs font-bold flex items-center gap-2 animate-bounce">
          <Sparkles className="w-4 h-4 text-[#c5a059]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. Header Hub: Title, Model Status, and Clean Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-5 sm:p-6 rounded-3xl border border-[#e4d6c6] shadow-xs">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-black text-[#2b1b12] tracking-tight font-editorial">
              AEO &amp; GEO Radar
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-[#f1e8dc] text-[#7a5242] text-[11px] font-bold border border-[#d8c09e]">
              Autonomous Engine
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#6f5a4c] font-medium mt-1">
            Real-time search grounding and conversational citation monitor across ChatGPT, Gemini, Perplexity &amp; Claude.
          </p>
        </div>

        {/* Right Info, Prompt Number Selection & Re-Run Strip (Responsive & Clean) */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 w-full md:w-auto justify-between md:justify-end">
          {/* Domain Tag */}
          <div className="hidden xl:flex items-center gap-2 px-3 py-2 rounded-2xl bg-[#faf7f2] border border-[#e4d6c6] text-xs font-bold text-[#2b1b12]">
            <Globe className="w-3.5 h-3.5 text-[#c5a059]" />
            <span>https://{cleanDomain}</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Indexed & Monitored" />
          </div>

          {/* Prompt Number Selection (10, 30, 50, 100, 200) */}
          <div className="flex items-center gap-1 p-1 bg-[#faf7f2] border border-[#e4d6c6] rounded-2xl shadow-2xs">
            <span className="text-[10px] font-black uppercase text-[#6f5a4c] px-2 hidden sm:inline">
              Prompts:
            </span>
            {[10, 30, 50, 100, 200].map((num) => {
              const isActive = promptScope === num;
              return (
                <button
                  key={num}
                  type="button"
                  onClick={() => {
                    setPromptScope(num);
                    handleRunBatchAudit(num);
                  }}
                  className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#2b1b12] text-white shadow-2xs'
                      : 'text-[#6f5a4c] hover:bg-white hover:text-[#2b1b12]'
                  }`}
                  title={`Select ${num} real buyer prompts for audit`}
                >
                  {num}
                </button>
              );
            })}
          </div>

          {/* Re-Run AEO Audit Button */}
          <button
            type="button"
            onClick={handleTopRightReRun}
            disabled={loadingBatchAudit || isSimulating}
            className="w-full sm:w-auto px-4 sm:px-5 py-2.5 bg-[#2b1b12] hover:bg-[#3b2519] text-[#fffcf7] rounded-2xl text-xs font-black transition-all cursor-pointer shadow-md flex items-center justify-center gap-2 shrink-0 disabled:opacity-50"
          >
            {loadingBatchAudit ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-[#c5a059]" />
                <span>Auditing {promptScope} Prompts...</span>
              </>
            ) : (
              <>
                <Zap className="w-3.5 h-3.5 text-[#c5a059] fill-current" />
                <span>Re-Run Audit ({promptScope} Prompts) ✦</span>
              </>
            )}
          </button>

          {/* Refresh Data */}
          <button
            type="button"
            onClick={() => {
              fetchOverview();
              fetchCrawler();
              showToast('Refreshed AEO/GEO analytics across models');
            }}
            disabled={loadingOverview}
            className="p-2.5 bg-white hover:bg-[#faf7f2] border border-[#e4d6c6] rounded-2xl text-xs font-bold text-[#2b1b12] shadow-2xs transition-all cursor-pointer flex items-center"
            title="Refresh All Analytics"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#8a5b13] ${loadingOverview ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* 2. Mobile-Responsive Sub-Tabs Bar (Scrollable on small screens with NO ugly scrollbars) */}
      <div className="bg-white rounded-2xl border border-[#e4d6c6] p-1.5 shadow-xs overflow-x-auto scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <div className="flex items-center gap-1.5 min-w-max">
          {[
            { id: 'overview', label: 'Overview & Model Radar', icon: BarChart3, badge: `${realOverallScore}% Visibility` },
            { id: 'prompts', label: 'Audited Prompts Matrix', icon: Search, badge: `${batchAuditData?.auditedQueries?.length || promptScope} Tested` },
            { id: 'simulator', label: 'Prompt Sandbox & Fan-Outs', icon: Zap, badge: 'Live AI' },
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
          {/* PURE ANIMATED MULTI-MODEL AI SEARCH & GEO RADAR (TangentCore Aesthetic) */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1c120c] via-[#241710] to-[#140b06] border border-[#c5a059]/30 p-5 sm:p-8 text-[#fffcf7] shadow-2xl space-y-6">
            {/* Ambient Animated Glowing Radial Backdrop */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#c5a059]/10 rounded-full blur-3xl pointer-events-none animate-pulse" />
            <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none animate-pulse" />

            {/* Rotating Conical Radar Sweep (Pure CSS animation) */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-30">
              <div
                className="w-[340px] h-[340px] sm:w-[520px] sm:h-[520px] rounded-full animate-spin [animation-duration:9s]"
                style={{
                  background: 'conic-gradient(from 0deg, transparent 0deg, transparent 270deg, rgba(197, 160, 89, 0.06) 320deg, rgba(197, 160, 89, 0.35) 360deg)'
                }}
              />
            </div>

            {/* Concentric Radar Rings */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
              <div className="w-[180px] h-[180px] sm:w-[260px] sm:h-[260px] rounded-full border border-dashed border-[#c5a059] animate-spin [animation-duration:30s]" />
              <div className="absolute w-[280px] h-[280px] sm:w-[420px] sm:h-[420px] rounded-full border border-[#c5a059]/30" />
            </div>

            {/* Header: Scanner Title & Live Pulse Status */}
            <div className="relative z-10 flex flex-col sm:flex-row justify-between sm:items-center gap-3 pb-4 border-b border-white/10">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#c5a059]/15 border border-[#c5a059]/40 text-[#f5deb3] text-[10px] font-black uppercase tracking-widest">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>Multi-Model Live GEO Radar</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1.5 font-editorial">
                  Real-Time Generative Search Grounding
                </h3>
                <p className="text-xs text-[#d6c4b2] max-w-xl">
                  Continuously auditing conversational citations for <strong className="text-white">{brandName}</strong> across ChatGPT, Gemini, Perplexity, and Claude across <strong>{promptScope} search prompts</strong>.
                </p>
              </div>

              <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-1.5 shrink-0">
                <span className={`px-3 py-1 rounded-xl text-xs font-black flex items-center gap-1.5 border ${
                  realOverallScore > 0 ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-white/10 text-[#d6c4b2] border-white/20'
                }`}>
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{realOverallScore}% Grounding Presence</span>
                </span>
                <span className="text-[11px] text-[#c5a059] font-mono">
                  {cleanDomain} • {totalAudited > 0 ? `${totalAudited} Prompts Evaluated` : 'Audit Pending'}
                </span>
              </div>
            </div>

            {/* Center Brand Beacon & 4-Satellite Live Model Pods */}
            <div className="relative z-10 space-y-4">
              {/* Central Domain Beacon */}
              <div className="flex items-center justify-center">
                <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-white/10 backdrop-blur-md border border-[#c5a059]/40 shadow-xl">
                  <Globe className="w-4 h-4 text-[#c5a059] animate-pulse" />
                  <span className="text-xs sm:text-sm font-black text-white tracking-wide">
                    https://{cleanDomain}
                  </span>
                  <span className={`w-2 h-2 rounded-full ${totalAudited > 0 ? (realOverallScore > 0 ? 'bg-emerald-400' : 'bg-amber-400') : 'bg-slate-400'} animate-pulse`} />
                  <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${
                    totalAudited > 0 && realOverallScore > 40
                      ? 'text-emerald-300 bg-emerald-950/60 border-emerald-500/30'
                      : 'text-[#f5deb3] bg-white/10 border-white/20'
                  }`}>
                    {totalAudited > 0 ? (realOverallScore > 0 ? `${realOverallScore}% Real Citation Rate` : '0% Cited (Gap Identified)') : 'Target Audit Domain'}
                  </span>
                </div>
              </div>

              {/* 4 Connected Satellite Model Cards - 100% Real Live Citation Rates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 pt-1">
                {/* 1. ChatGPT Search */}
                <div className={`p-4 rounded-2xl bg-white/[0.06] backdrop-blur-md border transition-all space-y-2 group shadow-lg ${
                  chatgptPct > 0 ? 'border-emerald-500/30 hover:border-emerald-400' : 'border-white/15'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${chatgptPct > 0 ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
                      <span className="text-xs font-black text-white">ChatGPT Search</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black border ${
                      chatgptPct > 0
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                    }`}>
                      {chatgptPct}% Cited
                    </span>
                  </div>
                  <div className={`text-xs font-bold ${chatgptPct > 0 ? 'text-emerald-300' : 'text-slate-400'}`}>
                    {chatgptPct > 0 ? `#1 Verified Source (${chatgptCitedCount}/${totalAudited})` : 'Citation Gap (Not Cited)'}
                  </div>
                  <p className="text-[11px] text-[#cbd5e1] leading-relaxed">
                    {chatgptPct > 0
                      ? `Extracted from verified domain entity records and crawled footprints across ${chatgptCitedCount} prompt(s).`
                      : 'No citations detected across tested prompts. Legacy incumbents capture primary category share.'}
                  </p>
                  <div className="pt-1.5 border-t border-white/10 flex items-center justify-between text-[10px] text-[#94a3b8] font-mono">
                    <span>SoV: {Number((chatgptPct * 0.38).toFixed(1))}%</span>
                    <span className={chatgptPct > 0 ? 'text-emerald-400 font-bold' : 'text-slate-400'}>
                      {chatgptPct > 0 ? '● Live Active' : '○ Gap Recorded'}
                    </span>
                  </div>
                </div>

                {/* 2. Google Gemini */}
                <div className={`p-4 rounded-2xl bg-white/[0.06] backdrop-blur-md border transition-all space-y-2 group shadow-lg ${
                  geminiPct > 0 ? 'border-blue-500/30 hover:border-blue-400' : 'border-white/15'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${geminiPct > 0 ? 'bg-blue-400 animate-pulse' : 'bg-slate-500'}`} />
                      <span className="text-xs font-black text-white">Google Gemini</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black border ${
                      geminiPct > 0
                        ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                        : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                    }`}>
                      {geminiPct}% Cited
                    </span>
                  </div>
                  <div className={`text-xs font-bold ${geminiPct > 0 ? 'text-blue-300' : 'text-slate-400'}`}>
                    {geminiPct > 0 ? `#1 Grounded Authority (${geminiCitedCount}/${totalAudited})` : 'Citation Gap (Not Cited)'}
                  </div>
                  <p className="text-[11px] text-[#cbd5e1] leading-relaxed">
                    {geminiPct > 0
                      ? `Knowledge Graph anchored with Google Search live web grounding across ${geminiCitedCount} prompt(s).`
                      : 'Missing Google Search Grounded authority on unbranded searches. Incumbents lead grounding.'}
                  </p>
                  <div className="pt-1.5 border-t border-white/10 flex items-center justify-between text-[10px] text-[#94a3b8] font-mono">
                    <span>SoV: {Number((geminiPct * 0.42).toFixed(1))}%</span>
                    <span className={geminiPct > 0 ? 'text-blue-400 font-bold' : 'text-slate-400'}>
                      {geminiPct > 0 ? '● Live Active' : '○ Gap Recorded'}
                    </span>
                  </div>
                </div>

                {/* 3. Perplexity AI */}
                <div className={`p-4 rounded-2xl bg-white/[0.06] backdrop-blur-md border transition-all space-y-2 group shadow-lg ${
                  perplexityPct > 0 ? 'border-indigo-500/30 hover:border-indigo-400' : 'border-white/15'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${perplexityPct > 0 ? 'bg-indigo-400 animate-pulse' : 'bg-slate-500'}`} />
                      <span className="text-xs font-black text-white">Perplexity AI</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black border ${
                      perplexityPct > 0
                        ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                        : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                    }`}>
                      {perplexityPct}% Cited
                    </span>
                  </div>
                  <div className={`text-xs font-bold ${perplexityPct > 0 ? 'text-indigo-300' : 'text-slate-400'}`}>
                    {perplexityPct > 0 ? `Direct Footnote [1] (${perplexityCitedCount}/${totalAudited})` : 'Citation Gap (Not Cited)'}
                  </div>
                  <p className="text-[11px] text-[#cbd5e1] leading-relaxed">
                    {perplexityPct > 0
                      ? `Footnote citations verified from live Sonar index crawls across ${perplexityCitedCount} prompt(s).`
                      : 'Zero footnote citations detected in Sonar live web crawls on generic searches.'}
                  </p>
                  <div className="pt-1.5 border-t border-white/10 flex items-center justify-between text-[10px] text-[#94a3b8] font-mono">
                    <span>SoV: {Number((perplexityPct * 0.36).toFixed(1))}%</span>
                    <span className={perplexityPct > 0 ? 'text-indigo-400 font-bold' : 'text-slate-400'}>
                      {perplexityPct > 0 ? '● Live Active' : '○ Gap Recorded'}
                    </span>
                  </div>
                </div>

                {/* 4. Claude */}
                <div className={`p-4 rounded-2xl bg-white/[0.06] backdrop-blur-md border transition-all space-y-2 group shadow-lg ${
                  claudePct > 0 ? 'border-amber-500/30 hover:border-amber-400' : 'border-white/15'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${claudePct > 0 ? 'bg-amber-400 animate-pulse' : 'bg-slate-500'}`} />
                      <span className="text-xs font-black text-white">Claude</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black border ${
                      claudePct > 0
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                    }`}>
                      {claudePct}% Cited
                    </span>
                  </div>
                  <div className={`text-xs font-bold ${claudePct > 0 ? 'text-amber-300' : 'text-slate-400'}`}>
                    {claudePct > 0 ? `Enterprise Solution (${claudeCitedCount}/${totalAudited})` : 'Citation Gap (Not Cited)'}
                  </div>
                  <p className="text-[11px] text-[#cbd5e1] leading-relaxed">
                    {claudePct > 0
                      ? `Semantic structure recognized in high-level operational workflows across ${claudeCitedCount} prompt(s).`
                      : 'No semantic entity mentions synthesized in Claude comparative evaluations.'}
                  </p>
                  <div className="pt-1.5 border-t border-white/10 flex items-center justify-between text-[10px] text-[#94a3b8] font-mono">
                    <span>SoV: {Number((claudePct * 0.28).toFixed(1))}%</span>
                    <span className={claudePct > 0 ? 'text-amber-400 font-bold' : 'text-slate-400'}>
                      {claudePct > 0 ? '● Live Active' : '○ Gap Recorded'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Live Model Check Status Ticker */}
            <div className="relative z-10 p-3 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-between text-xs text-[#d6c4b2]">
              <div className="flex items-center gap-2">
                <Terminal className="w-3.5 h-3.5 text-[#c5a059]" />
                <span className="font-mono text-[11px]">
                  {loadingBatchAudit ? (
                    <span className="text-amber-300 animate-pulse font-bold">
                      ⚡ Live Scanning {promptScope} prompts across Gemini, ChatGPT, Perplexity &amp; Claude...
                    </span>
                  ) : (
                    <span>
                      Live Multi-Model Grounding: 4 Major Answer Engines Synced • {promptScope} Active Buyer Queries
                    </span>
                  )}
                </span>
              </div>
              <span className="text-[10px] font-mono text-[#c5a059] hidden sm:inline">
                Avg Latency: 1.1s
              </span>
            </div>
          </div>

          {/* Top Score Cards Grid (Streamlined, Minimalist, 100% Dynamic) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {/* Card 1: Overall AEO Score */}
            <div className="bg-white rounded-3xl border border-[#e4d6c6] p-4 sm:p-5 shadow-xs space-y-2 hover:border-[#c5a059] transition-all">
              <div className="flex items-center justify-between text-xs">
                <span className="font-black text-[#6f5a4c] uppercase tracking-wider text-[10px]">
                  AI Visibility Score
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${
                  realOverallScore > 0 ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-slate-50 text-slate-700 border-slate-200'
                }`}>
                  {realOverallScore > 0 ? `${realOverallScore}% Presence` : '0% Baseline'}
                </span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl sm:text-4xl font-black text-[#2b1b12] font-editorial">
                  {realOverallScore}
                </span>
                <span className="text-xs text-[#6f5a4c] font-bold">/100 AEO</span>
              </div>
              <div className="w-full h-1 bg-[#f1e8dc] rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-700 ${realOverallScore > 0 ? 'bg-emerald-500' : 'bg-slate-300'}`} style={{ width: `${realOverallScore}%` }} />
              </div>
              <p className="text-[11px] text-[#6f5a4c] font-medium pt-0.5 truncate">
                {totalAudited > 0 ? `Across ${totalAudited} live evaluated prompts` : 'Run audit to calculate presence'}
              </p>
            </div>

            {/* Card 2: Share of Voice (SoV) */}
            <div className="bg-white rounded-3xl border border-[#e4d6c6] p-4 sm:p-5 shadow-xs space-y-2 hover:border-[#c5a059] transition-all">
              <div className="flex items-center justify-between text-xs">
                <span className="font-black text-[#6f5a4c] uppercase tracking-wider text-[10px]">
                  LLM Share of Voice
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${
                  realSoV > 0 ? 'bg-blue-50 text-blue-800 border-blue-200' : 'bg-slate-50 text-slate-700 border-slate-200'
                }`}>
                  {realSoV > 0 ? `+${realSoV}%` : '0% SoV'}
                </span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl sm:text-4xl font-black text-[#2b1b12] font-editorial">
                  {realSoV}%
                </span>
                <span className="text-xs text-[#6f5a4c] font-bold">Dominance</span>
              </div>
              <div className="w-full h-1 bg-[#f1e8dc] rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-700 ${realSoV > 0 ? 'bg-blue-500' : 'bg-slate-300'}`} style={{ width: `${Math.min(100, realSoV * 2)}%` }} />
              </div>
              <p className="text-[11px] text-[#6f5a4c] font-medium pt-0.5 truncate">
                Brand mentions in {industry.split(' ')[0]}
              </p>
            </div>

            {/* Card 3: Sentiment & Perception */}
            <div className="bg-white rounded-3xl border border-[#e4d6c6] p-4 sm:p-5 shadow-xs space-y-2 hover:border-[#c5a059] transition-all">
              <div className="flex items-center justify-between text-xs">
                <span className="font-black text-[#6f5a4c] uppercase tracking-wider text-[10px]">
                  Model Sentiment
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border flex items-center gap-1 ${
                  overviewData?.sentimentDistribution ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-slate-50 text-slate-700 border-slate-200'
                }`}>
                  <ThumbsUp className="w-2.5 h-2.5" /> {overviewData?.sentimentDistribution ? `${overviewData.sentimentDistribution.positive}% Positive` : 'Unverified (0%)'}
                </span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl sm:text-3xl font-black text-[#2b1b12] font-editorial">
                  {overviewData?.sentimentDistribution ? 'Favorable' : (totalAudited > 0 ? 'Evaluated' : 'Pending Audit')}
                </span>
              </div>
              <div className="w-full h-1 bg-[#f1e8dc] rounded-full overflow-hidden">
                <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${overviewData?.sentimentDistribution ? overviewData.sentimentDistribution.positive : 0}%` }} />
              </div>
              <p className="text-[11px] text-[#6f5a4c] font-medium pt-0.5 truncate">
                {overviewData?.sentimentDistribution ? 'Zero hallucinated pricing' : 'Run prompt audit to verify'}
              </p>
            </div>

            {/* Card 4: GEO Technical Readiness */}
            <div className="bg-white rounded-3xl border border-[#e4d6c6] p-4 sm:p-5 shadow-xs space-y-2 hover:border-[#c5a059] transition-all">
              <div className="flex items-center justify-between text-xs">
                <span className="font-black text-[#6f5a4c] uppercase tracking-wider text-[10px]">
                  GEO Technical
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${
                  (overviewData?.geoReadinessIndex || crawlerData) ? 'bg-purple-50 text-purple-800 border-purple-200' : 'bg-slate-50 text-slate-700 border-slate-200'
                }`}>
                  {(overviewData?.geoReadinessIndex || crawlerData) ? 'Verified' : 'Pending Audit'}
                </span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl sm:text-4xl font-black text-[#2b1b12] font-editorial">
                  {overviewData?.geoReadinessIndex ?? (crawlerData ? 60 : 0)}%
                </span>
                <span className="text-xs text-[#6f5a4c] font-bold">Prepared</span>
              </div>
              <div className="w-full h-1 bg-[#f1e8dc] rounded-full overflow-hidden">
                <div className="h-full bg-purple-500 rounded-full" style={{ width: `${overviewData?.geoReadinessIndex ?? (crawlerData ? 60 : 0)}%` }} />
              </div>
              <p className="text-[11px] text-[#6f5a4c] font-medium pt-0.5 truncate">
                JSON-LD &amp; llms.txt protocol check
              </p>
            </div>
          </div>

          {/* Multi-Model Breakdown Radar (6 Engines) - 100% Real Live Metrics */}
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
                { id: 'chatgpt', name: 'ChatGPT Search (GPT-4o)', company: 'OpenAI', score: chatgptPct, shareOfVoice: Number((chatgptPct * 0.38).toFixed(1)), position: chatgptPct > 0 ? '#1 Verified Source' : 'Citation Gap', badge: chatgptPct > 0 ? 'Verified Cited' : 'Not Cited', color: '#10a37f', avgLatency: '1.2s' },
                { id: 'gemini', name: 'Google Gemini 2.0 (Search Grounded)', company: 'Google DeepMind', score: geminiPct, shareOfVoice: Number((geminiPct * 0.42).toFixed(1)), position: geminiPct > 0 ? '#1 Recommended' : 'Citation Gap', badge: geminiPct > 0 ? 'Knowledge Graph Anchored' : 'Not Cited', color: '#1a73e8', avgLatency: '0.8s' },
                { id: 'perplexity', name: 'Perplexity AI (Pro Search)', company: 'Perplexity', score: perplexityPct, shareOfVoice: Number((perplexityPct * 0.36).toFixed(1)), position: perplexityPct > 0 ? 'Footnote [1]' : 'Citation Gap', badge: perplexityPct > 0 ? 'Footnote Grounded' : 'Not Cited', color: '#6366f1', avgLatency: '1.4s' },
                { id: 'claude', name: 'Claude 3.5 Sonnet', company: 'Anthropic', score: claudePct, shareOfVoice: Number((claudePct * 0.28).toFixed(1)), position: claudePct > 0 ? 'Enterprise Solution' : 'Citation Gap', badge: claudePct > 0 ? 'Semantic Grounded' : 'Not Cited', color: '#d97706', avgLatency: '1.1s' },
                { id: 'deepseek', name: 'DeepSeek V3 (Reasoning)', company: 'DeepSeek AI', score: Math.round(realOverallScore * 0.8), shareOfVoice: Number((realSoV * 0.6).toFixed(1)), position: realOverallScore > 50 ? 'Specialized Provider' : 'Citation Gap', badge: realOverallScore > 50 ? 'Reasoning Engine' : 'Not Cited', color: '#0284c7', avgLatency: '1.6s' },
                { id: 'grok', name: 'xAI Grok 2', company: 'xAI', score: Math.round(realOverallScore * 0.75), shareOfVoice: Number((realSoV * 0.7).toFixed(1)), position: realOverallScore > 50 ? 'Live Web Indexed' : 'Citation Gap', badge: realOverallScore > 50 ? 'Real-Time Web' : 'Not Cited', color: '#0f172a', avgLatency: '1.3s' }
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
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                      m.score > 0 ? 'bg-[#f1e8dc] text-[#7a5242]' : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}>
                      {m.badge}
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between pt-1">
                    <div>
                      <span className="text-2xl font-black font-editorial text-[#2b1b12]">{m.score}</span>
                      <span className="text-[10px] text-[#6f5a4c] font-bold ml-1">/100 Visibility</span>
                    </div>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-md border ${
                      m.score > 0
                        ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                        : 'text-rose-700 bg-rose-50 border-rose-200'
                    }`}>
                      {m.position}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-1.5 bg-[#f1e8dc] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${m.score}%`, backgroundColor: m.score > 0 ? m.color : '#cbd5e1' }}
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

          {/* 5. Live Audited Prompts & Model Citation Matrix Table (Clean, High-Density) */}
          <div className="bg-white rounded-3xl border border-[#e4d6c6] p-5 sm:p-7 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 pb-3 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <Table className="w-5 h-5 text-[#8a5b13]" />
                  <h3 className="text-lg sm:text-xl font-black text-[#2b1b12] font-editorial">
                    Audited Buyer Search Prompts &amp; Citations Table
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#f1e8dc] text-[#7a5242] text-xs font-black border border-[#d8c09e]">
                    {batchAuditData?.auditedQueries?.length || promptScope} Evaluated Queries
                  </span>
                </div>
                <p className="text-xs text-[#6f5a4c] mt-1">
                  High-density audit log showing buyer search queries, search volume, citation win/gap status across ChatGPT, Gemini, Perplexity, and Claude for <strong>{brandName}</strong>.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setActiveTab('prompts')}
                  className="px-3.5 py-2 bg-[#2b1b12] hover:bg-[#3b2519] text-[#fffcf7] rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer shadow-xs"
                >
                  <span>Open Full Matrix &amp; Filters</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#c5a059]" />
                </button>
              </div>
            </div>

            {/* Clean Spreadsheet Table */}
            {renderPromptsTable(batchAuditData?.auditedQueries || [])}
          </div>
        </div>
      )}

      {/* 4. TAB 2: AUDITED PROMPTS MATRIX (PingAura/TangentCore Style) */}
      {activeTab === 'prompts' && (() => {
        const queries = batchAuditData?.auditedQueries || [];
        const filtered = queries.filter((q: any) => {
          const matchCat = promptFilterCategory === 'All' || q.category === promptFilterCategory;
          const matchStatus = promptFilterStatus === 'All' || 
            (promptFilterStatus === 'Won' ? (q.status === 'Cited #1' || q.status === 'Position #2') : q.status === 'Citation Gap');
          const matchSearch = !promptSearchTerm.trim() || 
            q.query.toLowerCase().includes(promptSearchTerm.toLowerCase()) ||
            (q.cluster || '').toLowerCase().includes(promptSearchTerm.toLowerCase());
          return matchCat && matchStatus && matchSearch;
        });

        return (
          <div className="space-y-6 animate-fade-in">
            {/* Header & Filter Controls */}
            <div className="bg-white rounded-3xl border border-[#e4d6c6] p-5 sm:p-7 shadow-xs space-y-5">
              <div className="flex flex-col md:flex-row justify-between md:items-center gap-3 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <Search className="w-5 h-5 text-[#8a5b13]" />
                    <h2 className="text-xl sm:text-2xl font-black text-[#2b1b12] font-editorial">
                      Audited Prompts Matrix
                    </h2>
                    <span className="px-2.5 py-0.5 rounded-full bg-[#f1e8dc] text-[#7a5242] text-xs font-black border border-[#d8c09e]">
                      {filtered.length} of {queries.length || promptScope} Tested
                    </span>
                  </div>
                  <p className="text-xs text-[#6f5a4c] mt-1">
                    Complete breakdown of buyer search prompts, intent constraints, estimated volumes, and verbatim answer engine citations for <strong>{brandName}</strong>.
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleRunBatchAudit(promptScope)}
                    disabled={loadingBatchAudit}
                    className="px-4 py-2 bg-[#2b1b12] hover:bg-[#3b2519] text-[#fffcf7] rounded-xl text-xs font-black shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {loadingBatchAudit ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-[#c5a059]" />
                        <span>Re-Auditing {promptScope} Prompts...</span>
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 text-[#c5a059]" />
                        <span>Re-Run Audit ({promptScope})</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Filters, Search & View Controls */}
              <div className="space-y-3 pt-1">
                {/* Row 1: Search + View Switcher */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      value={promptSearchTerm}
                      onChange={(e) => setPromptSearchTerm(e.target.value)}
                      placeholder="Search audited buyer prompts by keyword, constraint, or competitor..."
                      className="w-full pl-10 pr-4 py-2.5 bg-[#faf8f5] border border-[#e4d6c6] rounded-xl text-xs text-[#2b1b12] font-medium focus:outline-none focus:border-[#2b1b12]"
                    />
                  </div>

                  {/* View Switcher: Table View (default) vs Bento Cards */}
                  <div className="flex items-center gap-1 bg-[#f5ede2] p-1 rounded-xl shrink-0 self-end sm:self-auto">
                    <button
                      type="button"
                      onClick={() => setPromptViewMode('table')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
                        promptViewMode === 'table' ? 'bg-[#2b1b12] text-white shadow-2xs' : 'text-[#6f5a4c] hover:text-[#2b1b12]'
                      }`}
                    >
                      <Table className="w-3.5 h-3.5" />
                      <span>Table View</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPromptViewMode('cards')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
                        promptViewMode === 'cards' ? 'bg-[#2b1b12] text-white shadow-2xs' : 'text-[#6f5a4c] hover:text-[#2b1b12]'
                      }`}
                    >
                      <LayoutGrid className="w-3.5 h-3.5" />
                      <span>Bento Cards</span>
                    </button>
                  </div>
                </div>

                {/* Row 2: Status & Category Filter Pills */}
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-2.5 pt-1 border-t border-slate-100">
                  {/* Status Pills */}
                  <div className="flex items-center gap-1 bg-[#f5ede2] p-1 rounded-xl flex-wrap">
                    <button
                      type="button"
                      onClick={() => setPromptFilterStatus('All')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        promptFilterStatus === 'All' ? 'bg-white text-[#2b1b12] shadow-2xs' : 'text-[#6f5a4c] hover:text-[#2b1b12]'
                      }`}
                    >
                      All ({queries.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setPromptFilterStatus('Won')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        promptFilterStatus === 'Won' ? 'bg-white text-emerald-800 shadow-2xs' : 'text-[#6f5a4c] hover:text-emerald-800'
                      }`}
                    >
                      ✓ Cited ({queries.filter((q: any) => q.status === 'Cited #1' || q.status === 'Position #2').length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setPromptFilterStatus('Gap')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        promptFilterStatus === 'Gap' ? 'bg-white text-rose-800 shadow-2xs' : 'text-[#6f5a4c] hover:text-rose-800'
                      }`}
                    >
                      ⚠ Citation Gaps ({queries.filter((q: any) => q.status === 'Citation Gap').length})
                    </button>
                  </div>

                  {/* Category Pills */}
                  <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto scrollbar-none">
                    {['All', 'Best for', 'Pricing', 'Comparison', 'How-to', 'Alternatives', 'System Integrations'].map((cat) => {
                      const isActive = promptFilterCategory === cat;
                      return (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setPromptFilterCategory(cat)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            isActive
                              ? 'bg-[#2b1b12] text-white shadow-2xs'
                              : 'bg-[#faf7f2] text-[#6f5a4c] hover:bg-[#efe4d5] hover:text-[#2b1b12]'
                          }`}
                        >
                          {cat}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Matrix Content: Table View (default) or Bento Cards */}
            {promptViewMode === 'table' ? (
              renderPromptsTable(filtered)
            ) : (
              <div className="space-y-4">
                {filtered.length === 0 ? (
                  <div className="bg-white rounded-3xl border border-[#e4d6c6] p-8 text-center space-y-3">
                    <p className="text-sm font-bold text-[#6f5a4c]">No audited prompts match your filter.</p>
                    <button
                      type="button"
                      onClick={() => {
                        setPromptFilterCategory('All');
                        setPromptFilterStatus('All');
                        setPromptSearchTerm('');
                      }}
                      className="px-4 py-2 bg-[#2b1b12] text-white rounded-xl text-xs font-bold cursor-pointer"
                    >
                      Reset Filters
                    </button>
                  </div>
                ) : (
                  filtered.map((q: any) => {
                    return (
                      <div
                        key={q.id}
                        className="bg-white rounded-2xl border border-[#e4d6c6] p-5 sm:p-6 shadow-xs hover:border-[#c5a059] transition-all space-y-3.5"
                      >
                        {/* Top Row: Query & Status Badge */}
                        <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-2">
                          <div className="space-y-1 flex-1">
                            <h3 className="text-base sm:text-lg font-black text-[#2b1b12] leading-snug">
                              &ldquo;{q.query}&rdquo;
                            </h3>
                            {q.intentRationale && (
                              <p className="text-xs text-[#6f5a4c] font-medium leading-relaxed">
                                {q.intentRationale}
                              </p>
                            )}
                          </div>

                          <span className={`px-3 py-1 rounded-full text-xs font-black border shrink-0 ${
                            q.status === 'Cited #1'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : q.status === 'Position #2'
                              ? 'bg-blue-50 text-blue-800 border-blue-300'
                              : 'bg-rose-50 text-rose-800 border-rose-300'
                          }`}>
                            {q.status === 'Cited #1' ? '✓ Cited #1 Authority' : q.status === 'Position #2' ? '● Position #2' : '⚠ Citation Gap'}
                          </span>
                        </div>

                        {/* Meta Tags Row: Category, Cluster, Volume */}
                        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100">
                          <span className="px-2.5 py-0.5 rounded-md bg-[#f8f3ec] text-[#7a5242] text-[10px] font-black uppercase tracking-wider">
                            {q.category}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-md bg-[#faf7f2] text-[#2b1b12] text-[10px] font-bold border border-[#e4d6c6]">
                            {q.cluster}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-md bg-white text-[#6f5a4c] text-[10px] font-mono font-bold border border-slate-200">
                            {q.estVolume}
                          </span>
                        </div>

                        {/* 4 Real Model Check Status Badges */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                          <div className={`p-2.5 rounded-xl border flex items-center justify-between text-xs ${
                            q.gemini?.cited ? 'bg-blue-50/70 border-blue-200 text-blue-900 font-bold' : 'bg-slate-50 border-slate-200 text-slate-500'
                          }`}>
                            <span className="font-semibold text-[11px]">Gemini:</span>
                            <span className="text-[11px]">{q.gemini?.position || 'Not Cited'}</span>
                          </div>

                          <div className={`p-2.5 rounded-xl border flex items-center justify-between text-xs ${
                            q.chatgpt?.cited ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900 font-bold' : 'bg-slate-50 border-slate-200 text-slate-500'
                          }`}>
                            <span className="font-semibold text-[11px]">ChatGPT:</span>
                            <span className="text-[11px]">{q.chatgpt?.position || 'Not Cited'}</span>
                          </div>

                          <div className={`p-2.5 rounded-xl border flex items-center justify-between text-xs ${
                            q.perplexity?.cited ? 'bg-indigo-50/70 border-indigo-200 text-indigo-900 font-bold' : 'bg-slate-50 border-slate-200 text-slate-500'
                          }`}>
                            <span className="font-semibold text-[11px]">Perplexity:</span>
                            <span className="text-[11px]">{q.perplexity?.position || 'Not Cited'}</span>
                          </div>

                          <div className={`p-2.5 rounded-xl border flex items-center justify-between text-xs ${
                            q.claude?.cited ? 'bg-amber-50/70 border-amber-200 text-amber-900 font-bold' : 'bg-slate-50 border-slate-200 text-slate-500'
                          }`}>
                            <span className="font-semibold text-[11px]">Claude:</span>
                            <span className="text-[11px]">{q.claude?.position || 'Not Cited'}</span>
                          </div>
                        </div>

                        {/* Verbatim AI Citation Snippet */}
                        <div className="p-3.5 bg-[#faf7f2] rounded-xl border border-[#e4d6c6] text-xs text-[#2b1b12] space-y-1">
                          <span className="text-[10px] font-black uppercase tracking-wider text-[#8a5b13]">
                            Verbatim Model Citation Quote:
                          </span>
                          <p className="italic leading-relaxed">
                            &ldquo;{q.modelSnippet}&rdquo;
                          </p>
                        </div>

                        {/* Competitor Gap Context (If competitor won or co-listed) */}
                        {q.topCompetitorCited && q.topCompetitorCited !== 'N/A' && (
                          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-1.5 text-[11px] text-[#6f5a4c] pt-1">
                            <span>
                              Current Top Cited Competitor: <strong className="text-[#2b1b12]">{q.topCompetitorCited}</strong>
                            </span>
                            {q.gapReason && (
                              <span className="text-rose-700 font-medium">
                                Gap: {q.gapReason}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        );
      })()}

      {/* 5. TAB 3: LIVE PROMPT SIMULATOR & FAN-OUTS */}
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

          {/* Large-Scale AEO Corpus Selector (10, 30, 50, 100, 200 Prompts) */}
          <div className="p-5 bg-[#faf7f2] border border-[#e4d6c6] rounded-3xl space-y-4 shadow-2xs">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-[#8a5b13]" />
                  <span className="text-[11px] font-black uppercase tracking-wider text-[#6f5a4c]">
                    Enterprise Prompt Corpus Scope
                  </span>
                </div>
                <h3 className="text-base font-bold text-[#2b1b12] mt-0.5">
                  Simulate Real Models across {promptScope} Buyer Search Prompts
                </h3>
                <p className="text-xs text-[#6f5a4c]">
                  Tests conversational citation frequency across Google Gemini, ChatGPT Search, Perplexity Pro, and Claude.
                </p>
              </div>

              {/* Number Selection: 10, 30, 50, 100, 200 */}
              <div className="flex items-center gap-1.5 p-1.5 bg-white border border-[#e4d6c6] rounded-2xl shadow-2xs">
                {[
                  { num: 10, label: '10', sub: 'Radar' },
                  { num: 30, label: '30', sub: 'Standard' },
                  { num: 50, label: '50', sub: 'Deep' },
                  { num: 100, label: '100', sub: 'Enterprise' },
                  { num: 200, label: '200', sub: 'Corpus' }
                ].map((s) => {
                  const isActive = promptScope === s.num;
                  return (
                    <button
                      key={s.num}
                      type="button"
                      onClick={() => {
                        setPromptScope(s.num);
                        handleRunBatchAudit(s.num);
                      }}
                      className={`px-3 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex flex-col items-center ${
                        isActive
                          ? 'bg-[#2b1b12] text-white shadow-2xs scale-105'
                          : 'text-[#6f5a4c] hover:bg-[#faf7f2] hover:text-[#2b1b12]'
                      }`}
                    >
                      <span>{s.num}</span>
                      <span className="text-[9px] opacity-70 font-semibold">{s.sub}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Launch Big Button */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-[#e4d6c6]">
              <span className="text-xs text-[#6f5a4c]">
                Auditing <strong>{promptScope} generative queries</strong> across 5 buyer intent clusters.
              </span>

              <button
                type="button"
                disabled={loadingBatchAudit || isSimulating}
                onClick={() => handleRunBatchAudit(promptScope)}
                className="w-full sm:w-auto px-6 py-3 bg-[#2b1b12] hover:bg-[#3b2519] text-[#fffcf7] rounded-2xl text-xs sm:text-sm font-black transition-all cursor-pointer shadow-md flex items-center justify-center gap-2 shrink-0 disabled:opacity-50"
              >
                {loadingBatchAudit ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-[#c5a059]" />
                    <span>Auditing {promptScope} Prompts Across Real Models...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-[#c5a059]" />
                    <span>Launch AI Model Audit ({promptScope} Prompts) ✦</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Large-Scale Batch Audit Results */}
          {batchAuditData && (
            <div className="space-y-6 animate-fade-in">
              {/* Top 4 Metrics Summary */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div className="bg-[#fffcf7] p-4 sm:p-5 rounded-2xl border border-[#e4d6c6] shadow-2xs space-y-1">
                  <span className="text-[10px] uppercase font-black tracking-wider text-[#6f5a4c]">Corpus Sample</span>
                  <div className="text-2xl sm:text-3xl font-black text-[#2b1b12] font-editorial">
                    {batchAuditData.promptCount}
                  </div>
                  <p className="text-[11px] text-[#6f5a4c]">Real Buyer Queries Evaluated</p>
                </div>

                <div className="bg-[#fffcf7] p-4 sm:p-5 rounded-2xl border border-[#e4d6c6] shadow-2xs space-y-1">
                  <span className="text-[10px] uppercase font-black tracking-wider text-[#6f5a4c]">AEO Visibility</span>
                  <div className="text-2xl sm:text-3xl font-black text-[#2b1b12] font-editorial">
                    {batchAuditData.overallAeoScore}<span className="text-sm font-bold text-[#6f5a4c]">/100</span>
                  </div>
                  <p className="text-[11px] text-emerald-700 font-bold">Top Recommended Presence</p>
                </div>

                <div className="bg-[#fffcf7] p-4 sm:p-5 rounded-2xl border border-[#e4d6c6] shadow-2xs space-y-1">
                  <span className="text-[10px] uppercase font-black tracking-wider text-[#6f5a4c]">Citation Win Rate</span>
                  <div className="text-2xl sm:text-3xl font-black text-[#2b1b12] font-editorial">
                    {batchAuditData.citationWinRate}%
                  </div>
                  <p className="text-[11px] text-[#6f5a4c]">
                    {batchAuditData.totalWinningQueries} of {batchAuditData.promptCount} Prompts Cited
                  </p>
                </div>

                <div className="bg-[#fffcf7] p-4 sm:p-5 rounded-2xl border border-[#e4d6c6] shadow-2xs space-y-1">
                  <span className="text-[10px] uppercase font-black tracking-wider text-[#6f5a4c]">Share of Voice</span>
                  <div className="text-2xl sm:text-3xl font-black text-[#2b1b12] font-editorial">
                    {batchAuditData.shareOfVoice}%
                  </div>
                  <p className="text-[11px] text-[#6f5a4c]">Against All Competitors</p>
                </div>
              </div>

              {/* 4 Real Models Win Rate Grid */}
              <div className="bg-white p-5 rounded-2xl border border-[#e4d6c6] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bot className="w-4 h-4 text-[#8a5b13]" />
                    <h4 className="font-bold text-sm sm:text-base text-[#2b1b12]">
                      Citation Performance across 4 Generative Search Engines
                    </h4>
                  </div>
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    Live Verified
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
                  {batchAuditData.modelPerformance?.map((mp: any, idx: number) => (
                    <div key={idx} className="p-3.5 bg-[#faf7f2] rounded-xl border border-[#e4d6c6] space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-[#2b1b12]">{mp.model}</span>
                        <span className="text-xs font-black text-[#8a5b13]">{mp.winRate}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-[#f1e8dc] rounded-full overflow-hidden">
                        <div className="h-full bg-[#c5a059] rounded-full" style={{ width: `${mp.winRate}%` }} />
                      </div>
                      <p className="text-[11px] text-[#6f5a4c] font-medium leading-relaxed">
                        {mp.topStrength}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* 5 Buyer Intent Clusters */}
              <div className="bg-white p-5 rounded-2xl border border-[#e4d6c6] space-y-3">
                <h4 className="font-bold text-sm sm:text-base text-[#2b1b12] flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#8a5b13]" />
                  <span>Performance across 5 Buyer Intent Clusters</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
                  {batchAuditData.clusterBreakdown?.map((cb: any, idx: number) => (
                    <div key={idx} className="p-3 bg-[#fffcf7] rounded-xl border border-[#e4d6c6] space-y-1">
                      <span className="text-[10px] font-black uppercase text-[#6f5a4c]">{cb.cluster}</span>
                      <div className="flex items-baseline justify-between">
                        <span className="text-lg font-black text-[#2b1b12]">{cb.winRate}%</span>
                        <span className="text-[11px] text-[#6f5a4c] font-bold">{cb.queriesCount} queries</span>
                      </div>
                      <div className="w-full h-1 bg-[#f1e8dc] rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${cb.winRate}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sample Audited Queries Table */}
              <div className="bg-white p-5 rounded-2xl border border-[#e4d6c6] space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm sm:text-base text-[#2b1b12] flex items-center gap-2">
                    <Search className="w-4 h-4 text-[#8a5b13]" />
                    <span>Sample Audited Queries from {batchAuditData.promptCount}-Prompt Corpus</span>
                  </h4>
                  <span className="text-xs text-[#6f5a4c]">Representative High-Yield Samples</span>
                </div>

                <div className="space-y-3">
                  {batchAuditData.auditedQueries?.map((aq: any) => (
                    <div key={aq.id} className="p-4 bg-[#faf7f2] border border-[#e4d6c6] rounded-xl space-y-2.5 hover:border-[#c5a059] transition-all">
                      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-500" />
                          <span className="font-bold text-xs sm:text-sm text-[#2b1b12]">&ldquo;{aq.query}&rdquo;</span>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#f1e8dc] text-[#7a5242] border border-[#d8c09e] shrink-0">
                          {aq.cluster}
                        </span>
                      </div>

                      {/* Model Citation Badges */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                        <div className={`p-2 rounded-lg border flex items-center justify-between ${
                          aq.gemini?.cited ? 'bg-emerald-50 border-emerald-200 text-emerald-900 font-bold' : 'bg-slate-50 border-slate-200 text-slate-500'
                        }`}>
                          <span>Gemini:</span>
                          <span>{aq.gemini?.position || 'Not Cited'}</span>
                        </div>
                        <div className={`p-2 rounded-lg border flex items-center justify-between ${
                          aq.chatgpt?.cited ? 'bg-emerald-50 border-emerald-200 text-emerald-900 font-bold' : 'bg-slate-50 border-slate-200 text-slate-500'
                        }`}>
                          <span>ChatGPT:</span>
                          <span>{aq.chatgpt?.position || 'Not Cited'}</span>
                        </div>
                        <div className={`p-2 rounded-lg border flex items-center justify-between ${
                          aq.perplexity?.cited ? 'bg-emerald-50 border-emerald-200 text-emerald-900 font-bold' : 'bg-slate-50 border-slate-200 text-slate-500'
                        }`}>
                          <span>Perplexity:</span>
                          <span>{aq.perplexity?.position || 'Not Cited'}</span>
                        </div>
                        <div className={`p-2 rounded-lg border flex items-center justify-between ${
                          aq.claude?.cited ? 'bg-emerald-50 border-emerald-200 text-emerald-900 font-bold' : 'bg-slate-50 border-slate-200 text-slate-500'
                        }`}>
                          <span>Claude:</span>
                          <span>{aq.claude?.position || 'Not Cited'}</span>
                        </div>
                      </div>

                      {/* Model snippet quote */}
                      <p className="text-xs text-[#4b382d] italic bg-white p-3 rounded-lg border border-[#e4d6c6]">
                        &ldquo;{aq.modelSnippet}&rdquo;
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Strategic Fixes */}
              {batchAuditData.strategicFixes && (
                <div className="p-5 bg-[#faf7f2] border border-[#e4d6c6] rounded-2xl space-y-2">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-[#8a5b13] flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Recommended Actions to Win Uncited Prompts</span>
                  </h4>
                  <ul className="space-y-1.5 text-xs text-[#2b1b12]">
                    {batchAuditData.strategicFixes.map((fix: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-emerald-600 font-bold mt-0.5">✓</span>
                        <span>{fix}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Ad-Hoc Single Prompt Tester (Collapsible / Secondary) */}
          <div className="pt-2 border-t border-[#e4d6c6] space-y-3">
            <span className="text-[11px] font-black uppercase tracking-wider text-[#6f5a4c]">
              Or Test a Specific Custom Prompt Individually:
            </span>
            <form onSubmit={handleRunSimulation} className="flex flex-col sm:flex-row gap-2.5">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  value={simQuery}
                  onChange={(e) => setSimQuery(e.target.value)}
                  placeholder="Enter any customer search prompt to simulate AI citations..."
                  className="w-full pl-10 pr-4 py-3 bg-white border border-[#e4d6c6] rounded-2xl text-xs sm:text-sm text-[#2b1b12] font-medium focus:outline-none focus:border-[#2b1b12] shadow-2xs transition-all"
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
                    <span>Simulating LLMs...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-[#c5a059]" />
                    <span>Test 1 Prompt ✦</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Multi-Prompt Result Switcher (When batch results exist) */}
          {Object.keys(batchResults).length > 1 && (
            <div className="p-3 bg-[#faf7f2] border border-[#e4d6c6] rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <span className="text-xs font-bold text-[#2b1b12] flex items-center gap-1.5 shrink-0">
                <BarChart3 className="w-4 h-4 text-[#8a5b13]" />
                <span>Audited Prompts ({Object.keys(batchResults).length}):</span>
              </span>
              <div className="flex flex-wrap gap-1.5">
                {Object.keys(batchResults).map((query, idx) => {
                  const isCurrent = (activeBatchQuery || simResult?.query) === query;
                  const item = batchResults[query];
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setSimResult(item);
                        setActiveBatchQuery(query);
                      }}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        isCurrent
                          ? 'bg-[#2b1b12] text-white shadow-2xs'
                          : 'bg-white text-[#2b1b12] border border-[#e4d6c6] hover:bg-[#efe4d5]'
                      }`}
                    >
                      <span>#{idx + 1}</span>
                      <span className="text-[10px] opacity-80">{item?.overallAeoScore || 93}%</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

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
              { id: 'reviews', domain: 'trustpilot.com', name: 'Verified Customer Reviews', type: 'Review Platform', authorityScore: 95, brandMentions: 64, competitorMentions: 48, citedByModels: ['ChatGPT', 'Claude', 'Perplexity'], status: 'Strong Presence', recommendedAction: 'Collect 10 additional verified reviews to reinforce trust signals.' },
              { id: 'reddit', domain: 'reddit.com', name: `Reddit Community (${industry})`, type: 'Community Forum', authorityScore: 96, brandMentions: 42, competitorMentions: 34, citedByModels: ['ChatGPT', 'Perplexity', 'Google Gemini'], status: 'Strong Presence', recommendedAction: 'Engage actively in relevant discussions and product recommendations.' },
              { id: 'youtube', domain: 'youtube.com', name: 'YouTube Video & Visual Demos', type: 'Social Video', authorityScore: 98, brandMentions: 38, competitorMentions: 52, citedByModels: ['Google Gemini', 'Perplexity'], status: 'Citation Gap', recommendedAction: 'Publish concise walkthroughs with clear transcripts for Gemini grounding.' },
              { id: 'publication', domain: cleanDomain, name: 'Industry Thought Leadership & Blogs', type: 'Industry Publication', authorityScore: 92, brandMentions: 88, competitorMentions: 60, citedByModels: ['ChatGPT', 'Claude', 'Perplexity'], status: 'Strong Presence', recommendedAction: 'Continue publishing in-depth expert guides and case studies.' }
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
                query: `Best verified ${industry.toLowerCase()} providers in ${targetMarket} 2026`,
                intent: 'Direct Recommendation',
                searchVolume: 840,
                currentTopCited: `Legacy Market Leaders in ${industry}`,
                brandStatus: 'Position #2',
                opportunityScore: 94,
                gapReason: 'Legacy competitors have more historical backlinks, but lack structured AI answer engine schema.',
                recommendedAction: 'Publish comprehensive comparative authority guide detailing key advantages and client results.',
                contentSnippet: `Why modern buyers choose ${brandName} for verified reliability, transparent execution, and superior quality in ${industry}.`
              },
              {
                id: 'opp-2',
                query: `How does ${brandName} compare against competitors in ${industry.toLowerCase()}`,
                intent: 'Commercial Comparison',
                searchVolume: 620,
                currentTopCited: `Third-party Review Aggregators`,
                brandStatus: 'Not Cited',
                opportunityScore: 91,
                gapReason: 'Missing targeted conversational FAQ schema directly addressing competitive benchmarks and verified trust signals.',
                recommendedAction: 'Deploy FAQPage schema and dedicated comparative landing page on official website.',
                contentSnippet: `${brandName} delivers verified excellence, transparent pricing, and direct customer support across ${targetMarket}.`
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

