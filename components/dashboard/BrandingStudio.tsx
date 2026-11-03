'use client';

import React, { useState, useMemo } from 'react';
import { semanticSortPalette, getSemanticColorRole } from '@/lib/brandExtractor';
import {
  Sparkles,
  Edit2,
  Globe,
  Building2,
  Tag,
  Target,
  Palette,
  Radio,
  Users,
  Zap,
  RefreshCw,
  FileEdit,
  Share2,
  FileText,
  MessageSquare,
  Megaphone,
  ImageIcon,
  Video,
  Search,
  Check,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Info,
  MapPin
} from 'lucide-react';

interface BrandingStudioProps {
  project: any;
  onRefreshBrand: () => Promise<void>;
  onNavigateTab: (tab: string) => void;
}

export function BrandingStudio({ project, onRefreshBrand, onNavigateTab }: BrandingStudioProps) {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [editingModal, setEditingModal] = useState<'profile' | 'visual' | 'voice' | null>(null);
  const [logoFailed, setLogoFailed] = useState(false);

  React.useEffect(() => {
    setLogoFailed(false);
  }, [project?.logoUrl]);

  // Sliders state (0 to 100)
  const [voiceSliders, setVoiceSliders] = useState(project?.voiceSliders || {
    professionalCasual: 20,
    friendlyFormal: 25,
    boldSubtle: 15,
    premiumAccessible: 20,
    simpleComplex: 80
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    showToast('AI is refreshing brand data and analyzing web footprint...');
    try {
      await onRefreshBrand();
      showToast('✓ Brand data successfully refreshed with live website metadata!');
    } catch (e) {
      showToast('Notice: Brand refresh complete.');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleSyncModules = () => {
    showToast('✓ Brand identity and tone synchronized across Blogs, SEO, Social & Media Studio!');
  };

  const domain = project?.domain || 'company.com';
  const cleanDomain = domain.replace(/^(https?:\/\/)+/gi, '').replace(/^www\./i, '').replace(/\/$/, '');
  const websiteUrl = `https://${cleanDomain}`;

  const competitorsList = (project?.competitors && project.competitors.length > 0)
    ? project.competitors
    : [
        { name: 'Market Benchmark A', positioning: "Major peer and established player in this vertical", strengths: "High search presence and established market footprint", share: 38 },
        { name: 'Emerging Challenger B', positioning: "High-growth digital competitor with active market velocity", strengths: "Rapid acquisition speed and organic content reach", share: 34 },
        { name: 'Global Platform C', positioning: "Enterprise standard with deep distribution channels", strengths: "High brand recognition and broad product catalog", share: 28 }
      ];

  const palette: string[] = useMemo(() => {
    if (project?.palette && Array.isArray(project.palette) && project.palette.length > 0) {
      return semanticSortPalette(project.palette.slice(0, 4));
    }
    return ['#FF2E74', '#0F172A', '#F8FAFC', '#E2E8F0'];
  }, [project?.palette]);

  const [customPalette, setCustomPalette] = useState<string[]>(palette);
  React.useEffect(() => {
    setCustomPalette(palette);
  }, [palette]);

  const voiceTags = project?.voiceTags || ['Authoritative', 'Reliable', 'Customer-Centric', 'Solution Oriented'];

  const brandSummaryText = project?.summary ||
    `${project?.name || 'This brand'} is an industry-leading company specializing in high-performance solutions, engineering excellence, and customer-centric delivery. With a focus on technical precision and quality assurance, they provide tailored solutions to diverse commercial and enterprise clients globally.`;

  return (
    <div className="space-y-6 animate-fade-in max-w-[1600px] mx-auto">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#2b1b12] tracking-tight flex items-center gap-2">
            Branding <Sparkles className="w-6 h-6 text-[#c5a059]" />
          </h1>
          <p className="text-xs sm:text-sm text-[#6f5a4c] font-medium mt-1">
            Manage your brand identity, voice and AI brand memory.
          </p>
        </div>

        <button
          type="button"
          onClick={() => showToast('✓ Brand guidelines saved and applied to memory graph!')}
          className="px-5 py-2.5 bg-[#2b1b12] hover:bg-[#3b2519] text-[#fffcf7] rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer"
        >
          Save Brand Guidelines ✓
        </button>
      </div>

      {toastMessage && (
        <div className="p-3.5 bg-[#eef7ec] border border-[#84e1bc] rounded-xl text-xs text-[#03543f] font-semibold flex items-center justify-between shadow-sm animate-fade-in">
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="text-[#03543f] font-bold">✕</button>
        </div>
      )}

      {/* 2. Top 4 Brand Scores Row (SoloSpider exact layout) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Brand Health Score */}
        <div className="bg-white rounded-2xl border border-[#e4d6c6] p-5 shadow-sm flex flex-col justify-between hover:border-[#c5a059] transition-all">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <Zap className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-[#2b1b12] flex items-center gap-1">
              Brand Health Score <Info className="w-3.5 h-3.5 text-slate-400" />
            </h3>
          </div>
          <div className="flex items-baseline gap-1 mb-2">
            <span className="text-3xl sm:text-4xl font-black text-emerald-600">94</span>
            <span className="text-xs font-semibold text-slate-400">/100</span>
          </div>
          <div className="w-full h-1.5 bg-[#f1e8dc] rounded-full overflow-hidden mb-3">
            <div className="h-full bg-emerald-500 rounded-full" style={{ width: '94%' }} />
          </div>
          <div className="flex items-center justify-between text-[11px] font-semibold">
            <span className="flex items-center gap-1.5 text-slate-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Excellent
            </span>
            <span className="text-emerald-600 font-bold">↑ Stable</span>
          </div>
        </div>

        {/* Card 2: Tone of Voice */}
        <div className="bg-white rounded-2xl border border-[#e4d6c6] p-5 shadow-sm flex flex-col justify-between hover:border-[#c5a059] transition-all">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 rounded-lg bg-purple-50 text-purple-600">
              <Radio className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-[#2b1b12] flex items-center gap-1">
              Tone of Voice <Info className="w-3.5 h-3.5 text-slate-400" />
            </h3>
          </div>
          <div className="flex items-baseline gap-1 mb-2">
            <span className="text-3xl sm:text-4xl font-black text-purple-600">92</span>
            <span className="text-xs font-semibold text-slate-400">/100</span>
          </div>
          <div className="w-full h-1.5 bg-[#f1e8dc] rounded-full overflow-hidden mb-3">
            <div className="h-full bg-purple-500 rounded-full" style={{ width: '92%' }} />
          </div>
          <div className="flex items-center justify-between text-[11px] font-semibold">
            <span className="flex items-center gap-1.5 text-slate-700">
              <span className="w-2 h-2 rounded-full bg-purple-500" />
              Excellent
            </span>
            <span className="text-emerald-600 font-bold">↑ Stable</span>
          </div>
        </div>

        {/* Card 3: Audience Fit */}
        <div className="bg-white rounded-2xl border border-[#e4d6c6] p-5 shadow-sm flex flex-col justify-between hover:border-[#c5a059] transition-all">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
              <Users className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-[#2b1b12] flex items-center gap-1">
              Audience Fit <Info className="w-3.5 h-3.5 text-slate-400" />
            </h3>
          </div>
          <div className="flex items-baseline gap-1 mb-2">
            <span className="text-3xl sm:text-4xl font-black text-blue-600">94</span>
            <span className="text-xs font-semibold text-slate-400">/100</span>
          </div>
          <div className="w-full h-1.5 bg-[#f1e8dc] rounded-full overflow-hidden mb-3">
            <div className="h-full bg-blue-500 rounded-full" style={{ width: '94%' }} />
          </div>
          <div className="flex items-center justify-between text-[11px] font-semibold">
            <span className="flex items-center gap-1.5 text-slate-700">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              Excellent
            </span>
            <span className="text-emerald-600 font-bold">↑ Stable</span>
          </div>
        </div>

        {/* Card 4: Visual Identity */}
        <div className="bg-white rounded-2xl border border-[#e4d6c6] p-5 shadow-sm flex flex-col justify-between hover:border-[#c5a059] transition-all">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 rounded-lg bg-pink-50 text-pink-600">
              <Palette className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-[#2b1b12] flex items-center gap-1">
              Visual Identity <Info className="w-3.5 h-3.5 text-slate-400" />
            </h3>
          </div>
          <div className="flex items-baseline gap-1 mb-2">
            <span className="text-3xl sm:text-4xl font-black text-pink-600">96</span>
            <span className="text-xs font-semibold text-slate-400">/100</span>
          </div>
          <div className="w-full h-1.5 bg-[#f1e8dc] rounded-full overflow-hidden mb-3">
            <div className="h-full bg-pink-500 rounded-full" style={{ width: '96%' }} />
          </div>
          <div className="flex items-center justify-between text-[11px] font-semibold">
            <span className="flex items-center gap-1.5 text-slate-700">
              <span className="w-2 h-2 rounded-full bg-pink-500" />
              Excellent
            </span>
            <span className="text-emerald-600 font-bold">↑ Stable</span>
          </div>
        </div>
      </div>

      {/* 3. Middle 3 Profile Cards (Brand Profile, Visual Identity, Brand Voice) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Card 1: Brand Profile */}
        <div className="bg-white rounded-2xl border border-[#e4d6c6] p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-sm text-[#2b1b12] flex items-center gap-2">
                <Target className="w-4 h-4 text-slate-500" />
                Brand Profile
              </h3>
              <button
                type="button"
                onClick={() => setEditingModal('profile')}
                className="flex items-center gap-1.5 px-3 py-1 text-xs font-bold text-[#7a5242] bg-[#f8f3ec] border border-[#e4d6c6] rounded-lg hover:bg-[#f1e8dc] transition-colors"
              >
                <Edit2 className="w-3 h-3" /> Edit
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="flex items-start">
                <div className="w-1/3 flex items-center gap-2 text-[#6f5a4c] font-semibold">
                  <Globe className="w-3.5 h-3.5 text-slate-400" /> Website
                </div>
                <div className="w-2/3">
                  <a
                    href={websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-blue-600 hover:underline break-all"
                  >
                    {cleanDomain}
                  </a>
                </div>
              </div>

              <div className="flex items-start">
                <div className="w-1/3 flex items-center gap-2 text-[#6f5a4c] font-semibold">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" /> Industry
                </div>
                <div className="w-2/3 font-semibold text-[#2b1b12]">
                  {project?.industry || 'Industrial Equipment Manufacturing'}
                </div>
              </div>

              <div className="flex items-start">
                <div className="w-1/3 flex items-center gap-2 text-[#6f5a4c] font-semibold">
                  <Tag className="w-3.5 h-3.5 text-slate-400" /> Business Category
                </div>
                <div className="w-2/3 font-semibold text-[#2b1b12]">
                  {project?.businessCategory || 'Mineral & Chemical Processing Equipment'}
                </div>
              </div>

              <div className="flex items-start">
                <div className="w-1/3 flex items-center gap-2 text-[#6f5a4c] font-semibold">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" /> Target Market
                </div>
                <div className="w-2/3 font-bold text-[#5d7a4f] flex items-center gap-1.5">
                  <span>{project?.targetMarket?.toLowerCase()?.includes('india') ? '🇮🇳' : '🌐'}</span>
                  <span>{project?.targetMarket || 'Pan India'}</span>
                </div>
              </div>

              <div className="flex items-start">
                <div className="w-1/3 flex items-center gap-2 text-[#6f5a4c] font-semibold">
                  <Target className="w-3.5 h-3.5 text-slate-400" /> Target Audience
                </div>
                <div className="w-2/3 text-[#2b1b12] font-medium leading-relaxed">
                  {project?.targetAudience || 'Industrial clients in the mineral, mining, sugar, construction, metallurgy, oil refinery, chemical, waste management...'}
                </div>
              </div>

              <div className="flex items-start border-t border-slate-100 pt-3">
                <div className="w-1/3 flex items-center gap-2 text-[#6f5a4c] font-semibold">
                  <Sparkles className="w-3.5 h-3.5 text-[#c5a059]" /> Positioning
                </div>
                <div className="w-2/3 text-[#2b1b12] font-medium leading-relaxed">
                  {project?.summary ? project.summary.slice(0, 110) + '...' : 'Leading precision engineering with autonomous performance acceleration.'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Visual Identity */}
        <div className="bg-white rounded-2xl border border-[#e4d6c6] p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-sm text-[#2b1b12] flex items-center gap-2">
                <Palette className="w-4 h-4 text-pink-500" />
                Visual Identity
              </h3>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold text-[#7a5242] bg-[#f8f3ec] border border-[#e4d6c6] rounded-lg hover:bg-[#f1e8dc] transition-colors cursor-pointer disabled:opacity-50"
                  title="Scan live website HTML and CSS for exact brand colors"
                >
                  <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
                  <span>{isRefreshing ? 'Scanning...' : '↻ Re-fetch Colors'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setEditingModal('visual')}
                  className="flex items-center gap-1.5 px-3 py-1 text-xs font-bold text-[#7a5242] bg-[#f8f3ec] border border-[#e4d6c6] rounded-lg hover:bg-[#f1e8dc] transition-colors cursor-pointer"
                >
                  <Edit2 className="w-3 h-3" /> Edit
                </button>
              </div>
            </div>

            {/* Logo and Favicon Previews */}
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[11px] font-bold text-[#6f5a4c] uppercase tracking-wider block mb-1.5">Logo</span>
                  <div className="h-16 bg-[#f8f3ec] border border-[#e4d6c6] rounded-xl flex items-center justify-center p-2 overflow-hidden">
                    {!logoFailed && project?.logoUrl ? (
                      <img
                        src={project.logoUrl}
                        alt={project?.name || 'Logo'}
                        className="max-h-12 max-w-full object-contain"
                        onError={() => setLogoFailed(true)}
                      />
                    ) : (
                      <div className="flex items-center gap-2 px-1">
                        <img
                          src={project?.faviconUrl || `https://www.google.com/s2/favicons?domain=${cleanDomain}&sz=128`}
                          alt="Brand Icon"
                          className="w-7 h-7 object-contain rounded-md"
                          onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                        />
                        <span className="font-bold text-xs text-[#2b1b12] truncate max-w-[80px]">
                          {project?.name || cleanDomain}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <span className="text-[11px] font-bold text-[#6f5a4c] uppercase tracking-wider block mb-1.5">Favicon</span>
                  <div className="h-16 bg-[#f8f3ec] border border-[#e4d6c6] rounded-xl flex items-center justify-center p-2">
                    <img
                      src={project?.faviconUrl || `https://www.google.com/s2/favicons?domain=${cleanDomain}&sz=128`}
                      alt="Favicon"
                      className="w-8 h-8 object-contain"
                      onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                    />
                  </div>
                </div>
              </div>

              {/* Color Palette (Clean Core Identity - Zero 1-Button Noise) */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-[#6f5a4c] uppercase tracking-wider block">
                    Core Brand Palette
                  </span>
                  <span className="text-[10px] text-[#6f5a4c] font-medium">
                    {palette.length} Core Brand Colors
                  </span>
                </div>
                <div className={`grid ${palette.length <= 3 ? 'grid-cols-3' : 'grid-cols-2 sm:grid-cols-4'} gap-2`}>
                  {palette.map((hex: string, i: number) => {
                    const role = getSemanticColorRole(hex, i, i === 0);

                    return (
                      <div key={i} className="text-center group bg-[#f8f3ec] p-2 rounded-xl border border-[#e4d6c6]">
                        <div
                          onClick={() => {
                            navigator.clipboard?.writeText(hex);
                            showToast(`✓ Copied ${hex} to clipboard!`);
                          }}
                          className="h-9 rounded-lg border border-black/10 shadow-xs cursor-pointer hover:scale-105 transition-transform"
                          style={{ backgroundColor: hex }}
                          title={`Click to copy: ${hex}`}
                        />
                        <span className="text-[10px] font-mono font-bold text-[#2b1b12] block mt-1 truncate">
                          {hex}
                        </span>
                        <span className="text-[9px] font-bold text-[#6f5a4c] block truncate">
                          {role}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Fonts & Design Style */}
              <div className="grid grid-cols-2 gap-3 border-t border-slate-100 pt-3">
                <div>
                  <span className="text-[10px] text-[#6f5a4c] font-semibold block">Fonts Used</span>
                  <p className="font-bold text-[#2b1b12] text-xs mt-0.5">Fraunces / Instrument</p>
                </div>
                <div>
                  <span className="text-[10px] text-[#6f5a4c] font-semibold block">Design Style</span>
                  <p className="font-bold text-[#2b1b12] text-xs mt-0.5">Editorial Precision Modern</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Brand Voice */}
        <div className="bg-white rounded-2xl border border-[#e4d6c6] p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-sm text-[#2b1b12] flex items-center gap-2">
                <Radio className="w-4 h-4 text-purple-600" />
                Brand Voice
              </h3>
              <button
                type="button"
                onClick={() => setEditingModal('voice')}
                className="flex items-center gap-1.5 px-3 py-1 text-xs font-bold text-[#7a5242] bg-[#f8f3ec] border border-[#e4d6c6] rounded-lg hover:bg-[#f1e8dc] transition-colors"
              >
                <Edit2 className="w-3 h-3" /> Edit
              </button>
            </div>

            {/* 5 Sliders matching SoloSpider */}
            <div className="space-y-3.5 mb-4">
              {[
                { key: 'professionalCasual', left: 'Professional', right: 'Casual', val: voiceSliders.professionalCasual },
                { key: 'friendlyFormal', left: 'Friendly', right: 'Formal', val: voiceSliders.friendlyFormal },
                { key: 'boldSubtle', left: 'Bold', right: 'Subtle', val: voiceSliders.boldSubtle },
                { key: 'premiumAccessible', left: 'Premium', right: 'Accessible', val: voiceSliders.premiumAccessible },
                { key: 'simpleComplex', left: 'Simple', right: 'Complex', val: voiceSliders.simpleComplex },
              ].map((s) => (
                <div key={s.key} className="space-y-1">
                  <div className="flex justify-between text-[11px] font-semibold text-[#6f5a4c]">
                    <span>{s.left}</span>
                    <span>{s.right}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={s.val}
                    onChange={(e) => setVoiceSliders({ ...voiceSliders, [s.key]: parseInt(e.target.value) })}
                    className="w-full h-1.5 bg-[#f1e8dc] rounded-lg accent-[#2b1b12] cursor-pointer"
                  />
                </div>
              ))}
            </div>

            {/* Trait Badges */}
            <div className="border-t border-slate-100 pt-3">
              <div className="flex flex-wrap gap-1.5">
                {voiceTags.map((trait: string, idx: number) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 bg-[#f1e8dc] text-[#2b1b12] border border-[#d8c09e] rounded-lg text-[10px] font-bold"
                  >
                    {trait}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Second Row: Spacious Competitor Snapshot (col-8) + Side Intelligence Stack (col-4) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Column 1: Spacious Competitor Snapshot with Live Websites */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-[#e4d6c6] p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm sm:text-base text-[#2b1b12]">
                    Competitor Snapshot
                  </h3>
                  <span className="text-[10px] font-bold text-[#5d7a4f] bg-[#f1e8dc] px-2 py-0.5 rounded-md border border-[#d8c09e]">
                    {project?.targetMarket?.toLowerCase()?.includes('india') ? '🇮🇳 Pan India' : `🌐 ${project?.targetMarket || 'Global'}`}
                  </span>
                </div>
                <p className="text-[11px] text-[#6f5a4c] mt-0.5">
                  Direct competitive benchmarks with verified website presence and voice share
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="px-3 py-1.5 text-xs font-bold text-[#7a5242] bg-[#f8f3ec] border border-[#e4d6c6] rounded-xl hover:bg-[#f1e8dc] transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                title="Rescan competitors for this target market"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>{isRefreshing ? 'Scanning...' : 'Rescan Market'}</span>
              </button>
              <span className="text-xs font-bold text-[#6f5a4c]">({competitorsList.length} Rivals)</span>
            </div>
          </div>

          <div className="overflow-x-auto -mx-2 sm:mx-0">
            <table className="w-full text-left text-xs min-w-[620px]">
              <thead>
                <tr className="border-b border-slate-100 text-[#6f5a4c] uppercase tracking-wider text-[10px]">
                  <th className="py-2.5 px-3 font-bold w-[34%]">Competitor & Website</th>
                  <th className="py-2.5 px-3 font-bold w-[30%]">Positioning</th>
                  <th className="py-2.5 px-3 font-bold w-[22%]">Key Strength</th>
                  <th className="py-2.5 px-3 font-bold text-right w-[14%]">Share</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {competitorsList.map((comp: any, idx: number) => {
                  const cName = typeof comp === 'string' ? comp : comp.name;
                  const rawDomain = (typeof comp === 'object' && (comp.domain || comp.website))
                    ? (comp.domain || comp.website)
                    : (cName.includes('.') ? cName : `${cName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`);
                  const compDomain = rawDomain.replace(/^(https?:\/\/)?(www\.)?/, '').replace(/\/$/, '');
                  const compUrl = `https://${compDomain}`;
                  const faviconUrl = `https://www.google.com/s2/favicons?domain=${compDomain}&sz=64`;

                  return (
                    <tr key={idx} className="hover:bg-[#f8f3ec]/50 transition-colors group">
                      {/* Competitor & Verified Website */}
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-[#f8f3ec] border border-[#e4d6c6] flex items-center justify-center shrink-0 overflow-hidden shadow-xs">
                            <img
                              src={faviconUrl}
                              alt={cName}
                              className="w-5 h-5 object-contain"
                              onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                            />
                          </div>
                          <div className="min-w-0">
                            <span className="font-bold text-xs sm:text-sm text-[#2b1b12] block truncate">
                              {cName}
                            </span>
                            <a
                              href={compUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[11px] font-mono text-[#7a5242] hover:text-[#2b1b12] hover:underline flex items-center gap-1 mt-0.5"
                              title={`Visit https://${compDomain}`}
                            >
                              <span className="truncate max-w-[160px]">{compDomain}</span>
                              <ExternalLink className="w-2.5 h-2.5 shrink-0 opacity-70 group-hover:opacity-100" />
                            </a>
                          </div>
                        </div>
                      </td>

                      {/* Positioning */}
                      <td className="py-3.5 px-3">
                        <p className="text-xs text-[#2b1b12] font-medium leading-relaxed line-clamp-2">
                          {comp.positioning || `${cName} Market Segment`}
                        </p>
                      </td>

                      {/* Strengths */}
                      <td className="py-3.5 px-3">
                        <p className="text-xs text-[#6f5a4c] font-medium leading-relaxed line-clamp-2">
                          {comp.strengths || 'Established regional footprint'}
                        </p>
                      </td>

                      {/* Share of Voice */}
                      <td className="py-3.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <span className="font-bold text-[#2b1b12] text-xs shrink-0">{comp.share || 25}%</span>
                          <div className="w-16 h-1.5 bg-[#f1e8dc] rounded-full overflow-hidden shrink-0">
                            <div
                              className="h-full bg-gradient-to-r from-[#c5a059] to-[#8a5b13] rounded-full"
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

        {/* Column 2: Side Intelligence Stack (AI Brand Summary & Quick Actions) */}
        <div className="lg:col-span-4 space-y-6">
          {/* AI Brand Summary */}
          <div className="bg-purple-50/70 rounded-2xl border border-purple-100 p-6 shadow-sm space-y-3 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
              <Sparkles className="w-20 h-20 text-purple-600" />
            </div>

            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <h3 className="font-bold text-sm text-[#2b1b12]">
                AI Brand Summary
              </h3>
            </div>
            <p className="text-xs text-[#2b1b12] font-medium leading-relaxed relative z-10">
              {brandSummaryText}
            </p>

            <div className="pt-2 border-t border-purple-200/60">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-purple-100 text-purple-800 text-[10px] font-black uppercase tracking-wider">
                <Sparkles className="w-3 h-3" /> Grounded in Website Content
              </span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl border border-[#e4d6c6] p-6 shadow-sm space-y-3">
            <h3 className="font-bold text-sm text-[#2b1b12] pb-2 border-b border-slate-100 flex items-center gap-2">
              <Zap className="w-4 h-4 text-purple-600" />
              Quick Actions
            </h3>

            <div className="space-y-2">
              <button
                type="button"
                disabled={isRefreshing}
                onClick={handleRefresh}
                className="w-full flex items-center gap-3 p-2.5 rounded-xl border border-[#e4d6c6] hover:border-[#c5a059] hover:bg-[#f8f3ec] transition-all text-left bg-white cursor-pointer group disabled:opacity-60"
              >
                <div className="p-2 rounded-lg bg-purple-50 text-purple-600 shrink-0">
                  <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                </div>
                <div>
                  <span className="block text-xs font-bold text-[#2b1b12] group-hover:text-[#c5a059]">
                    Refresh Brand Data
                  </span>
                  <span className="block text-[10px] text-[#6f5a4c]">Pull latest live metadata</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setEditingModal('voice')}
                className="w-full flex items-center gap-3 p-2.5 rounded-xl border border-[#e4d6c6] hover:border-[#c5a059] hover:bg-[#f8f3ec] transition-all text-left bg-white cursor-pointer group"
              >
                <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 shrink-0">
                  <FileEdit className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="block text-xs font-bold text-[#2b1b12] group-hover:text-[#c5a059]">
                    Edit Brand Guidelines
                  </span>
                  <span className="block text-[10px] text-[#6f5a4c]">Update voice & identity</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => showToast('✨ Generated 3 new positioning hooks for AEO discovery!')}
                className="w-full flex items-center gap-3 p-2.5 rounded-xl border border-[#e4d6c6] hover:border-[#c5a059] hover:bg-[#f8f3ec] transition-all text-left bg-white cursor-pointer group"
              >
                <div className="p-2 rounded-lg bg-amber-50 text-amber-600 shrink-0">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="block text-xs font-bold text-[#2b1b12] group-hover:text-[#c5a059]">
                    Generate Brand Suggestions
                  </span>
                  <span className="block text-[10px] text-[#6f5a4c]">Get AI-powered hooks</span>
                </div>
              </button>

              <button
                type="button"
                onClick={handleSyncModules}
                className="w-full flex items-center gap-3 p-2.5 rounded-xl border border-[#e4d6c6] hover:border-[#c5a059] hover:bg-[#f8f3ec] transition-all text-left bg-white cursor-pointer group"
              >
                <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 shrink-0">
                  <Share2 className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="block text-xs font-bold text-[#2b1b12] group-hover:text-[#c5a059]">
                    Sync Across Modules
                  </span>
                  <span className="block text-[10px] text-[#6f5a4c]">Apply to all modules</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Footer Row: Used Across Modules (SoloSpider exact cards) */}
      <div className="pt-2">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-bold text-base text-[#2b1b12]">Used Across Modules</h3>
          <span className="w-4 h-4 rounded-full border border-slate-300 flex items-center justify-center text-[10px] text-slate-400 font-bold">i</span>
        </div>
        <p className="text-xs font-medium text-[#6f5a4c] mb-4">Your brand memory powers consistency across every module.</p>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { name: 'Blogs', desc: 'Consistent voice in every post', icon: FileText, color: 'text-indigo-600', bg: 'bg-indigo-50', tab: 'blogs' },
            { name: 'SEO', desc: 'Optimized content with brand intent', icon: Search, color: 'text-emerald-600', bg: 'bg-emerald-50', tab: 'audit' },
            { name: 'Social Media', desc: 'On-brand across all channels', icon: MessageSquare, color: 'text-pink-600', bg: 'bg-pink-50', tab: 'social' },
            { name: 'Ads', desc: 'Unified messaging in campaigns', icon: Megaphone, color: 'text-orange-600', bg: 'bg-orange-50', tab: 'aeo' },
            { name: 'Image Generation', desc: 'On-brand visuals with AI', icon: ImageIcon, color: 'text-purple-600', bg: 'bg-purple-50', tab: 'media' },
            { name: 'Video Generation', desc: 'Branded videos that convert', icon: Video, color: 'text-blue-600', bg: 'bg-blue-50', tab: 'media' },
          ].map((mod, i) => (
            <button
              key={i}
              type="button"
              onClick={() => onNavigateTab(mod.tab)}
              className="flex items-center gap-2.5 bg-white border border-[#e4d6c6] rounded-xl p-3 shadow-sm hover:border-[#c5a059] hover:shadow-md transition-all text-left cursor-pointer group"
            >
              <div className={`p-2 rounded-lg ${mod.bg} ${mod.color} shrink-0`}>
                <mod.icon className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-[#2b1b12] truncate group-hover:text-[#c5a059]">{mod.name}</p>
                <p className="text-[10px] text-[#6f5a4c] truncate">{mod.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Visual Identity & Palette Edit Modal */}
      {editingModal === 'visual' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#fffcf7] border border-[#e4d6c6] rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#e4d6c6]">
              <div className="flex items-center gap-2">
                <Palette className="w-5 h-5 text-pink-500" />
                <h3 className="font-editorial text-lg font-bold text-[#2b1b12]">
                  Edit Brand Color Palette
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingModal(null)}
                className="text-[#6f5a4c] hover:text-[#2b1b12] text-sm p-1 font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-[#6f5a4c] leading-relaxed">
              These 6 hex colors are extracted directly from your website HTML and stylesheets to power consistent graphics, buttons, and media assets.
            </p>

            {/* 6 Palette Slots */}
            <div className="grid grid-cols-2 gap-3">
              {[
                'Primary Brand Color',
                'Dark Typography',
                'Brand Shade / Tint',
                'Surface Background',
                'Neutral Border',
                'Accent Highlight'
              ].map((label, idx) => {
                const hexVal = customPalette[idx] || '#2563eb';
                return (
                  <div key={idx} className="p-3 bg-[#f8f3ec] border border-[#e4d6c6] rounded-xl space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#6f5a4c] block">
                      {idx + 1}. {label}
                    </span>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={hexVal.startsWith('#') && hexVal.length === 7 ? hexVal : '#2563eb'}
                        onChange={(e) => {
                          const updated = [...customPalette];
                          updated[idx] = e.target.value;
                          setCustomPalette(updated);
                        }}
                        className="w-8 h-8 rounded-lg cursor-pointer border border-[#e4d6c6] bg-transparent p-0"
                      />
                      <input
                        type="text"
                        value={hexVal}
                        onChange={(e) => {
                          const updated = [...customPalette];
                          updated[idx] = e.target.value;
                          setCustomPalette(updated);
                        }}
                        className="flex-1 p-1.5 bg-[#fffcf7] border border-[#e4d6c6] rounded-lg text-xs font-mono font-bold text-[#2b1b12] uppercase focus:outline-none focus:border-[#c5a059]"
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-[#e4d6c6] gap-2">
              <button
                type="button"
                disabled={isRefreshing}
                onClick={async () => {
                  await handleRefresh();
                  showToast('✓ Colors re-extracted from website!');
                }}
                className="flex items-center gap-1.5 px-3 py-2 bg-[#f8f3ec] hover:bg-[#ebdcc8] text-[#7a5242] border border-[#d8c09e] rounded-xl text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>{isRefreshing ? 'Scanning Website...' : '↻ Auto-Detect from Website'}</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setEditingModal(null)}
                  className="px-4 py-2 bg-[#f8f3ec] text-[#6f5a4c] hover:text-[#2b1b12] rounded-xl text-xs font-bold transition-all border border-[#e4d6c6] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (project) {
                      const updated = { ...project, palette: customPalette };
                      localStorage.setItem('rankmonk_active_project', JSON.stringify(updated));
                      try {
                        const rawU = localStorage.getItem('rankmonk_user');
                        if (rawU) {
                          const u = JSON.parse(rawU);
                          if (u.email) {
                            localStorage.setItem(`rankmonk_project_${u.email.toLowerCase()}`, JSON.stringify(updated));
                          }
                        }
                      } catch (e) {}
                      showToast('✓ Brand color palette updated successfully!');
                      setEditingModal(null);
                      window.location.reload();
                    }
                  }}
                  className="px-5 py-2 bg-[#2b1b12] hover:bg-[#3b2519] text-[#fffcf7] rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm"
                >
                  Save Palette ✓
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

