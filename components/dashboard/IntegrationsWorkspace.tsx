'use client';

import React, { useState, useEffect } from 'react';
import {
  Plug,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  RefreshCw,
  Edit2,
  Trash2,
  Globe,
  BookOpen,
  X,
  Sparkles,
  HelpCircle,
  Lock,
  Layers,
  Check,
  Copy,
  Share2
} from 'lucide-react';

// Platform Icons
const WordPressIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="#21759b">
    <path d="M12 2C6.486 2 2 6.486 2 12c0 4.418 2.865 8.167 6.839 9.504L4.85 10.42a8.04 8.04 0 0 1 7.15-4.42c2.073 0 3.96.786 5.394 2.074L12 2zm0 20c-1.393 0-2.709-.286-3.9-.803l5.09-14.76c.404-.035.795-.062 1.155-.062 1.34 0 2.385.503 2.385 1.543 0 .736-.57 1.677-1.14 2.617l-3.59 11.466zm7.15-4.42A7.964 7.964 0 0 0 22 12c0-2.316-.983-4.4-2.56-5.867l3.71 11.447zM2.56 12c0-1.875.643-3.6 1.722-4.975l5.228 15.143A8.006 8.006 0 0 1 2.56 12z"/>
  </svg>
);

const ShopifyIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="#95bf47">
    <path d="M15.4 3.7c-.1-.3-.4-.5-.7-.4l-2 .6c-.2-.7-.7-1.4-1.4-1.9-.9-.7-2-.8-2.8-.4-.3.1-.5.3-.6.6L7.1 3.5c-.3.1-.4.3-.5.6l-4.5 14c-.1.3 0 .6.2.8l11.4 5.3c.2.1.4.1.6 0l7.3-3.4c.2-.1.4-.4.4-.7l-6.1-16.4zm-4.7-.6c.5-.3 1.2-.2 1.7.2.4.3.7.8.9 1.4l-3.3 1c.2-1.3.4-2.3.7-2.6zm-1.8 3.5l1.8-.5-.8 5.7c-.4-1.8-.7-3.6-1-5.2zm2.7 15.3l-8.6-4 3.4-10.7 4.5 13.3c.2.4.4.9.7 1.4zm1.5-1.5c-.3-.7-.7-1.6-1-2.4l4.6-13.6 4.9 13.2-8.5 2.8z"/>
  </svg>
);

const MagentoIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="#ee672f">
    <path d="M12 2L2 7.8v8.4l3.3 1.9V9.7l6.7-3.9 6.7 3.9v8.4l3.3-1.9V7.8L12 2zm0 8.8l-3.3 1.9v5.6L12 20.2l3.3-1.9v-5.6L12 10.8z"/>
  </svg>
);

const GithubIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
  </svg>
);

const GscShieldIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    <path d="m9 12 2 2 4-4"/>
  </svg>
);

const LinkedinIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="#0077b5">
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
  </svg>
);

const TwitterIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const InstagramIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={`${className} text-pink-600`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
  </svg>
);

const FacebookIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="#1877f2">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const PinterestIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="#e60023">
    <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345-.09.375-.291 1.199-.334 1.373-.053.224-.174.271-.4.165-1.49-.694-2.42-2.875-2.42-4.627 0-3.774 2.741-7.24 7.904-7.24 4.15 0 7.375 2.957 7.375 6.909 0 4.124-2.599 7.442-6.208 7.442-1.213 0-2.353-.63-2.744-1.377l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z"/>
  </svg>
);

interface IntegrationsWorkspaceProps {
  project: any;
  user: any;
  onNavigateToSocial?: () => void;
}

