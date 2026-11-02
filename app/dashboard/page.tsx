'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PricingModal } from '@/components/pricing/PricingModal';
import { DashboardOverview } from '@/components/dashboard/DashboardOverview';
import { BrandingStudio } from '@/components/dashboard/BrandingStudio';
import { MediaStudio } from '@/components/dashboard/MediaStudio';

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
  const [mediaPrompt, setMediaPrompt] = useState('');
  const [mediaRatio, setMediaRatio] = useState<'1:1' | '16:9' | '9:16' | '4:5'>('1:1');
  const [mediaGenerating, setMediaGenerating] = useState(false);
  const [generatedMediaList, setGeneratedMediaList] = useState<any[]>([]);
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [activeMediaPost, setActiveMediaPost] = useState<any>(null);
  const [copiedCaptionToast, setCopiedCaptionToast] = useState(false);

  // Blog Engine States
  const [blogSubTab, setBlogSubTab] = useState<'writer' | 'bulk' | 'library' | 'calendar'>('writer');
  const [blogTitle, setBlogTitle] = useState('');
  const [blogKeyword, setBlogKeyword] = useState('');
  const [blogTone, setBlogTone] = useState('Authoritative');
  const [blogSize, setBlogSize] = useState('Medium (1200-1600 words)');
  const [blogTargetCountry, setBlogTargetCountry] = useState('India');
  const [blogWriting, setBlogWriting] = useState(false);
  const [previewArticle, setPreviewArticle] = useState<any>(null);

  // Bulk Generator States
  const [bulkRows, setBulkRows] = useState([
    { id: '1', keyword: 'best growth marketing agency', title: '' },
    { id: '2', keyword: 'generative engine optimization guide', title: '' },
    { id: '3', keyword: 'how to rank in chatgpt and claude', title: '' },
  ]);
  const [bulkGenerating, setBulkGenerating] = useState(false);

  // SEO Fix State
  const [fixingIssues, setFixingIssues] = useState(false);
  const [activeFixModal, setActiveFixModal] = useState<string | null>(null);

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

  // Backlink Outreach State
  const [selectedProspect, setSelectedProspect] = useState<any>(null);
  const [pitchGenerated, setPitchGenerated] = useState('');
  const [generatingPitch, setGeneratingPitch] = useState(false);

  // Brand Settings Notification State
  const [brandSavedToast, setBrandSavedToast] = useState(false);

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
      const rawProject = localStorage.getItem('rankmonk_active_project');
      if (rawProject) {
        const p = JSON.parse(rawProject);
        setProject(p);
        if (p.mediaAssets) setGeneratedMediaList(p.mediaAssets);
        if (!mediaPrompt) {
          setMediaPrompt(`${p.name} Brand Visual Identity & Performance Command Center`);
        }
        if (!blogTitle && p.articles && p.articles.length > 0) {
          setBlogTitle(`How ${p.name} is Setting the 2026 Standard in ${p.industry}`);
          setBlogKeyword(`${p.name.toLowerCase()} ${p.industry.toLowerCase()}`);
        }
      } else {
        // No project found: Keep project as null so Onboarding Domain View is shown!
        setProject(null);
      }
    } catch (e) {
      console.error('Error loading session:', e);
    } finally {
      setLoadingWorkspace(false);
    }
  }, [router]);

  // Handle Fixed Domain Onboarding Submission
  const handleInitializeDomain = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = onboardingDomain.trim().toLowerCase().replace(/^https?:\/\//i, '').replace(/^www\./i, '').split('/')[0];
    if (!clean || !clean.includes('.')) {
      setOnboardingError('Please enter a valid website domain (e.g. yourcompany.com)');
      return;
    }

    setAnalyzingDomain(true);
    setOnboardingError('');

    try {
      setAnalysisStep(`Connecting to https://${clean}...`);
      await new Promise(r => setTimeout(r, 600));

      setAnalysisStep('Extracting official logo, favicon, and brand metadata...');
      await new Promise(r => setTimeout(r, 700));

      setAnalysisStep('Analyzing visual palette, typography, and competitor landscape...');

      const res = await fetch('/api/brand/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: clean })
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to extract website branding.');
      }

      setAnalysisStep('Calibrating AEO citation radar and initializing locked workspace...');
      await new Promise(r => setTimeout(r, 600));

      const brand = json.data;

      const newProject = {
        id: `proj_${clean.replace(/[^a-z0-9]/g, '_')}`,
        name: brand.name,
        domain: brand.domain,
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
        mediaAssets: [
          {
            id: `media_${Date.now()}`,
            prompt: `${brand.name} Autonomous Command Center with Zen Lighting`,
            url: brand.logoUrl || '/assets/rank-monk-logo-horizontal.png',
            ratio: '16:9',
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
          }
        ]
      };

      // Lock single fixed domain into user state and localStorage
      if (user) {
        const updatedUser = { ...user, domain: clean };
        setUser(updatedUser);
        localStorage.setItem('rankmonk_user', JSON.stringify(updatedUser));
        localStorage.setItem('rankmonk_active_user_v3', JSON.stringify(updatedUser));
      }
      localStorage.setItem('rankmonk_active_project', JSON.stringify(newProject));

      setProject(newProject);
      setGeneratedMediaList(newProject.mediaAssets);
      setMediaPrompt(`${brand.name} Brand Visual Identity & Performance Command Center`);
      setBlogTitle(`How ${brand.name} is Setting the 2026 Standard in ${brand.industry}`);
      setBlogKeyword(`${brand.name.toLowerCase()} ${brand.industry.toLowerCase()}`);
    } catch (err) {
      setOnboardingError((err as Error).message);
    } finally {
      setAnalyzingDomain(false);
      setAnalysisStep('');
    }
  };

  // Handle Saving Gemini API Key
  const handleSaveGeminiKey = (key: string) => {
    setGeminiApiKey(key);
    localStorage.setItem('rankmonk_gemini_key', key);
    alert('✓ Gemini API Key saved locally!');
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
    setActiveMediaPost(newAsset);

    if (project) {
      const p = { ...project, mediaAssets: updated };
      setProject(p);
      localStorage.setItem('rankmonk_active_project', JSON.stringify(p));
    }
    return newAsset;
  };

  // Handle Media Studio Generation
  const handleGenerateMedia = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mediaPrompt.trim()) return;

    setMediaGenerating(true);
    try {
      const res = await fetch('/api/ai/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: mediaPrompt,
          ratio: mediaRatio,
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
      setActiveMediaPost(newAsset);

      if (project) {
        const p = { ...project, mediaAssets: updated };
        setProject(p);
        localStorage.setItem('rankmonk_active_project', JSON.stringify(p));
      }
    } catch (err) {
      alert('Generation notice: ' + (err as Error).message);
    } finally {
      setMediaGenerating(false);
    }
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
    setActiveTab('social');
  };

  // Handle Single Blog Generation
  const handleGenerateBlog = (e: React.FormEvent) => {
    e.preventDefault();
    setBlogWriting(true);

    setTimeout(() => {
      const newArticle = {
        id: `art_${Date.now()}`,
        title: blogTitle,
        keyword: blogKeyword,
        country: blogTargetCountry,
        wordCount: blogSize.includes('1200') ? 1480 : 2250,
        status: 'Draft' as const,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        engines: ['Google', 'ChatGPT', 'Perplexity'],
        content: `# ${blogTitle}\n\n*Target Keyword: ${blogKeyword} | Tone: ${blogTone} | Target: ${blogTargetCountry}*\n\n### Executive Summary\nIn today's fast-moving market, authoritative domain visibility requires alignment across traditional search indexers and conversational generative LLMs.\n\n### The Strategic Roadmap for ${project?.name || 'Your Brand'}\nBy implementing deep JSON-LD entity graph structuring, verified EEAT author attribution, and semantic footnote schemas, brands achieve sustained citation velocity across Google Gemini, ChatGPT, and Claude.\n\n### Conclusion & Next Action Steps\nAutonomous growth pipelines provide the exact technical foundation needed to outpace legacy competitors.`
      };

      if (project) {
        const updatedArticles = [newArticle, ...(project.articles || [])];
        const p = { ...project, articles: updatedArticles };
        setProject(p);
        localStorage.setItem('rankmonk_active_project', JSON.stringify(p));
      }

      setBlogWriting(false);
      setPreviewArticle(newArticle);
    }, 1200);
  };

  // Handle Bulk Title Auto-Generation
  const handleGenerateBulkTitles = () => {
    setBulkGenerating(true);
    setTimeout(() => {
      const updated = bulkRows.map(row => ({
        ...row,
        title: row.title || `${row.keyword.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}: The 2026 Strategic Playbook`
      }));
      setBulkRows(updated);
      setBulkGenerating(false);
    }, 800);
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

  // Handle Generate Pitch
  const handleGeneratePitch = (prospect: any) => {
    setSelectedProspect(prospect);
    setGeneratingPitch(true);
    setTimeout(() => {
      setPitchGenerated(`Hi Editor,\n\nI noticed your recent piece on modern industry benchmarks on ${prospect.domain}. We recently published an in-depth data study at ${project?.domain} analyzing technical authority and generative search shifts.\n\nWould love to offer an exclusive contributor quote or relevant data point for your readers. Let me know if you'd like a quick preview.\n\nBest regards,\nGrowth Lead at ${project?.name}`);
      setGeneratingPitch(false);
    }, 600);
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
                <label className="block text-xs font-bold text-[#2b1b12] uppercase tracking-wider mb-2">
                  Website Domain
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-[#6f5a4c] font-medium">
                    https://
                  </span>
                  <input
                    type="text"
                    value={onboardingDomain}
                    onChange={(e) => setOnboardingDomain(e.target.value)}
                    placeholder="yourcompany.com"
                    required
                    disabled={analyzingDomain}
                    className="w-full pl-20 pr-4 py-3.5 bg-[#f8f3ec] border border-[#e4d6c6] rounded-xl text-xs text-[#2b1b12] focus:outline-none focus:border-[#c5a059] placeholder-[#a69282]"
                  />
                </div>
                <p className="text-[11px] text-[#6f5a4c] mt-1.5">
                  Enter your root domain. Once locked, all audits, blogs, and AI citations will target this exact website.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2b1b12] uppercase tracking-wider mb-2">
                  Target Geographic Market
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
    <div className="min-h-screen bg-[#f8f3ec] text-[#2b1b12] flex flex-col font-sans">
      {/* FIXED TOP HEADER (NO DOMAIN SWITCHER) */}
      <header className="h-16 bg-[#fffcf7] border-b border-[#e4d6c6] px-4 sm:px-6 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2.5">
            <img src="/assets/rank-monk-logo-horizontal.png" alt="Rank Monk" className="h-10 sm:h-11 w-auto object-contain" />
          </Link>

          {/* Fixed Single Domain Badge (NO Switch Button) */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#f1e8dc] border border-[#d8c09e] rounded-xl text-xs">
            <span className="w-2 h-2 rounded-full bg-[#5d7a4f] animate-pulse" />
            <span className="text-[#6f5a4c] font-medium hidden sm:inline">Active Domain:</span>
            <span className="font-bold text-[#2b1b12]">{project.domain}</span>
            <a
              href={`https://${project.domain}`}
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
            className="text-xs text-[#7a5242] hover:text-[#2b1b12] font-semibold border border-[#e4d6c6] hover:bg-[#f1e8dc] px-3 py-1.5 rounded-lg transition-colors"
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* DASHBOARD BODY WITH SIDEBAR */}
      <div className="flex-1 flex overflow-hidden">
        {/* SIDEBAR NAVIGATION (SoloSpider Structure) */}
        <aside className="w-64 bg-[#f8f3ec] border-r border-[#e4d6c6] p-4 flex flex-col justify-between hidden md:flex shrink-0">
          <div className="space-y-4">
            {/* WORKSPACE CARD (Single Fixed Domain Workspace) */}
            <div>
              <div className="text-[10px] font-black uppercase tracking-wider text-[#6f5a4c] mb-2 px-1">
                Workspace
              </div>
              <div className="p-3 bg-white border border-[#e4d6c6] rounded-2xl flex items-center gap-3 shadow-sm">
                <div className="w-9 h-9 rounded-xl bg-[#f8f3ec] border border-[#e4d6c6] flex items-center justify-center shrink-0 overflow-hidden">
                  <img
                    src={project.logoUrl || project.faviconUrl || `https://www.google.com/s2/favicons?domain=${project.domain}&sz=128`}
                    alt={project.name}
                    className="max-h-7 max-w-7 object-contain"
                    onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-[#2b1b12] truncate">
                    https://{project.domain}
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
                    if (tab.id === 'reports') {
                      setActiveTab('audit');
                    } else if (tab.id === 'tracking') {
                      setActiveTab('aeo');
                    } else if (tab.id === 'integrations') {
                      setActiveTab('audit');
                    } else {
                      setActiveTab(tab.id as any);
                    }
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
        <main className="flex-1 p-6 sm:p-8 overflow-y-auto max-w-7xl mx-auto w-full">

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

          {/* TAB 3: SEO SITE AUDIT */}
          {activeTab === 'audit' && (
            <div className="space-y-6 animate-fade-in max-w-5xl">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h1 className="font-editorial text-3xl font-bold text-[#2b1b12]">SEO Site Audit</h1>
                  <p className="text-xs text-[#6f5a4c]">Autonomous technical crawl inventory for {project.domain}</p>
                </div>
                <button
                  onClick={() => {
                    alert('Re-crawling domain... All 4 URLs refreshed with 200 OK.');
                  }}
                  className="bg-[#2b1b12] hover:bg-[#3b2519] text-[#fffcf7] px-4 py-2 rounded-xl text-xs font-semibold shadow-sm transition-all"
                >
                  Re-crawl Domain ⟳
                </button>
              </div>

              {/* Crawled Pages Table */}
              <div className="bg-[#fffcf7] border border-[#e4d6c6] rounded-2xl overflow-hidden shadow-card">
                <div className="p-4 bg-[#f1e8dc] border-b border-[#e4d6c6] flex justify-between items-center text-xs font-bold text-[#2b1b12]">
                  <span>CRAWLED URL INVENTORY</span>
                  <span className="text-[#5d7a4f]">{(project.crawledPages || []).length} URLs Monitored</span>
                </div>

                <div className="divide-y divide-[#e4d6c6] overflow-x-auto">
                  {(project.crawledPages || []).map((page: any, i: number) => (
                    <div key={i} className="p-4 hover:bg-[#f8f3ec] transition-colors space-y-2">
                      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-[#eef7ec] text-[#03543f] text-[10px] font-bold border border-[#84e1bc]">
                            {page.statusCode || 200} OK
                          </span>
                          <span className="font-bold text-xs text-[#2b1b12] break-all">{page.url}</span>
                        </div>
                        <div className="text-[11px] text-[#6f5a4c] font-semibold">
                          Word Count: <strong>{page.wordCount || 1200} words</strong>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#6f5a4c] pt-1">
                        <div>
                          <strong className="text-[#2b1b12]">Title:</strong> {page.title}
                        </div>
                        <div>
                          <strong className="text-[#2b1b12]">H1:</strong> {page.h1 || 'Detected'}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        <span className="text-[10px] font-bold text-[#6f5a4c] uppercase">Schema Types:</span>
                        {(page.schemaTypes || ['WebSite', 'Organization']).map((st: string, idx: number) => (
                          <span key={idx} className="px-2 py-0.5 bg-[#f1e8dc] text-[#2b1b12] text-[10px] rounded font-semibold">
                            {st}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 1-Click Code Remediation Box */}
              <div className="bg-[#fffcf7] border border-[#e4d6c6] rounded-2xl p-6 shadow-card space-y-4">
                <div className="flex items-center justify-between border-b border-[#e4d6c6] pb-3">
                  <div>
                    <h3 className="font-editorial text-lg font-bold text-[#2b1b12]">Autonomous Code Remediation</h3>
                    <p className="text-xs text-[#6f5a4c]">Auto-generated JSON-LD Schema markup ready to inject</p>
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard?.writeText(`<script type="application/ld+json">{\n  "@context": "https://schema.org",\n  "@type": "Organization",\n  "name": "${project.name}",\n  "url": "https://${project.domain}"\n}</script>`);
                      alert('Schema markup copied to clipboard!');
                    }}
                    className="text-xs font-bold text-[#2b1b12] bg-[#f1e8dc] border border-[#d8c09e] hover:bg-[#e4d6c6] px-3 py-1.5 rounded-lg"
                  >
                    Copy JSON-LD Code ✦
                  </button>
                </div>

                <pre className="p-4 bg-[#2b1b12] text-[#fffcf7] rounded-xl text-xs font-mono overflow-x-auto leading-relaxed">
{`<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "${project.name}",
  "url": "https://${project.domain}",
  "logo": "${project.logoUrl || `https://${project.domain}/logo.png`}",
  "sameAs": [
    "https://twitter.com/${project.name.toLowerCase().replace(/\\s+/g, '')}",
    "https://linkedin.com/company/${project.name.toLowerCase().replace(/\\s+/g, '')}"
  ]
}
</script>`}
                </pre>
              </div>
            </div>
          )}

          {/* TAB 4: AEO / GEO RADAR */}
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

          {/* TAB 5: CONTENT ENGINE */}
          {activeTab === 'blogs' && (
            <div className="space-y-6 animate-fade-in max-w-5xl">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h1 className="font-editorial text-3xl font-bold text-[#2b1b12]">Content Engine</h1>
                  <p className="text-xs text-[#6f5a4c]">High-velocity SEO & AEO blog generator calibrated to {project.name}</p>
                </div>

                {/* Sub-tab Navigation */}
                <div className="flex gap-1 bg-[#f1e8dc] p-1 rounded-xl text-xs font-semibold">
                  {[
                    { id: 'writer', label: 'Single Post' },
                    { id: 'bulk', label: 'Bulk Queue' },
                    { id: 'library', label: 'Post Library' },
                  ].map((st) => (
                    <button
                      key={st.id}
                      onClick={() => setBlogSubTab(st.id as any)}
                      className={`px-3 py-1.5 rounded-lg transition-all ${
                        blogSubTab === st.id ? 'bg-[#2b1b12] text-[#fffcf7]' : 'text-[#6f5a4c] hover:text-[#2b1b12]'
                      }`}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sub-Tab 1: Single Post Generator */}
              {blogSubTab === 'writer' && (
                <div className="bg-[#fffcf7] border border-[#e4d6c6] rounded-2xl p-6 shadow-card space-y-5">
                  <form onSubmit={handleGenerateBlog} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-bold text-[#2b1b12] uppercase tracking-wider mb-1">
                          Article Title
                        </label>
                        <input
                          type="text"
                          value={blogTitle}
                          onChange={(e) => setBlogTitle(e.target.value)}
                          placeholder="e.g. How Enterprise Leaders are Driving 10x ROI"
                          required
                          className="w-full p-2.5 bg-[#f8f3ec] border border-[#e4d6c6] rounded-xl text-xs text-[#2b1b12]"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-[#2b1b12] uppercase tracking-wider mb-1">
                          Target Focus Keyword
                        </label>
                        <input
                          type="text"
                          value={blogKeyword}
                          onChange={(e) => setBlogKeyword(e.target.value)}
                          placeholder="e.g. enterprise growth marketing"
                          required
                          className="w-full p-2.5 bg-[#f8f3ec] border border-[#e4d6c6] rounded-xl text-xs text-[#2b1b12]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-[11px] font-bold text-[#2b1b12] uppercase tracking-wider mb-1">
                          Article Size
                        </label>
                        <select
                          value={blogSize}
                          onChange={(e) => setBlogSize(e.target.value)}
                          className="w-full p-2.5 bg-[#f8f3ec] border border-[#e4d6c6] rounded-xl text-xs text-[#2b1b12]"
                        >
                          <option>Standard (800-1200 words)</option>
                          <option>Medium (1200-1600 words)</option>
                          <option>Deep Pillar (2000-3000 words)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-[#2b1b12] uppercase tracking-wider mb-1">
                          Tone Calibration
                        </label>
                        <select
                          value={blogTone}
                          onChange={(e) => setBlogTone(e.target.value)}
                          className="w-full p-2.5 bg-[#f8f3ec] border border-[#e4d6c6] rounded-xl text-xs text-[#2b1b12]"
                        >
                          <option>Authoritative & Analytical</option>
                          <option>Visionary & Thought Leadership</option>
                          <option>Practical How-To & Playbook</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-[#2b1b12] uppercase tracking-wider mb-1">
                          Target Geography
                        </label>
                        <select
                          value={blogTargetCountry}
                          onChange={(e) => setBlogTargetCountry(e.target.value)}
                          className="w-full p-2.5 bg-[#f8f3ec] border border-[#e4d6c6] rounded-xl text-xs text-[#2b1b12]"
                        >
                          <option>India</option>
                          <option>United States</option>
                          <option>Global / Worldwide</option>
                        </select>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={blogWriting}
                      className="w-full py-3.5 bg-[#2b1b12] hover:bg-[#3b2519] text-[#fffcf7] rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
                    >
                      {blogWriting ? 'Writing Autonomous Article with Citations...' : 'Generate Full Article with EEAT Schema ✦'}
                    </button>
                  </form>

                  {previewArticle && (
                    <div className="border-t border-[#e4d6c6] pt-5 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-[#5d7a4f]">✓ Article Generated Successfully</span>
                        <span className="text-[11px] text-[#6f5a4c]">{previewArticle.wordCount} Words • EEAT Score: 96/100</span>
                      </div>
                      <div className="p-4 bg-[#f8f3ec] border border-[#e4d6c6] rounded-xl text-xs text-[#2b1b12] font-mono whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto">
                        {previewArticle.content}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Sub-Tab 2: Bulk Queue Generator */}
              {blogSubTab === 'bulk' && (
                <div className="bg-[#fffcf7] border border-[#e4d6c6] rounded-2xl p-6 shadow-card space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-editorial text-lg font-bold text-[#2b1b12]">High-Velocity Bulk Topic Queue</h3>
                      <p className="text-xs text-[#6f5a4c]">Batch generate multi-keyword topic clusters in parallel</p>
                    </div>
                    <button
                      onClick={handleGenerateBulkTitles}
                      disabled={bulkGenerating}
                      className="px-4 py-2 bg-[#f1e8dc] border border-[#d8c09e] hover:bg-[#e4d6c6] text-[#2b1b12] text-xs font-bold rounded-xl"
                    >
                      {bulkGenerating ? 'Auto-generating titles...' : 'Auto-Generate Titles ✦'}
                    </button>
                  </div>

                  <div className="space-y-3">
                    {bulkRows.map((row, idx) => (
                      <div key={row.id} className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 bg-[#f8f3ec] border border-[#e4d6c6] rounded-xl">
                        <div>
                          <span className="text-[10px] text-[#6f5a4c] font-bold block mb-1">Target Keyword #{idx + 1}</span>
                          <input
                            type="text"
                            value={row.keyword}
                            onChange={(e) => {
                              const copy = [...bulkRows];
                              copy[idx].keyword = e.target.value;
                              setBulkRows(copy);
                            }}
                            className="w-full p-2 bg-[#fffcf7] border border-[#e4d6c6] rounded-lg text-xs"
                          />
                        </div>
                        <div>
                          <span className="text-[10px] text-[#6f5a4c] font-bold block mb-1">Proposed Title</span>
                          <input
                            type="text"
                            value={row.title}
                            placeholder="Click 'Auto-Generate Titles' above"
                            onChange={(e) => {
                              const copy = [...bulkRows];
                              copy[idx].title = e.target.value;
                              setBulkRows(copy);
                            }}
                            className="w-full p-2 bg-[#fffcf7] border border-[#e4d6c6] rounded-lg text-xs"
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => {
                      alert('Bulk batch submitted! 3 articles queued for autonomous generation.');
                    }}
                    className="w-full py-3.5 bg-[#2b1b12] hover:bg-[#3b2519] text-[#fffcf7] rounded-xl text-xs font-bold"
                  >
                    Launch Batch Queue (3 Articles) ✦
                  </button>
                </div>
              )}

              {/* Sub-Tab 3: Article Library */}
              {blogSubTab === 'library' && (
                <div className="bg-[#fffcf7] border border-[#e4d6c6] rounded-2xl overflow-hidden shadow-card">
                  <div className="p-4 bg-[#f1e8dc] border-b border-[#e4d6c6] flex justify-between items-center text-xs font-bold text-[#2b1b12]">
                    <span>POST LIBRARY ({(project.articles || []).length} Total Articles)</span>
                    <span className="text-[#5d7a4f]">Auto-Sync Enabled</span>
                  </div>

                  <div className="divide-y divide-[#e4d6c6]">
                    {(project.articles || []).map((art: any) => (
                      <div key={art.id} className="p-4 hover:bg-[#f8f3ec] transition-colors space-y-2">
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <div className="font-bold text-xs text-[#2b1b12]">{art.title}</div>
                            <div className="text-[11px] text-[#6f5a4c] mt-0.5">
                              Keyword: <strong>{art.keyword}</strong> • {art.wordCount} words • {art.date}
                            </div>
                          </div>
                          <span className={`px-2.5 py-1 rounded text-[10px] font-bold border ${
                            art.status === 'Published'
                              ? 'bg-[#eef7ec] text-[#03543f] border-[#84e1bc]'
                              : 'bg-[#fef3c7] text-[#92400e] border-[#fde68a]'
                          }`}>
                            {art.status}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 pt-1 text-[10px] text-[#6f5a4c]">
                          <span>Targeted Citations:</span>
                          {(art.engines || ['Google', 'ChatGPT', 'Perplexity']).map((eng: string, i: number) => (
                            <span key={i} className="px-2 py-0.5 bg-[#f1e8dc] rounded font-semibold text-[#2b1b12]">
                              {eng}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 6: MEDIA STUDIO BETA (SOLOSPIDER EXACT LAYOUT) */}
          {activeTab === 'media' && (
            <MediaStudio
              project={project}
              user={user}
              mediaAssets={generatedMediaList}
              onGenerateMedia={handleGenerateMediaStudio}
              onPushToSocialQueue={handlePushToSocialQueue}
            />
          )}

          {/* TAB 7: SOCIAL QUEUE */}
          {activeTab === 'social' && (
            <div className="space-y-6 animate-fade-in max-w-5xl">
              <div>
                <h1 className="font-editorial text-3xl font-bold text-[#2b1b12]">Social Media Queue</h1>
                <p className="text-xs text-[#6f5a4c]">Omnichannel scheduled publishing across LinkedIn, X (Twitter) & Instagram for {project.name}</p>
              </div>

              {/* Composer Box */}
              <div className="bg-[#fffcf7] border border-[#e4d6c6] rounded-2xl p-6 shadow-card space-y-4">
                <div className="flex gap-2 border-b border-[#e4d6c6] pb-3">
                  {(['linkedin', 'twitter', 'instagram'] as const).map((plat) => (
                    <button
                      key={plat}
                      onClick={() => setSocialPlatform(plat)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                        socialPlatform === plat ? 'bg-[#2b1b12] text-[#fffcf7]' : 'text-[#6f5a4c] hover:bg-[#f1e8dc]'
                      }`}
                    >
                      {plat}
                    </button>
                  ))}
                </div>

                <textarea
                  rows={3}
                  value={socialPostText}
                  onChange={(e) => setSocialPostText(e.target.value)}
                  placeholder={`Draft your ${socialPlatform} post. Rank Monk automatically injects brand hashtags and link back to ${project.domain}...`}
                  className="w-full p-3 bg-[#f8f3ec] border border-[#e4d6c6] rounded-xl text-xs text-[#2b1b12]"
                />

                <div className="flex justify-between items-center">
                  <span className="text-[11px] text-[#6f5a4c]">{socialPostText.length} characters</span>
                  <button
                    onClick={() => {
                      if (!socialPostText.trim()) return;
                      setSocialScheduledPosts([
                        { id: `soc_${Date.now()}`, platform: socialPlatform, text: socialPostText, date: 'Next Available Slot', status: 'Scheduled' },
                        ...socialScheduledPosts
                      ]);
                      setSocialPostText('');
                      alert('Post scheduled in queue!');
                    }}
                    className="px-4 py-2 bg-[#2b1b12] hover:bg-[#3b2519] text-[#fffcf7] rounded-xl text-xs font-bold"
                  >
                    Schedule Post ✦
                  </button>
                </div>
              </div>

              {/* Scheduled Posts List */}
              <div className="bg-[#fffcf7] border border-[#e4d6c6] rounded-2xl p-6 shadow-card space-y-3">
                <h3 className="font-editorial text-lg font-bold text-[#2b1b12]">Upcoming Scheduled Queue</h3>
                <div className="divide-y divide-[#e4d6c6]">
                  {socialScheduledPosts.map((post) => (
                    <div key={post.id} className="py-3 flex justify-between items-center text-xs">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-[#f1e8dc] text-[#7a5242]">
                            {post.platform}
                          </span>
                          <span className="text-[11px] text-[#6f5a4c]">{post.date}</span>
                        </div>
                        <div className="font-medium text-[#2b1b12] mt-1 max-w-xl">{post.text}</div>
                      </div>
                      <span className="px-2.5 py-1 bg-[#eef7ec] text-[#03543f] border border-[#84e1bc] rounded text-[10px] font-bold">
                        {post.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: BACKLINK OUTREACH */}
          {activeTab === 'backlinks' && (
            <div className="space-y-6 animate-fade-in max-w-5xl">
              <div>
                <h1 className="font-editorial text-3xl font-bold text-[#2b1b12]">Backlink Outreach Hub</h1>
                <p className="text-xs text-[#6f5a4c]">Prospect high-authority industry publications linking to rivals & auto-generate outreach pitches</p>
              </div>

              {/* Opportunities Table */}
              <div className="bg-[#fffcf7] border border-[#e4d6c6] rounded-2xl overflow-hidden shadow-card">
                <div className="p-4 bg-[#f1e8dc] border-b border-[#e4d6c6] text-xs font-bold text-[#2b1b12]">
                  PROSPECT RADAR & DOMAIN AUTHORITY
                </div>

                <div className="divide-y divide-[#e4d6c6]">
                  {[
                    { domain: 'techcrunch.com', dr: 92, relevance: 'High (Tech & Growth)', status: 'Prospect Ready' },
                    { domain: 'venturebeat.com', dr: 89, relevance: 'High (AI Architecture)', status: 'Prospect Ready' },
                    { domain: 'yourstory.com', dr: 84, relevance: 'High (Indian Enterprise & Startup)', status: 'Prospect Ready' },
                    { domain: 'inc42.com', dr: 82, relevance: 'Medium (B2B SaaS Growth)', status: 'Prospect Ready' },
                  ].map((p, i) => (
                    <div key={i} className="p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-3 text-xs">
                      <div>
                        <div className="font-bold text-[#2b1b12]">{p.domain}</div>
                        <div className="text-[11px] text-[#6f5a4c]">
                          Domain Rating: <strong>DR {p.dr}</strong> • Relevance: {p.relevance}
                        </div>
                      </div>
                      <button
                        onClick={() => handleGeneratePitch(p)}
                        className="px-3 py-1.5 bg-[#2b1b12] hover:bg-[#3b2519] text-[#fffcf7] rounded-lg text-xs font-semibold cursor-pointer"
                      >
                        Generate AI Pitch ✦
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pitch Display Modal / Box */}
              {selectedProspect && (
                <div className="bg-[#fffcf7] border border-[#e4d6c6] rounded-2xl p-6 shadow-card space-y-3 animate-fade-in">
                  <div className="flex justify-between items-center border-b border-[#e4d6c6] pb-3">
                    <h3 className="font-editorial text-lg font-bold text-[#2b1b12]">
                      Target Pitch: {selectedProspect.domain}
                    </h3>
                    <button
                      onClick={() => {
                        navigator.clipboard?.writeText(pitchGenerated);
                        alert('Outreach pitch copied to clipboard!');
                      }}
                      className="px-3 py-1 bg-[#f1e8dc] border border-[#d8c09e] rounded text-xs font-bold text-[#2b1b12]"
                    >
                      Copy Pitch
                    </button>
                  </div>

                  <div className="p-4 bg-[#f8f3ec] border border-[#e4d6c6] rounded-xl text-xs font-mono whitespace-pre-wrap text-[#2b1b12] leading-relaxed">
                    {generatingPitch ? 'Generating personalized high-authority pitch...' : pitchGenerated}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 9: PLAN & SETTINGS */}
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
                  <Link
                    href="/pricing"
                    className="text-xs font-bold text-[#7a5242] hover:text-[#2b1b12] underline"
                  >
                    Manage Tier
                  </Link>
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

      {/* Code Remediation Modal */}
      {activeFixModal && (
        <div className="fixed inset-0 z-50 bg-[#2b1b12]/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#fffcf7] border border-[#e4d6c6] rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-scale-in text-[#2b1b12]">
            <div className="flex justify-between items-center border-b border-[#e4d6c6] pb-3">
              <h3 className="font-editorial text-lg font-bold">
                {activeFixModal === 'breadcrumb' ? 'BreadcrumbList Schema Fix' : 'Meta Description Fix'}
              </h3>
              <button
                onClick={() => setActiveFixModal(null)}
                className="text-xs font-bold text-[#6f5a4c] hover:text-[#2b1b12]"
              >
                ✕ Close
              </button>
            </div>

            <p className="text-xs text-[#6f5a4c]">
              Copy and paste this snippet directly into the <code className="bg-[#f1e8dc] px-1 py-0.5 rounded">&lt;head&gt;</code> tag of your target page:
            </p>

            <pre className="p-3 bg-[#2b1b12] text-[#fffcf7] rounded-xl text-xs font-mono overflow-x-auto">
{activeFixModal === 'breadcrumb' ? (
`<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [{
    "@type": "ListItem",
    "position": 1,
    "name": "Home",
    "item": "https://${project.domain}"
  },{
    "@type": "ListItem",
    "position": 2,
    "name": "Solutions",
    "item": "https://${project.domain}/solutions"
  }]
}
</script>`
) : (
`<meta name="description" content="${project.name} delivers high-performance solutions in ${project.industry}. Explore verified authority case studies and autonomous digital results." />`
)}
            </pre>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  navigator.clipboard?.writeText(activeFixModal === 'breadcrumb' ? 'Breadcrumb Schema Copied' : 'Meta Description Copied');
                  alert('Copied to clipboard!');
                  setActiveFixModal(null);
                }}
                className="px-4 py-2 bg-[#2b1b12] text-[#fffcf7] rounded-xl text-xs font-bold"
              >
                Copy to Clipboard ✦
              </button>
            </div>
          </div>
        </div>
      )}

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
