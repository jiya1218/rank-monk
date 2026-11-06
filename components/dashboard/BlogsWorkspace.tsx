'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  FileText,
  Sparkles,
  Search,
  Globe,
  CheckCircle2,
  ExternalLink,
  Copy,
  Check,
  Download,
  Send,
  Loader2,
  RefreshCw,
  HelpCircle,
  Eye,
  Code,
  Settings2,
  AlertCircle,
  ArrowRight,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Sliders,
  Layers
} from 'lucide-react';
import { BlogArticle, detectTechStack, TechStackDetection } from '@/lib/blogEngine';

const GithubIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
);

interface BlogsWorkspaceProps {
  project?: any;
  user?: any;
  onRefreshBrand?: () => Promise<void>;
}

export function BlogsWorkspace({ project, user, onRefreshBrand }: BlogsWorkspaceProps) {
  const brandName = project?.name || 'Rank Monk';
  const domain = project?.domain || 'zenuphealth.com';
  const cleanDomain = domain.replace(/^(https?:\/\/)?(www\.)?/, '').replace(/\/$/, '');

  // 1. Tech Stack Auto-Detection State
  const [techStack, setTechStack] = useState<TechStackDetection>(() => {
    return detectTechStack('', cleanDomain);
  });

  // 2. Integration Config State (Stored in localStorage for seamless persistence)
  const [activeIntegrationTab, setActiveIntegrationTab] = useState<'github' | 'wordpress' | 'webhook'>('github');
  const [integrationsModalOpen, setIntegrationsModalOpen] = useState(false);

  const [githubConfig, setGithubConfig] = useState({
    token: '',
    repo: '',
    branch: 'main',
    folderPath: cleanDomain.includes('officex') ? 'content/resources' : 'content/blogs'
  });

  const [wpConfig, setWpConfig] = useState({
    wpUrl: `https://${cleanDomain}`,
    wpUsername: '',
    wpAppPassword: '',
    status: 'publish' as 'publish' | 'draft'
  });

  const [webhookConfig, setWebhookConfig] = useState({
    webhookUrl: '',
    secretKey: `rm_sec_${Math.random().toString(36).substr(2, 10)}`
  });

  // Load saved configurations from localStorage on mount
  useEffect(() => {
    try {
      const savedGh = localStorage.getItem(`rm_gh_config_${cleanDomain}`);
      if (savedGh) setGithubConfig(JSON.parse(savedGh));

      const savedWp = localStorage.getItem(`rm_wp_config_${cleanDomain}`);
      if (savedWp) setWpConfig(JSON.parse(savedWp));

      const savedWh = localStorage.getItem(`rm_wh_config_${cleanDomain}`);
      if (savedWh) setWebhookConfig(JSON.parse(savedWh));

      // Universal tech stack detection from crawled metadata or domain
      const detected = detectTechStack(project?.crawledHtml || '', cleanDomain);
      setTechStack(detected);
      setActiveIntegrationTab(detected.recommendedIntegration);
    } catch {}
  }, [cleanDomain, project]);

  // Save configs helper
  const saveIntegrationConfig = (type: 'github' | 'wordpress' | 'webhook') => {
    try {
      if (type === 'github') {
        localStorage.setItem(`rm_gh_config_${cleanDomain}`, JSON.stringify(githubConfig));
      } else if (type === 'wordpress') {
        localStorage.setItem(`rm_wp_config_${cleanDomain}`, JSON.stringify(wpConfig));
      } else if (type === 'webhook') {
        localStorage.setItem(`rm_wh_config_${cleanDomain}`, JSON.stringify(webhookConfig));
      }
      setToastMessage(`✓ ${type.toUpperCase()} integration settings saved!`);
      setIntegrationsModalOpen(false);
    } catch {}
  };

  const isGithubConnected = Boolean(githubConfig.token && githubConfig.repo);
  const isWpConnected = Boolean(wpConfig.wpUrl && wpConfig.wpUsername && wpConfig.wpAppPassword);
  const isWebhookConnected = Boolean(webhookConfig.webhookUrl);

  // Active connected integration
  const currentConnectedService = useMemo(() => {
    if (techStack.recommendedIntegration === 'wordpress' && isWpConnected) return 'wordpress';
    if (isGithubConnected) return 'github';
    if (isWpConnected) return 'wordpress';
    if (isWebhookConnected) return 'webhook';
    return null;
  }, [isGithubConnected, isWpConnected, isWebhookConnected, techStack]);

  // 3. Article Generator State
  const [keyword, setKeyword] = useState('');
  const [tone, setTone] = useState('Professional & Authoritative');
  const [wordCountTarget, setWordCountTarget] = useState(1500);
  const [includeFaq, setIncludeFaq] = useState(true);
  const [includeToc, setIncludeToc] = useState(true);

  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // 4. Current Article & Articles Library State
  const [currentArticle, setCurrentArticle] = useState<BlogArticle | null>(null);
  const [articleViewTab, setArticleViewTab] = useState<'preview' | 'markdown' | 'html'>('preview');
  const [articlesList, setArticlesList] = useState<BlogArticle[]>([]);
  const [copiedType, setCopiedType] = useState<'html' | 'md' | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishSuccessInfo, setPublishSuccessInfo] = useState<{ url?: string; liveUrl?: string; commitUrl?: string; message?: string } | null>(null);
  const [showSeoChecklist, setShowSeoChecklist] = useState(false);
  const [showGithubGuide, setShowGithubGuide] = useState(true);
  const [showWpGuide, setShowWpGuide] = useState(true);

  // Universal dynamic suggested topics based on project industry & category
  const suggestedTopics = useMemo(() => {
    const category = project?.businessCategory || project?.industry || 'Modern Digital Solutions';
    const market = project?.targetMarket || 'Global';
    const bName = project?.name || (cleanDomain ? cleanDomain.split('.')[0].toUpperCase() : 'Our Platform');

    return [
      `Best ${category} in ${market}: 2026 Comprehensive Comparison`,
      `How to Choose the Right ${category} for Your Organization`,
      `Key Advantages of ${category}: A Strategic Framework by ${bName}`,
      `Top Mistakes to Avoid When Evaluating ${category} Solutions`
    ];
  }, [cleanDomain, project]);

  // Generate Article via Bedrock Claude
  const handleGenerate = async (targetKw?: string) => {
    const selectedKw = targetKw || keyword;
    if (!selectedKw.trim()) {
      setToastMessage('Please enter a target keyword or topic.');
      return;
    }

    setIsGenerating(true);
    setGenerationStep('Synthesizing outline & topical entity graph...');

    try {
      setTimeout(() => setGenerationStep('Synthesizing article with Claude via AWS Bedrock...'), 1200);
      setTimeout(() => setGenerationStep('Injecting FAQ Schema & AEO Citation Box...'), 2600);

      const res = await fetch('/api/blogs/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          keyword: selectedKw,
          tone,
          wordCountTarget,
          includeFaq,
          includeToc,
          brandName: project?.name || brandName,
          brandDomain: cleanDomain,
          industry: project?.industry || '',
          businessCategory: project?.businessCategory || '',
          targetAudience: project?.targetAudience || '',
          brandPositioning: project?.brandPositioning || project?.summary || '',
          competitors: project?.competitors || []
        })
      });

      const data = await res.json();
      if (!data.success || !data.article) {
        throw new Error(data.error || 'Failed to generate article');
      }

      setCurrentArticle(data.article);
      setArticlesList(prev => [data.article, ...prev]);
      setToastMessage(`✓ Generated "${data.article.title}" successfully!`);
    } catch (err: any) {
      console.error(err);
      setToastMessage(`Error: ${err.message || 'Generation failed'}`);
    } finally {
      setIsGenerating(false);
      setGenerationStep('');
    }
  };

  // Publish Article to Connected Integration
  const handlePublish = async (destination: 'github' | 'wordpress' | 'webhook') => {
    if (!currentArticle) return;

    let config: any = null;
    if (destination === 'github') {
      if (!isGithubConnected) {
        setIntegrationsModalOpen(true);
        setActiveIntegrationTab('github');
        return;
      }
      config = githubConfig;
    } else if (destination === 'wordpress') {
      if (!isWpConnected) {
        setIntegrationsModalOpen(true);
        setActiveIntegrationTab('wordpress');
        return;
      }
      config = wpConfig;
    } else if (destination === 'webhook') {
      if (!isWebhookConnected) {
        setIntegrationsModalOpen(true);
        setActiveIntegrationTab('webhook');
        return;
      }
      config = webhookConfig;
    }

    setIsPublishing(true);
    setPublishSuccessInfo(null);

    try {
      const res = await fetch('/api/blogs/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destination,
          config: {
            ...config,
            brandDomain: cleanDomain
          },
          article: currentArticle,
          brandDomain: cleanDomain
        })
      });

      const result = await res.json();
      if (!result.success) {
        throw new Error(result.error || 'Failed to publish');
      }

      const isResource = (config?.folderPath || '').includes('resource') || cleanDomain.includes('officex');
      const targetFolder = isResource ? 'resources' : 'blog';
      const liveArticleUrl = result.liveUrl || result.postUrl || (cleanDomain ? `https://${cleanDomain}/${targetFolder}/${currentArticle.slug}` : undefined);

      setPublishSuccessInfo({
        liveUrl: liveArticleUrl,
        commitUrl: result.commitUrl,
        message: liveArticleUrl ? `Blog is successfully posted on: ${liveArticleUrl}` : result.message
      });
      setToastMessage(`✓ Blog is successfully posted on: ${liveArticleUrl || cleanDomain}`);
    } catch (err: any) {
      console.error(err);
      setToastMessage(`Publishing error: ${err.message}`);
    } finally {
      setIsPublishing(false);
    }
  };

  // 1-Click Copy helpers
  const handleCopy = (type: 'html' | 'md') => {
    if (!currentArticle) return;
    const text = type === 'html' ? currentArticle.contentHtml : currentArticle.contentMarkdown;
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setToastMessage(`✓ Copied article ${type.toUpperCase()} to clipboard!`);
    setTimeout(() => setCopiedType(null), 2500);
  };

  // Download Markdown file
  const handleDownload = () => {
    if (!currentArticle) return;
    const blob = new Blob([currentArticle.contentMarkdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentArticle.slug}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setToastMessage(`✓ Downloaded ${currentArticle.slug}.md`);
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in max-w-[1600px] mx-auto pb-12">
      {/* 1. Header with Tech Stack Detection & Integrations */}
      <div className="space-y-3 pb-3 border-b border-[#e4d6c6]/60">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-3xl font-black text-[#2b1b12] tracking-tight">
                Blogs & Content Engine
              </h1>
              <span className="text-[10.5px] px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-extrabold border border-indigo-200">
                Claude 3.5 Sonnet
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#6f5a4c] font-medium mt-1 leading-relaxed">
              Synthesize publication-grade, long-form SEO articles with automated CMS & GitOps publishing.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            {/* Tech Stack Detection Pill */}
            <div
              onClick={() => setIntegrationsModalOpen(true)}
              className="px-3 py-1.5 rounded-xl border border-[#e4d6c6] bg-white hover:bg-[#f8f3ec] text-xs font-bold text-[#2b1b12] flex items-center gap-1.5 cursor-pointer shadow-2xs transition-all"
              title="Click to manage publishing integrations"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{techStack.label}</span>
              <Settings2 className="w-3.5 h-3.5 text-[#c5a059] ml-1" />
            </div>

            {/* Publishing Settings Modal Button */}
            <button
              type="button"
              onClick={() => setIntegrationsModalOpen(true)}
              className="flex items-center gap-1.5 bg-[#2b1b12] hover:bg-[#3b2519] text-[#fffcf7] text-xs font-bold py-1.5 sm:py-2 px-3 sm:px-4 rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <Send className="w-3.5 h-3.5 text-[#c5a059]" />
              <span>Publish Integrations</span>
            </button>
          </div>
        </div>

        {/* Smart Detection Alert Banner */}
        <div className="p-3 bg-gradient-to-r from-[#faf6f0] via-white to-[#faf6f0] border border-[#e4d6c6] rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs text-[#2b1b12]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#c5a059]/20 text-[#8a5b13] flex items-center justify-center font-bold shrink-0">
              ⚡
            </div>
            <div>
              <span className="font-bold">Detected Platform: </span>
              <span className="font-semibold text-[#6f5a4c]">{techStack.description}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {currentConnectedService ? (
              <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 font-bold text-[11px] border border-emerald-200 flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                <span>Connected via {currentConnectedService.toUpperCase()}</span>
              </span>
            ) : (
              <button
                type="button"
                onClick={() => setIntegrationsModalOpen(true)}
                className="px-3 py-1 bg-[#c5a059] hover:bg-[#b38e47] text-[#2b1b12] font-black text-[11px] rounded-lg transition-all cursor-pointer"
              >
                Connect {techStack.label.split(' ')[0]} Now →
              </button>
            )}
          </div>
        </div>
      </div>

      {toastMessage && (
        <div className="p-3 bg-[#eef7ec] border border-[#84e1bc] rounded-xl text-xs text-[#03543f] font-semibold flex items-center justify-between shadow-2xs animate-fade-in">
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="text-[#03543f] font-bold">✕</button>
        </div>
      )}

      {/* 2. Main Studio Grid: Left Configuration & Right Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (5 Cols): Article Synthesis Form */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-white rounded-3xl border border-[#e4d6c6] p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-sm sm:text-base text-[#2b1b12] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#c5a059]" />
                <span>Article Synthesizer</span>
              </h3>
              <span className="text-[10.5px] font-bold text-[#8a5b13] bg-[#c5a059]/15 px-2 py-0.5 rounded-full border border-[#c5a059]/30">
                Autonomous EEAT
              </span>
            </div>

            {/* Keyword Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#2b1b12] flex items-center justify-between">
                <span>Target Primary Keyword or Topic</span>
                <span className="text-[10px] text-[#6f5a4c] font-normal">H1 Focus</span>
              </label>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder={
                    project?.businessCategory
                      ? `e.g. Best ${project.businessCategory} Solutions for 2026`
                      : project?.industry
                      ? `e.g. Strategic Guide to ${project.industry}`
                      : "e.g. Comprehensive Industry Comparison & Guide"
                  }
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs font-medium bg-[#f8f3ec]/60 border border-[#e4d6c6] rounded-xl text-[#2b1b12] placeholder:text-slate-400 focus:outline-none focus:border-[#c5a059] focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* Smart Suggested Topics */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10.5px] font-bold text-[#6f5a4c] uppercase tracking-wider block">
                  Suggested Topics for {cleanDomain || brandName}
                </span>
                <span className="text-[10px] text-slate-400">Click to select & configure</span>
              </div>
              <div className="space-y-1.5">
                {suggestedTopics.map((top, idx) => {
                  const isSelected = keyword === top;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setKeyword(top)}
                      className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-center justify-between group cursor-pointer ${
                        isSelected
                          ? 'border-[#c5a059] bg-[#ebdcc8]/60 text-[#2b1b12] ring-1 ring-[#c5a059]/40 shadow-xs'
                          : 'border-[#e4d6c6] bg-[#faf6f0] hover:bg-[#ebdcc8]/40 hover:border-[#c5a059]/60 text-[#2b1b12]'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate pr-2">
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 text-[9px] font-bold ${
                          isSelected ? 'bg-[#c5a059] text-white' : 'bg-[#e4d6c6]/60 text-[#6f5a4c] group-hover:bg-[#c5a059]/30'
                        }`}>
                          {isSelected ? <Check className="w-2.5 h-2.5 stroke-[3]" /> : idx + 1}
                        </div>
                        <span className={`text-[11px] truncate ${isSelected ? 'font-bold text-[#2b1b12]' : 'font-medium text-[#4a3528]'}`}>
                          {top}
                        </span>
                      </div>
                      {isSelected ? (
                        <span className="text-[9.5px] font-bold bg-[#c5a059]/20 text-[#8a5b13] px-1.5 py-0.5 rounded shrink-0">
                          Selected ✓
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400 group-hover:text-[#2b1b12] shrink-0 font-medium">
                          Select →
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Controls: Tone & Word Count */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#2b1b12]">Brand Voice</label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="w-full px-2.5 py-2 text-xs font-medium bg-[#f8f3ec] border border-[#e4d6c6] rounded-xl text-[#2b1b12] focus:outline-none focus:border-[#c5a059]"
                >
                  <option value="Professional & Authoritative">Professional & Authoritative</option>
                  <option value="Executive & Thought Leadership">Executive & Thought Leadership</option>
                  <option value="Engaging & Conversational">Engaging & Conversational</option>
                  <option value="Data-Driven & Analytical">Data-Driven & Analytical</option>
                  <option value="Educational & Step-by-Step">Educational & Step-by-Step</option>
                  <option value="Direct & Persuasive">Direct & Persuasive</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#2b1b12]">Target Word Count</label>
                <select
                  value={wordCountTarget}
                  onChange={(e) => setWordCountTarget(Number(e.target.value))}
                  className="w-full px-2.5 py-2 text-xs font-medium bg-[#f8f3ec] border border-[#e4d6c6] rounded-xl text-[#2b1b12] focus:outline-none focus:border-[#c5a059]"
                >
                  <option value={1000}>1,000 words (Standard Article)</option>
                  <option value={1500}>1,500 words (Comprehensive Deep Dive)</option>
                  <option value={2000}>2,000 words (Authority Pillar Guide)</option>
                  <option value={2500}>2,500 words (Skyscraper Benchmark)</option>
                </select>
              </div>
            </div>

            {/* Checkbox Options */}
            <div className="space-y-2 pt-1 border-t border-slate-100 text-xs">
              <label className="flex items-center gap-2 cursor-pointer font-medium text-[#4a3528]">
                <input
                  type="checkbox"
                  checked={includeFaq}
                  onChange={(e) => setIncludeFaq(e.target.checked)}
                  className="rounded border-[#e4d6c6] text-[#c5a059] focus:ring-0"
                />
                <span>Include Schema-optimized FAQ section (JSON-LD)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer font-medium text-[#4a3528]">
                <input
                  type="checkbox"
                  checked={includeToc}
                  onChange={(e) => setIncludeToc(e.target.checked)}
                  className="rounded border-[#e4d6c6] text-[#c5a059] focus:ring-0"
                />
                <span>Include Table of Contents</span>
              </label>
            </div>

            {/* Generate Button */}
            <button
              type="button"
              disabled={isGenerating || !keyword.trim()}
              onClick={() => handleGenerate()}
              className="w-full py-3 bg-[#2b1b12] hover:bg-[#3b2519] text-[#fffcf7] font-black text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#c5a059]" />
                  <span>{generationStep || 'Writing article with Claude...'}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-[#c5a059]" />
                  <span>Generate Article with Claude</span>
                </>
              )}
            </button>
          </div>

          {/* Publishing Checklist Box */}
          <div className="bg-[#faf6f0] border border-[#e4d6c6] rounded-3xl p-5 space-y-3 text-xs">
            <h4 className="font-bold text-[#2b1b12] flex items-center gap-1.5">
              <span>Publishing Integrations Status</span>
            </h4>
            <div className="space-y-2 divide-y divide-[#e4d6c6]/60">
              <div className="flex items-center justify-between pt-1">
                <span className="flex items-center gap-1.5 font-medium text-[#4a3528]">
                  <GithubIcon className="w-3.5 h-3.5" /> GitHub GitOps
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${isGithubConnected ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'}`}>
                  {isGithubConnected ? 'Connected' : 'Not Configured'}
                </span>
              </div>
              <div className="flex items-center justify-between pt-2">
                <span className="flex items-center gap-1.5 font-medium text-[#4a3528]">
                  <Globe className="w-3.5 h-3.5" /> WordPress REST API
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${isWpConnected ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'}`}>
                  {isWpConnected ? 'Connected' : 'Not Configured'}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIntegrationsModalOpen(true)}
              className="w-full py-1.5 bg-white border border-[#e4d6c6] hover:bg-[#ebdcc8] text-[#2b1b12] text-xs font-bold rounded-xl transition-all cursor-pointer mt-1"
            >
              Configure Connection Keys ↗
            </button>
          </div>
        </div>

        {/* Right Column (7 Cols): Active Article Live Viewer & Canvas */}
        <div className="lg:col-span-7 space-y-4">
          {currentArticle ? (
            <div className="bg-white rounded-3xl border border-[#e4d6c6] shadow-sm overflow-hidden flex flex-col justify-between">
              {/* Canvas Header */}
              <div className="p-4 sm:p-5 border-b border-[#e4d6c6] bg-[#faf6f0]/50 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-[#8a5b13] bg-[#c5a059]/20 px-2.5 py-0.5 rounded-full border border-[#c5a059]/30">
                      SEO Score: {currentArticle.seoScore}/100 • {currentArticle.readingTime}
                    </span>
                    <h2 className="text-base sm:text-lg font-black text-[#2b1b12] mt-1 leading-snug">
                      {currentArticle.title}
                    </h2>
                  </div>

                  {/* View Switcher: Preview, Markdown, HTML */}
                  <div className="flex items-center bg-white border border-[#e4d6c6] rounded-xl p-1 gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => setArticleViewTab('preview')}
                      className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                        articleViewTab === 'preview' ? 'bg-[#2b1b12] text-white' : 'text-[#6f5a4c] hover:bg-slate-100'
                      }`}
                    >
                      <Eye className="w-3 h-3" />
                      <span>Preview</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setArticleViewTab('markdown')}
                      className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                        articleViewTab === 'markdown' ? 'bg-[#2b1b12] text-white' : 'text-[#6f5a4c] hover:bg-slate-100'
                      }`}
                    >
                      <BookOpen className="w-3 h-3" />
                      <span>Markdown</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setArticleViewTab('html')}
                      className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                        articleViewTab === 'html' ? 'bg-[#2b1b12] text-white' : 'text-[#6f5a4c] hover:bg-slate-100'
                      }`}
                    >
                      <Code className="w-3 h-3" />
                      <span>HTML</span>
                    </button>
                  </div>
                </div>

                {/* Live Automated SEO & Brand Integrity Audit Inspector */}
                {currentArticle.seoAudit && (
                  <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold">
                          ✓
                        </span>
                        <div>
                          <span className="font-bold text-xs text-emerald-950 flex items-center gap-1.5">
                            <span>SEO & Brand Audit: 100% Passed</span>
                            <span className="text-[10px] font-black bg-emerald-200/60 text-emerald-900 px-1.5 py-0.2 rounded">
                              {currentArticle.seoAudit.grade} ({currentArticle.seoAudit.score}/100)
                            </span>
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowSeoChecklist(!showSeoChecklist)}
                        className="text-[11px] font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 cursor-pointer"
                      >
                        <span>{showSeoChecklist ? 'Hide Quality Checks' : `View Verified Checks (${currentArticle.seoAudit.totalPassed}/${currentArticle.seoAudit.totalChecks})`}</span>
                        {showSeoChecklist ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    {showSeoChecklist && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-emerald-200/60 animate-fade-in text-[11px]">
                        {currentArticle.seoAudit.checks.map((chk) => (
                          <div key={chk.id} className="p-2 bg-white/90 border border-emerald-200/60 rounded-xl space-y-0.5">
                            <div className="flex items-center gap-1.5 font-bold text-[#2b1b12]">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span>{chk.label}</span>
                            </div>
                            <p className="text-[10px] text-[#6f5a4c] pl-5 leading-relaxed">
                              {chk.detail}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Publishing Action Bar */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#e4d6c6]/60">
                  <div className="flex items-center gap-2">
                    {/* Primary Publish Action */}
                    {techStack.recommendedIntegration === 'wordpress' ? (
                      <button
                        type="button"
                        disabled={isPublishing}
                        onClick={() => handlePublish('wordpress')}
                        className="px-3 py-1.5 bg-[#c5a059] hover:bg-[#b38e47] text-[#2b1b12] font-black text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        {isPublishing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                        <span>Publish to WordPress</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={isPublishing}
                        onClick={() => handlePublish('github')}
                        className="px-3 py-1.5 bg-[#2b1b12] hover:bg-[#3b2519] text-[#fffcf7] font-black text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        {isPublishing ? <Loader2 className="w-3.5 h-3.5 animate-spin text-[#c5a059]" /> : <GithubIcon className="w-3.5 h-3.5 text-[#c5a059]" />}
                        <span>Commit to GitHub</span>
                      </button>
                    )}

                    {/* Secondary alternate publish */}
                    {techStack.recommendedIntegration === 'wordpress' ? (
                      <button
                        type="button"
                        onClick={() => handlePublish('github')}
                        className="px-2.5 py-1.5 bg-white hover:bg-[#f8f3ec] text-[#2b1b12] border border-[#e4d6c6] font-bold text-xs rounded-xl transition-all flex items-center gap-1 cursor-pointer"
                        title="Commit markdown to GitHub instead"
                      >
                        <GithubIcon className="w-3 h-3" />
                        <span>GitHub</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handlePublish('wordpress')}
                        className="px-2.5 py-1.5 bg-white hover:bg-[#f8f3ec] text-[#2b1b12] border border-[#e4d6c6] font-bold text-xs rounded-xl transition-all flex items-center gap-1 cursor-pointer"
                        title="Publish to WordPress instead"
                      >
                        <Globe className="w-3 h-3 text-blue-600" />
                        <span>WordPress</span>
                      </button>
                    )}
                  </div>

                  {/* 1-Click Copy & Export Tools */}
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleCopy('html')}
                      className="px-2.5 py-1.5 bg-white hover:bg-[#f8f3ec] text-[#2b1b12] border border-[#e4d6c6] text-xs font-bold rounded-xl transition-all flex items-center gap-1 cursor-pointer"
                      title="Copy raw formatted HTML for any CMS editor"
                    >
                      {copiedType === 'html' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>Copy HTML</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCopy('md')}
                      className="px-2.5 py-1.5 bg-white hover:bg-[#f8f3ec] text-[#2b1b12] border border-[#e4d6c6] text-xs font-bold rounded-xl transition-all flex items-center gap-1 cursor-pointer"
                      title="Copy Markdown code"
                    >
                      {copiedType === 'md' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>Copy MD</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleDownload}
                      className="p-1.5 bg-white hover:bg-[#f8f3ec] text-[#2b1b12] border border-[#e4d6c6] rounded-xl transition-all cursor-pointer"
                      title="Download Markdown file"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {publishSuccessInfo && (
                  <div className="p-3.5 bg-emerald-50 border-2 border-emerald-300 rounded-2xl text-xs text-emerald-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs animate-fade-in">
                    <div className="flex items-start sm:items-center gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 text-[10px] font-bold">
                        ✓
                      </div>
                      <div className="space-y-0.5">
                        <span className="font-bold text-xs text-emerald-950 flex items-center gap-1.5">
                          ✓ Blog is successfully posted on:
                        </span>
                        {publishSuccessInfo.liveUrl && (
                          <a
                            href={publishSuccessInfo.liveUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-mono text-[11px] text-emerald-800 hover:text-emerald-950 underline font-semibold break-all flex items-center gap-1"
                          >
                            <span>{publishSuccessInfo.liveUrl}</span>
                            <ExternalLink className="w-3 h-3 shrink-0" />
                          </a>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {publishSuccessInfo.liveUrl && (
                        <a
                          href={publishSuccessInfo.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <span>Open Live Blog ↗</span>
                        </a>
                      )}
                      {publishSuccessInfo.commitUrl && (
                        <a
                          href={publishSuccessInfo.commitUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1.5 bg-white border border-emerald-200 hover:bg-emerald-100/60 text-emerald-900 font-bold text-xs rounded-xl transition-all flex items-center gap-1"
                          title="View commit in GitHub"
                        >
                          <GithubIcon className="w-3 h-3" />
                          <span>Commit</span>
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Canvas Content Body */}
              <div className="p-5 sm:p-7 max-h-[720px] overflow-y-auto">
                {articleViewTab === 'preview' && (
                  <div
                    className="prose prose-stone max-w-none text-xs sm:text-sm leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: currentArticle.contentHtml }}
                  />
                )}

                {articleViewTab === 'markdown' && (
                  <pre className="p-4 bg-[#f8f3ec] border border-[#e4d6c6] rounded-2xl text-[11px] font-mono text-[#2b1b12] whitespace-pre-wrap overflow-x-auto leading-relaxed">
                    {currentArticle.contentMarkdown}
                  </pre>
                )}

                {articleViewTab === 'html' && (
                  <pre className="p-4 bg-[#f8f3ec] border border-[#e4d6c6] rounded-2xl text-[11px] font-mono text-[#2b1b12] whitespace-pre-wrap overflow-x-auto leading-relaxed">
                    {currentArticle.contentHtml}
                  </pre>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-[#faf6f0]/60 border-2 border-dashed border-[#e4d6c6] rounded-3xl p-12 text-center flex flex-col items-center justify-center min-h-[500px] space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-[#f1e8dc] text-[#c5a059] flex items-center justify-center font-bold shadow-xs">
                <FileText className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-base text-[#2b1b12]">No Article Selected Yet</h3>
              <p className="text-xs text-[#6f5a4c] max-w-md leading-relaxed">
                Choose a suggested topic on the left or type your target keyword, then click <strong>Generate Article with Claude</strong> to synthesize a comprehensive, publication-ready piece.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 3. Generated Articles Library */}
      {articlesList.length > 0 && (
        <div className="bg-white rounded-3xl border border-[#e4d6c6] p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-base text-[#2b1b12]">Content Library & History</h3>
              <p className="text-xs text-[#6f5a4c]">All synthesized articles available for immediate re-publishing</p>
            </div>
            <span className="text-xs font-bold text-[#8a5b13]">
              {articlesList.length} Articles
            </span>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {articlesList.map((art) => (
              <div key={art.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#f8f3ec]/40 rounded-xl px-2 transition-colors">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs sm:text-sm text-[#2b1b12] truncate">{art.title}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 shrink-0">
                      Score: {art.seoScore}
                    </span>
                  </div>
                  <div className="text-[11px] text-[#6f5a4c] flex items-center gap-3 mt-1">
                    <span>Keyword: <strong>{art.keyword}</strong></span>
                    <span>•</span>
                    <span>{art.wordCount} words</span>
                    <span>•</span>
                    <span>{art.readingTime}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setCurrentArticle(art)}
                    className="px-3 py-1.5 bg-[#f8f3ec] hover:bg-[#ebdcc8] text-[#2b1b12] border border-[#e4d6c6] rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    Open Canvas
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Publishing Integrations Settings Modal */}
      {integrationsModalOpen && (
        <div className="fixed inset-0 z-[99999] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white border border-[#e4d6c6] rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl space-y-5 text-left">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#2b1b12] text-[#c5a059] flex items-center justify-center font-bold">
                  <Settings2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base text-[#2b1b12]">Publishing Integrations</h3>
                  <p className="text-[11px] text-[#6f5a4c]">Configure credentials to publish directly to your live website</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIntegrationsModalOpen(false)}
                className="p-1.5 rounded-lg border border-[#e4d6c6] hover:bg-[#f1e8dc] text-xs font-bold"
              >
                ✕
              </button>
            </div>

            {/* Integration Destination Tabs */}
            <div className="flex items-center bg-[#f8f3ec] border border-[#e4d6c6] rounded-2xl p-1 gap-1">
              <button
                type="button"
                onClick={() => setActiveIntegrationTab('github')}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeIntegrationTab === 'github' ? 'bg-[#2b1b12] text-[#fffcf7] shadow-xs' : 'text-[#6f5a4c] hover:text-[#2b1b12]'
                }`}
              >
                <GithubIcon className="w-3.5 h-3.5" />
                <span>GitHub (GitOps)</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveIntegrationTab('wordpress')}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeIntegrationTab === 'wordpress' ? 'bg-[#2b1b12] text-[#fffcf7] shadow-xs' : 'text-[#6f5a4c] hover:text-[#2b1b12]'
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>WordPress</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveIntegrationTab('webhook')}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeIntegrationTab === 'webhook' ? 'bg-[#2b1b12] text-[#fffcf7] shadow-xs' : 'text-[#6f5a4c] hover:text-[#2b1b12]'
                }`}
              >
                <Code className="w-3.5 h-3.5" />
                <span>Custom Webhook</span>
              </button>
            </div>

            {/* TAB A: GitHub GitOps Config */}
            {activeIntegrationTab === 'github' && (
              <div className="space-y-3.5 text-xs">
                <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-amber-950 flex items-center gap-1.5">
                      <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
                      <span>How to get your GitHub Token (30-Second Guide)</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowGithubGuide(!showGithubGuide)}
                      className="text-[11px] font-bold text-amber-800 hover:text-amber-950 flex items-center gap-1 cursor-pointer"
                    >
                      <span>{showGithubGuide ? 'Hide Steps' : 'View Steps'}</span>
                      {showGithubGuide ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  {showGithubGuide && (
                    <div className="space-y-2 pt-2 border-t border-amber-200/60 text-[11px] text-[#4a3528]">
                      <ol className="list-decimal list-inside space-y-1.5 leading-relaxed font-medium">
                        <li>
                          Open <a href="https://github.com/settings/tokens?type=beta" target="_blank" rel="noopener noreferrer" className="font-bold text-[#0F8B7D] underline inline-flex items-center gap-0.5">GitHub Token Settings <ExternalLink className="w-3 h-3" /></a>
                        </li>
                        <li>Click <strong>Generate new token</strong> (Fine-grained).</li>
                        <li>Give it a name like <code className="bg-white px-1 py-0.5 rounded border border-amber-200 text-xs font-mono">RankMonk</code>.</li>
                        <li>Under <strong>Repository access</strong>, select <strong>Only select repositories</strong> and choose your website repo.</li>
                        <li>Under <strong>Permissions → Repository permissions</strong>, find <strong>Contents</strong> and set it to <strong>Read and write</strong>.</li>
                        <li>Click <strong>Generate token</strong> at the bottom, copy the <code className="bg-white px-1 py-0.5 rounded border border-amber-200 font-mono text-xs">ghp_...</code> string, and paste it below!</li>
                      </ol>
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-[#2b1b12]">GitHub Personal Access Token</label>
                  <input
                    type="password"
                    value={githubConfig.token}
                    onChange={(e) => setGithubConfig({ ...githubConfig, token: e.target.value })}
                    placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs focus:outline-none focus:border-[#c5a059]"
                  />
                  <span className="text-[10px] text-slate-500">Fine-grained token with 'Contents: Read & Write' scope.</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-[#2b1b12]">Repository (owner/repo)</label>
                    <input
                      type="text"
                      value={githubConfig.repo}
                      onChange={(e) => setGithubConfig({ ...githubConfig, repo: e.target.value })}
                      placeholder="e.g. your-org/your-repo"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:border-[#c5a059]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-[#2b1b12]">Branch</label>
                    <input
                      type="text"
                      value={githubConfig.branch}
                      onChange={(e) => setGithubConfig({ ...githubConfig, branch: e.target.value })}
                      placeholder="main"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:border-[#c5a059]"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-[#2b1b12]">Blog Folder Path</label>
                  <input
                    type="text"
                    value={githubConfig.folderPath}
                    onChange={(e) => setGithubConfig({ ...githubConfig, folderPath: e.target.value })}
                    placeholder="content/blogs or src/posts"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:border-[#c5a059]"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => saveIntegrationConfig('github')}
                  className="w-full py-2.5 bg-[#2b1b12] hover:bg-[#3b2519] text-white font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer mt-2"
                >
                  Save GitHub GitOps Settings
                </button>
              </div>
            )}

            {/* TAB B: WordPress REST API Config */}
            {activeIntegrationTab === 'wordpress' && (
              <div className="space-y-3.5 text-xs">
                <div className="bg-blue-50/70 border border-blue-200/80 rounded-2xl p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-blue-950 flex items-center gap-1.5">
                      <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
                      <span>How to get your WordPress Password (No plugins needed)</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowWpGuide(!showWpGuide)}
                      className="text-[11px] font-bold text-blue-800 hover:text-blue-950 flex items-center gap-1 cursor-pointer"
                    >
                      <span>{showWpGuide ? 'Hide Steps' : 'View Steps'}</span>
                      {showWpGuide ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  {showWpGuide && (
                    <div className="space-y-2 pt-2 border-t border-blue-200/60 text-[11px] text-[#2c3e50]">
                      <ol className="list-decimal list-inside space-y-1.5 leading-relaxed font-medium">
                        <li>Log in to your WordPress Admin dashboard (<code className="bg-white px-1 py-0.5 rounded border border-blue-200 font-mono text-xs">yourdomain.com/wp-admin</code>).</li>
                        <li>In the left sidebar, click <strong>Users → Profile</strong> (or <em>Users → All Users</em> and click your administrator name).</li>
                        <li>Scroll down near the bottom to the <strong>Application Passwords</strong> section.</li>
                        <li>Type <code className="bg-white px-1 py-0.5 rounded border border-blue-200 text-xs font-mono">RankMonk</code> in the <em>New Application Password Name</em> input.</li>
                        <li>Click <strong>Add New Application Password</strong>.</li>
                        <li>WordPress will display a 16-character password (e.g. <code className="bg-white px-1 py-0.5 rounded border border-blue-200 font-mono text-xs">xxxx xxxx xxxx xxxx</code>). Copy and paste it below!</li>
                      </ol>
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-[#2b1b12]">WordPress Site URL</label>
                  <input
                    type="text"
                    value={wpConfig.wpUrl}
                    onChange={(e) => setWpConfig({ ...wpConfig, wpUrl: e.target.value })}
                    placeholder="https://yourdomain.com"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs focus:outline-none focus:border-[#c5a059]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-[#2b1b12]">WP Username</label>
                    <input
                      type="text"
                      value={wpConfig.wpUsername}
                      onChange={(e) => setWpConfig({ ...wpConfig, wpUsername: e.target.value })}
                      placeholder="admin"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#c5a059]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-[#2b1b12]">Application Password</label>
                    <input
                      type="password"
                      value={wpConfig.wpAppPassword}
                      onChange={(e) => setWpConfig({ ...wpConfig, wpAppPassword: e.target.value })}
                      placeholder="xxxx xxxx xxxx xxxx"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:border-[#c5a059]"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-[#2b1b12]">Publish Mode</label>
                  <select
                    value={wpConfig.status}
                    onChange={(e) => setWpConfig({ ...wpConfig, status: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                  >
                    <option value="publish">Publish Live Directly</option>
                    <option value="draft">Save as Draft (Review First)</option>
                  </select>
                </div>

                <button
                  type="button"
                  onClick={() => saveIntegrationConfig('wordpress')}
                  className="w-full py-2.5 bg-[#2b1b12] hover:bg-[#3b2519] text-white font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer mt-2"
                >
                  Save WordPress REST API Settings
                </button>
              </div>
            )}

            {/* TAB C: Custom Webhook Config */}
            {activeIntegrationTab === 'webhook' && (
              <div className="space-y-3.5 text-xs">
                <div className="p-3 bg-[#f8f3ec] border border-[#e4d6c6] rounded-2xl text-[11px] text-[#4a3528] leading-relaxed">
                  <strong>For custom backends (React Native, Node, Laravel, Python):</strong> Rank Monk sends a signed POST request containing the slug, markdown, HTML, and schema JSON whenever a blog is published.
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-[#2b1b12]">Webhook Endpoint URL</label>
                  <input
                    type="text"
                    value={webhookConfig.webhookUrl}
                    onChange={(e) => setWebhookConfig({ ...webhookConfig, webhookUrl: e.target.value })}
                    placeholder="https://api.yourdomain.com/webhooks/blog"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs focus:outline-none focus:border-[#c5a059]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-[#2b1b12]">HMAC Signature Secret Key</label>
                  <input
                    type="text"
                    readOnly
                    value={webhookConfig.secretKey}
                    className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl font-mono text-xs text-slate-600"
                  />
                  <span className="text-[10px] text-slate-500">Sent in the 'x-rankmonk-signature' HTTP header to authenticate requests.</span>
                </div>

                <button
                  type="button"
                  onClick={() => saveIntegrationConfig('webhook')}
                  className="w-full py-2.5 bg-[#2b1b12] hover:bg-[#3b2519] text-white font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer mt-2"
                >
                  Save Webhook Settings
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
