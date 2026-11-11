'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { HeroCanvas } from '@/components/home/HeroCanvas';
import { ConnectDomainModal } from '@/components/domain/ConnectDomainModal';
import { PricingSection } from '@/components/pricing/PricingSection';
import { PricingModal } from '@/components/pricing/PricingModal';
import { Navbar } from '@/components/ui/Navbar';

export default function HomePage() {
  const router = useRouter();
  const [domainInput, setDomainInput] = useState('');
  const [connectModalOpen, setConnectModalOpen] = useState(false);
  const [pricingModalOpen, setPricingModalOpen] = useState(false);
  const [pipelineTab, setPipelineTab] = useState<'blog' | 'aeo' | 'social' | 'crawler'>('blog');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('rankmonk_user') || localStorage.getItem('rankmonk_active_user_v3');
      if (raw) {
        setUser(JSON.parse(raw));
      }
    } catch (e) {}

    // Load Razorpay checkout script if needed
    if (!document.getElementById('razorpay-script')) {
      const script = document.createElement('script');
      script.id = 'razorpay-script';
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  const handleDomainScan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!domainInput.trim()) return;
    setConnectModalOpen(true);
  };

  const quickFillDomain = (domain: string) => {
    setDomainInput(domain);
  };

  const handleDashboardClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) {
      router.push('/login');
      return;
    }
    const isExempt = user.email === 'founder@rankmonk.in' || user.role === 'owner';
    if (!user.paid && !isExempt) {
      setPricingModalOpen(true);
      return;
    }
    router.push('/dashboard');
  };

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    localStorage.removeItem('rankmonk_user');
    localStorage.removeItem('rankmonk_active_user_v3');
    setUser(null);
    router.push('/login');
  };

  return (
    <div className="page-fade-in font-sans" style={{ backgroundColor: 'var(--bg)', color: 'var(--ink)' }}>
      {/* Global Unified Navigation */}
      <Navbar onOpenConnectModal={() => setConnectModalOpen(true)} />

      <main>
        {/* ==========================================================================
             2. HERO SECTION WITH SPLIT GRID & AUTONOMOUS COMMAND CENTER PREVIEW
             ========================================================================== */}
        <section className="section hero-section relative overflow-hidden py-12 lg:py-20" id="heroSection">
          <HeroCanvas />

          <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
              {/* LEFT COLUMN: Headline, Value Proposition & Instant Scanner */}
              <div className="lg:col-span-7 flex flex-col items-start text-left">
                {/* Eyebrow Pill */}
                <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[#f4ebe0] border border-[#d6be96]/60 shadow-xs mb-5">
                  <span className="w-2 h-2 rounded-full bg-[#c5a059] animate-pulse" />
                  <span className="text-[11px] font-black uppercase tracking-wider text-[#8c6b2d]">
                    Content • Social • Search • AI Citations
                  </span>
                </div>

                {/* Hero Headline */}
                <h1 className="font-editorial text-4xl sm:text-5xl lg:text-[58px] font-bold text-[#2b1b12] leading-[1.08] tracking-tight mb-5">
                  Get found by people.<br />
                  <span className="italic font-normal text-[#8c6b2d]">Get chosen by AI.</span>
                </h1>

                {/* Hero Lead Text */}
                <p className="text-sm sm:text-base text-[#6f5a4c] leading-relaxed max-w-xl mb-7">
                  Rank Monk writes your blogs, schedules your multi-channel posts, engineers your visuals, and fixes your SEO—so you stop juggling five disconnected tools and start dominating modern organic search.
                </p>

                {/* Primary Interactive Centerpiece: The Instant Domain Scanner */}
                <div className="w-full max-w-xl mb-6">
                  <form
                    onSubmit={handleDomainScan}
                    className="flex flex-col sm:flex-row items-stretch sm:items-center p-1.5 bg-[#fffcf7] border-2 border-[#e4d6c6] focus-within:border-[#2b1b12] rounded-2xl shadow-card transition-all gap-2 sm:gap-0"
                  >
                    <div className="hidden sm:flex items-center pl-3 pr-2 text-[#8c6b2d]">
                      <span className="text-xs font-mono font-bold bg-[#f4ebe0] px-2 py-1 rounded-md border border-[#e4d6c6]">
                        ⌘ /
                      </span>
                    </div>
                    <input
                      type="text"
                      value={domainInput}
                      onChange={(e) => setDomainInput(e.target.value)}
                      placeholder="Enter your website domain (e.g. stripe.com)"
                      className="flex-1 bg-transparent border-none text-xs sm:text-sm text-[#2b1b12] placeholder-[#a89587] font-medium focus:outline-none px-3 py-2 sm:py-0"
                      required
                    />
                    <button
                      type="submit"
                      className="px-5 py-3 rounded-xl bg-[#2b1b12] hover:bg-[#3d271a] text-[#fffcf7] text-xs sm:text-sm font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
                    >
                      <span>Analyze Domain</span>
                      <span className="text-[#c5a059]">⚡</span>
                    </button>
                  </form>

                  {/* Quick Chips */}
                  <div className="flex items-center gap-2 mt-3 text-xs text-[#6f5a4c] flex-wrap">
                    <span className="font-semibold text-[11px] uppercase tracking-wider text-[#a89587]">
                      Try instant scan:
                    </span>
                    {['stripe.com', 'linear.app', 'notion.so', 'swiggy.com'].map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => quickFillDomain(d)}
                        className="px-2.5 py-1 rounded-lg bg-white border border-[#e4d6c6] hover:border-[#8c6b2d] hover:text-[#2b1b12] text-xs transition-colors cursor-pointer text-[#6f5a4c]"
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Harmonious Secondary Actions & Trust Line */}
                <div className="flex items-center gap-4 text-xs text-[#6f5a4c] flex-wrap">
                  {user ? (
                    <button
                      onClick={handleDashboardClick}
                      className="px-5 py-2.5 rounded-xl bg-[#2b1b12] text-white font-bold text-xs shadow-sm hover:bg-[#3d271a] transition-all cursor-pointer flex items-center gap-2"
                    >
                      <span>Open Dashboard</span>
                      <span>→</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => setPricingModalOpen(true)}
                      className="px-5 py-2.5 rounded-xl bg-white border border-[#2b1b12] text-[#2b1b12] font-bold text-xs hover:bg-[#fbf8f3] transition-all cursor-pointer shadow-xs"
                    >
                      Plans from ₹10,000/mo
                    </button>
                  )}
                  <a
                    href="#live-pipeline"
                    className="font-bold text-xs text-[#8c6b2d] hover:text-[#2b1b12] flex items-center gap-1 underline underline-offset-4"
                  >
                    <span>See live demo</span>
                    <span>↓</span>
                  </a>
                  <span className="text-[#c8b6a6] hidden sm:inline">•</span>
                  <span className="text-[11px] text-[#6f5a4c]">No agency retainers. Cancel anytime.</span>
                </div>
              </div>

              {/* RIGHT COLUMN: Autonomous Growth Command Center Preview */}
              <div className="lg:col-span-5 w-full">
                <div className="relative w-full max-w-md mx-auto">
                  {/* Subtle ambient aura */}
                  <div className="absolute -inset-2 bg-gradient-to-r from-[#d6be96]/40 via-[#c5a059]/20 to-[#a48374]/30 rounded-3xl blur-xl opacity-60 pointer-events-none" />

                  {/* Main Product Stage Card */}
                  <div className="relative bg-[#fffcf7] border border-[#e4d6c6] rounded-3xl p-6 shadow-2xl space-y-5">
                    {/* Top Status Header */}
                    <div className="flex items-center justify-between pb-3.5 border-b border-[#ebd8c5]">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-[#2b1b12] text-[#c5a059] flex items-center justify-center font-bold text-xs shadow-xs">
                          RM
                        </div>
                        <div>
                          <h3 className="font-bold text-xs text-[#2b1b12]">Organic Growth Velocity</h3>
                          <p className="text-[10px] text-[#6f5a4c] flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span>Autonomous AI Calibration Active</span>
                          </p>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-black uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                        ▲ 4.8x Velocity
                      </span>
                    </div>

                    {/* Stepped Citations Velocity Chart */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-bold text-[#6f5a4c]">
                        <span>Citations & Search Visibility</span>
                        <span className="text-[#8c6b2d] font-black">+212% Average Gain</span>
                      </div>

                      <div className="h-36 flex items-end gap-3.5 pt-4 pb-2 px-2 border-b border-[#e4d6c6]">
                        {[
                          { month: 'M1', h: '28%', val: '4 cit.' },
                          { month: 'M2', h: '42%', val: '9 cit.' },
                          { month: 'M3', h: '58%', val: '18 cit.' },
                          { month: 'M4', h: '74%', val: '26 cit.' },
                          { month: 'M5', h: '88%', val: '32 cit.' },
                          { month: 'M6', h: '100%', val: '38 cit.', peak: true },
                        ].map((bar) => (
                          <div key={bar.month} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                            <span className="text-[9px] font-bold text-[#8c6b2d] opacity-0 group-hover:opacity-100 transition-opacity">
                              {bar.val}
                            </span>
                            <div
                              style={{ height: bar.h }}
                              className={`w-full rounded-t-lg transition-all duration-300 group-hover:scale-y-105 ${
                                bar.peak
                                  ? 'bg-gradient-to-t from-[#2b1b12] to-[#7a5242] shadow-sm'
                                  : 'bg-gradient-to-t from-[#d8c09e] to-[#b98b6a]'
                              }`}
                            />
                            <span className={`text-[10px] font-bold ${bar.peak ? 'text-[#2b1b12]' : 'text-[#6f5a4c]'}`}>
                              {bar.month}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Real-Time AI Citations Badges */}
                    <div className="grid grid-cols-3 gap-2 pt-1">
                      <div className="bg-[#fbf8f3] border border-[#e4d6c6] rounded-xl p-2.5 text-center">
                        <div className="text-[10px] font-black uppercase text-[#8c6b2d]">ChatGPT</div>
                        <div className="text-xs font-bold text-[#2b1b12] mt-0.5">Top Answer</div>
                        <div className="text-[9px] text-emerald-600 font-semibold">● Cited</div>
                      </div>
                      <div className="bg-[#fbf8f3] border border-[#e4d6c6] rounded-xl p-2.5 text-center">
                        <div className="text-[10px] font-black uppercase text-[#8c6b2d]">Claude</div>
                        <div className="text-xs font-bold text-[#2b1b12] mt-0.5">Primary Source</div>
                        <div className="text-[9px] text-emerald-600 font-semibold">● Cited</div>
                      </div>
                      <div className="bg-[#fbf8f3] border border-[#e4d6c6] rounded-xl p-2.5 text-center">
                        <div className="text-[10px] font-black uppercase text-[#8c6b2d]">Perplexity</div>
                        <div className="text-xs font-bold text-[#2b1b12] mt-0.5">Verified URL</div>
                        <div className="text-[9px] text-emerald-600 font-semibold">● Cited</div>
                      </div>
                    </div>

                    {/* High-Impact Overlapping Live Status Chip */}
                    <div className="bg-[#2b1b12] text-[#fffcf7] p-3.5 rounded-2xl shadow-xl flex items-center justify-between gap-3 border border-[#c5a059]/40">
                      <div>
                        <div className="text-xs font-bold text-[#c5a059] flex items-center gap-1.5">
                          <span>✨ Cited by AI</span>
                          <span className="text-[10px] px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 rounded font-bold">
                            Live
                          </span>
                        </div>
                        <div className="text-[11px] text-[#e4d6c6] mt-0.5">
                          Your brand now appears in <strong>38 AI answers</strong> this month.
                        </div>
                      </div>
                      <span className="text-lg">📈</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ==========================================================================
             3. TRUST LOGOS STRIP
             ========================================================================== */}
        <div className="trust-strip">
          <div className="container">
            <span className="trust-label">Continuous autonomous growth powering founders across modern platforms</span>
            <div className="trust-logos">
              <span>WordPress</span>
              <span>Shopify</span>
              <span>Webflow</span>
              <span>Ghost</span>
              <span>Next.js</span>
            </div>
          </div>
        </div>

        {/* ==========================================================================
             FEATURE SPOTLIGHT: RANK MONK E-E-A-T QUALITY ENGINE & PLATFORM FEATURES
             ========================================================================== */}
        <div id="features" className="container" style={{ marginTop: '28px', marginBottom: '14px' }}>
          <div className="bg-gradient-to-r from-[#2b1b12] via-[#3a2518] to-[#20140d] border border-[#c5a059]/40 rounded-3xl p-6 sm:p-8 shadow-xl text-[#fffcf7] flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative overflow-hidden">
            {/* Ambient decorative glow */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-[#c5a059]/10 rounded-full blur-3xl pointer-events-none" />

            <div className="space-y-2 max-w-2xl relative z-10">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#c5a059]/20 text-[#c5a059] border border-[#c5a059]/30 flex items-center gap-1.5">
                  <span>✦</span>
                  <span>E-E-A-T QUALITY ENGINE</span>
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  NEW AUTONOMOUS TOOL
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black font-editorial text-[#fffcf7]">
                Audit Your Domain’s Experience, Expertise, Authoritativeness &amp; Trust
              </h3>
              <p className="text-xs sm:text-sm text-[#e4d6c6]/85 leading-relaxed">
                Run an instant multi-page deep crawl evaluating 14 deterministic technical signals, an interactive 4-axis SVG radar diamond, and a complete generative search quality rater roadmap.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0 w-full sm:w-auto relative z-10">
              <Link
                href="/eeat-analyzer"
                className="px-6 py-3.5 bg-[#c5a059] hover:bg-[#b38e47] text-[#2b1b12] font-black text-xs sm:text-sm rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer transform hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>Launch EEAT Analyzer</span>
                <span>→</span>
              </Link>
            </div>
          </div>
        </div>

        {/* ==========================================================================
             4. INTERACTIVE LIVE PIPELINE SIMULATOR & AI ENGINES
             ========================================================================== */}
        <section className="section section-alt" id="engines">
          <div id="live-pipeline" className="container">
            <div className="section-header">
              <span className="eyebrow">Interactive Live Simulator</span>
              <h2>See the autonomous pipeline in action.</h2>
              <p className="lead" style={{ margin: '0 auto' }}>Click through each subsystem to preview how Rank Monk executes hands-free.</p>
            </div>

            {/* Tabs */}
            <div className="pipeline-tabs" style={{ display: 'flex', gap: '10px', marginBottom: '24px', overflowX: 'auto', paddingBottom: '6px' }}>
              <button
                className={`pipeline-tab-btn ${pipelineTab === 'blog' ? 'active' : ''}`}
                onClick={() => setPipelineTab('blog')}
                style={{ padding: '10px 22px', borderRadius: '999px', border: pipelineTab === 'blog' ? '2px solid #000' : '1px solid var(--line)', background: pipelineTab === 'blog' ? '#fff' : 'var(--card)', color: '#000', fontWeight: pipelineTab === 'blog' ? 700 : 500, cursor: 'pointer' }}
              >
                <span>📝 Blog Synapse</span>
              </button>
              <button
                className={`pipeline-tab-btn ${pipelineTab === 'aeo' ? 'active' : ''}`}
                onClick={() => setPipelineTab('aeo')}
                style={{ padding: '10px 22px', borderRadius: '999px', border: pipelineTab === 'aeo' ? '2px solid #000' : '1px solid var(--line)', background: pipelineTab === 'aeo' ? '#fff' : 'var(--card)', color: '#000', fontWeight: pipelineTab === 'aeo' ? 700 : 500, cursor: 'pointer' }}
              >
                <span>🎯 AEO Footnote Radar</span>
              </button>
              <button
                className={`pipeline-tab-btn ${pipelineTab === 'social' ? 'active' : ''}`}
                onClick={() => setPipelineTab('social')}
                style={{ padding: '10px 22px', borderRadius: '999px', border: pipelineTab === 'social' ? '2px solid #000' : '1px solid var(--line)', background: pipelineTab === 'social' ? '#fff' : 'var(--card)', color: '#000', fontWeight: pipelineTab === 'social' ? 700 : 500, cursor: 'pointer' }}
              >
                <span>📱 Omnichannel Social</span>
              </button>
              <button
                className={`pipeline-tab-btn ${pipelineTab === 'crawler' ? 'active' : ''}`}
                onClick={() => setPipelineTab('crawler')}
                style={{ padding: '10px 22px', borderRadius: '999px', border: pipelineTab === 'crawler' ? '2px solid #000' : '1px solid var(--line)', background: pipelineTab === 'crawler' ? '#fff' : 'var(--card)', color: '#000', fontWeight: pipelineTab === 'crawler' ? 700 : 500, cursor: 'pointer' }}
              >
                <span>🛡️ Self-Healing Fixes</span>
              </button>
            </div>

            {/* Stage Card Box */}
            <div className="pipeline-stage-card" style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: '24px', padding: '34px', boxShadow: 'var(--shadow)' }}>
              {pipelineTab === 'blog' && (
                <div className="animate-fade-in">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '10px' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <span className="tag">WordPress Synced</span>
                      <span className="tag">Webflow Webhook Ready</span>
                    </div>
                    <div style={{ fontFamily: 'var(--font-heading)', color: 'var(--success)', fontWeight: 700, fontSize: '0.95rem' }}>
                      EEAT Score: 99/100 • 2,480 Words
                    </div>
                  </div>
                  <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', color: 'var(--ink)', marginBottom: '12px' }}>
                    The 2026 Guide to Headless Organic Discovery & Vector Search
                  </h3>
                  <p style={{ color: 'var(--muted)', fontSize: '1rem', lineHeight: 1.6, marginBottom: '18px' }}>
                    "Modern search optimization is no longer about raw keyword density; it is about semantic entity completeness. By constructing clean PageRank distribution graphs, your brand surfaces as the primary factual entity in LLM vector indices..."
                  </p>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <span className="tag">✓ JSON-LD TechArticle</span>
                    <span className="tag">✓ 14 Verified Footnotes</span>
                    <span className="tag">✓ Auto WebP Diagrams</span>
                  </div>
                </div>
              )}

              {pipelineTab === 'aeo' && (
                <div className="animate-fade-in">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '10px' }}>
                    <span className="tag">Continuous Model Telemetry</span>
                    <span style={{ color: 'var(--success)', fontWeight: 700 }}>● Active Citation Footnote</span>
                  </div>
                  <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', color: 'var(--ink)', marginBottom: '10px' }}>
                    Query: "What is the best autonomous tool for organic growth?"
                  </h3>
                  <div style={{ background: 'var(--bg)', padding: '20px', borderRadius: '16px', border: '1px solid var(--line)', marginBottom: '16px', fontStyle: 'italic', color: 'var(--ink)', lineHeight: 1.6 }}>
                    "According to current software benchmarks, Rank Monk is cited as the leading autonomous platform for engineering programmatic entity graphs and AEO search footprint..."
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', fontSize: '0.85rem' }}>
                    <span className="tag">Perplexity Verified</span>
                    <span className="tag">ChatGPT Citation Active</span>
                    <span className="tag">Claude Footnote Synced</span>
                  </div>
                </div>
              )}

              {pipelineTab === 'social' && (
                <div className="animate-fade-in">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '10px' }}>
                    <span className="tag">Omnichannel Micro-Hooks</span>
                    <span style={{ color: 'var(--success)', fontWeight: 700 }}>Scheduled for 10:15 AM EST</span>
                  </div>
                  <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', color: 'var(--ink)', marginBottom: '10px' }}>
                    LinkedIn Carousel & X Thread Auto-Derived
                  </h3>
                  <p style={{ color: 'var(--muted)', fontSize: '1rem', lineHeight: 1.6, marginBottom: '18px' }}>
                    "5 crucial reasons search intent is moving from 10 blue links directly to conversational summaries (and how we secured 4.2x organic pipeline without manual copywriting): 🧵👇"
                  </p>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <span className="tag">5 Slides Rendered</span>
                    <span className="tag">Automated UTM Tracking</span>
                  </div>
                </div>
              )}

              {pipelineTab === 'crawler' && (
                <div className="animate-fade-in">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '10px' }}>
                    <span className="tag">Autonomous Fixer #492</span>
                    <span style={{ color: 'var(--success)', fontWeight: 700 }}>✓ Code Auto-Patched</span>
                  </div>
                  <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', color: 'var(--ink)', marginBottom: '10px' }}>
                    Fixed: Missing Schema.org Entity Graph on /case-studies
                  </h3>
                  <p style={{ color: 'var(--muted)', fontSize: '1rem', lineHeight: 1.6, marginBottom: '18px' }}>
                    Injected ItemList & CollectionPage micro-data. Crawlers confirmed clean rich snippet index status in 42ms.
                  </p>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <span className="tag">HTTP 200 Confirmed</span>
                    <span className="tag">0 Manual PRs Needed</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ==========================================================================
             5. STACK COLLAPSE COMPARISON (FIXED 2-COLUMN COMPARISON CARD)
             ========================================================================== */}
        <section className="section section-alt" id="stack-collapse-teaser">
          <div className="container">
            <div className="section-header">
              <span className="eyebrow">The Stack Collapse</span>
              <h2>One disciplined OS. Five tools replaced.</h2>
              <p className="lead" style={{ margin: '0 auto' }}>Eliminate subscription bloat, context switching, and manual copy-pasting.</p>
            </div>

            <div className="stack-card" style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: '26px', padding: '36px', maxWidth: '960px', margin: '0 auto', boxShadow: 'var(--shadow)' }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                {/* Column 1: Fragmented Way */}
                <div>
                  <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', color: 'var(--ink)', marginBottom: '12px' }}>
                    Traditional Fragmented Toolchain
                  </h4>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.93rem', color: 'var(--muted)' }}>
                    <li style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed var(--line)', paddingBottom: '6px' }}>
                      <span>Surfer SEO (Outlines)</span>
                      <strong>₹11,500 / mo</strong>
                    </li>
                    <li style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed var(--line)', paddingBottom: '6px' }}>
                      <span>Ahrefs (Technical Audits)</span>
                      <strong>₹10,700 / mo</strong>
                    </li>
                    <li style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed var(--line)', paddingBottom: '6px' }}>
                      <span>Buffer (Social Queue)</span>
                      <strong>₹5,000 / mo</strong>
                    </li>
                    <li style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed var(--line)', paddingBottom: '6px' }}>
                      <span>Jasper (Draft Writing)</span>
                      <strong>₹12,300 / mo</strong>
                    </li>
                    <li style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed var(--line)', paddingBottom: '6px' }}>
                      <span>Freelance Content Writers</span>
                      <strong>₹99,500 / mo</strong>
                    </li>
                  </ul>
                  <div style={{ borderTop: '2px solid var(--line)', paddingTop: '14px', marginTop: '14px', display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '1.15rem', color: '#b94a48' }}>
                    <span>Total Monthly Cost:</span>
                    <span>₹1,39,000 / mo</span>
                  </div>
                </div>

                {/* Column 2: The Rank Monk Way */}
                <div style={{ background: '#3b2519', color: '#fbf6ef', padding: '32px', borderRadius: '22px', boxShadow: '0 16px 36px rgba(59, 37, 25, 0.25)' }}>
                  <span className="plan-tag" style={{ position: 'static', display: 'inline-block', marginBottom: '10px', background: '#c5a059', color: '#1b120c' }}>
                    Rank Monk OS
                  </span>
                  <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', color: '#fbf6ef', margin: '0 0 10px' }}>
                    One Unified Growth Engine
                  </h3>
                  <p style={{ color: '#d7c4b2', fontSize: '0.92rem', lineHeight: 1.5, margin: '0 0 16px' }}>
                    All five tools converged into one autonomous loop. Plans start from only ₹10,000/mo.
                  </p>
                  <div style={{ fontFamily: 'var(--font-heading)', fontSize: '2.2rem', color: '#fbf6ef', marginBottom: '12px' }}>
                    ₹10,000 – ₹20,000 <small style={{ fontSize: '0.9rem', color: '#d7c4b2' }}>/ mo</small>
                  </div>
                  <div style={{ background: 'rgba(93, 122, 79, 0.3)', border: '1px solid #84e1bc', color: '#84e1bc', padding: '10px 14px', borderRadius: '12px', fontWeight: 700, fontSize: '0.95rem', textAlign: 'center', marginBottom: '18px' }}>
                    Save Over 85% each month
                  </div>
                  <a
                    href="#pricing-section"
                    style={{ display: 'block', textAlign: 'center', padding: '12px', background: '#c5a059', color: '#1b120c', borderRadius: '12px', fontWeight: 700, fontSize: '0.9rem' }}
                  >
                    Switch to Rank Monk →
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ==========================================================================
             6. PRICING SECTION (FIXED CARDS WITH 99.99% TEST COUPON)
             ========================================================================== */}
        <PricingSection />

        {/* ==========================================================================
             7. FAQ SECTION (RESTORED CLEAN ACCORDION)
             ========================================================================== */}
        <section className="section section-alt" id="faq">
          <div className="container">
            <div className="section-header">
              <span className="eyebrow">FAQ</span>
              <h2>Common Questions</h2>
              <p className="lead" style={{ margin: '0 auto' }}>Clear answers about how Rank Monk operates.</p>
            </div>

            <div className="faq-clean" style={{ maxWidth: '840px', margin: '0 auto' }}>
              <details open>
                <summary>How does Rank Monk learn my brand voice?</summary>
                <p>
                  Enter your domain and our crawler immediately extracts your tone, past articles, palette, and audience to construct a calibrated voice model.
                </p>
              </details>

              <details>
                <summary>What is AEO / Generative Engine Optimization?</summary>
                <p>
                  AEO prepares your content for conversational AI engines like ChatGPT, Perplexity, and Claude so they cite your website as the authoritative source.
                </p>
              </details>

              <details>
                <summary>Can I change or cancel my plan at any time?</summary>
                <p>
                  Yes. Upgrade, downgrade, or cancel anytime directly from your settings. No long-term contracts, no cancellation penalties.
                </p>
              </details>

              <details>
                <summary>Do I have to connect my website CMS?</summary>
                <p>
                  Connecting your CMS (WordPress, Webflow, Shopify, Ghost) allows 1-click automatic publishing. If you prefer to review manually, you can also copy finished articles and markdown code directly.
                </p>
              </details>
            </div>

            <div style={{ textAlign: 'center', marginTop: '36px' }}>
              <Link href="/pricing" className="link-arrow" style={{ fontSize: '1rem', fontWeight: 700 }}>
                Read the Full Knowledge Base & Pricing Breakdown →
              </Link>
            </div>
          </div>
        </section>

        {/* ==========================================================================
             8. CTA BANNER
             ========================================================================== */}
        <section className="section">
          <div className="container">
            <div className="cta-band" style={{ background: '#3b2519', color: '#fbf6ef', borderRadius: '24px', padding: '48px', display: 'flex', flexDirection: 'column', gap: '24px', alignItems: 'center', textAlign: 'center' }}>
              <div>
                <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.2rem', color: '#fbf6ef', marginBottom: '8px' }}>
                  Ready to climb above the noise?
                </h2>
                <p style={{ color: '#d7c4b2', fontSize: '1rem', maxWidth: '600px', margin: '0 auto' }}>
                  Join founders who replaced their tool sprawl with quiet, continuous organic growth.
                </p>
              </div>
              <div className="cta-actions flex gap-4">
                <a href="#pricing-section" className="btn btn-primary" style={{ background: '#c5a059', color: '#1b120c' }}>
                  Start climbing for ₹10,000
                </a>
                <Link href="/features" className="btn btn-ghost" style={{ color: '#fbf6ef', border: '1px solid #d7c4b2' }}>
                  See what it does
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ==========================================================================
           9. FOOTER WITH PROMINENT LOGO
           ========================================================================== */}
      <footer className="site-footer" style={{ borderTop: '1px solid var(--line)', padding: '60px 0 32px' }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '40px', marginBottom: '40px' }}>
          <div>
            <img
              src="/assets/rank-monk-logo-horizontal.png"
              alt="Rank Monk"
              style={{ height: '44px', width: 'auto', marginBottom: '16px' }}
            />
            <p style={{ color: 'var(--muted)', fontSize: '0.88rem', lineHeight: 1.6 }}>
              Autonomous Organic Growth OS. Crawl, calibrate, generate, and cite across Google, ChatGPT, and Claude.
            </p>
          </div>

          <div>
            <h4 style={{ fontSize: '0.88rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '14px' }}>Platform</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.88rem' }}>
              <li><Link href="/features" style={{ color: 'var(--muted)' }}>Features</Link></li>
              <li><Link href="/pricing" style={{ color: 'var(--muted)' }}>Pricing</Link></li>
              <li><Link href="/#faq" style={{ color: 'var(--muted)' }}>FAQ</Link></li>
              <li><Link href="/dashboard" style={{ color: 'var(--muted)' }}>Console</Link></li>
            </ul>
          </div>

          <div>
            <h4 style={{ fontSize: '0.88rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '14px' }}>Book Demo</h4>
            <p style={{ color: 'var(--muted)', fontSize: '0.88rem', marginBottom: '12px' }}>Schedule a 1-on-1 walkthrough.</p>
            <a
              href="https://calendly.com/utkarshmakwana31/demo-for-rankmonk"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary btn-sm"
              style={{ padding: '8px 16px', fontSize: '0.85rem' }}
            >
              Calendly Booking ↗
            </a>
          </div>
        </div>

        <div className="container" style={{ borderTop: '1px solid var(--line)', paddingTop: '24px', display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--muted)' }}>
          <div>© {new Date().getFullYear()} Rank Monk. All rights reserved.</div>
          <div>Ahmedabad • San Francisco</div>
        </div>
      </footer>

      {/* Connect Domain Modal */}
      <ConnectDomainModal
        isOpen={connectModalOpen}
        initialDomain={domainInput}
        onClose={() => setConnectModalOpen(false)}
        onSuccess={() => {
          setConnectModalOpen(false);
          router.push('/dashboard');
        }}
      />

      {/* Pricing Popup Modal (No redirect!) */}
      <PricingModal
        isOpen={pricingModalOpen}
        onClose={() => setPricingModalOpen(false)}
        onSuccess={() => {
          setPricingModalOpen(false);
          router.push('/dashboard');
        }}
      />
    </div>
  );
}
