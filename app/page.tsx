'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { HeroCanvas } from '@/components/home/HeroCanvas';
import { ConnectDomainModal } from '@/components/domain/ConnectDomainModal';
import { PricingSection } from '@/components/pricing/PricingSection';
import { PricingModal } from '@/components/pricing/PricingModal';

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
      {/* ==========================================================================
           1. SITE HEADER - BORDERLESS, AIRY, PROMINENT LOGO & DASHBOARD BUTTON
           ========================================================================== */}
      <header className="site-header" id="siteHeader" style={{ height: '76px', display: 'flex', alignItems: 'center' }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          {/* Brand Logo - Prominent & Sized (48px) */}
          <Link href="/" className="brand" aria-label="Rank Monk home" style={{ display: 'flex', alignItems: 'center' }}>
            <img
              src="/assets/rank-monk-logo-horizontal.png"
              alt="Rank Monk"
              className="brand-logo-img logo-light"
              style={{ height: '48px', width: 'auto', maxHeight: '52px' }}
            />
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="nav-links hidden lg:flex items-center gap-6 text-sm font-semibold text-[#6f5a4c]">
            <Link href="/" className="nav-link active text-[#2b1b12]">Home</Link>
            <Link href="/features" className="nav-link hover:text-[#2b1b12]">Features</Link>
            <Link href="/#engines" className="nav-link hover:text-[#2b1b12]">AI Engines</Link>
            <Link href="/#stack-collapse-teaser" className="nav-link hover:text-[#2b1b12]">Stack Collapse</Link>
            <Link href="/pricing" className="nav-link hover:text-[#2b1b12]">Pricing</Link>
            <Link href="/#faq" className="nav-link hover:text-[#2b1b12]">FAQ</Link>
          </nav>

          {/* Nav Actions - Desktop */}
          <div className="hidden lg:flex items-center gap-3">
            <a
              href="https://calendly.com/utkarshmakwana31/demo-for-rankmonk"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-ghost btn-sm"
              style={{ borderRadius: '10px', fontSize: '0.84rem', fontWeight: 600, padding: '7px 16px', border: '1px solid var(--line)' }}
            >
              Book Demo
            </a>

            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button
                  onClick={handleDashboardClick}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 18px',
                    background: '#2b1b12',
                    color: '#fffcf7',
                    borderRadius: '12px',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    boxShadow: '0 4px 12px rgba(43, 27, 18, 0.15)',
                    transition: 'all 0.2s ease',
                    cursor: 'pointer',
                    border: 'none'
                  }}
                >
                  <span>Dashboard</span>
                  <span>→</span>
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingLeft: '4px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#f1e8dc', border: '1px solid #d8c09e', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, color: '#2b1b12' }}>
                    {(user.name || user.email || 'U').charAt(0).toUpperCase()}
                  </div>
                  <button
                    onClick={handleLogout}
                    style={{ fontSize: '0.75rem', color: '#7a5242', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}
                  >
                    Log Out
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Link
                  href="/login"
                  style={{ fontSize: '0.85rem', fontWeight: 700, color: '#2b1b12', padding: '6px 12px' }}
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  style={{
                    padding: '8px 18px',
                    background: '#2b1b12',
                    color: '#fffcf7',
                    borderRadius: '12px',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    boxShadow: '0 4px 12px rgba(43, 27, 18, 0.15)'
                  }}
                >
                  Start climbing
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Hamburger Toggle Button */}
          <div className="flex lg:hidden items-center gap-2">
            {user && (
              <button
                onClick={handleDashboardClick}
                style={{
                  padding: '6px 12px',
                  background: '#2b1b12',
                  color: '#fffcf7',
                  borderRadius: '10px',
                  fontWeight: 700,
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                  border: 'none'
                }}
              >
                Dashboard →
              </button>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-[#2b1b12] hover:bg-[#f1e8dc] transition-colors"
              aria-label="Toggle navigation menu"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                {mobileMenuOpen ? (
                  <>
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </>
                ) : (
                  <>
                    <line x1="4" y1="6" x2="20" y2="6"></line>
                    <line x1="4" y1="12" x2="20" y2="12"></line>
                    <line x1="4" y1="18" x2="20" y2="18"></line>
                  </>
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Slide-down Sheet */}
        {mobileMenuOpen && (
          <div className="lg:hidden absolute top-[76px] left-0 right-0 bg-[#fffcf7] border-b border-[#e4d6c6] shadow-xl p-6 z-50 animate-fade-in space-y-4">
            <nav className="flex flex-col gap-3.5 font-semibold text-sm text-[#2b1b12]">
              <Link href="/" onClick={() => setMobileMenuOpen(false)}>Home</Link>
              <Link href="/features" onClick={() => setMobileMenuOpen(false)}>Features</Link>
              <Link href="/#engines" onClick={() => setMobileMenuOpen(false)}>AI Engines</Link>
              <Link href="/#stack-collapse-teaser" onClick={() => setMobileMenuOpen(false)}>Stack Collapse</Link>
              <Link href="/pricing" onClick={() => setMobileMenuOpen(false)}>Pricing & Plans</Link>
              <Link href="/#faq" onClick={() => setMobileMenuOpen(false)}>FAQ</Link>
            </nav>

            <div className="border-t border-[#e4d6c6] pt-4 flex flex-col gap-3">
              <a
                href="https://calendly.com/utkarshmakwana31/demo-for-rankmonk"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full text-center py-2.5 rounded-xl border border-[#e4d6c6] text-xs font-bold text-[#2b1b12]"
              >
                Book Demo (Calendly)
              </a>

              {user ? (
                <div className="space-y-2.5">
                  <button
                    onClick={(e) => {
                      setMobileMenuOpen(false);
                      handleDashboardClick(e);
                    }}
                    className="w-full block text-center py-3 bg-[#2b1b12] text-[#fffcf7] rounded-xl text-xs font-bold cursor-pointer border-none"
                  >
                    Open Dashboard →
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full text-center text-xs text-[#7a5242] underline py-1 font-semibold"
                  >
                    Log Out ({user.email})
                  </button>
                </div>
              ) : (
                <div className="flex gap-2.5">
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex-1 text-center py-2.5 rounded-xl border border-[#2b1b12] text-xs font-bold text-[#2b1b12]"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/signup"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex-1 text-center py-2.5 rounded-xl bg-[#2b1b12] text-[#fffcf7] text-xs font-bold"
                  >
                    Start Free
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      <main>
        {/* ==========================================================================
             2. HERO SECTION WITH SPLIT GRID & CLIMB CARD SIDE-BY-SIDE
             ========================================================================== */}
        <section className="section hero-section" id="heroSection">
          <HeroCanvas />

          <div className="container hero-content">
            <div className="hero-split-grid">
              {/* LEFT COLUMN: Headline & Scanner */}
              <div className="hero-text-col">
                <span className="eyebrow">Content • Social • Search • AI Visibility</span>
                <h1 className="hero-headline">
                  Get found by people.<br />
                  <span className="accent">Get chosen by AI.</span>
                </h1>
                <p className="lead">
                  Rank Monk writes your blogs, schedules your posts, makes your visuals and fixes your SEO, so you stop juggling five tools and start getting noticed.
                </p>

                <div className="hero-actions flex items-center gap-3 flex-wrap">
                  {user ? (
                    <button onClick={handleDashboardClick} className="btn btn-primary" style={{ padding: '12px 26px', fontSize: '0.95rem', cursor: 'pointer', border: 'none' }}>
                      Go to Dashboard →
                    </button>
                  ) : (
                    <button onClick={() => setPricingModalOpen(true)} className="btn btn-primary" style={{ padding: '12px 26px', fontSize: '0.95rem', cursor: 'pointer', border: 'none' }}>
                      Start climbing for ₹10,000
                    </button>
                  )}
                  <a className="btn btn-ghost" href="#live-pipeline" style={{ padding: '12px 24px', fontSize: '0.95rem' }}>
                    See live demo
                  </a>
                </div>

                {/* Instant Domain Scanner */}
                <div className="hero-scanner-wrap" id="hero-scanner" style={{ marginTop: '28px' }}>
                  <form className="scanner-box" id="heroScannerForm" onSubmit={handleDomainScan}>
                    <div className="scanner-prefix-icon">
                      <span>⌘ /</span>
                    </div>
                    <input
                      type="text"
                      id="heroScannerInput"
                      className="scanner-input"
                      value={domainInput}
                      onChange={(e) => setDomainInput(e.target.value)}
                      placeholder="Enter your domain to analyze (e.g. stripe.com)"
                      required
                    />
                    <button type="submit" className="scanner-btn cursor-pointer">
                      <span>Analyze Domain</span>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
                    </button>
                  </form>

                  <div className="scanner-quick-chips">
                    <span className="scanner-quick-label">Try instant scan:</span>
                    <button type="button" className="scanner-chip" onClick={() => quickFillDomain('stripe.com')}>stripe.com</button>
                    <button type="button" className="scanner-chip" onClick={() => quickFillDomain('linear.app')}>linear.app</button>
                    <button type="button" className="scanner-chip" onClick={() => quickFillDomain('notion.so')}>notion.so</button>
                  </div>
                </div>

                <p className="hero-note" style={{ marginTop: '16px' }}>
                  <strong>No agency retainers.</strong> Plans from ₹10,000 a month. Cancel anytime.
                </p>
              </div>

              {/* RIGHT COLUMN: The Climb Card (Side-by-side with headline on desktop) */}
              <div className="hero-visual-col" id="heroVisualCol">
                <div className="climb-card" aria-hidden="true">
                  <div className="climb-top">
                    <small>Organic visibility</small>
                    <span className="pill-up">▲ 4.8x</span>
                  </div>
                  <div className="bars">
                    <span></span>
                    <span></span>
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                  <div className="climb-foot">
                    <div>Months with Rank Monk<strong>6</strong></div>
                    <div style={{ textAlign: 'right' }}>Average gain<strong>+212%</strong></div>
                  </div>
                  <div className="float-chip">
                    <b>Cited by AI</b>
                    Your brand now appears in 38 AI answers this month.
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
             4. INTERACTIVE LIVE PIPELINE SIMULATOR (FIXED CARD CONTAINER)
             ========================================================================== */}
        <section className="section section-alt" id="live-pipeline">
          <div className="container">
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
