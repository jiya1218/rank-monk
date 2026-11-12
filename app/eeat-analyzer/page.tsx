'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Compass,
  Search,
  Loader2,
  ShieldCheck,
  Award,
  BookOpen,
  UserCheck,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Download,
  Share2,
  ArrowRight,
  ExternalLink,
  RefreshCw,
  Sparkles,
  Zap,
  Globe,
  FileText,
  Lock,
  Layers,
  Check,
  AlertTriangle
} from 'lucide-react';
import { Navbar } from '@/components/ui/Navbar';

interface TechnicalChecklist {
  ssl: boolean;
  aboutUs: boolean;
  contactDetails: boolean;
  socialLinks: boolean;
  organizationSchema: boolean;
  authorCredentials: boolean;
  g2: boolean;
  capterra: boolean;
  reddit: boolean;
  linkedin: boolean;
  crunchbase: boolean;
  trustpilot: boolean;
  termsPrivacy: boolean;
  metaSecurity: boolean;
}

interface EeatSignal {
  question: string;
  details: string;
}

interface EeatCategory {
  score: number;
  passedCount: number;
  totalCount: number;
  status: 'Poor' | 'Needs Work' | 'Good';
  working: EeatSignal[];
  missing: EeatSignal[];
  improve: string[];
}

interface TechnicalChecklistItem {
  id: string;
  label: string;
  present: boolean;
  desc: string;
}

interface RemediationStep {
  title: string;
  desc: string;
  tag: string;
}

interface EeatAnalysisResponse {
  success: boolean;
  domain: string;
  url?: string;
  brandName: string;
  siteType?: string;
  siteTypeLabel?: string;
  industryCategory: string;
  businessSummary?: string;
  timestamp?: string;
  crawledPagesCount: number;
  checklist: TechnicalChecklist;
  technicalChecklist?: TechnicalChecklistItem[];
  remediationSteps?: RemediationStep[];
  scores: {
    experience: number;
    expertise: number;
    authority: number;
    trust: number;
  };
  overallScore: number;
  grade?: string;
  qualityTier: string;
  whyThisScore?: string;
  categories: {
    experience: EeatCategory;
    expertise: EeatCategory;
    authority: EeatCategory;
    trust: EeatCategory;
  };
}

