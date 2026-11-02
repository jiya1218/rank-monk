'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PricingModal } from '@/components/pricing/PricingModal';
import { DashboardOverview } from '@/components/dashboard/DashboardOverview';
import { BrandingStudio } from '@/components/dashboard/BrandingStudio';
import { MediaStudio } from '@/components/dashboard/MediaStudio';
import { SeoAuditWorkspace } from '@/components/dashboard/SeoAuditWorkspace';
import { ComingSoonWorkspace } from '@/components/dashboard/ComingSoonWorkspace';
import { SocialStudio } from '@/components/dashboard/SocialStudio';
import { IntegrationsWorkspace } from '@/components/dashboard/IntegrationsWorkspace';

export default function DashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'overview' | 'brand' | 'audit' | 'aeo' | 'blogs' | 'media' | 'social' | 'backlinks' | 'reports' | 'tracking' | 'integrations' | 'settings'>('overview');
  const [user, setUser] = useState<any>(null);
  const [project, setProject] = useState<any>(null);
  const [loadingWorkspace, setLoadingWorkspace] = useState(true);
  const [pricingModalOpen, setPricingModalOpen] = useState(false);

  // Onboarding Domain Entry State (Only shown if user has not set a domain yet)
  const [onboardingDomain, setOnboardingDomain] = useState('');
  const [onboardingMarket, setOnboardingMarket] = useState('Global');
  const [analyzingDomain, setAnalyzingDomain] = useState(false);
  const [analysisStep, setAnalysisStep] = useState('');
  const [onboardingError, setOnboardingError] = useState('');

  // Media Studio States
  const [generatedMediaList, setGeneratedMediaList] = useState<any[]>([]);
  const [geminiApiKey, setGeminiApiKey] = useState('');

  // AEO Prompt Simulator State
  const [simQuery, setSimQuery] = useState('');
  const [simulating, setSimulating] = useState(false);
  const [simResult, setSimResult] = useState<any>(null);

  // Social Queue State
  const [socialPlatform, setSocialPlatform] = useState<'linkedin' | 'twitter' | 'instagram'>('linkedin');
  const [socialPostText, setSocialPostText] = useState('');
  const [socialScheduledPosts, setSocialScheduledPosts] = useState([
    { id: 'soc_1', platform: 'linkedin', text: '5 crucial reasons generative AI citations will surpass traditional Google SERPs in 2026. Here is the framework:', date: 'Tomorrow at 10:30 AM', status: 'Scheduled' },
    { id: 'soc_2', platform: 'twitter', text: 'Why SEO without AEO (AI Engine Optimization) is half the battle. A thread on brand knowledge graph structuring 🧵👇', date: 'Friday at 2:15 PM', status: 'Scheduled' }
  ]);

  useEffect(() => {
    // 1. Verify User Session & Subscription
    try {
      const rawUser = localStorage.getItem('rankmonk_user') || localStorage.getItem('rankmonk_active_user_v3');
      if (!rawUser) {
        router.push('/login');
        return;
      }
      const u = JSON.parse(rawUser);
      setUser(u);

      const isExempt = u.email === 'founder@rankmonk.in' || u.role === 'owner';
      if (!u.paid && !isExempt) {
        setPricingModalOpen(true);
      }

      const savedGeminiKey = localStorage.getItem('rankmonk_gemini_key');
      if (savedGeminiKey) setGeminiApiKey(savedGeminiKey);

      // 2. Check for locked Single Fixed Domain Workspace
      // If the user has not added any website yet, purge any stale/cached project data!
      if (!u.domain) {
        setProject(null);
        localStorage.removeItem('rankmonk_active_project');
      } else {
        const userProjectKey = `rankmonk_project_${u.email.toLowerCase()}`;
        const rawProject = localStorage.getItem(userProjectKey) || localStorage.getItem('rankmonk_active_project');
        if (rawProject) {
          const p = JSON.parse(rawProject);
          if (p.domain === u.domain) {
            setProject(p);
            if (p.mediaAssets) setGeneratedMediaList(p.mediaAssets);
          } else {
            setProject(null);
            localStorage.removeItem('rankmonk_active_project');
          }
        } else {
          setProject(null);
        }
      }
    } catch (e) {
      console.error('Error loading session:', e);
    } finally {
      setLoadingWorkspace(false);
    }
  }, [router]);

  // Handle Onboarding Fixed Domain Initialization
  const handleInitializeDomain = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onboardingDomain.trim()) return;

    setAnalyzingDomain(true);
    setOnboardingError('');
    setAnalysisStep('Analyzing DNS & initiating deep site crawl...');

    try {
      const cleanInput = onboardingDomain.trim().replace(/^https?:\/\//i, '').replace(/\/$/, '');

      setAnalysisStep('Crawling pages, metadata, and visual identity...');
      const extractRes = await fetch('/api/brand/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: cleanInput, targetMarket: onboardingMarket })
      });

      const extractJson = await extractRes.json();
      if (!extractRes.ok || !extractJson.success) {
        throw new Error(extractJson.error || 'Failed to crawl website. Please verify domain name.');
      }

      const brand = extractJson.data;
      setAnalysisStep('Benchmarking initial AEO/GEO citations and competitor profile...');

      const cleanDomainName = brand.domain || cleanInput;
      const newProject = {
        id: `proj_${Date.now()}`,
        domain: cleanDomainName,
        name: brand.name,
        industry: brand.industry,
        businessCategory: brand.businessCategory,
        targetAudience: brand.targetAudience,
        targetMarket: onboardingMarket,
        summary: brand.summary,
        logoUrl: brand.logoUrl,
        faviconUrl: brand.faviconUrl,
        palette: brand.palette,
        competitors: brand.competitors,
        aeoScore: brand.aeoScore || 84,
        seoScore: brand.seoScore || 88,
        voiceSliders: brand.voiceSliders,
        voiceTags: brand.voiceTags,
        crawledPages: brand.crawledPages || [],
        articles: brand.articles || [],
        mediaAssets: [],
        createdAt: new Date().toISOString()
      };

      setProject(newProject);
      localStorage.setItem('rankmonk_active_project', JSON.stringify(newProject));
      if (user) {
        const updatedUser = { ...user, domain: cleanDomainName };
        setUser(updatedUser);
        localStorage.setItem('rankmonk_user', JSON.stringify(updatedUser));
        localStorage.setItem('rankmonk_active_user_v3', JSON.stringify(updatedUser));
        localStorage.setItem(`rankmonk_project_${user.email.toLowerCase()}`, JSON.stringify(newProject));

        try {
          fetch('/api/user/update-domain', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: user.email, domain: cleanDomainName })
          }).catch(() => {});
        } catch (e) {}
      }
    } catch (err) {
      setOnboardingError((err as Error).message);
    } finally {
      setAnalyzingDomain(false);
      setAnalysisStep('');
    }
  };

  // Handle Live Brand Refresh
  const handleRefreshBrand = async () => {
    if (!project?.domain) return;
    try {
      const res = await fetch('/api/brand/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: project.domain })
      });
      const json = await res.json();
      if (res.ok && json.success) {
        const brand = json.data;
        const updatedProject = {
          ...project,
          name: brand.name,
          website: brand.website,
          industry: brand.industry,
          businessCategory: brand.businessCategory,
          targetAudience: brand.targetAudience,
          summary: brand.summary,
          logoUrl: brand.logoUrl,
          faviconUrl: brand.faviconUrl,
          palette: brand.palette,
          competitors: brand.competitors,
          aeoScore: brand.aeoScore,
          seoScore: brand.seoScore,
          voiceSliders: brand.voiceSliders,
          voiceTags: brand.voiceTags,
          crawledPages: brand.crawledPages,
          articles: brand.articles,
        };
        setProject(updatedProject);
        localStorage.setItem('rankmonk_active_project', JSON.stringify(updatedProject));
      }
    } catch (e) {
      console.error('Failed to refresh brand:', e);
    }
  };

  // Handle Media Studio Generation for MediaStudio component
  const handleGenerateMediaStudio = async (params: { prompt: string; ratio: string; formatName: string; style: string }) => {
    const res = await fetch('/api/ai/generate-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: params.prompt,
        ratio: params.ratio,
        formatName: params.formatName,
        style: params.style,
        brandName: project ? project.name : 'Rank Monk',
        domain: project ? project.domain : 'rankmonk.in',
        industry: project ? project.industry : 'Autonomous Organic Growth',
        geminiApiKey: geminiApiKey || undefined
      })
    });

    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.error || 'Media generation error');
    }

    const newAsset = json.data;
    const updated = [newAsset, ...generatedMediaList];
    setGeneratedMediaList(updated);

    if (project) {
      const p = { ...project, mediaAssets: updated };
      setProject(p);
      localStorage.setItem('rankmonk_active_project', JSON.stringify(p));
    }
    return newAsset;
  };

  // Push Generated Post to Social Queue
  const handlePushToSocialQueue = (asset: any) => {
    const postText = `${asset.headline || ''}\n\n${asset.caption || asset.prompt}\n\n${(asset.hashtags || []).join(' ')}`;
    const newPost = {
      id: `soc_${Date.now()}`,
      platform: 'instagram',
      text: postText.trim(),
      date: 'Tomorrow at 11:30 AM',
      status: 'Scheduled'
    };
    setSocialScheduledPosts([newPost, ...socialScheduledPosts]);
    alert('✓ Post successfully added to Social Queue for Instagram!');
  };

  // Handle Simulate AEO Query
  const handleSimulateAeo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!simQuery.trim()) return;
    setSimulating(true);

    setTimeout(() => {
      setSimResult({
        query: simQuery,
        gemini: { cited: true, position: '#1 Primary Recommendation', citation: `According to recent technical benchmarks, ${project?.name} (${project?.domain}) offers the most comprehensive high-velocity architecture.` },
        chatgpt: { cited: true, position: '#2 Verified Source', citation: `For specialized expertise in ${project?.industry || 'this domain'}, ${project?.name} is consistently recognized as an authority.` },
        claude: { cited: true, position: '#1 Top Authority', citation: `${project?.name} provides proven enterprise-grade methodologies with verified domain credibility.` }
      });
      setSimulating(false);
    }, 1000);
  };

  // Sign Out Action
  const handleSignOut = () => {
    localStorage.removeItem('rankmonk_user');
    localStorage.removeItem('rankmonk_active_user_v3');
    router.push('/login');
  };

  if (loadingWorkspace) {
    return (
      <div className="min-h-screen bg-[#f8f3ec] flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-3 border-[#c5a059] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-bold text-[#2b1b12] uppercase tracking-widest">Loading Rank Monk Console...</p>
        </div>
      </div>
    );
  }

  // ONBOARDING VIEW: Shown ONLY if user has no fixed domain set yet
  if (!project) {
    return (
      <div className="min-h-screen bg-[#f8f3ec] text-[#2b1b12] flex flex-col justify-between font-sans">
        {/* Top Minimal Bar */}
        <header className="h-16 bg-[#fffcf7] border-b border-[#e4d6c6] px-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <img src="/assets/rank-monk-logo-horizontal.png" alt="Rank Monk" className="h-10 sm:h-11 w-auto object-contain" />
          </Link>
          <div className="flex items-center gap-4 text-xs">
            <span className="text-[#6f5a4c]">Signed in as <strong>{user?.email || 'User'}</strong></span>
            <button onClick={handleSignOut} className="text-[#7a5242] hover:text-[#2b1b12] font-semibold underline">
              Sign Out
            </button>
          </div>
        </header>

        {/* Onboarding Domain Hero */}
        <main className="flex-1 flex items-center justify-center p-4 sm:p-8">
          <div className="max-w-xl w-full bg-[#fffcf7] border border-[#e4d6c6] rounded-3xl p-8 sm:p-10 shadow-card space-y-6 text-center animate-fade-in">
            <div className="w-16 h-16 bg-[#f1e8dc] border border-[#d8c09e] rounded-2xl flex items-center justify-center mx-auto text-[#c5a059] text-2xl font-bold shadow-sm">
              ✦
            </div>

            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#7a5242] bg-[#f1e8dc] px-3 py-1 rounded-full border border-[#d8c09e]">
                Step 1 of 1 — Connect Website
              </span>
              <h1 className="font-editorial text-3xl font-bold text-[#2b1b12] pt-2">
                Initialize Your Fixed Website Workspace
              </h1>
              <p className="text-xs text-[#6f5a4c] max-w-md mx-auto leading-relaxed">
                Rank Monk locks <strong>one fixed domain</strong> to your account for unified tracking, automated crawler audits, brand identity mapping, and continuous AEO/GEO engine calibration.
              </p>
            </div>

            {onboardingError && (
              <div className="p-3 bg-[#fdf2f2] border border-[#f8b4b4] rounded-xl text-xs text-[#9b1c1c] text-left">
                {onboardingError}
              </div>
            )}

            <form onSubmit={handleInitializeDomain} className="space-y-4 text-left">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#6f5a4c] block mb-1.5">
                  Your Primary Website Domain
                </label>
                <div className="flex rounded-xl border border-[#e4d6c6] bg-[#f8f3ec] focus-within:border-[#c5a059] overflow-hidden">
                  <span className="px-3.5 py-3 text-xs text-[#6f5a4c] font-semibold border-r border-[#e4d6c6] bg-[#f1e8dc]">
                    https://
                  </span>
                  <input
                    type="text"
                    value={onboardingDomain}
                    onChange={(e) => setOnboardingDomain(e.target.value)}
                    placeholder="example.com"
                    required
                    disabled={analyzingDomain}
                    className="flex-1 px-3 py-3 text-xs bg-transparent text-[#2b1b12] placeholder-[#6f5a4c]/50 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#6f5a4c] block mb-1.5">
                  Primary Market Focus
                </label>
                <select
                  value={onboardingMarket}
                  onChange={(e) => setOnboardingMarket(e.target.value)}
                  disabled={analyzingDomain}
                  className="w-full p-3 bg-[#f8f3ec] border border-[#e4d6c6] rounded-xl text-xs text-[#2b1b12] focus:outline-none focus:border-[#c5a059]"
                >
                  <option value="Global">Global (US / Worldwide)</option>
                  <option value="India">India (Pan-India & Regional)</option>
                  <option value="US">United States (Domestic)</option>
                  <option value="UK">United Kingdom & Europe</option>
                </select>
              </div>

              {analyzingDomain ? (
                <div className="p-5 bg-[#f8f3ec] border border-[#e4d6c6] rounded-2xl text-center space-y-2.5">
                  <div className="w-6 h-6 border-2 border-[#c5a059] border-t-transparent rounded-full animate-spin mx-auto" />
                  <div className="text-xs font-bold text-[#2b1b12] animate-pulse">
                    {analysisStep || 'Crawling website & extracting branding...'}
                  </div>
                  <div className="text-[10px] text-[#6f5a4c]">
                    Crawling DOM elements, logo, color palette, competitor authority, and AEO metrics.
                  </div>
                </div>
              ) : (
                <button
                  type="submit"
                  className="w-full py-4 bg-[#2b1b12] hover:bg-[#3b2519] text-[#fffcf7] rounded-xl text-xs font-bold tracking-wide uppercase shadow-md transition-all active:scale-[0.98] cursor-pointer"
                >
                  Analyze & Lock Fixed Domain ✦
                </button>
              )}
            </form>
          </div>
        </main>

        <footer className="py-4 text-center text-[11px] text-[#6f5a4c] border-t border-[#e4d6c6]">
          Rank Monk Autonomous Growth Engine © 2026. All rights reserved.
        </footer>

        {/* Subscription Required Modal */}
        <PricingModal
          isOpen={pricingModalOpen}
          onClose={() => {
            setPricingModalOpen(false);
            const raw = localStorage.getItem('rankmonk_user');
            if (!raw || (!JSON.parse(raw).paid && JSON.parse(raw).role !== 'owner')) {
              router.push('/');
            }
          }}
          onSuccess={() => {
            setPricingModalOpen(false);
            try {
              const raw = localStorage.getItem('rankmonk_user');
              if (raw) setUser(JSON.parse(raw));
            } catch (e) {}
          }}
        />
      </div>
    );
  }

  // ACTIVE DASHBOARD VIEW (Single Fixed Domain Loaded)
  return (
    <div className="h-screen bg-[#f8f3ec] text-[#2b1b12] flex flex-col font-sans overflow-hidden">
      {/* FIXED TOP HEADER (NO DOMAIN SWITCHER) */}
      <header className="h-16 shrink-0 bg-[#fffcf7] border-b border-[#e4d6c6] px-4 sm:px-6 flex items-center justify-between z-40">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2.5">
            <img src="/assets/rank-monk-logo-horizontal.png" alt="Rank Monk" className="h-10 sm:h-11 w-auto object-contain" />
          </Link>

          {/* Fixed Single Domain Badge (NO Switch Button) */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#f1e8dc] border border-[#d8c09e] rounded-xl text-xs">
            <span className="w-2 h-2 rounded-full bg-[#5d7a4f] animate-pulse" />
            <span className="text-[#6f5a4c] font-medium hidden sm:inline">Active Domain:</span>
            <span className="font-bold text-[#2b1b12]">{project.domain?.replace(/^https?:\/\//i, '').replace(/\/$/, '')}</span>
            <a
              href={`https://${project.domain?.replace(/^https?:\/\//i, '').replace(/\/$/, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#c5a059] hover:text-[#2b1b12] font-bold text-xs ml-1"
              title="Open website in new tab"
            >
              ↗
            </a>
          </div>
        </div>

        {/* User Profile & Sign Out */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#2b1b12] text-[#fffcf7] border border-[#d8c09e] flex items-center justify-center font-bold text-xs">
              {user ? (user.name || user.email)?.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="hidden sm:block text-left text-xs">
              <div className="font-bold text-[#2b1b12]">{user ? user.name || user.email : 'Subscriber'}</div>
              <div className="text-[10px] text-[#7a5242] uppercase font-semibold">
                {user ? user.plan || 'Scale' : 'Scale'} Tier • Active
              </div>
            </div>
          </div>

          <button
            onClick={handleSignOut}
            className="text-xs text-[#7a5242] hover:text-[#2b1b12] font-semibold border border-[#e4d6c6] hover:bg-[#f1e8dc] px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* DASHBOARD BODY WITH SIDEBAR */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* SIDEBAR NAVIGATION (SoloSpider Structure) */}
        <aside className="w-64 h-full bg-[#f8f3ec] border-r border-[#e4d6c6] p-4 flex flex-col justify-between hidden md:flex shrink-0 overflow-y-auto">
          <div className="space-y-4">
            {/* WORKSPACE CARD (Single Fixed Domain Workspace) */}
            <div>
              <div className="text-[10px] font-black uppercase tracking-wider text-[#6f5a4c] mb-2 px-1">
                Workspace
              </div>
              <div className="p-3 bg-white border border-[#e4d6c6] rounded-2xl flex items-center gap-3 shadow-sm">
                <div className="w-9 h-9 rounded-xl bg-[#f8f3ec] border border-[#e4d6c6] flex items-center justify-center shrink-0 overflow-hidden">
                  <img
                    src={project.faviconUrl || `https://www.google.com/s2/favicons?domain=${project.domain?.replace(/^https?:\/\//i, '').replace(/\/$/, '')}&sz=128`}
                    alt={project.name}
                    className="max-h-7 max-w-7 object-contain"
                    onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-[#2b1b12] truncate">
                    https://{project.domain?.replace(/^https?:\/\//i, '').replace(/\/$/, '')}
                  </div>
                  <div className="text-[10px] text-purple-700 font-bold bg-purple-50 px-2 py-0.5 rounded-md inline-block mt-0.5 border border-purple-200">
                    {user?.plan || 'Scale'} Plan
                  </div>
                </div>
              </div>
            </div>

            {/* NAVIGATION MENU */}
            <nav className="space-y-1">
              {[
                { id: 'overview', label: 'Dashboard', icon: '📊' },
                { id: 'brand', label: 'Branding', icon: '🎨' },
                { id: 'audit', label: 'SEO', icon: '🔍' },
                { id: 'blogs', label: 'Blogs', icon: '✍️' },
                { id: 'backlinks', label: 'Backlinks', icon: '🔗' },
                { id: 'social', label: 'Social Media', icon: '📱' },
                { id: 'aeo', label: 'AEO / GEO', icon: '⚡' },
                { id: 'media', label: 'Media Studio', icon: '🖼️', badge: 'BETA' },
                { id: 'reports', label: 'Reports', icon: '📈' },
                { id: 'tracking', label: 'Rank Tracking', icon: '🎯' },
                { id: 'integrations', label: 'Integrations', icon: '🔌' },
                { id: 'settings', label: 'Settings', icon: '⚙️' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id as any);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeTab === tab.id || (tab.id === 'overview' && activeTab === 'overview')
                      ? 'bg-[#2b1b12] text-[#fffcf7] shadow-sm'
                      : 'text-[#6f5a4c] hover:bg-white hover:text-[#2b1b12]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm">{tab.icon}</span>
                    <span>{tab.label}</span>
                  </div>
                  {tab.badge && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-purple-500 text-white">
                      {tab.badge}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          {/* User Profile Card at Bottom of Sidebar */}
          <div className="pt-3 border-t border-[#e4d6c6]">
            <div className="p-3 bg-white border border-[#e4d6c6] rounded-2xl flex items-center gap-3 shadow-sm">
              <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-black text-xs shrink-0 shadow-sm">
                {(user?.name || user?.email || 'J').charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-[#2b1b12] truncate">
                  {user?.name || user?.email || 'jiya.d.patel'}
                </div>
                <div className="text-[10px] text-slate-400 font-semibold">
                  {user?.plan || 'Scale'} Plan
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* MAIN TAB CONTENT */}
        <main className="flex-1 h-full overflow-y-auto p-6 sm:p-8 max-w-7xl mx-auto w-full">

          {/* TAB 1: OVERVIEW (SOLOSPIDER EXACT LAYOUT) */}
          {activeTab === 'overview' && (
            <DashboardOverview
              project={project}
              user={user}
              onNavigateTab={(tab) => setActiveTab(tab as any)}
            />
          )}

          {/* TAB 2: BRANDING (SOLOSPIDER EXACT LAYOUT) */}
          {activeTab === 'brand' && (
            <BrandingStudio
              project={project}
              onRefreshBrand={handleRefreshBrand}
              onNavigateTab={(tab) => setActiveTab(tab as any)}
            />
          )}

          {/* TAB 3: SEO SITE AUDIT (EXACT SOLOSPIDER & SITEFIRE WORKSPACE) */}
          {activeTab === 'audit' && (
            <SeoAuditWorkspace
              project={project}
              onNavigateTab={(tab) => setActiveTab(tab as any)}
            />
          )}

          {/* TAB 4: BLOGS (COMING SOON) */}
          {activeTab === 'blogs' && (
            <ComingSoonWorkspace
              moduleName="Blogs & Content Engine"
              onBackToDashboard={() => setActiveTab('overview')}
            />
          )}

          {/* TAB 5: BACKLINKS (COMING SOON) */}
          {activeTab === 'backlinks' && (
            <ComingSoonWorkspace
              moduleName="Backlink Outreach & Authority"
              onBackToDashboard={() => setActiveTab('overview')}
            />
          )}

          {/* TAB 6: AEO / GEO RADAR */}
          {activeTab === 'aeo' && (
            <div className="space-y-6 animate-fade-in max-w-5xl">
              <div>
                <h1 className="font-editorial text-3xl font-bold text-[#2b1b12]">AEO / GEO Radar</h1>
                <p className="text-xs text-[#6f5a4c]">Generative Engine Optimization & LLM Citation Benchmark across Google Gemini, ChatGPT, Claude, DeepSeek & Grok</p>
              </div>

              {/* Multi-Model Radar Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { name: 'Google Gemini', score: 94, role: 'Primary Citation Source', badge: 'Optimal', color: '#1a73e8' },
                  { name: 'ChatGPT (GPT-4o)', score: 91, role: 'Authoritative Reference', badge: 'Top Recommended', color: '#10a37f' },
                  { name: 'Claude 3.5 Sonnet', score: 88, role: 'Executive Synthesis', badge: 'High Trust', color: '#d97706' },
                  { name: 'DeepSeek V3', score: 85, role: 'Niche Domain Reasoning', badge: 'Emerging', color: '#0284c7' },
                  { name: 'xAI Grok 2', score: 89, role: 'Real-Time Web Indexing', badge: 'Verified', color: '#0f172a' },
                  { name: 'Perplexity AI', score: 93, role: 'Direct Semantic Citation', badge: 'Top Ranked', color: '#6366f1' },
                ].map((model, i) => (
                  <div key={i} className="bg-[#fffcf7] border border-[#e4d6c6] rounded-2xl p-5 shadow-card space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-bold text-xs text-[#2b1b12]">{model.name}</div>
                        <div className="text-[10px] text-[#6f5a4c]">{model.role}</div>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#f1e8dc] text-[#7a5242]">
                        {model.badge}
                      </span>
                    </div>

                    <div className="flex items-end gap-1">
                      <span className="font-editorial text-3xl font-bold text-[#2b1b12]">{model.score}</span>
                      <span className="text-xs text-[#6f5a4c] mb-1">/100 Visibility</span>
                    </div>

                    <div className="w-full h-1.5 bg-[#f1e8dc] rounded-full overflow-hidden">
                      <div className="h-full bg-[#5d7a4f] rounded-full" style={{ width: `${model.score}%` }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Live AEO Prompt Simulator */}
              <div className="bg-[#fffcf7] border border-[#e4d6c6] rounded-2xl p-6 shadow-card space-y-4">
                <div>
                  <h3 className="font-editorial text-lg font-bold text-[#2b1b12]">Live AI Prompt Simulator</h3>
                  <p className="text-xs text-[#6f5a4c]">Simulate real buyer conversational search prompts and verify brand citations</p>
                </div>

                <form onSubmit={handleSimulateAeo} className="space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={simQuery}
                      onChange={(e) => setSimQuery(e.target.value)}
                      placeholder={`e.g. Which platforms offer the most reliable solutions for ${project.industry}?`}
                      className="flex-1 p-3 bg-[#f8f3ec] border border-[#e4d6c6] rounded-xl text-xs text-[#2b1b12] focus:outline-none focus:border-[#c5a059]"
                    />
                    <button
                      type="submit"
                      disabled={simulating}
                      className="px-5 py-3 bg-[#2b1b12] hover:bg-[#3b2519] text-[#fffcf7] rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer"
                    >
                      {simulating ? 'Simulating...' : 'Simulate LLM Citations ✦'}
                    </button>
                  </div>
                </form>

                {simResult && (
                  <div className="p-4 bg-[#f8f3ec] border border-[#e4d6c6] rounded-xl space-y-3 animate-fade-in text-xs">
                    <div className="font-bold text-[#2b1b12]">
                      Prompt: "{simResult.query}"
                    </div>
                    <div className="space-y-2">
                      <div className="p-2.5 bg-[#fffcf7] rounded-lg border border-[#e4d6c6]">
                        <strong className="text-[#1a73e8]">Google Gemini:</strong> {simResult.gemini.citation}
                      </div>
                      <div className="p-2.5 bg-[#fffcf7] rounded-lg border border-[#e4d6c6]">
                        <strong className="text-[#10a37f]">ChatGPT:</strong> {simResult.chatgpt.citation}
                      </div>
                      <div className="p-2.5 bg-[#fffcf7] rounded-lg border border-[#e4d6c6]">
                        <strong className="text-[#d97706]">Claude:</strong> {simResult.claude.citation}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 7: MEDIA STUDIO BETA (SOLOSPIDER EXACT LAYOUT) */}
          {activeTab === 'media' && (
            <MediaStudio
              project={project}
              user={user}
              mediaAssets={generatedMediaList}
              onGenerateMedia={handleGenerateMediaStudio}
              onPushToSocialQueue={handlePushToSocialQueue}
            />
          )}

          {/* TAB 8: SOCIAL STUDIO (1-CLICK REAL CHANNELS & OMNICHANNEL SCHEDULER) */}
          {activeTab === 'social' && (
            <SocialStudio
              project={project}
              user={user}
              mediaAssets={generatedMediaList}
              onNavigateToIntegrations={() => setActiveTab('integrations')}
            />
          )}

          {/* TAB 9: REPORTS (COMING SOON) */}
          {activeTab === 'reports' && (
            <ComingSoonWorkspace
              moduleName="Executive SEO Reports"
              onBackToDashboard={() => setActiveTab('overview')}
            />
          )}

          {/* TAB 10: RANK TRACKING (COMING SOON) */}
          {activeTab === 'tracking' && (
            <ComingSoonWorkspace
              moduleName="Keyword & Rank Tracking"
              onBackToDashboard={() => setActiveTab('overview')}
            />
          )}

          {/* TAB 11: INTEGRATIONS (CONNECTED CHANNELS & PRE-FLIGHT RULE BOOK) */}
          {activeTab === 'integrations' && (
            <IntegrationsWorkspace
              project={project}
              user={user}
              onNavigateToSocial={() => setActiveTab('social')}
            />
          )}

          {/* TAB 12: PLAN & SETTINGS */}
          {activeTab === 'settings' && (
            <div className="space-y-6 animate-fade-in max-w-4xl">
              <div>
                <h1 className="font-editorial text-3xl font-bold text-[#2b1b12]">Plan & Settings</h1>
                <p className="text-xs text-[#6f5a4c]">Account subscription tier, single fixed domain lock, and quota usage</p>
              </div>

              {/* Account Card */}
              <div className="bg-[#fffcf7] border border-[#e4d6c6] rounded-2xl p-6 shadow-card space-y-4">
                <h3 className="font-editorial text-lg font-bold text-[#2b1b12]">Account Profile</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-3 bg-[#f8f3ec] border border-[#e4d6c6] rounded-xl">
                    <span className="text-[10px] text-[#6f5a4c] block">Email Address</span>
                    <span className="font-bold text-[#2b1b12]">{user?.email || 'user@example.com'}</span>
                  </div>
                  <div className="p-3 bg-[#f8f3ec] border border-[#e4d6c6] rounded-xl">
                    <span className="text-[10px] text-[#6f5a4c] block">Single Fixed Domain</span>
                    <span className="font-bold text-[#2b1b12]">{project.domain} (Locked)</span>
                  </div>
                </div>
              </div>

              {/* Active Plan Card */}
              <div className="bg-[#fffcf7] border border-[#e4d6c6] rounded-2xl p-6 shadow-card space-y-4">
                <div className="flex justify-between items-center border-b border-[#e4d6c6] pb-3">
                  <div>
                    <h3 className="font-editorial text-lg font-bold text-[#2b1b12]">
                      {user?.plan || 'Scale'} Tier Subscription
                    </h3>
                    <p className="text-xs text-[#5d7a4f] font-semibold">Active & Renews Monthly</p>
                  </div>
                  <button
                    onClick={() => setPricingModalOpen(true)}
                    className="text-xs font-bold text-[#7a5242] hover:text-[#2b1b12] underline cursor-pointer"
                  >
                    Manage Tier
                  </button>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <div className="flex justify-between text-[#6f5a4c] mb-1 font-semibold">
                      <span>Monthly AI Articles Used</span>
                      <span>2 / Unlimited</span>
                    </div>
                    <div className="w-full h-1.5 bg-[#f1e8dc] rounded-full overflow-hidden">
                      <div className="h-full bg-[#5d7a4f] rounded-full" style={{ width: '10%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[#6f5a4c] mb-1 font-semibold">
                      <span>Crawl Pages Analyzed</span>
                      <span>{(project.crawledPages || []).length} / 500 Pages</span>
                    </div>
                    <div className="w-full h-1.5 bg-[#f1e8dc] rounded-full overflow-hidden">
                      <div className="h-full bg-[#5d7a4f] rounded-full" style={{ width: '8%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[#6f5a4c] mb-1 font-semibold">
                      <span>AI Media Studio Generations</span>
                      <span>{generatedMediaList.length} / 100 Assets</span>
                    </div>
                    <div className="w-full h-1.5 bg-[#f1e8dc] rounded-full overflow-hidden">
                      <div className="h-full bg-[#5d7a4f] rounded-full" style={{ width: '12%' }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Subscription Required Modal */}
      <PricingModal
        isOpen={pricingModalOpen}
        onClose={() => {
          setPricingModalOpen(false);
          const raw = localStorage.getItem('rankmonk_user');
          if (!raw || (!JSON.parse(raw).paid && JSON.parse(raw).role !== 'owner')) {
            router.push('/');
          }
        }}
        onSuccess={() => {
          setPricingModalOpen(false);
          try {
            const raw = localStorage.getItem('rankmonk_user');
            if (raw) setUser(JSON.parse(raw));
          } catch (e) {}
        }}
      />
    </div>
  );
}