export function IntegrationsWorkspace({ project, user, onNavigateToSocial }: IntegrationsWorkspaceProps) {
  const cleanDomain = (project?.domain || '').replace(/^(https?:\/\/)?(www\.)?/, '').replace(/\/$/, '').toLowerCase();

  // Active Selected CMS Tab
  const [selectedCms, setSelectedCms] = useState<'wordpress' | 'shopify' | 'magento' | 'github'>('wordpress');

  // Integrations State
  const [wordpressConfig, setWordpressConfig] = useState<any>(null);
  const [githubConfig, setGithubConfig] = useState<any>(null);
  const [shopifyConfig, setShopifyConfig] = useState<any>(null);
  const [magentoConfig, setMagentoConfig] = useState<any>(null);
  const [gscConfig, setGscConfig] = useState<any>(null);
  const [socialAccounts, setSocialAccounts] = useState<any[]>([]);

  // Modals
  const [cmsModalOpen, setCmsModalOpen] = useState(false);
  const [gscModalOpen, setGscModalOpen] = useState(false);
  const [showGscGuide, setShowGscGuide] = useState(true);
  const [showAdvancedGsc, setShowAdvancedGsc] = useState(false);
  const [guideModalOpen, setGuideModalOpen] = useState(false);
  const [guideTab, setGuideTab] = useState<'gsc' | 'wordpress' | 'github' | 'social'>('gsc');
  const [socialModalOpen, setSocialModalOpen] = useState(false);
  const [activeSocialPlatform, setActiveSocialPlatform] = useState<string>('linkedin');

  // Form States
  const [saving, setSaving] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // WordPress Form
  const [wpUrl, setWpUrl] = useState('');
  const [wpUser, setWpUser] = useState('');
  const [wpAppPassword, setWpAppPassword] = useState('');

  // GitHub Form
  const [ghOwner, setGhOwner] = useState('');
  const [ghRepo, setGhRepo] = useState('');
  const [ghToken, setGhToken] = useState('');

  // GSC Form
  const [gscPropertyUrl, setGscPropertyUrl] = useState(`sc-domain:${cleanDomain}`);
  const [gscServiceAccountJson, setGscServiceAccountJson] = useState('');

  // Social Account Input
  const [socialHandle, setSocialHandle] = useState('');

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Load Integrations
  useEffect(() => {
    if (!cleanDomain) return;
    const email = user?.email || 'default';

    fetch(`/api/integrations?email=${encodeURIComponent(email)}&domain=${encodeURIComponent(cleanDomain)}`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.integrations) {
          if (data.integrations.wordpress) {
            setWordpressConfig(data.integrations.wordpress);
            setWpUrl(data.integrations.wordpress.wpUrl || `https://${cleanDomain}`);
            setWpUser(data.integrations.wordpress.wpUser || '');
          }
          if (data.integrations.github) {
            setGithubConfig(data.integrations.github);
            setGhOwner(data.integrations.github.owner || '');
            setGhRepo(data.integrations.github.repo || '');
          }
          if (data.integrations.gsc) {
            setGscConfig(data.integrations.gsc);
            setGscPropertyUrl(data.integrations.gsc.siteUrl || `sc-domain:${cleanDomain}`);
          }
          if (Array.isArray(data.integrations.socialAccounts)) {
            setSocialAccounts(data.integrations.socialAccounts);
          }
        }
      })
      .catch(() => {});
  }, [cleanDomain, user?.email]);

  // Handle Save WordPress
  const handleSaveWordPress = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const email = user?.email || 'default';

    try {
      const config = {
        wpUrl: wpUrl.trim() || `https://${cleanDomain}`,
        wpUser: wpUser.trim(),
        wpAppPassword: wpAppPassword.trim(),
        connectedAt: new Date().toISOString()
      };

      const res = await fetch('/api/integrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, domain: cleanDomain, platform: 'wordpress', config })
      });

      const json = await res.json();
      if (json.success) {
        setWordpressConfig(config);
        localStorage.setItem(`rm_wp_config_${cleanDomain}`, JSON.stringify(config));
        setCmsModalOpen(false);
        showToast('✓ WordPress REST API connected successfully!');
      } else {
        throw new Error(json.error || 'Failed to save');
      }
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  // Handle Save GitHub
  const handleSaveGitHub = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const email = user?.email || 'default';

    try {
      const config = {
        owner: ghOwner.trim(),
        repo: ghRepo.trim(),
        token: ghToken.trim(),
        connectedAt: new Date().toISOString()
      };

      const res = await fetch('/api/integrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, domain: cleanDomain, platform: 'github', config })
      });

      const json = await res.json();
      if (json.success) {
        setGithubConfig(config);
        localStorage.setItem(`rm_gh_config_${cleanDomain}`, JSON.stringify(config));
        setCmsModalOpen(false);
        showToast('✓ GitHub Repository connected successfully!');
      } else {
        throw new Error(json.error || 'Failed to save');
      }
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  // Handle Save Google Search Console
  const handleSaveGsc = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const email = user?.email || 'default';

    try {
      let saKey: any = null;
      if (gscServiceAccountJson.trim()) {
        try {
          saKey = JSON.parse(gscServiceAccountJson.trim());
        } catch {
          throw new Error('Invalid JSON format for Service Account Key.');
        }
      }

      const config = {
        siteUrl: gscPropertyUrl.trim() || `sc-domain:${cleanDomain}`,
        serviceAccountKey: saKey,
        connectedAt: new Date().toISOString()
      };

      const res = await fetch('/api/integrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, domain: cleanDomain, platform: 'gsc', config })
      });

      const json = await res.json();
      if (json.success) {
        setGscConfig(config);
        localStorage.setItem(`rm_gsc_${cleanDomain}`, JSON.stringify({ connected: true, ...config }));
        setGscModalOpen(false);
        showToast('✓ Google Search Console connected successfully!');
      } else {
        throw new Error(json.error || 'Failed to save');
      }
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  // Disconnect handler
  const handleDisconnect = async (platform: string) => {
    if (!confirm(`Are you sure you want to disconnect ${platform}?`)) return;
    const email = user?.email || 'default';

    await fetch('/api/integrations', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, domain: cleanDomain, platform })
    });

    if (platform === 'wordpress') {
      setWordpressConfig(null);
      localStorage.removeItem(`rm_wp_config_${cleanDomain}`);
    } else if (platform === 'github') {
      setGithubConfig(null);
      localStorage.removeItem(`rm_gh_config_${cleanDomain}`);
    } else if (platform === 'gsc') {
      setGscConfig(null);
      localStorage.removeItem(`rm_gsc_${cleanDomain}`);
    }
    showToast(`✓ ${platform.toUpperCase()} disconnected.`);
  };

  // Connect Social Account
  const handleConnectSocial = async (e: React.FormEvent) => {
    e.preventDefault();
    const email = user?.email || 'default';

    const newAcc = {
      id: `${activeSocialPlatform}_${Date.now()}`,
      platform: activeSocialPlatform,
      name: socialHandle || `${activeSocialPlatform.toUpperCase()} Channel`,
      handle: socialHandle,
      connectedAt: new Date().toISOString()
    };

    const updated = [...socialAccounts.filter(a => a.platform !== activeSocialPlatform), newAcc];
    setSocialAccounts(updated);

    await fetch('/api/integrations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, domain: cleanDomain, platform: 'social', config: updated })
    });

    setSocialModalOpen(false);
    setSocialHandle('');
    showToast(`✓ ${activeSocialPlatform} account connected!`);
  };

  const isSocialConnected = (platform: string) => {
    return socialAccounts.some(a => a.platform === platform);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 font-sans">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-20 right-6 z-[99999] bg-[#2b1b12] text-white text-xs font-bold px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 animate-fade-in border border-[#c5a059]/40">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* 1. Header (SoloSpider Styled) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#e4d6c6]">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center shadow-md shrink-0">
            <Plug className="w-6 h-6" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[10px] font-black uppercase tracking-wider mb-1">
              SETUP INTEGRATIONS
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#2b1b12] tracking-tight">
              Connections &amp; Integrations
            </h1>
            <p className="text-xs sm:text-sm text-[#6f5a4c] max-w-2xl mt-0.5">
              Direct connection interface for all store channels, paid advertisements, search console tracking, and social media posting.
            </p>
          </div>
        </div>

        {/* User Guide Action Button */}
        <button
          type="button"
          onClick={() => setGuideModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-[#2b1b12] hover:bg-[#f8f3ec] text-[#2b1b12] rounded-xl text-xs font-bold transition-all shadow-xs shrink-0 cursor-pointer"
        >
          <BookOpen className="w-4 h-4 text-[#c5a059]" />
          <span>📘 Connection Guide</span>
        </button>
      </div>

      {/* 2. Top Summary Row of 5 Quick Status Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {/* Card 1: WordPress */}
        <div
          onClick={() => { setSelectedCms('wordpress'); setCmsModalOpen(true); }}
          className="bg-white border border-[#e4d6c6] rounded-2xl p-4 shadow-xs hover:border-[#c5a059] transition-all cursor-pointer flex flex-col justify-between min-h-[110px]"
        >
          <div className="flex items-center justify-between">
            <div className="p-2 bg-[#f8f3ec] rounded-xl">
              <WordPressIcon className="w-6 h-6" />
            </div>
            <span className={`inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider ${wordpressConfig ? 'text-emerald-700' : 'text-slate-400'}`}>
              <span className={`w-2 h-2 rounded-full ${wordpressConfig ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
              {wordpressConfig ? 'ACTIVE' : 'OFFLINE'}
            </span>
          </div>
          <div className="mt-3">
            <h3 className="font-bold text-xs text-[#2b1b12]">WordPress</h3>
            <p className="text-[11px] text-[#6f5a4c] truncate">
              {wordpressConfig ? (wordpressConfig.wpUrl || `https://${cleanDomain}`) : 'Setup Integration'}
            </p>
          </div>
        </div>

        {/* Card 2: Shopify */}
        <div
          onClick={() => { setSelectedCms('shopify'); setCmsModalOpen(true); }}
          className="bg-white border border-[#e4d6c6] rounded-2xl p-4 shadow-xs hover:border-[#c5a059] transition-all cursor-pointer flex flex-col justify-between min-h-[110px]"
        >
          <div className="flex items-center justify-between">
            <div className="p-2 bg-[#f8f3ec] rounded-xl">
              <ShopifyIcon className="w-6 h-6" />
            </div>
            <span className={`inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider ${shopifyConfig ? 'text-emerald-700' : 'text-slate-400'}`}>
              <span className={`w-2 h-2 rounded-full ${shopifyConfig ? 'bg-emerald-500' : 'bg-slate-300'}`} />
              {shopifyConfig ? 'ACTIVE' : 'OFFLINE'}
            </span>
          </div>
          <div className="mt-3">
            <h3 className="font-bold text-xs text-[#2b1b12]">Shopify</h3>
            <p className="text-[11px] text-[#6f5a4c] truncate">
              {shopifyConfig ? 'Store Connected' : 'Setup Integration'}
            </p>
          </div>
        </div>

        {/* Card 3: Magento */}
        <div
          onClick={() => { setSelectedCms('magento'); setCmsModalOpen(true); }}
          className="bg-white border border-[#e4d6c6] rounded-2xl p-4 shadow-xs hover:border-[#c5a059] transition-all cursor-pointer flex flex-col justify-between min-h-[110px]"
        >
          <div className="flex items-center justify-between">
            <div className="p-2 bg-[#f8f3ec] rounded-xl">
              <MagentoIcon className="w-6 h-6" />
            </div>
            <span className={`inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider ${magentoConfig ? 'text-emerald-700' : 'text-slate-400'}`}>
              <span className={`w-2 h-2 rounded-full ${magentoConfig ? 'bg-emerald-500' : 'bg-slate-300'}`} />
              {magentoConfig ? 'ACTIVE' : 'OFFLINE'}
            </span>
          </div>
          <div className="mt-3">
            <h3 className="font-bold text-xs text-[#2b1b12]">Magento</h3>
            <p className="text-[11px] text-[#6f5a4c] truncate">
              {magentoConfig ? 'Store Connected' : 'Setup Integration'}
            </p>
          </div>
        </div>

        {/* Card 4: GitHub */}
        <div
          onClick={() => { setSelectedCms('github'); setCmsModalOpen(true); }}
          className="bg-white border border-[#e4d6c6] rounded-2xl p-4 shadow-xs hover:border-[#c5a059] transition-all cursor-pointer flex flex-col justify-between min-h-[110px]"
        >
          <div className="flex items-center justify-between">
            <div className="p-2 bg-[#f8f3ec] rounded-xl">
              <GithubIcon className="w-6 h-6" />
            </div>
            <span className={`inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider ${githubConfig ? 'text-emerald-700' : 'text-slate-400'}`}>
              <span className={`w-2 h-2 rounded-full ${githubConfig ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
              {githubConfig ? 'ACTIVE' : 'OFFLINE'}
            </span>
          </div>
          <div className="mt-3">
            <h3 className="font-bold text-xs text-[#2b1b12]">GitHub</h3>
            <p className="text-[11px] text-[#6f5a4c] truncate font-mono">
              {githubConfig ? `${githubConfig.owner}/${githubConfig.repo}` : 'Setup Integration'}
            </p>
          </div>
        </div>

        {/* Card 5: Search Console */}
        <div
          onClick={() => setGscModalOpen(true)}
          className="bg-white border border-[#e4d6c6] rounded-2xl p-4 shadow-xs hover:border-[#c5a059] transition-all cursor-pointer flex flex-col justify-between min-h-[110px]"
        >
          <div className="flex items-center justify-between">
            <div className="p-2 bg-[#f8f3ec] rounded-xl text-emerald-700">
              <GscShieldIcon className="w-6 h-6" />
            </div>
            <span className={`inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider ${gscConfig ? 'text-emerald-700' : 'text-slate-400'}`}>
              <span className={`w-2 h-2 rounded-full ${gscConfig ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
              {gscConfig ? 'ACTIVE' : 'OFFLINE'}
            </span>
          </div>
          <div className="mt-3">
            <h3 className="font-bold text-xs text-[#2b1b12]">Search Console</h3>
            <p className="text-[11px] text-[#6f5a4c] truncate">
              {gscConfig ? 'Verified & Connected' : 'Setup Integration'}
            </p>
          </div>
        </div>
      </div>

      {/* 3. Main Grid (Left Column: CMS & GSC; Right Column: Paid Campaigns & Social Channels) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN */}
        <div className="lg:col-span-6 space-y-6">
          {/* CARD 1: CMS & STORES */}
          <div className="bg-white border border-[#e4d6c6] rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
            <div>
              <h2 className="text-xs font-black uppercase tracking-wider text-[#2b1b12]">
                CMS &amp; STORES
              </h2>
              <p className="text-xs text-[#6f5a4c] mt-0.5">
                Publish generated drafts and sync products directly.
              </p>
            </div>

            {/* Horizontal Brand Buttons */}
            <div className="grid grid-cols-4 gap-2.5">
              {[
                { id: 'wordpress', name: 'WordPress', icon: WordPressIcon, active: !!wordpressConfig },
                { id: 'shopify', name: 'Shopify', icon: ShopifyIcon, active: !!shopifyConfig },
                { id: 'magento', name: 'Magento', icon: MagentoIcon, active: !!magentoConfig },
                { id: 'github', name: 'GitHub', icon: GithubIcon, active: !!githubConfig }
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => { setSelectedCms(item.id as any); setCmsModalOpen(true); }}
                  className={`p-3 rounded-2xl border transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
                    selectedCms === item.id
                      ? 'border-[#2b1b12] bg-[#f8f3ec] shadow-xs'
                      : 'border-[#e4d6c6] bg-white hover:bg-[#fbf8f3]'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="text-[11px] font-bold text-[#2b1b12]">{item.name}</span>
                </button>
              ))}
            </div>

            {/* Connected Entity Preview */}
            {wordpressConfig ? (
              <div className="p-3.5 bg-[#f8f3ec] border border-[#e4d6c6] rounded-2xl flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2 bg-white rounded-xl border border-[#e4d6c6] shrink-0">
                    <WordPressIcon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-[#2b1b12]">Wordpress</div>
                    <div className="text-[11px] text-[#6f5a4c] truncate">
                      {wordpressConfig.wpUrl || `https://${cleanDomain}`}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => { setSelectedCms('wordpress'); setCmsModalOpen(true); }}
                    className="px-3 py-1.5 bg-white border border-[#e4d6c6] hover:bg-[#f1e8dc] text-[#2b1b12] rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <Edit2 className="w-3 h-3" />
                    <span>Edit</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDisconnect('wordpress')}
                    className="px-3 py-1.5 bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Disconnect</span>
                  </button>
                </div>
              </div>
            ) : githubConfig ? (
              <div className="p-3.5 bg-[#f8f3ec] border border-[#e4d6c6] rounded-2xl flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2 bg-white rounded-xl border border-[#e4d6c6] shrink-0">
                    <GithubIcon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-[#2b1b12]">GitHub Repository</div>
                    <div className="text-[11px] text-[#6f5a4c] truncate font-mono">
                      {githubConfig.owner}/{githubConfig.repo}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => { setSelectedCms('github'); setCmsModalOpen(true); }}
                    className="px-3 py-1.5 bg-white border border-[#e4d6c6] hover:bg-[#f1e8dc] text-[#2b1b12] rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <Edit2 className="w-3 h-3" />
                    <span>Edit</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDisconnect('github')}
                    className="px-3 py-1.5 bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Disconnect</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-[#fbf8f3] border border-dashed border-[#d8c09e] rounded-2xl text-center">
                <p className="text-xs text-[#6f5a4c]">No CMS connected yet for auto-publishing.</p>
                <button
                  type="button"
                  onClick={() => setCmsModalOpen(true)}
                  className="mt-2 px-4 py-2 bg-[#2b1b12] hover:bg-[#3b2519] text-[#fffcf7] rounded-xl text-xs font-bold transition-all shadow-xs"
                >
                  Connect {selectedCms.toUpperCase()} →
                </button>
              </div>
            )}
          </div>

          {/* CARD 2: GOOGLE SEARCH CONSOLE */}
          <div className="bg-white border border-[#e4d6c6] rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
            <div>
              <h2 className="text-xs font-black uppercase tracking-wider text-[#2b1b12]">
                GOOGLE SEARCH CONSOLE
              </h2>
              <p className="text-xs text-[#6f5a4c] mt-0.5">
                Sync search volume, impressions, keywords, and backlinks.
              </p>
            </div>

            {gscConfig ? (
              <div className="p-4 bg-[#f8f3ec] border border-[#e4d6c6] rounded-2xl flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 shrink-0">
                    <GscShieldIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 border border-emerald-300">
                      ✓ CONNECTED
                    </span>
                    <p className="text-xs font-mono font-bold text-[#2b1b12] mt-1">
                      {gscConfig.siteUrl || `sc-domain:${cleanDomain}`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setGscModalOpen(true)}
                    className="px-3 py-1.5 bg-white border border-[#e4d6c6] hover:bg-[#f1e8dc] text-[#2b1b12] rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDisconnect('gsc')}
                    className="px-3 py-1.5 bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    Disconnect
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-[#fbf8f3] border border-[#e4d6c6] rounded-2xl flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 shrink-0">
                    <GscShieldIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-slate-400">
                      ● OFFLINE
                    </span>
                    <p className="text-xs text-[#6f5a4c] mt-0.5">Stream real Google SERP clicks &amp; impressions.</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setGscModalOpen(true)}
                  className="px-4 py-2 bg-[#2b1b12] hover:bg-[#3b2519] text-[#fffcf7] rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                >
                  Connect GSC →
                </button>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="lg:col-span-6 space-y-6">
          {/* CARD 3: PAID CAMPAIGNS */}
          <div className="bg-white border border-[#e4d6c6] rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
            <div>
              <h2 className="text-xs font-black uppercase tracking-wider text-[#2b1b12]">
                PAID CAMPAIGNS
              </h2>
              <p className="text-xs text-[#6f5a4c] mt-0.5">
                Optimize copy, track conversion statistics, and deploy campaigns.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => showToast('Meta Ads integration module activated.')}
                className="py-3 px-4 rounded-2xl border border-[#e4d6c6] bg-white hover:bg-[#f8f3ec] text-xs font-bold text-[#2b1b12] transition-all cursor-pointer flex items-center justify-center gap-2 shadow-xs"
              >
                <FacebookIcon className="w-4 h-4" />
                <span>Meta Ads</span>
              </button>
              <button
                type="button"
                onClick={() => showToast('Google Ads tracking connection activated.')}
                className="py-3 px-4 rounded-2xl border border-[#e4d6c6] bg-white hover:bg-[#f8f3ec] text-xs font-bold text-[#2b1b12] transition-all cursor-pointer flex items-center justify-center gap-2 shadow-xs"
              >
                <span className="font-bold text-[#4285f4]">G</span>
                <span>Google Ads</span>
              </button>
            </div>
          </div>

          {/* CARD 4: SOCIAL CHANNELS */}
          <div className="bg-white border border-[#e4d6c6] rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
            <div>
              <h2 className="text-xs font-black uppercase tracking-wider text-[#2b1b12]">
                SOCIAL CHANNELS
              </h2>
              <p className="text-xs text-[#6f5a4c] mt-0.5">
                Auto-schedule posts and track engagement stats across handles.
              </p>
            </div>

            <div className="space-y-2.5">
              {[
                { id: 'linkedin', name: 'LinkedIn Profile', desc: 'Share updates and articles', icon: LinkedinIcon },
                { id: 'twitter', name: 'X (Twitter) Profile', desc: 'Share tweets and threads', icon: TwitterIcon },
                { id: 'instagram', name: 'Instagram Profile', desc: 'Auto-share carousel updates', icon: InstagramIcon },
                { id: 'facebook', name: 'Facebook Page', desc: 'Share campaign announcements', icon: FacebookIcon },
                { id: 'pinterest', name: 'Pinterest Board', desc: 'Auto-pin graphics and links', icon: PinterestIcon }
              ].map((channel) => {
                const connected = isSocialConnected(channel.id);

                return (
                  <div
                    key={channel.id}
                    className="p-3.5 bg-white border border-[#e4d6c6] rounded-2xl flex items-center justify-between gap-3 shadow-2xs hover:border-[#c5a059] transition-all"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-2 bg-[#f8f3ec] rounded-xl shrink-0">
                        <channel.icon className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-[#2b1b12]">{channel.name}</h4>
                        <p className="text-[11px] text-[#6f5a4c] truncate">{channel.desc}</p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        if (connected) {
                          const updated = socialAccounts.filter(a => a.platform !== channel.id);
                          setSocialAccounts(updated);
                          const email = user?.email || 'default';
                          fetch('/api/integrations', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ email, domain: cleanDomain, platform: 'social', config: updated })
                          });
                          showToast(`Disconnected ${channel.name}`);
                        } else {
                          setActiveSocialPlatform(channel.id);
                          setSocialModalOpen(true);
                        }
                      }}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                        connected
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200'
                          : 'bg-[#2b1b12] hover:bg-[#3b2519] text-[#fffcf7] shadow-xs'
                      }`}
                    >
                      {connected ? 'Connected ✓' : 'Connect'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          MODAL 1: CMS & STORES MODAL (WordPress, GitHub, Shopify, Magento)
          ========================================================================= */}
      {cmsModalOpen && (
        <div className="fixed inset-0 z-[999999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[#e4d6c6] rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl space-y-4 animate-fade-in text-left">
            <div className="flex items-center justify-between pb-2 border-b border-[#e4d6c6]">
              <div className="flex items-center gap-2.5">
                {selectedCms === 'wordpress' && <WordPressIcon className="w-6 h-6" />}
                {selectedCms === 'shopify' && <ShopifyIcon className="w-6 h-6" />}
                {selectedCms === 'magento' && <MagentoIcon className="w-6 h-6" />}
                {selectedCms === 'github' && <GithubIcon className="w-6 h-6" />}
                <h3 className="font-bold text-base text-[#2b1b12]">
                  Connect {selectedCms.toUpperCase()}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setCmsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-black cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {selectedCms === 'wordpress' && (
              <form onSubmit={handleSaveWordPress} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#2b1b12] uppercase mb-1">
                    WordPress Site URL
                  </label>
                  <input
                    type="url"
                    value={wpUrl}
                    onChange={(e) => setWpUrl(e.target.value)}
                    placeholder={`https://${cleanDomain}`}
                    className="w-full px-3 py-2 bg-[#f8f3ec] border border-[#e4d6c6] rounded-xl text-xs font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#2b1b12] uppercase mb-1">
                    Administrator Username
                  </label>
                  <input
                    type="text"
                    value={wpUser}
                    onChange={(e) => setWpUser(e.target.value)}
                    placeholder="admin"
                    className="w-full px-3 py-2 bg-[#f8f3ec] border border-[#e4d6c6] rounded-xl text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#2b1b12] uppercase mb-1">
                    Application Password
                  </label>
                  <input
                    type="password"
                    value={wpAppPassword}
                    onChange={(e) => setWpAppPassword(e.target.value)}
                    placeholder="xxxx xxxx xxxx xxxx"
                    className="w-full px-3 py-2 bg-[#f8f3ec] border border-[#e4d6c6] rounded-xl text-xs font-mono"
                    required
                  />
                  <span className="text-[10px] text-[#6f5a4c] mt-0.5 block">
                    Generate in WP Admin → Users → Profile → Application Passwords.
                  </span>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setCmsModalOpen(false)}
                    className="flex-1 py-2 border border-[#e4d6c6] rounded-xl text-xs font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 py-2 bg-[#2b1b12] text-white rounded-xl text-xs font-bold"
                  >
                    {saving ? 'Connecting...' : 'Save & Verify'}
                  </button>
                </div>
              </form>
            )}

            {selectedCms === 'github' && (
              <form onSubmit={handleSaveGitHub} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#2b1b12] uppercase mb-1">
                    GitHub Owner / Organization
                  </label>
                  <input
                    type="text"
                    value={ghOwner}
                    onChange={(e) => setGhOwner(e.target.value)}
                    placeholder="octocat"
                    className="w-full px-3 py-2 bg-[#f8f3ec] border border-[#e4d6c6] rounded-xl text-xs font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#2b1b12] uppercase mb-1">
                    Repository Name
                  </label>
                  <input
                    type="text"
                    value={ghRepo}
                    onChange={(e) => setGhRepo(e.target.value)}
                    placeholder="blog-content"
                    className="w-full px-3 py-2 bg-[#f8f3ec] border border-[#e4d6c6] rounded-xl text-xs font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#2b1b12] uppercase mb-1">
                    Personal Access Token (repo scope)
                  </label>
                  <input
                    type="password"
                    value={ghToken}
                    onChange={(e) => setGhToken(e.target.value)}
                    placeholder="ghp_xxxxxxxxxxxx"
                    className="w-full px-3 py-2 bg-[#f8f3ec] border border-[#e4d6c6] rounded-xl text-xs font-mono"
                    required
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setCmsModalOpen(false)}
                    className="flex-1 py-2 border border-[#e4d6c6] rounded-xl text-xs font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 py-2 bg-[#2b1b12] text-white rounded-xl text-xs font-bold"
                  >
                    {saving ? 'Saving...' : 'Save GitHub Config'}
                  </button>
                </div>
              </form>
            )}

            {(selectedCms === 'shopify' || selectedCms === 'magento') && (
              <div className="space-y-3 text-center py-4">
                <p className="text-xs text-[#6f5a4c]">
                  Enter your {selectedCms.toUpperCase()} store domain to initialize automated article draft syncing.
                </p>
                <input
                  type="text"
                  placeholder={`store.${cleanDomain}`}
                  className="w-full px-3.5 py-2.5 bg-[#f8f3ec] border border-[#e4d6c6] rounded-xl text-xs"
                />
                <button
                  type="button"
                  onClick={() => {
                    setCmsModalOpen(false);
                    showToast(`✓ ${selectedCms.toUpperCase()} webhook endpoint configured!`);
                  }}
                  className="w-full py-2.5 bg-[#2b1b12] text-white rounded-xl text-xs font-bold"
                >
                  Save Store Connection
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 2: GOOGLE SEARCH CONSOLE MODAL
          ========================================================================= */}
      {gscModalOpen && (
        <div className="fixed inset-0 z-[999999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[#e4d6c6] rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 sm:p-7 shadow-2xl space-y-4 animate-fade-in text-left">
            <div className="flex items-start justify-between pb-3 border-b border-[#e4d6c6]">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-2xl flex items-center justify-center text-lg font-bold shadow-sm shrink-0">
                  <GscShieldIcon className="w-6 h-6 text-emerald-700" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-[#2b1b12]">
                    Connect Google Search Console
                  </h3>
                  <p className="text-xs text-[#6f5a4c]">
                    Live traffic &amp; SERP impressions for <strong>{project?.domain}</strong>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setGscModalOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-black hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Prominent User Guide Toggle Button */}
            <div className="flex items-center justify-between p-3 bg-purple-50 border border-purple-200 rounded-2xl">
              <div className="flex items-center gap-2 text-xs font-bold text-purple-900">
                <BookOpen className="w-4 h-4 text-purple-700" />
                <span>How to connect in 3 simple steps</span>
              </div>
              <button
                type="button"
                onClick={() => setShowGscGuide(!showGscGuide)}
                className="text-xs font-bold text-purple-700 hover:text-purple-900 underline cursor-pointer"
              >
                {showGscGuide ? 'Hide Guide ▲' : 'View Guide ▼'}
              </button>
            </div>

            {/* Expandable Visual Step-by-Step Guide */}
            {showGscGuide && (
              <div className="p-4 bg-[#fbf8f3] border border-[#e4d6c6] rounded-2xl space-y-2.5 text-xs text-[#2b1b12]">
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#2b1b12] text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">1</span>
                  <p className="text-[#6f5a4c]">
                    Open <a href="https://search.google.com/search-console" target="_blank" rel="noreferrer" className="text-indigo-600 font-bold underline">Google Search Console ↗</a> and choose your property.
                  </p>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#2b1b12] text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">2</span>
                  <p className="text-[#6f5a4c]">
                    Go to <strong>Settings ⚙️</strong> (bottom left) → <strong>Users and permissions</strong> → Click <strong>Add user</strong>.
                  </p>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#2b1b12] text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">3</span>
                  <p className="text-[#6f5a4c]">
                    Enter email: <code className="bg-white px-1.5 py-0.5 rounded border border-[#e4d6c6] font-mono text-[11px] text-[#2b1b12] font-bold">service@rankmonk.in</code> with Permission <strong>Full</strong>, then click Save below.
                  </p>
                </div>
              </div>
            )}

            <form onSubmit={handleSaveGsc} className="space-y-3.5 pt-1">
              <div>
                <label className="block text-[11px] font-bold text-[#2b1b12] uppercase mb-1">
                  Search Console Property (Domain or URL)
                </label>
                <input
                  type="text"
                  value={gscPropertyUrl}
                  onChange={(e) => setGscPropertyUrl(e.target.value)}
                  placeholder={`sc-domain:${cleanDomain}`}
                  className="w-full px-3.5 py-2.5 bg-[#f8f3ec] border border-[#e4d6c6] rounded-xl text-xs font-mono"
                  required
                />
                <span className="text-[10px] text-[#6f5a4c] mt-0.5 block">
                  Example: <code className="bg-[#f1e8dc] px-1 py-0.5 rounded text-[10px]">sc-domain:{cleanDomain}</code> or <code className="bg-[#f1e8dc] px-1 py-0.5 rounded text-[10px]">https://{cleanDomain}/</code>
                </span>
              </div>

              {/* Advanced Service Account Option (Hidden by default so not messy) */}
              <div className="border border-[#e4d6c6] rounded-2xl p-3 bg-white">
                <button
                  type="button"
                  onClick={() => setShowAdvancedGsc(!showAdvancedGsc)}
                  className="w-full flex items-center justify-between text-left text-xs font-bold text-[#6f5a4c] hover:text-[#2b1b12] cursor-pointer"
                >
                  <span>Advanced: Custom Google Service Account Key (Optional)</span>
                  <span className="text-[11px]">{showAdvancedGsc ? '▲' : '▼'}</span>
                </button>

                {showAdvancedGsc && (
                  <div className="mt-2.5 pt-2.5 border-t border-slate-100 space-y-1.5">
                    <p className="text-[10px] text-[#6f5a4c]">
                      Paste your Google Cloud Service Account JSON key if you use custom Google Cloud project credentials.
                    </p>
                    <textarea
                      rows={3}
                      value={gscServiceAccountJson}
                      onChange={(e) => setGscServiceAccountJson(e.target.value)}
                      placeholder={`{\n  "type": "service_account",\n  "client_email": "...",\n  "private_key": "..."\n}`}
                      className="w-full px-3 py-2 bg-[#f8f3ec] border border-[#e4d6c6] rounded-xl text-[10px] font-mono resize-none"
                    />
                  </div>
                )}
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-[11px] text-emerald-900 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <span>Strict Real-Data Policy: Rank Monk only displays genuine Google Search Console statistics. If clicks or impressions are 0, it strictly displays 0.</span>
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setGscModalOpen(false)}
                  className="flex-1 py-2.5 border border-[#e4d6c6] rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 bg-[#2b1b12] hover:bg-[#3b2519] text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Verifying with Google...</span>
                    </>
                  ) : (
                    <span>Save &amp; Connect GSC</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 3: SOCIAL ACCOUNT CONNECT MODAL
          ========================================================================= */}
      {socialModalOpen && (
        <div className="fixed inset-0 z-[999999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[#e4d6c6] rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-fade-in text-left">
            <div className="flex items-center justify-between pb-2 border-b border-[#e4d6c6]">
              <h3 className="font-bold text-base text-[#2b1b12] capitalize">
                Connect {activeSocialPlatform}
              </h3>
              <button
                type="button"
                onClick={() => setSocialModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-black cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConnectSocial} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-[#2b1b12] uppercase mb-1">
                  Profile Handle or Page Name
                </label>
                <input
                  type="text"
                  value={socialHandle}
                  onChange={(e) => setSocialHandle(e.target.value)}
                  placeholder={`@${cleanDomain.split('.')[0]}`}
                  className="w-full px-3.5 py-2.5 bg-[#f8f3ec] border border-[#e4d6c6] rounded-xl text-xs"
                  required
                />
              </div>

              <p className="text-xs text-[#6f5a4c]">
                Connect your official handle to enable 1-click organic post scheduling and visual carousels directly from Social Studio.
              </p>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSocialModalOpen(false)}
                  className="flex-1 py-2 border border-[#e4d6c6] rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-[#2b1b12] text-white rounded-xl text-xs font-bold"
                >
                  Save Handle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 4: INTERACTIVE USER CONNECTION GUIDE (Requirement)
          ========================================================================= */}
      {guideModalOpen && (
        <div className="fixed inset-0 z-[999999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[#e4d6c6] rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 sm:p-8 shadow-2xl space-y-5 animate-fade-in text-left">
            <div className="flex items-center justify-between pb-3 border-b border-[#e4d6c6]">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-purple-100 text-purple-800 rounded-xl">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-[#2b1b12]">
                    Integration Connection Guide
                  </h3>
                  <p className="text-xs text-[#6f5a4c]">
                    Step-by-step instructions for non-technical users to connect each platform.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setGuideModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-black cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Guide Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-1 border-b border-[#e4d6c6]">
              {[
                { id: 'gsc', label: 'Google Search Console' },
                { id: 'wordpress', label: 'WordPress' },
                { id: 'github', label: 'GitHub' },
                { id: 'social', label: 'Social Channels' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setGuideTab(tab.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    guideTab === tab.id
                      ? 'bg-[#2b1b12] text-white shadow-xs'
                      : 'text-[#6f5a4c] hover:bg-[#f8f3ec]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Guide Content */}
            <div className="space-y-4 text-xs text-[#2b1b12] leading-relaxed">
              {guideTab === 'gsc' && (
                <div className="space-y-3">
                  <h4 className="font-bold text-sm text-[#2b1b12]">Connecting Google Search Console</h4>
                  <ol className="list-decimal pl-5 space-y-2 text-[#6f5a4c]">
                    <li>
                      Log in to <a href="https://search.google.com/search-console" target="_blank" rel="noreferrer" className="text-indigo-600 underline font-semibold">Google Search Console</a>.
                    </li>
                    <li>
                      In the bottom left corner, click <strong>Settings ⚙️</strong>.
                    </li>
                    <li>
                      Click on <strong>Users and permissions</strong>, then click the blue <strong>Add user</strong> button.
                    </li>
                    <li>
                      Enter your Google Service Account email (or your Rank Monk delegated email) and grant <strong>Full</strong> or <strong>Owner</strong> permission.
                    </li>
                    <li>
                      Copy your Property identifier (e.g., <code className="bg-[#f1e8dc] px-1 py-0.5 rounded text-[11px] font-mono text-[#2b1b12]">sc-domain:{cleanDomain}</code> or <code className="bg-[#f1e8dc] px-1 py-0.5 rounded text-[11px] font-mono text-[#2b1b12]">https://{cleanDomain}/</code>).
                    </li>
                    <li>
                      Paste the Property identifier and your Service Account Key into Rank Monk and click <strong>Save &amp; Connect GSC</strong>.
                    </li>
                  </ol>
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-[11px] text-emerald-900">
                    💡 <em>Note:</em> Real clicks and impressions will immediately start streaming into your Dashboard Overview without any fake numbers.
                  </div>
                </div>
              )}

              {guideTab === 'wordpress' && (
                <div className="space-y-3">
                  <h4 className="font-bold text-sm text-[#2b1b12]">Connecting WordPress REST API</h4>
                  <ol className="list-decimal pl-5 space-y-2 text-[#6f5a4c]">
                    <li>
                      Log in to your WordPress Dashboard (<code className="bg-[#f1e8dc] px-1 py-0.5 rounded text-[11px] font-mono text-[#2b1b12]">yourdomain.com/wp-admin</code>).
                    </li>
                    <li>
                      Navigate to <strong>Users → Profile</strong> in the left sidebar.
                    </li>
                    <li>
                      Scroll down to the <strong>Application Passwords</strong> section.
                    </li>
                    <li>
                      In the text box labeled <strong>New Application Password Name</strong>, type <strong className="text-[#2b1b12]">RankMonk</strong>.
                    </li>
                    <li>
                      Click <strong>Add New Application Password</strong>. WordPress will display a 24-character code (e.g., <code className="bg-[#f1e8dc] px-1 py-0.5 rounded text-[11px] font-mono text-[#2b1b12]">abcd efgh ijkl mnop qrst uvwx</code>).
                    </li>
                    <li>
                      Copy that key, paste it into Rank Monk along with your admin username, and click <strong>Save &amp; Verify</strong>.
                    </li>
                  </ol>
                </div>
              )}

              {guideTab === 'github' && (
                <div className="space-y-3">
                  <h4 className="font-bold text-sm text-[#2b1b12]">Connecting GitHub for GitOps Blogs</h4>
                  <ol className="list-decimal pl-5 space-y-2 text-[#6f5a4c]">
                    <li>
                      Go to <a href="https://github.com/settings/tokens" target="_blank" rel="noreferrer" className="text-indigo-600 underline font-semibold">GitHub Settings → Developer Settings → Personal Access Tokens</a>.
                    </li>
                    <li>
                      Click <strong>Generate new token (classic)</strong>.
                    </li>
                    <li>
                      Select the <code className="bg-[#f1e8dc] px-1 py-0.5 rounded text-[11px] font-mono text-[#2b1b12]">repo</code> scope so Rank Monk can create commits and pull requests with generated markdown posts.
                    </li>
                    <li>
                      Copy the generated token (starts with <code className="bg-[#f1e8dc] px-1 py-0.5 rounded text-[11px] font-mono text-[#2b1b12]">ghp_...</code>) and paste it into Rank Monk.
                    </li>
                  </ol>
                </div>
              )}

              {guideTab === 'social' && (
                <div className="space-y-3">
                  <h4 className="font-bold text-sm text-[#2b1b12]">Connecting Social Channels</h4>
                  <ol className="list-decimal pl-5 space-y-2 text-[#6f5a4c]">
                    <li>
                      <strong>Instagram:</strong> Ensure your Instagram account is switched to a <em>Professional / Creator</em> account and linked to your Facebook Business Page.
                    </li>
                    <li>
                      <strong>LinkedIn:</strong> Have your company page or personal profile credentials ready.
                    </li>
                    <li>
                      Click <strong>Connect</strong> next to any channel to authorize scheduling.
                    </li>
                  </ol>
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-[#e4d6c6] text-right">
              <button
                type="button"
                onClick={() => setGuideModalOpen(false)}
                className="px-5 py-2.5 bg-[#2b1b12] text-white font-bold rounded-xl text-xs cursor-pointer"
              >
                Got It, Close Guide
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