export default function EeatAnalyzerPage() {
  const router = useRouter();
  const [urlInput, setUrlInput] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [scanPhase, setScanPhase] = useState<number>(1);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<EeatAnalysisResponse | null>(null);
  const [checklistFilter, setChecklistFilter] = useState<'all' | 'present' | 'missing'>('all');
  const [openCategory, setOpenCategory] = useState<string | null>('experience');
  const [subTabs, setSubTabs] = useState<Record<string, 'summary' | 'issues' | 'passed'>>({
    experience: 'summary',
    expertise: 'summary',
    authority: 'summary',
    trust: 'summary'
  });
  const [recentAudits, setRecentAudits] = useState<Array<{ domain: string; date: string; score: number }>>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Load recent audit history from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('rm_eeat_history');
      if (saved) {
        setRecentAudits(JSON.parse(saved));
      }
    } catch {}
  }, []);

  // Multi-phase scanner simulation timer while waiting for backend
  useEffect(() => {
    let interval: any;
    if (analyzing) {
      setScanPhase(1);
      interval = setInterval(() => {
        setScanPhase((prev) => (prev < 4 ? prev + 1 : prev));
      }, 1200);
    }
    return () => clearInterval(interval);
  }, [analyzing]);

  // Execute E-E-A-T deep audit
  const runAudit = async (targetDomain: string) => {
    if (!targetDomain.trim()) return;
    setAnalyzing(true);
    setError(null);

    const cleanInput = targetDomain.trim().replace(/^https?:\/\//i, '').replace(/\/+$/, '');

    try {
      const res = await fetch(`/api/eeat-analysis?url=${encodeURIComponent(cleanInput)}`);
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to complete E-E-A-T analysis. Please check domain accessibility.');
      }

      setResult(data);

      // Save to recent audits
      const newEntry = {
        domain: data.domain,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        score: data.overallScore
      };

      setRecentAudits((prev) => {
        const filtered = prev.filter((item) => item.domain.toLowerCase() !== data.domain.toLowerCase());
        const updated = [newEntry, ...filtered].slice(0, 6);
        try {
          localStorage.setItem('rm_eeat_history', JSON.stringify(updated));
        } catch {}
        return updated;
      });

      // Smooth scroll to results
      setTimeout(() => {
        document.getElementById('eeat-results')?.scrollIntoView({ behavior: 'smooth' });
      }, 200);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An unexpected error occurred during deep crawl. Please verify the URL.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    runAudit(urlInput);
  };

  // Download / Print Executive PDF Report
  const handlePrintPdf = () => {
    if (!result) return;
    window.print();
  };

  // Color helpers
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-700';
    if (score >= 60) return 'text-amber-700';
    return 'text-rose-700';
  };

  const getScoreBadgeBg = (status: string) => {
    if (status === 'Good') return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    if (status === 'Needs Work') return 'bg-amber-100 text-amber-800 border-amber-200';
    return 'bg-rose-100 text-rose-800 border-rose-200';
  };

  // Render SVG 4-Axis Radar Chart
  const renderRadarChart = (scores: { experience: number; expertise: number; authority: number; trust: number }) => {
    const center = 150;
    const rMax = 100;

    const rExp = Math.max(15, (scores.experience / 100) * rMax);
    const rExpert = Math.max(15, (scores.expertise / 100) * rMax);
    const rAuth = Math.max(15, (scores.authority / 100) * rMax);
    const rTrust = Math.max(15, (scores.trust / 100) * rMax);

    // Top: Experience, Right: Expertise, Bottom: Authority, Left: Trust
    const points = [
      { x: center, y: center - rExp },
      { x: center + rExpert, y: center },
      { x: center, y: center + rAuth },
      { x: center - rTrust, y: center }
    ];

    const polygonPointsStr = points.map((p) => `${p.x},${p.y}`).join(' ');

    return (
      <div className="relative w-full max-w-[340px] h-[320px] mx-auto select-none flex items-center justify-center">
        <svg width="340" height="320" viewBox="0 0 340 320" className="mx-auto overflow-visible">
          {/* Concentric Grid Circles */}
          {[0.25, 0.5, 0.75, 1.0].map((scale, i) => (
            <circle
              key={i}
              cx={center}
              cy={center}
              r={rMax * scale}
              fill="none"
              stroke="#e4d6c6"
              strokeWidth="1.2"
              strokeDasharray={scale < 1.0 ? '3 3' : 'none'}
            />
          ))}

          {/* Axes Lines */}
          <line x1={center} y1={center - rMax} x2={center} y2={center + rMax} stroke="#d8c09e" strokeWidth="1.2" />
          <line x1={center - rMax} y1={center} x2={center + rMax} y2={center} stroke="#d8c09e" strokeWidth="1.2" />

          {/* Axis Labels */}
          <text x={center} y={center - rMax - 14} textAnchor="middle" className="text-[11px] font-black fill-[#2b1b12] uppercase tracking-wider">
            Experience ({scores.experience}%)
          </text>
          <text x={center + rMax + 14} y={center + 4} textAnchor="start" className="text-[11px] font-black fill-[#2b1b12] uppercase tracking-wider">
            Expertise ({scores.expertise}%)
          </text>
          <text x={center} y={center + rMax + 22} textAnchor="middle" className="text-[11px] font-black fill-[#2b1b12] uppercase tracking-wider">
            Authority ({scores.authority}%)
          </text>
          <text x={center - rMax - 14} y={center + 4} textAnchor="end" className="text-[11px] font-black fill-[#2b1b12] uppercase tracking-wider">
            Trust ({scores.trust}%)
          </text>

          {/* Filled Polygon */}
          <polygon
            points={polygonPointsStr}
            fill="rgba(197, 160, 89, 0.28)"
            stroke="#8a5b13"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />

          {/* Vertices Points */}
          {points.map((p, idx) => (
            <circle key={idx} cx={p.x} cy={p.y} r="5" fill="#2b1b12" stroke="#c5a059" strokeWidth="2" />
          ))}
        </svg>
      </div>
    );
  };

  // Convert checklist to array for filtering (uses tailored 14 technical signals from API if available)
  const checklistItems: TechnicalChecklistItem[] = result
    ? (result.technicalChecklist && result.technicalChecklist.length > 0)
      ? result.technicalChecklist
      : [
          { id: 'ssl', label: 'SSL / TLS Encryption (HTTPS)', present: result.checklist.ssl, desc: 'Secure transport layer encryption protecting visitors.' },
          { id: 'aboutUs', label: 'About Us / Company Transparency', present: result.checklist.aboutUs, desc: 'Dedicated about or company page proving organizational existence.' },
          { id: 'contactDetails', label: 'Direct Business Contact Info', present: result.checklist.contactDetails, desc: 'Accessible phone, email, or physical location info.' },
          { id: 'socialLinks', label: 'Verified Social Footprint', present: result.checklist.socialLinks, desc: 'Linked presence across LinkedIn, X/Twitter, YouTube, etc.' },
          { id: 'organizationSchema', label: 'Schema.org JSON-LD Structured Data', present: result.checklist.organizationSchema, desc: 'Machine-readable semantic Organization entity declared to search engines.' },
          { id: 'authorCredentials', label: 'Author Bylines & Bio Credentials', present: result.checklist.authorCredentials, desc: 'Identifiable subject matter authors on published insights.' },
          { id: 'linkedin', label: 'LinkedIn Corporate Entity', present: result.checklist.linkedin, desc: 'Verified company profile with employee scale and corporate footprint.' },
          { id: 'g2', label: 'G2 Directory Profile', present: result.checklist.g2, desc: 'Independent customer review validation for software & service credibility.' },
          { id: 'capterra', label: 'Capterra Catalog Listing', present: result.checklist.capterra, desc: 'Verified software and vendor directory listing.' },
          { id: 'reddit', label: 'Organic Reddit Discussion Footprint', present: result.checklist.reddit, desc: 'Organic third-party recommendations and community mentions.' },
          { id: 'crunchbase', label: 'Crunchbase Entity Registration', present: result.checklist.crunchbase, desc: 'Corporate registry verifying company establishment and operations.' },
          { id: 'trustpilot', label: 'Trustpilot / Public Review Footprint', present: result.checklist.trustpilot, desc: 'Open public customer sentiment and star ratings.' },
          { id: 'termsPrivacy', label: 'Published Terms & Privacy Policies', present: result.checklist.termsPrivacy, desc: 'Transparent legal documentation, data handling, and disclosures.' },
          { id: 'metaSecurity', label: 'Canonical & Responsive Viewport', present: result.checklist.metaSecurity, desc: 'Modern technical crawl directives and responsive standards.' }
        ]
    : [];

  const filteredChecklist = checklistItems.filter((item) => {
    if (checklistFilter === 'present') return item.present;
    if (checklistFilter === 'missing') return !item.present;
    return true;
  });

  return (
    <div className="min-h-screen bg-[#fffcf7] text-[#2b1b12] font-sans antialiased selection:bg-[#c5a059]/20 selection:text-[#2b1b12]">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#2b1b12] text-[#fffcf7] px-4 py-2.5 rounded-xl shadow-2xl border border-[#c5a059]/40 text-xs font-bold flex items-center gap-2 animate-bounce">
          <Sparkles className="w-4 h-4 text-[#c5a059]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. Main Navigation */}
      <div className="print:hidden">
        <Navbar />
      </div>

      {/* Print-Only Header */}
      <div className="hidden print:block p-8 border-b border-slate-300">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-black text-[#2b1b12]">Rank Monk E-E-A-T Executive Audit</h1>
            <p className="text-xs text-[#6f5a4c]">Confidential Experience, Expertise, Authoritativeness & Trustworthiness Assessment</p>
          </div>
          <div className="text-right text-xs">
            <span className="font-bold text-[#2b1b12] block">https://{result?.domain || 'domain.com'}</span>
            <span className="text-slate-500">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
          </div>
        </div>
      </div>

      {/* 2. Hero & Input Section */}
      <section className="print:hidden relative overflow-hidden pt-12 pb-16 md:pt-16 md:pb-24 border-b border-[#e4d6c6]/60 bg-gradient-to-b from-[#f8f3ec]/60 via-[#fffcf7] to-[#fffcf7]">
        {/* Subtle decorative background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-[#c5a059]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-6">
          {/* Animated Insignia Badge */}
          <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white border border-[#e4d6c6] shadow-xs animate-fade-in">
            <div className="w-6 h-6 rounded-full bg-[#2b1b12] text-[#c5a059] flex items-center justify-center shadow-xs">
              <Compass className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '12s' }} />
            </div>
            <span className="text-xs font-black text-[#2b1b12] tracking-wide uppercase">
              Rank Monk E-E-A-T Quality Engine
            </span>
          </div>

          {/* Headline */}
          <div className="space-y-3 max-w-3xl mx-auto">
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-[#2b1b12] tracking-tight font-editorial leading-[1.1]">
              Audit Your Website’s <span className="italic text-[#8a5b13]">E-E-A-T</span> Signals
            </h1>
            <p className="text-xs sm:text-base text-[#6f5a4c] font-medium max-w-2xl mx-auto leading-relaxed">
              Deep crawl your website to audit <strong>Experience</strong>, <strong>Expertise</strong>, <strong>Authoritativeness</strong>, and <strong>Trustworthiness</strong> signals. Get an instant executive grade, 14-signal technical checklist, and generative search readiness roadmap.
            </p>
          </div>

          {/* Interactive URL Input Form */}
          <div className="max-w-xl mx-auto pt-2">
            <form onSubmit={handleSubmit} className="relative z-10">
              <div className="flex flex-col sm:flex-row gap-2.5 bg-white border-2 border-[#e4d6c6] hover:border-[#c5a059] focus-within:border-[#2b1b12] rounded-2xl sm:rounded-full p-2 shadow-lg transition-all">
                <div className="flex-1 flex items-center px-4 py-2 sm:py-0">
                  <Globe className="w-4 h-4 text-[#8a5b13] shrink-0 mr-2" />
                  <span className="select-none font-bold text-[#6f5a4c] text-xs sm:text-sm">https://</span>
                  <input
                    type="text"
                    placeholder="yourdomain.com"
                    value={urlInput}
                    onPaste={(e) => {
                      const text = e.clipboardData.getData('text');
                      if (/^https?:\/\//i.test(text)) {
                        e.preventDefault();
                        const clean = text.replace(/^https?:\/\//i, '').replace(/\/+$/, '');
                        setUrlInput(clean);
                      }
                    }}
                    onChange={(e) => {
                      let val = e.target.value;
                      val = val.replace(/^https?:\/\//i, '');
                      setUrlInput(val);
                    }}
                    disabled={analyzing}
                    className="w-full bg-transparent ml-1 text-xs sm:text-sm font-bold text-[#2b1b12] placeholder-[#6f5a4c]/50 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={analyzing || !urlInput.trim()}
                  className="rounded-xl sm:rounded-full bg-[#2b1b12] hover:bg-[#3b2519] text-[#fffcf7] px-6 py-3 text-xs sm:text-sm font-black transition-all disabled:opacity-50 cursor-pointer shadow-md flex items-center justify-center gap-2 shrink-0 border border-[#c5a059]/40"
                >
                  {analyzing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-[#c5a059]" />
                      <span>Deep Crawling...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 fill-current text-[#c5a059]" />
                      <span>Run Deep Audit ✦</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Quick Sample Domain Chips */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-3 text-[11px] text-[#6f5a4c]">
              <span className="font-semibold">Try sample:</span>
              {['stripe.com', 'shopify.com', 'hubspot.com'].map((sample) => (
                <button
                  key={sample}
                  type="button"
                  onClick={() => {
                    setUrlInput(sample);
                    runAudit(sample);
                  }}
                  disabled={analyzing}
                  className="px-2.5 py-0.5 rounded-lg bg-white border border-[#e4d6c6] hover:border-[#c5a059] text-[#2b1b12] font-mono font-bold transition-all cursor-pointer shadow-2xs"
                >
                  {sample}
                </button>
              ))}
            </div>

            {/* Error banner */}
            {error && (
              <div className="mt-4 p-4 sm:p-5 bg-rose-50 border-2 border-rose-300 rounded-2xl text-xs text-rose-900 space-y-2.5 shadow-sm animate-fade-in text-left">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-black text-rose-800 text-sm">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>Real Live Crawl Status</span>
                  </div>
                  <button onClick={() => setError(null)} className="font-bold text-rose-900 cursor-pointer">✕</button>
                </div>
                <p className="text-xs text-rose-900 font-medium leading-relaxed">
                  {error}
                </p>
                <div className="text-[11px] bg-white/80 p-2.5 rounded-xl border border-rose-200 text-[#4b382d] leading-relaxed">
                  💡 <strong>Why does this happen?</strong> Rank Monk executes <strong>100% real live network crawls</strong> and refuses to serve pre-fed fake mock data. When enterprise platforms (like Zomato) deploy strict Cloudflare / Akamai bot challenges (HTTP 403), automated scraping is actively rejected.
                </div>
              </div>
            )}
          </div>

          {/* Recent Audits Pill Row */}
          {recentAudits.length > 0 && !analyzing && (
            <div className="pt-4 flex flex-wrap items-center justify-center gap-2 max-w-2xl mx-auto">
              <span className="text-[10.5px] font-bold text-[#6f5a4c] uppercase tracking-wider">Recent Audits:</span>
              {recentAudits.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setUrlInput(item.domain);
                    runAudit(item.domain);
                  }}
                  className="px-2.5 py-1 rounded-xl bg-white/80 border border-[#e4d6c6] text-[11px] font-bold text-[#2b1b12] hover:bg-white flex items-center gap-1.5 cursor-pointer shadow-2xs transition-all"
                >
                  <span>{item.domain}</span>
                  <span className="px-1.5 py-0.2 rounded text-[9px] bg-emerald-100 text-emerald-800 font-black">
                    {item.score}/100
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 3. Live Crawling Animation Banner */}
      {analyzing && (
        <section className="max-w-4xl mx-auto px-4 py-12 animate-fade-in">
          <div className="bg-white rounded-3xl border-2 border-[#c5a059] p-6 sm:p-8 shadow-xl space-y-6 text-left">
            <div className="flex items-center justify-between border-b border-[#e4d6c6] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#2b1b12] text-[#c5a059] flex items-center justify-center shadow-md">
                  <Loader2 className="w-5 h-5 animate-spin" />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-[#2b1b12]">
                    Deep Multi-Page Crawl in Progress
                  </h3>
                  <p className="text-xs text-[#6f5a4c]">
                    Crawling <span className="font-mono font-bold text-[#2b1b12]">{urlInput}</span> and discovering subpages
                  </p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#c5a059]/15 text-[#8a5b13] border border-[#c5a059]/30">
                Phase {scanPhase} of 4
              </span>
            </div>

            {/* 4-Phase Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { phase: 1, title: 'Network & SSL', desc: 'Validating TLS certificate' },
                { phase: 2, title: 'Subpage Discovery', desc: '/about, /contact, /terms' },
                { phase: 3, title: '14 Technical Signals', desc: 'Schema, G2, Reddit, Authors' },
                { phase: 4, title: 'E-E-A-T Scoring', desc: 'AI Search Quality Evaluation' }
              ].map((p) => {
                const isDone = scanPhase > p.phase;
                const isCurrent = scanPhase === p.phase;
                return (
                  <div
                    key={p.phase}
                    className={`p-3 rounded-2xl border text-xs transition-all ${
                      isDone
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                        : isCurrent
                        ? 'bg-[#faf6f0] border-[#c5a059] shadow-xs ring-1 ring-[#c5a059]/40'
                        : 'bg-white border-[#e4d6c6] text-[#6f5a4c] opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-black uppercase tracking-wider">Phase {p.phase}</span>
                      {isDone ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : isCurrent ? (
                        <Loader2 className="w-4 h-4 animate-spin text-[#c5a059]" />
                      ) : (
                        <span className="w-3.5 h-3.5 rounded-full border border-slate-300" />
                      )}
                    </div>
                    <div className="font-bold text-xs text-[#2b1b12]">{p.title}</div>
                    <p className="text-[10px] text-[#6f5a4c] mt-0.5">{p.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* 4. Results Section */}
      {result && !analyzing && (
        <section id="eeat-results" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-8 animate-fade-in">
          {/* Top Header Card */}
          <div className="bg-white rounded-3xl border border-[#e4d6c6] p-5 sm:p-7 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="text-xl sm:text-2xl font-black text-[#2b1b12] font-editorial">
                  {result.brandName}
                </span>
                <span className="font-mono text-xs text-[#6f5a4c] font-semibold">
                  (https://{result.domain})
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>AUDITED</span>
                </span>
              </div>
              <p className="text-xs text-[#6f5a4c]">
                Crawl completed across {result.crawledPagesCount} pages • Industry Category: <strong className="text-[#2b1b12]">{result.siteTypeLabel || result.industryCategory.replace('_', ' ')}</strong>
              </p>
              {result.businessSummary && (
                <p className="text-[11px] text-[#6f5a4c]/90 pt-0.5 max-w-2xl">
                  {result.businessSummary}
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-2.5 print:hidden">
              <button
                type="button"
                onClick={handlePrintPdf}
                className="px-4 py-2 bg-[#2b1b12] hover:bg-[#3b2519] text-[#fffcf7] text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer border border-[#c5a059]/40"
              >
                <Download className="w-3.5 h-3.5 text-[#c5a059]" />
                <span>Download Executive PDF</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  navigator.clipboard?.writeText(window.location.href);
                  showToast('✓ Link copied to clipboard');
                }}
                className="p-2 bg-white hover:bg-[#faf7f2] border border-[#e4d6c6] rounded-xl text-[#2b1b12] text-xs font-bold transition-all cursor-pointer shadow-2xs"
                title="Share Audit Link"
              >
                <Share2 className="w-3.5 h-3.5 text-[#8a5b13]" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setUrlInput('');
                  setResult(null);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="px-3.5 py-2 bg-white hover:bg-[#faf7f2] border border-[#e4d6c6] rounded-xl text-xs font-bold text-[#6f5a4c] hover:text-[#2b1b12] transition-all cursor-pointer shadow-2xs"
              >
                Scan Another Domain
              </button>
            </div>
          </div>

          {/* Radar Chart & Master Score Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left 5 Cols: SVG Radar Diamond */}
            <div className="lg:col-span-5 bg-white rounded-3xl border border-[#e4d6c6] p-6 shadow-sm flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between border-b border-[#e4d6c6] pb-3">
                  <h3 className="font-bold text-sm text-[#2b1b12] uppercase tracking-wider text-[11px]">
                    4-Axis E-E-A-T Radar Diamond
                  </h3>
                  <span className="text-[10px] text-[#8a5b13] font-bold">Vector Synthesis</span>
                </div>
                <p className="text-[11px] text-[#6f5a4c] mt-1.5">
                  Visual balance across Experience, Expertise, Authoritativeness, and Trustworthiness.
                </p>
              </div>

              {renderRadarChart(result.scores)}

              <div className="p-3 bg-[#f8f3ec] rounded-2xl border border-[#e4d6c6] text-[11px] text-[#4b382d] leading-relaxed">
                💡 <strong>Radar Analysis:</strong> The polygon shape indicates balance. An elongated axis shows disproportionate strength, while compressed points pinpoint generative citation barriers.
              </div>
            </div>

            {/* Right 7 Cols: Overall Score & 4 Pillar Cards */}
            <div className="lg:col-span-7 space-y-4">
              {/* Overall Score Master Hero Card */}
              <div className="bg-gradient-to-br from-[#2b1b12] via-[#3a2518] to-[#1c120b] text-[#fffcf7] rounded-3xl p-6 sm:p-7 shadow-md border border-[#c5a059]/40 relative overflow-hidden flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#c5a059]/20 text-[#c5a059] border border-[#c5a059]/30">
                      OVERALL QUALITY TIER
                    </span>
                    {result.grade && (
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                        result.grade.startsWith('A')
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          : result.grade === 'B'
                          ? 'bg-teal-500/20 text-teal-300 border-teal-500/30'
                          : result.grade === 'C'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                          : result.grade === 'D'
                          ? 'bg-orange-500/20 text-orange-300 border-orange-500/30'
                          : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                      }`}>
                        Grade {result.grade}
                      </span>
                    )}
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/10 text-[#fffcf7] border border-white/20">
                      {result.qualityTier}
                    </span>
                  </div>
                  <h4 className="text-xl sm:text-2xl font-black font-editorial text-white">
                    {result.brandName} E-E-A-T Score
                  </h4>
                  <p className="text-xs text-[#e4d6c6]/80 max-w-md">
                    Composite quality score judged against Google Search Quality Rater Guidelines (Trust 40%, Experience 20%, Expertise 20%, Authority 20%).
                  </p>
                </div>

                <div className="text-center sm:text-right shrink-0 bg-white/5 border border-white/10 rounded-2xl p-4">
                  <div className="text-4xl sm:text-5xl font-black text-[#c5a059] font-editorial leading-none">
                    {result.overallScore}
                  </div>
                  <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest block mt-1">
                    out of 100
                  </span>
                </div>
              </div>

              {/* Why This Score Card (Google Quality Rater Guidance) */}
              {result.whyThisScore && (
                <div className="p-4 bg-white rounded-2xl border border-[#e4d6c6] shadow-xs space-y-1.5">
                  <span className="font-black text-[10.5px] uppercase tracking-wider text-[#8a5b13] flex items-center gap-1.5">
                    <span>💡 Why this score?</span>
                  </span>
                  <p className="text-xs text-[#4b382d] leading-relaxed">
                    {result.whyThisScore}
                  </p>
                </div>
              )}

              {/* 4 Pillars 2x2 Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {[
                  { key: 'experience', label: 'Experience', desc: 'First-hand usage & practical execution proof', score: result.scores.experience, cat: result.categories.experience, icon: UserCheck },
                  { key: 'expertise', label: 'Expertise', desc: 'Subject matter credentials & technical depth', score: result.scores.expertise, cat: result.categories.expertise, icon: Award },
                  { key: 'authority', label: 'Authoritativeness', desc: 'Ecosystem citations, G2, Reddit & press', score: result.scores.authority, cat: result.categories.authority, icon: BookOpen },
                  { key: 'trust', label: 'Trustworthiness', desc: 'Security, contact clarity & transparent terms', score: result.scores.trust, cat: result.categories.trust, icon: ShieldCheck }
                ].map((pillar) => {
                  const Icon = pillar.icon;
                  return (
                    <div
                      key={pillar.key}
                      onClick={() => setOpenCategory(pillar.key)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                        openCategory === pillar.key
                          ? 'bg-white border-[#2b1b12] shadow-sm ring-1 ring-[#2b1b12]/20'
                          : 'bg-white border-[#e4d6c6] hover:border-[#c5a059]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-xl bg-[#f8f3ec] border border-[#e4d6c6] text-[#8a5b13] flex items-center justify-center shrink-0">
                            <Icon className="w-4 h-4" />
                          </div>
                          <span className="font-bold text-xs text-[#2b1b12]">{pillar.label}</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase border ${getScoreBadgeBg(pillar.cat.status)}`}>
                          {pillar.cat.status}
                        </span>
                      </div>

                      <div className="flex items-baseline justify-between mt-2 pt-2 border-t border-[#e4d6c6]/50">
                        <span className="text-[10px] text-[#6f5a4c]">{pillar.cat.passedCount} of {pillar.cat.totalCount} signals</span>
                        <span className={`text-xl font-black font-editorial ${getScoreColor(pillar.score)}`}>
                          {pillar.score}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 5. 14-Point Deterministic Technical Signals Matrix */}
          <div className="bg-white rounded-3xl border border-[#e4d6c6] p-6 sm:p-7 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center pb-4 border-b border-[#e4d6c6] gap-3">
              <div>
                <h3 className="font-editorial text-lg sm:text-xl font-bold text-[#2b1b12] flex items-center gap-2">
                  <span>14-Point Technical Signals Audit</span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#f1e8dc] text-[#7a5242]">
                    {checklistItems.filter((i) => i.present).length}/14 Passing
                  </span>
                </h3>
                <p className="text-xs text-[#6f5a4c]">
                  Deterministic crawler checks validating explicit HTML markers, schemas, and digital entity profiles.
                </p>
              </div>

              {/* Filter Pills */}
              <div className="flex items-center bg-[#f8f3ec] border border-[#e4d6c6] rounded-xl p-1 gap-1 print:hidden">
                {[
                  { id: 'all', label: `All (14)` },
                  { id: 'present', label: `Verified (${checklistItems.filter((i) => i.present).length})` },
                  { id: 'missing', label: `Missing (${checklistItems.filter((i) => !i.present).length})` }
                ].map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setChecklistFilter(f.id as any)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      checklistFilter === f.id
                        ? 'bg-[#2b1b12] text-[#fffcf7] shadow-2xs'
                        : 'text-[#6f5a4c] hover:text-[#2b1b12]'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Checklist Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredChecklist.map((item) => (
                <div
                  key={item.id}
                  className={`p-3.5 rounded-2xl border text-xs flex flex-col justify-between gap-2 transition-all ${
                    item.present
                      ? 'bg-emerald-50/50 border-emerald-200 text-emerald-950'
                      : 'bg-rose-50/50 border-rose-200 text-rose-950'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-bold text-xs">{item.label}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase shrink-0 border ${
                        item.present
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : 'bg-rose-100 text-rose-800 border-rose-300'
                      }`}
                    >
                      {item.present ? 'Verified ✓' : 'Missing ✕'}
                    </span>
                  </div>
                  <p className="text-[10.5px] opacity-80 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 6. Detailed Pillar Accordions (Deep Dives) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-editorial text-lg sm:text-xl font-bold text-[#2b1b12]">
                Detailed Quality Rater Pillar Breakdown
              </h3>
              <span className="text-xs text-[#6f5a4c]">Click any category to expand full diagnostic findings</span>
            </div>

            {Object.entries(result.categories).map(([key, category]) => {
              const isOpen = openCategory === key;
              const activeSub = subTabs[key] || 'summary';
              const issuesCount = category.missing.length;
              const passedCount = category.passedCount ?? category.working.length;

              const metaMap: Record<string, { title: string; subtitle: string; icon: any }> = {
                experience: { title: 'Experience', subtitle: 'First-hand, practical involvement and demonstrated execution', icon: UserCheck },
                expertise: { title: 'Expertise', subtitle: 'Demonstrated knowledge, certifications, and depth of terminology', icon: Award },
                authority: { title: 'Authoritativeness', subtitle: 'Industry standing, external citations, reviews, and co-citations', icon: BookOpen },
                trust: { title: 'Trustworthiness', subtitle: 'Security, contact clarity, transparency, and data disclosures', icon: ShieldCheck }
              };

              const meta = metaMap[key] || { title: key, subtitle: '', icon: HelpCircle };
              const Icon = meta.icon;

              return (
                <div key={key} className="bg-white border border-[#e4d6c6] rounded-3xl overflow-hidden shadow-xs transition-all">
                  {/* Accordion Trigger Header */}
                  <button
                    type="button"
                    onClick={() => setOpenCategory(isOpen ? null : key)}
                    className="w-full p-5 sm:p-6 flex items-start sm:items-center justify-between gap-4 text-left cursor-pointer hover:bg-[#faf7f2]/50 transition-colors"
                  >
                    <div className="flex items-start sm:items-center gap-3.5">
                      <div className="w-10 h-10 rounded-2xl bg-[#f8f3ec] border border-[#e4d6c6] text-[#8a5b13] flex items-center justify-center shrink-0">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="font-bold text-sm sm:text-base text-[#2b1b12]">{meta.title}</h4>
                          <span className={`text-xs font-black font-editorial ${getScoreColor(category.score)}`}>
                            {category.score}/100
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase border ${getScoreBadgeBg(category.status)}`}>
                            {category.status}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#6f5a4c] mt-0.5">{meta.subtitle}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[11px] font-bold text-[#6f5a4c] hidden sm:inline">
                        {passedCount}/{category.totalCount} passed
                      </span>
                      {isOpen ? <ChevronUp className="w-4 h-4 text-[#2b1b12]" /> : <ChevronDown className="w-4 h-4 text-[#6f5a4c]" />}
                    </div>
                  </button>

                  {/* Accordion Content */}
                  {isOpen && (
                    <div className="p-5 sm:p-6 border-t border-[#e4d6c6] bg-[#fffcf7]/50 space-y-5 animate-fade-in">
                      {/* Sub-Tabs: Summary / Issues / Passed */}
                      <div className="flex gap-4 border-b border-[#e4d6c6] pb-3 text-xs font-bold print:hidden">
                        {[
                          { id: 'summary', label: 'Summary & Roadmap' },
                          { id: 'issues', label: `Issues Detected (${issuesCount})` },
                          { id: 'passed', label: `Passed Signals (${passedCount})` }
                        ].map((st) => (
                          <button
                            key={st.id}
                            type="button"
                            onClick={() => setSubTabs((prev) => ({ ...prev, [key]: st.id as any }))}
                            className={`pb-2 border-b-2 transition-all cursor-pointer ${
                              activeSub === st.id
                                ? 'border-[#2b1b12] text-[#2b1b12]'
                                : 'border-transparent text-[#6f5a4c] hover:text-[#2b1b12]'
                            }`}
                          >
                            {st.label}
                          </button>
                        ))}
                      </div>

                      {/* Tab 1: Summary (Working + Recommendations) */}
                      {activeSub === 'summary' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          {/* Working Signals */}
                          <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200/70 space-y-3">
                            <span className="font-black text-[10px] text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>What is Working Well</span>
                            </span>
                            <ul className="space-y-2 text-xs text-emerald-950">
                              {category.working.map((item, idx) => (
                                <li key={idx} className="flex items-start gap-2">
                                  <span className="text-emerald-600 font-bold shrink-0">✓</span>
                                  <div>
                                    <strong className="block text-[#2b1b12]">{item.question}</strong>
                                    <span className="text-[11px] text-[#6f5a4c]">{item.details}</span>
                                  </div>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* How to Improve */}
                          <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-200/70 space-y-3">
                            <span className="font-black text-[10px] text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
                              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                              <span>Recommended Optimization Steps</span>
                            </span>
                            <ul className="space-y-2 text-xs text-amber-950">
                              {category.improve.map((step, idx) => (
                                <li key={idx} className="flex items-start gap-2">
                                  <span className="text-amber-600 font-bold shrink-0">✦</span>
                                  <span className="text-xs text-[#2b1b12] leading-relaxed">{step}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}

                      {/* Tab 2: Issues Detected */}
                      {activeSub === 'issues' && (
                        <div className="space-y-3">
                          {category.missing.length === 0 ? (
                            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-800 font-semibold">
                              ✓ Excellent! No critical issues or gaps detected in this pillar.
                            </div>
                          ) : (
                            category.missing.map((issue, idx) => (
                              <div key={idx} className="p-3.5 bg-rose-50/60 rounded-2xl border border-rose-200/80 text-xs flex items-start gap-2.5">
                                <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                                <div>
                                  <strong className="text-rose-950 block">{issue.question}</strong>
                                  <p className="text-[11px] text-[#6f5a4c] mt-0.5">{issue.details}</p>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      )}

                      {/* Tab 3: Passed Signals */}
                      {activeSub === 'passed' && (
                        <div className="space-y-3">
                          {category.working.map((item, idx) => (
                            <div key={idx} className="p-3.5 bg-emerald-50/60 rounded-2xl border border-emerald-200/80 text-xs flex items-start gap-2.5">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                              <div>
                                <strong className="text-emerald-950 block">{item.question}</strong>
                                <p className="text-[11px] text-[#6f5a4c] mt-0.5">{item.details}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* 7. Actionable Executive Remediation Roadmap */}
          <div className="bg-[#fffcf7] rounded-3xl border-2 border-[#2b1b12] p-6 sm:p-8 shadow-md space-y-4 print:break-before-page print:break-inside-avoid">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-[#e4d6c6] pb-4 gap-2">
              <div>
                <h3 className="font-editorial text-lg sm:text-2xl font-bold text-[#2b1b12] flex items-center gap-2">
                  <span>Executive Remediation Checklist</span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#c5a059]/20 text-[#8a5b13] font-black uppercase">
                    Priority Steps
                  </span>
                </h3>
                <p className="text-xs text-[#6f5a4c]">
                  Direct actions to establish high E-E-A-T grounding and increase AI search recommendations
                </p>
              </div>

              <Link
                href="/dashboard"
                className="px-5 py-2.5 bg-[#2b1b12] hover:bg-[#3b2519] text-[#fffcf7] text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
              >
                <span>Launch Rank Monk Hub</span>
                <span>→</span>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-2">
              {(result.remediationSteps && result.remediationSteps.length > 0
                ? result.remediationSteps
                : [
                    {
                      title: result.checklist.organizationSchema
                        ? 'Expand Schema to Service & FAQPage JSON-LD'
                        : 'Deploy Organization & Product JSON-LD',
                      desc: result.checklist.organizationSchema
                        ? 'Organization schema is verified. Now add granular Service, Product, Offer, and FAQPage JSON-LD schemas to dominate AI answer engines.'
                        : 'Declare entity types, founding credentials, contact points, and product/service catalogs directly in the HTML head.',
                      tag: 'Technical Schema'
                    },
                    { title: 'Publish Quantified Case Studies & Proof', desc: 'Add 2–3 customer operational success stories with verified metrics to prove hands-on Experience.', tag: 'Experience Proof' },
                    { title: 'Add Verified Author & Creator Bylines', desc: 'Include named author credentials and links to LinkedIn profiles on published resources to satisfy Expertise.', tag: 'Author Authority' },
                    { title: 'Claim Third-Party Verified Profiles', desc: 'Claim and optimize your brand profiles on independent review platforms (Trustpilot or Google Reviews) to anchor AI search grounding.', tag: 'Third-Party Trust' },
                    { title: 'Publish Standard llms.txt File', desc: 'Expose a canonical llms.txt file at your domain root (https://domain/llms.txt) to prevent generative AI hallucinations.', tag: 'AEO Protocol' },
                    {
                      title: result.checklist.termsPrivacy
                        ? 'Footer Corporate Governance Details'
                        : 'Transparent Legal Disclosures',
                      desc: result.checklist.termsPrivacy
                        ? 'Terms & Privacy are verified. Ensure registered physical corporate address and company registration numbers are clear site-wide.'
                        : 'Ensure physical corporate address, Terms of Service, and Privacy Policy links are in the site-wide footer.',
                      tag: 'Trust Compliance'
                    }
                  ]
              ).map((act, i) => (
                <div key={i} className="p-4 bg-white rounded-2xl border border-[#e4d6c6] shadow-xs space-y-2 flex flex-col justify-between">
                  <div className="space-y-1">
                    <span className="text-[9.5px] font-black uppercase tracking-wider text-[#8a5b13] px-2 py-0.5 rounded bg-[#f8f3ec] border border-[#e4d6c6] inline-block">
                      {act.tag}
                    </span>
                    <h5 className="font-bold text-xs text-[#2b1b12] pt-1">{act.title}</h5>
                    <p className="text-[11px] text-[#6f5a4c] leading-relaxed">{act.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 5. Informational Blueprint Section (When no scan active) */}
      {!result && !analyzing && (
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 space-y-12">
          {/* 4 Pillars Explainer Cards */}
          <div className="space-y-4 text-center">
            <h2 className="text-2xl sm:text-3xl font-black text-[#2b1b12] font-editorial">
              How Google &amp; AI Search Evaluate E-E-A-T
            </h2>
            <p className="text-xs sm:text-sm text-[#6f5a4c] max-w-xl mx-auto">
              Modern generative engines prioritize websites with verified human experience and recognized authority to minimize hallucination.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { letter: 'E', name: 'Experience', desc: 'First-hand evidence, case studies, hands-on screenshots, and real-world results.', icon: UserCheck },
              { letter: 'E', name: 'Expertise', desc: 'Named authors, subject-matter credentials, technical terminology, and specialized depth.', icon: Award },
              { letter: 'A', name: 'Authoritativeness', desc: 'Recognition across external ecosystems: G2, Reddit, Capterra, Crunchbase, and media citations.', icon: BookOpen },
              { letter: 'T', name: 'Trustworthiness', desc: 'The central anchor: SSL security, transparent contact info, clear terms, and Schema.org markup.', icon: ShieldCheck }
            ].map((p, idx) => {
              const Icon = p.icon;
              return (
                <div key={idx} className="bg-white rounded-3xl border border-[#e4d6c6] p-5 shadow-xs space-y-3 hover:border-[#c5a059] transition-all">
                  <div className="w-10 h-10 rounded-2xl bg-[#2b1b12] text-[#c5a059] flex items-center justify-center font-editorial font-bold text-lg shadow-xs">
                    {p.letter}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-[#2b1b12] flex items-center gap-1.5">
                      <span>{p.name}</span>
                    </h3>
                    <p className="text-[11px] text-[#6f5a4c] leading-relaxed mt-1">{p.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 6. Footer */}
      <footer className="print:hidden border-t border-[#e4d6c6] py-8 bg-[#f8f3ec]/60 text-center text-xs text-[#6f5a4c] space-y-2">
        <p className="font-semibold text-[#2b1b12]">
          Rank Monk Autonomous Growth Engine • rankmonk.in
        </p>
        <p className="text-[11px]">
          Confidential Quality Rater &amp; Generative Engine Optimization Benchmark
        </p>
      </footer>
    </div>
  );
}

