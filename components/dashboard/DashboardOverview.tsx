'use client';

import React, { useState } from 'react';
import {
  Activity,
  FileText,
  Share2,
  Eye,
  Search,
  Image as ImageIcon,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  Bell,
  ArrowUpRight,
  Sparkles,
  Link as LinkIcon,
  Globe,
  ExternalLink,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';

interface DashboardOverviewProps {
  project: any;
  user: any;
  onNavigateTab: (tab: string) => void;
}

export function DashboardOverview({ project, user, onNavigateTab }: DashboardOverviewProps) {
  const [gscModalOpen, setGscModalOpen] = useState(false);
  const [gscConnected, setGscConnected] = useState(false);
  const [connectingGsc, setConnectingGsc] = useState(false);

  // Top SEO Issues State
  const [issues] = useState([
    { id: 'dup-titles', text: '2 pages have duplicate title tags', severity: 'Medium' },
    { id: 'meta-desc', text: '10 pages are missing meta descriptions', severity: 'Medium' },
    { id: 'alt-text', text: '21 pages are missing alt text', severity: 'Low' },
    { id: 'schema', text: '5 pages lack structured JSON-LD schema', severity: 'Low' }
  ]);

  // Handle Google Search Console Connection
  const handleConnectGsc = () => {
    setConnectingGsc(true);
    setTimeout(() => {
      setGscConnected(true);
      setConnectingGsc(false);
      setGscModalOpen(false);
    }, 1200);
  };

  // Competitor List
  const competitorsList = (project?.competitors && project.competitors.length > 0)
    ? project.competitors
    : [
        { name: 'cairnindia.com', positioning: "Major player in oil & gas exploration", strengths: "Extensive reserves and established presence", share: 30 },
        { name: 'essar.com', positioning: "Diversified global conglomerate", strengths: "Broad industrial portfolio and international reach", share: 25 },
        { name: 'relianceind.com', positioning: "India's largest enterprise with diversified business", strengths: "Market dominance across energy & retail", share: 45 }
      ];

  const firstName = user?.name ? user.name.split(' ')[0] : (user?.email?.split('@')[0] || 'User');

  return (
    <div className="space-y-8 animate-fade-in">
      {/* 1. Header with Welcome, Subtitle & Date Pill */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#2b1b12] tracking-tight">
            Welcome back, {firstName}! 👋
          </h1>
          <p className="text-xs sm:text-sm text-[#6f5a4c] font-medium mt-1">
            Here&apos;s what&apos;s happening with your brand today.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white border border-[#e4d6c6] px-3.5 py-1.5 rounded-xl text-xs font-semibold text-[#2b1b12] shadow-sm">
            <Calendar className="w-3.5 h-3.5 text-[#c5a059]" />
            <span>Oct 28 - Nov 3, 2026</span>
          </div>
          <button
            type="button"
            className="w-9 h-9 bg-white border border-[#e4d6c6] rounded-xl flex items-center justify-center text-[#6f5a4c] hover:text-[#2b1b12] hover:bg-[#f1e8dc] transition-colors relative shadow-sm"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="w-2 h-2 rounded-full bg-[#c5a059] absolute top-2 right-2 ring-2 ring-white" />
          </button>
        </div>
      </div>

      {/* 2. Top Metric Cards Row (5 Cards exactly like SoloSpider) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Metric 1: Overall SEO Score */}
        <div className="bg-white rounded-2xl p-5 border border-[#e4d6c6] shadow-sm flex flex-col justify-between min-h-[160px] hover:border-[#c5a059] transition-all">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="text-[#6f5a4c] font-black text-[11px] uppercase tracking-wider">Overall SEO Score</h3>
            <span className="text-slate-400 text-xs cursor-help" title="Technical SEO health calculated from crawls, schema, and mobile performance">ⓘ</span>
          </div>
          <div className="flex items-center gap-4 mt-2">
            <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
              <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 80 80">
                <circle cx="40" cy="40" r="32" stroke="#f1e8dc" strokeWidth="6" fill="transparent" />
                <circle
                  cx="40"
                  cy="40"
                  r="32"
                  stroke="#10b981"
                  strokeWidth="6"
                  fill="transparent"
                  strokeDasharray={2 * Math.PI * 32}
                  strokeDashoffset={2 * Math.PI * 32 * (1 - (project?.seoScore || 84) / 100)}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-lg font-black text-[#2b1b12]">{project?.seoScore || 84}</span>
                <span className="text-[8px] text-[#6f5a4c] font-bold">/100</span>
              </div>
            </div>
            <div>
              <div className="text-xs font-bold text-emerald-600">Great!</div>
              <div className="text-[11px] font-semibold text-emerald-600 flex items-center gap-0.5 mt-0.5">
                <span>+8%</span>
                <span>from last week</span>
              </div>
            </div>
          </div>
        </div>

        {/* Metric 2: Organic Traffic (GSC) */}
        <div
          onClick={() => !gscConnected && setGscModalOpen(true)}
          className="bg-white rounded-2xl p-5 border border-[#e4d6c6] shadow-sm relative overflow-hidden flex flex-col justify-between min-h-[160px] cursor-pointer hover:border-[#c5a059] transition-all group"
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="text-[#6f5a4c] font-black text-[11px] uppercase tracking-wider">Organic Traffic</h3>
          </div>
          {gscConnected ? (
            <div className="mt-2">
              <div className="text-2xl font-black text-[#2b1b12]">8,420</div>
              <div className="text-xs font-semibold text-emerald-600 mt-1 flex items-center gap-1">
                <span>▲ +14.2%</span>
                <span className="text-slate-400 font-normal">vs last month</span>
              </div>
            </div>
          ) : (
            <>
              {/* Blurred background preview */}
              <div className="filter blur-[6px] select-none opacity-40 mt-2 space-y-1">
                <div className="text-2xl font-black text-slate-800">8,210</div>
                <div className="h-6 w-full bg-gradient-to-r from-emerald-100 to-emerald-200 rounded" />
              </div>
              {/* Overlay Glass Badge */}
              <div className="absolute inset-0 bg-[#fffcf7]/70 backdrop-blur-[2px] flex flex-col items-center justify-center p-3 text-center">
                <span className="px-2.5 py-0.5 bg-[#f1e8dc] text-[#7a5242] border border-[#d8c09e] rounded-md text-[10px] font-black tracking-wider uppercase mb-1">
                  GSC Required
                </span>
                <span className="text-[11px] font-bold text-[#2b1b12] group-hover:underline">
                  Connect to unlock metric
                </span>
              </div>
            </>
          )}
        </div>

        {/* Metric 3: Total Impressions (GSC) */}
        <div
          onClick={() => !gscConnected && setGscModalOpen(true)}
          className="bg-white rounded-2xl p-5 border border-[#e4d6c6] shadow-sm relative overflow-hidden flex flex-col justify-between min-h-[160px] cursor-pointer hover:border-[#c5a059] transition-all group"
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="text-[#6f5a4c] font-black text-[11px] uppercase tracking-wider">Total Impressions</h3>
          </div>
          {gscConnected ? (
            <div className="mt-2">
              <div className="text-2xl font-black text-[#2b1b12]">46.8K</div>
              <div className="text-xs font-semibold text-emerald-600 mt-1 flex items-center gap-1">
                <span>▲ +28.5%</span>
                <span className="text-slate-400 font-normal">SERP impressions</span>
              </div>
            </div>
          ) : (
            <>
              <div className="filter blur-[6px] select-none opacity-40 mt-2 space-y-1">
                <div className="text-2xl font-black text-slate-800">42.5K</div>
                <div className="h-6 w-full bg-gradient-to-r from-purple-100 to-purple-200 rounded" />
              </div>
              <div className="absolute inset-0 bg-[#fffcf7]/70 backdrop-blur-[2px] flex flex-col items-center justify-center p-3 text-center">
                <span className="px-2.5 py-0.5 bg-[#f1e8dc] text-[#7a5242] border border-[#d8c09e] rounded-md text-[10px] font-black tracking-wider uppercase mb-1">
                  GSC Required
                </span>
                <span className="text-[11px] font-bold text-[#2b1b12] group-hover:underline">
                  Connect to unlock metric
                </span>
              </div>
            </>
          )}
        </div>

        {/* Metric 4: Backlinks (GSC) */}
        <div
          onClick={() => !gscConnected && setGscModalOpen(true)}
          className="bg-white rounded-2xl p-5 border border-[#e4d6c6] shadow-sm relative overflow-hidden flex flex-col justify-between min-h-[160px] cursor-pointer hover:border-[#c5a059] transition-all group"
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="text-[#6f5a4c] font-black text-[11px] uppercase tracking-wider">Backlinks</h3>
          </div>
          {gscConnected ? (
            <div className="mt-2">
              <div className="text-2xl font-black text-[#2b1b12]">342</div>
              <div className="text-xs font-semibold text-emerald-600 mt-1 flex items-center gap-1">
                <span>▲ 18 New</span>
                <span className="text-slate-400 font-normal">high DA links</span>
              </div>
            </div>
          ) : (
            <>
              <div className="filter blur-[6px] select-none opacity-40 mt-2 space-y-1">
                <div className="text-2xl font-black text-slate-800">320</div>
                <div className="h-6 w-full bg-gradient-to-r from-blue-100 to-blue-200 rounded" />
              </div>
              <div className="absolute inset-0 bg-[#fffcf7]/70 backdrop-blur-[2px] flex flex-col items-center justify-center p-3 text-center">
                <span className="px-2.5 py-0.5 bg-[#f1e8dc] text-[#7a5242] border border-[#d8c09e] rounded-md text-[10px] font-black tracking-wider uppercase mb-1">
                  GSC Required
                </span>
                <span className="text-[11px] font-bold text-[#2b1b12] group-hover:underline">
                  Connect to unlock metric
                </span>
              </div>
            </>
          )}
        </div>

        {/* Metric 5: AI Visibility Score */}
        <div className="bg-white rounded-2xl p-5 border border-[#e4d6c6] shadow-sm flex flex-col justify-between min-h-[160px] hover:border-[#c5a059] transition-all">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="text-[#6f5a4c] font-black text-[11px] uppercase tracking-wider">AI Visibility Score</h3>
            <span className="text-slate-400 text-xs cursor-help" title="Citation share across Gemini, ChatGPT, Claude, and Perplexity">ⓘ</span>
          </div>
          <div className="flex items-center gap-4 mt-2">
            <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
              <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 80 80">
                <circle cx="40" cy="40" r="32" stroke="#f1e8dc" strokeWidth="6" fill="transparent" />
                <circle
                  cx="40"
                  cy="40"
                  r="32"
                  stroke="#c5a059"
                  strokeWidth="6"
                  fill="transparent"
                  strokeDasharray={2 * Math.PI * 32}
                  strokeDashoffset={2 * Math.PI * 32 * (1 - (project?.aeoScore || 88) / 100)}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-lg font-black text-[#2b1b12]">{project?.aeoScore || 88}</span>
                <span className="text-[8px] text-[#6f5a4c] font-bold">/100</span>
              </div>
            </div>
            <div>
              <div className="text-xs font-bold text-[#c5a059]">Great!</div>
              <div className="text-[10px] text-[#6f5a4c] mt-0.5 leading-snug">
                Recommended by 4 major AI engines
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Second Row (3 Columns: Top SEO Issues, Traffic Overview, Quick Actions) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Column 1: Top SEO Issues */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-[#e4d6c6] p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-sm text-[#2b1b12]">Top SEO Issues</h3>
              <button
                onClick={() => onNavigateTab('audit')}
                className="text-xs font-semibold text-[#7a5242] hover:text-[#2b1b12] hover:underline"
              >
                View All
              </button>
            </div>

            <div className="space-y-3">
              {issues.map((issue) => (
                <div
                  key={issue.id}
                  className="p-3 rounded-xl border text-xs flex items-center justify-between gap-2 bg-[#f8f3ec] border-[#e4d6c6] hover:border-[#c5a059] transition-all"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <FileText className="w-4 h-4 text-amber-500 shrink-0" />
                    <div className="min-w-0">
                      <p className="font-semibold truncate text-[#2b1b12]">
                        {issue.text}
                      </p>
                      <span className="text-[10px] font-bold text-amber-700">
                        • {issue.severity} Priority
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onNavigateTab('audit')}
                    className="px-2.5 py-1 bg-white hover:bg-[#ebdcc8] text-[#2b1b12] border border-[#d8c09e] rounded-lg text-[10px] font-bold shrink-0 transition-all cursor-pointer flex items-center gap-1"
                    title="View details in SEO Audit"
                  >
                    <span>Inspect</span>
                    <ChevronRight className="w-3 h-3 text-[#6f5a4c]" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Column 2: Traffic Overview Chart */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-[#e4d6c6] p-5 shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-sm text-[#2b1b12]">Traffic Overview</h3>
              <div className="flex items-center gap-3 text-[11px] text-[#6f5a4c] font-medium">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#c5a059]" /> Organic Traffic
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-slate-300" /> Total Traffic
                </span>
              </div>
            </div>

            {/* Blurred background chart simulation */}
            <div className="h-44 w-full flex items-end justify-between gap-2 px-2 filter blur-[5px] opacity-40 select-none">
              {[40, 55, 48, 65, 80, 75, 95].map((h, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full bg-[#c5a059] rounded-t" style={{ height: `${h}%` }} />
                  <span className="text-[10px] text-slate-400">Day {i + 1}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Central Overlay Box for GSC Connection */}
          <div className="absolute inset-x-6 top-16 bottom-6 bg-[#fffcf7]/95 border border-[#e4d6c6] rounded-2xl p-5 flex flex-col items-center justify-center text-center shadow-lg">
            <span className="px-3 py-1 bg-[#f1e8dc] text-[#7a5242] border border-[#d8c09e] rounded-full text-[10px] font-black uppercase tracking-wider mb-2">
              GSC Required
            </span>
            <p className="text-xs text-[#6f5a4c] max-w-sm mb-4 leading-relaxed">
              Google Search Console connection is required to show real-time organic search traffic trends and keyword positions.
            </p>
            <button
              onClick={() => setGscModalOpen(true)}
              className="px-5 py-2.5 bg-[#2b1b12] hover:bg-[#3b2519] text-[#fffcf7] rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer"
            >
              Connect Google Search Console
            </button>
          </div>
        </div>

        {/* Column 3: Quick Actions */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-[#e4d6c6] p-5 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-sm text-[#2b1b12] pb-3 border-b border-slate-100 mb-4">
              Quick Actions
            </h3>

            <div className="space-y-2.5">
              {[
                { label: 'Run SEO Audit', tab: 'audit', icon: Activity, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                { label: 'Create Blog', tab: 'blogs', icon: FileText, color: 'text-purple-600', bg: 'bg-purple-50' },
                { label: 'Generate Social Post', tab: 'social', icon: Share2, color: 'text-pink-600', bg: 'bg-pink-50' },
                { label: 'Check AI Visibility', tab: 'aeo', icon: Eye, color: 'text-[#c5a059]', bg: 'bg-[#f1e8dc]' },
              ].map((act, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => onNavigateTab(act.tab)}
                  className="w-full flex items-center justify-between p-3 rounded-xl border border-[#e4d6c6] hover:border-[#c5a059] hover:bg-[#f8f3ec] transition-all text-left bg-white group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${act.bg} ${act.color}`}>
                      <act.icon className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-[#2b1b12] group-hover:text-[#c5a059]">
                      {act.label}
                    </span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 4. Third Row: Competitor's Website Table */}
      <div className="bg-white rounded-2xl border border-[#e4d6c6] p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-bold text-base text-[#2b1b12]">Competitor&apos;s Website</h3>
            <p className="text-xs text-[#6f5a4c]">Benchmark your organic presence and share of voice against key rivals</p>
          </div>
          <span className="text-xs font-semibold text-[#7a5242]">
            {competitorsList.length} Competitors Tracked
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-[#6f5a4c] uppercase tracking-wider text-[10px]">
                <th className="py-2.5 font-bold">Competitor</th>
                <th className="py-2.5 font-bold">Positioning</th>
                <th className="py-2.5 font-bold">Strengths</th>
                <th className="py-2.5 font-bold text-right">Share of Voice</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {competitorsList.map((comp: any, idx: number) => {
                const domainName = typeof comp === 'string' ? comp : (comp.domain || comp.name);
                const initial = domainName.replace(/^(https?:\/\/)?(www\.)?/, '').charAt(0).toUpperCase();
                return (
                  <tr key={idx} className="hover:bg-[#f8f3ec]/50 transition-colors">
                    <td className="py-3 font-bold text-[#2b1b12]">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-[#f1e8dc] text-[#7a5242] border border-[#d8c09e] flex items-center justify-center font-bold text-xs">
                          {initial}
                        </div>
                        <span>{domainName}</span>
                      </div>
                    </td>
                    <td className="py-3 text-[#6f5a4c] max-w-xs truncate font-medium">
                      {comp.positioning || 'Enterprise Industry Leader'}
                    </td>
                    <td className="py-3 text-[#6f5a4c] max-w-xs truncate font-medium">
                      {comp.strengths || 'Established brand reach & domain authority'}
                    </td>
                    <td className="py-3 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <span className="font-bold text-[#2b1b12]">{comp.share || 25}%</span>
                        <div className="w-20 h-1.5 bg-[#f1e8dc] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#c5a059] rounded-full"
                            style={{ width: `${comp.share || 25}%` }}
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Fourth Row: All Modules Grid */}
      <div className="space-y-4">
        <div>
          <h3 className="font-bold text-base text-[#2b1b12]">All Modules</h3>
          <p className="text-xs text-[#6f5a4c]">Access your autonomous growth engines and content accelerators</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { id: 'audit', title: 'SEO', desc: 'Audit, inspect, and optimize your website for search engines.', icon: Search, color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { id: 'blogs', title: 'Blogs', desc: 'Create SEO-optimized blogs with AI and auto-publish.', icon: FileText, color: 'text-indigo-600', bg: 'bg-indigo-50', isComingSoon: true },
            { id: 'backlinks', title: 'Backlinks', desc: 'Build quality backlinks and improve domain authority.', icon: LinkIcon, color: 'text-blue-600', bg: 'bg-blue-50', isComingSoon: true },
            { id: 'social', title: 'Social Media', desc: 'Create, schedule & publish across all social platforms.', icon: Share2, color: 'text-pink-600', bg: 'bg-pink-50' },
            { id: 'aeo', title: 'AEO / GEO', desc: 'Improve visibility in AI search engines & generative AI.', icon: Sparkles, color: 'text-[#c5a059]', bg: 'bg-[#f1e8dc]' },
            { id: 'media', title: 'Media Studio', desc: 'Generate images, videos & creatives with AI.', isBeta: true, icon: ImageIcon, color: 'text-purple-600', bg: 'bg-purple-50' },
          ].map((mod) => (
            <div
              key={mod.id}
              onClick={() => onNavigateTab(mod.id)}
              className="bg-white rounded-2xl border border-[#e4d6c6] p-5 shadow-sm hover:border-[#c5a059] hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`p-2.5 rounded-xl ${mod.bg} ${mod.color}`}>
                  <mod.icon className="w-5 h-5" />
                </div>
                {mod.isBeta && (
                  <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 text-[10px] font-black uppercase tracking-wider border border-purple-200">
                    BETA
                  </span>
                )}
                {mod.isComingSoon && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-black uppercase tracking-wider border border-amber-200">
                    Coming Soon
                  </span>
                )}
              </div>
              <div>
                <h4 className="font-bold text-sm text-[#2b1b12] group-hover:text-[#c5a059] transition-colors flex items-center gap-1.5">
                  {mod.title}
                  {mod.isComingSoon && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase bg-amber-100 text-amber-800 border border-amber-300">
                      Coming Soon
                    </span>
                  )}
                  <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </h4>
                <p className="text-xs text-[#6f5a4c] mt-1 leading-relaxed">
                  {mod.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 6. Fifth Row: Recent Activities Feed */}
      <div className="bg-white rounded-2xl border border-[#e4d6c6] p-6 shadow-sm space-y-4">
        <h3 className="font-bold text-base text-[#2b1b12]">Recent Activities</h3>
        <div className="space-y-3">
          {[
            { title: `Domain crawl completed for ${project?.domain || 'site'}`, time: '2 mins ago', type: 'crawl', icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { title: 'AI Brand Memory & Visual Identity synchronized', time: '15 mins ago', type: 'brand', icon: Sparkles, color: 'text-[#c5a059]', bg: 'bg-[#f1e8dc]' },
            { title: 'New long-form EEAT article drafted in Content Engine', time: '1 hour ago', type: 'blog', icon: FileText, color: 'text-indigo-600', bg: 'bg-indigo-50' },
            { title: 'Instagram marketing carousel scheduled in Social Queue', time: '3 hours ago', type: 'social', icon: Share2, color: 'text-pink-600', bg: 'bg-pink-50' },
            { title: 'AEO Entity Knowledge Graph radar calibrated across LLMs', time: '1 day ago', type: 'aeo', icon: Activity, color: 'text-purple-600', bg: 'bg-purple-50' },
          ].map((act, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-[#f8f3ec] border border-[#e4d6c6] text-xs">
              <div className="flex items-center gap-3">
                <div className={`p-1.5 rounded-lg ${act.bg} ${act.color}`}>
                  <act.icon className="w-4 h-4" />
                </div>
                <span className="font-semibold text-[#2b1b12]">{act.title}</span>
              </div>
              <span className="text-[11px] text-[#6f5a4c] font-medium">{act.time}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Google Search Console Connection Modal */}
      {gscModalOpen && (
        <div className="fixed inset-0 z-[999999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[#e4d6c6] rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl text-center space-y-5 animate-fade-in">
            <div className="w-14 h-14 bg-[#f1e8dc] text-[#c5a059] border border-[#d8c09e] rounded-2xl flex items-center justify-center mx-auto text-xl font-bold shadow-sm">
              <Globe className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-bold text-[#2b1b12]">Connect Google Search Console</h3>
              <p className="text-xs text-[#6f5a4c] leading-relaxed">
                Stream real-time organic search visits, SERP impressions, CTR, and search queries for <strong>{project?.domain}</strong>.
              </p>
            </div>

            <div className="p-4 bg-[#f8f3ec] border border-[#e4d6c6] rounded-xl text-left text-xs space-y-2 text-[#6f5a4c]">
              <div className="flex items-center gap-2 text-[#2b1b12] font-bold">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Read-Only Official OAuth Integration</span>
              </div>
              <p className="text-[11px]">Rank Monk only requests read-only metrics access. No code modifications are performed on your Google account.</p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setGscModalOpen(false)}
                className="flex-1 py-3 border border-[#e4d6c6] text-[#6f5a4c] hover:bg-[#f8f3ec] rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={connectingGsc}
                onClick={handleConnectGsc}
                className="flex-1 py-3 bg-[#2b1b12] hover:bg-[#3b2519] text-[#fffcf7] rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {connectingGsc ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Connecting...</span>
                  </>
                ) : (
                  <span>Connect with Google</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

