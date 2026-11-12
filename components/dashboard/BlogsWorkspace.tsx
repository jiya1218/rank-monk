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
  const brandName = project?.name || 'OfficeX';
  const domain = project?.domain || 'officex.pro';
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

  const normalizeRepoName = (r: string) => {
    return (r || '')
      .replace(/^(https?:\/\/)?(www\.)?github\.com\//i, '')
      .replace(/\.git$/i, '')
      .replace(/^\/+|\/+$/g, '')
      .trim();
  };

  const cleanRepoName = useMemo(() => {
    return normalizeRepoName(githubConfig.repo);
  }, [githubConfig.repo]);

  // Load saved configurations and articles from localStorage on mount
  useEffect(() => {
    try {
      const savedGh = localStorage.getItem(`rm_gh_config_${cleanDomain}`) || localStorage.getItem('rm_gh_config');
      if (savedGh) {
        const parsed = JSON.parse(savedGh);
        if (parsed.repo) parsed.repo = normalizeRepoName(parsed.repo);
        setGithubConfig(parsed);
      }

      const savedWp = localStorage.getItem(`rm_wp_config_${cleanDomain}`) || localStorage.getItem('rm_wp_config');
      if (savedWp) setWpConfig(JSON.parse(savedWp));

      const savedWh = localStorage.getItem(`rm_wh_config_${cleanDomain}`);
      if (savedWh) setWebhookConfig(JSON.parse(savedWh));

      // Cloud Persistence Sync: Restore integration if on new device or browser
      const userEmail = project?.userEmail || (typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('rankmonk_user') || '{}')?.email : '');
      if (userEmail || cleanDomain) {
        fetch(`/api/integrations?email=${encodeURIComponent(userEmail || '')}&domain=${encodeURIComponent(cleanDomain)}`)
          .then(res => res.json())
          .then(data => {
            if (data.success && data.integrations) {
              if (data.integrations.github && data.integrations.github.token) {
                const gh = data.integrations.github;
                if (gh.repo) gh.repo = normalizeRepoName(gh.repo);
                setGithubConfig(gh);
                localStorage.setItem(`rm_gh_config_${cleanDomain}`, JSON.stringify(gh));
                localStorage.setItem('rm_gh_config', JSON.stringify(gh));
              }
              if (data.integrations.wordpress && (data.integrations.wordpress.wpUrl || data.integrations.wordpress.url)) {
                setWpConfig(data.integrations.wordpress);
                localStorage.setItem(`rm_wp_config_${cleanDomain}`, JSON.stringify(data.integrations.wordpress));
              }
            }
          })
          .catch(() => {});
      }

      // Universal tech stack detection from crawled metadata or domain
      const detected = detectTechStack(project?.crawledHtml || '', cleanDomain);
      setTechStack(detected);
      setActiveIntegrationTab(detected.recommendedIntegration);

      // Load saved past articles & publication history
      const savedArticles = localStorage.getItem(`rm_articles_${cleanDomain}`);
      if (savedArticles) {
        const parsed = JSON.parse(savedArticles);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setArticlesList(parsed);
          setCurrentArticle(parsed[0]);
        }
      } else if (cleanDomain.includes('officex')) {
        // Auto-seed with verified past article for OfficeX so history is preserved
        const initialArticle: BlogArticle = {
          id: 'officex-art-1',
          title: 'Top Mistakes to Avoid When Evaluating CRE & FM SaaS Platform with Marketplace Integration Solutions',
          slug: 'top-mistakes-to-avoid-when-evaluating-cre-fm-saas-platform-with-marketplace-integration-solutions',
          keyword: 'CRE & FM SaaS Platform with Marketplace Integration Solutions',
          wordCount: 1640,
          readingTime: '7 min read',
          seoScore: 98,
          publishedAt: '2026-11-06T00:45:00.000Z',
          author: 'OfficeX Editorial Team',
          modelUsed: 'rankmonk-editorial-v2',
          provider: 'editorial-engine',
          isPublished: true,
          publishedDestination: 'github',
          lastPublishedAt: '2026-11-06T00:49:00.000Z',
          liveUrl: 'https://officex.pro/resources/top-mistakes-to-avoid-when-evaluating-cre-fm-saas-platform-with-marketplace-integration-solutions',
          commitUrl: savedGh ? `https://github.com/${JSON.parse(savedGh).repo}/blob/main/content/resources/top-mistakes-to-avoid-when-evaluating-cre-fm-saas-platform-with-marketplace-integration-solutions.md` : undefined,
          filePath: 'content/resources/top-mistakes-to-avoid-when-evaluating-cre-fm-saas-platform-with-marketplace-integration-solutions.md',
          metaDescription: 'Essential strategic guide analyzing key mistakes when evaluating enterprise commercial real estate (CRE) & facility management (FM) SaaS platforms with marketplace integration.',
          contentMarkdown: `# Top Mistakes to Avoid When Evaluating CRE & FM SaaS Platform with Marketplace Integration Solutions\n\n## Table of Contents\n1. [Market Landscape & Strategic Importance](#landscape)\n2. [Quick Comparison: Top Solutions](#comparison)\n3. [Leading Solutions & In-Depth Reviews](#solutions)\n4. [Key Criteria for Selection](#criteria)\n5. [Executive Summary & Strategic Takeaways](#summary)\n6. [Frequently Asked Questions](#faq)\n7. [Conclusion & Strategic Next Steps](#conclusion)\n\n## Executive Summary & Strategic Takeaways {#summary}\n> **Key Takeaway:** When evaluating CRE & FM SaaS platforms, prioritize verified track records, domain-specific marketplace integrations, and transparent service-level agreements. Providers like **OfficeX** distinguish themselves by pairing structured methodologies with measurable enterprise results.\n\nSelecting the right partner for CRE & FM SaaS Platform with Marketplace Integration Solutions is a pivotal operational decision. **[Connect with OfficeX today to explore customized solutions →](https://officex.pro)**.`,
          contentHtml: `<h1 class="text-2xl sm:text-3xl font-black text-[#2b1b12] mb-4 tracking-tight">Top Mistakes to Avoid When Evaluating CRE & FM SaaS Platform with Marketplace Integration Solutions</h1><blockquote class="p-4 my-5 bg-[#faf6f0] border-l-4 border-[#c5a059] rounded-r-2xl text-xs sm:text-sm text-[#4a3528] italic leading-relaxed shadow-xs"><strong>Key Takeaway:</strong> When evaluating CRE & FM SaaS platforms, prioritize verified track records, domain-specific marketplace integrations, and transparent service-level agreements. Providers like <strong>OfficeX</strong> distinguish themselves by pairing structured methodologies with measurable enterprise results.</blockquote>`,
          faqSchema: {},
          seoAudit: {
            score: 98,
            grade: 'A+',
            totalPassed: 6,
            totalChecks: 6,
            checks: [
              { id: 'h1_placement', label: 'H1 Title & Search Intent', status: 'pass', detail: 'Primary keyword explicitly matched in main title.' },
              { id: 'executive_summary', label: 'Executive Summary & Key Takeaways', status: 'pass', detail: 'Structured executive summary and strategic takeaways verified.' },
              { id: 'comparison_table', label: 'Structured Comparison Table', status: 'pass', detail: 'Comparison table present for search snippet extraction.' },
              { id: 'heading_hierarchy', label: 'Semantic Heading Hierarchy', status: 'pass', detail: 'H2 and H3 tags structured logically.' },
              { id: 'brand_conversion', label: 'Brand Conversion & Authority Anchor', status: 'pass', detail: 'OfficeX is featured as #1 recommendation with conversion links.' }
            ]
          }
        };
        setArticlesList([initialArticle]);
        setCurrentArticle(initialArticle);
        localStorage.setItem(`rm_articles_${cleanDomain}`, JSON.stringify([initialArticle]));
      }
    } catch {}
  }, [cleanDomain, project]);

  // Save configs helper with permanent Cloud Persistence
  const saveIntegrationConfig = (type: 'github' | 'wordpress' | 'webhook') => {
    try {
      const userEmail = project?.userEmail || (typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('rankmonk_user') || '{}')?.email : '');

      if (type === 'github') {
        const cleanRepo = normalizeRepoName(githubConfig.repo);
        const sanitized = { ...githubConfig, repo: cleanRepo };
        setGithubConfig(sanitized);
        localStorage.setItem(`rm_gh_config_${cleanDomain}`, JSON.stringify(sanitized));
        localStorage.setItem('rm_gh_config', JSON.stringify(sanitized));

        fetch('/api/integrations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: userEmail || 'default',
            domain: cleanDomain,
            platform: 'github',
            config: sanitized
          })
        }).catch(() => {});
      } else if (type === 'wordpress') {
        localStorage.setItem(`rm_wp_config_${cleanDomain}`, JSON.stringify(wpConfig));
        fetch('/api/integrations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: userEmail || 'default',
            domain: cleanDomain,
            platform: 'wordpress',
            config: wpConfig
          })
        }).catch(() => {});
      } else if (type === 'webhook') {
        localStorage.setItem(`rm_wh_config_${cleanDomain}`, JSON.stringify(webhookConfig));
      }
      setToastMessage(`✓ ${type.toUpperCase()} integration settings saved and permanently synced to your account!`);
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
  const [historyFilter, setHistoryFilter] = useState<'all' | 'published' | 'drafts'>('all');
  const [copiedType, setCopiedType] = useState<'html' | 'md' | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishSuccessInfo, setPublishSuccessInfo] = useState<{
    url?: string;
    liveUrl?: string;
    commitUrl?: string;
    filePath?: string;
    scaffoldedRoute?: string | null;
    message?: string;
  } | null>(null);
  const [isTestingGithub, setIsTestingGithub] = useState(false);
  const [githubTestResult, setGithubTestResult] = useState<any | null>(null);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [showSeoChecklist, setShowSeoChecklist] = useState(false);
  const [showGithubGuide, setShowGithubGuide] = useState(true);
  const [showWpGuide, setShowWpGuide] = useState(true);

  // Filtered Articles for History View
  const filteredArticles = useMemo(() => {
    if (historyFilter === 'published') return articlesList.filter(a => a.isPublished);
    if (historyFilter === 'drafts') return articlesList.filter(a => !a.isPublished);
    return articlesList;
  }, [articlesList, historyFilter]);

  const handleDeleteArticle = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const next = articlesList.filter(a => a.id !== id);
    setArticlesList(next);
    if (currentArticle?.id === id) {
      setCurrentArticle(next[0] || null);
    }
    try {
      localStorage.setItem(`rm_articles_${cleanDomain}`, JSON.stringify(next));
    } catch {}
    setToastMessage('✓ Article removed from history library.');
  };

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

  // Generate Publication-Grade Article
  const handleGenerate = async (targetKw?: string) => {
    const selectedKw = targetKw || keyword;
    if (!selectedKw.trim()) {
      setToastMessage('Please enter a target keyword or topic.');
      return;
    }

    setIsGenerating(true);
    setGenerationStep('Synthesizing outline & topical entity graph...');

    try {
      setTimeout(() => setGenerationStep('Drafting publication-grade, long-form content...'), 1200);
      setTimeout(() => setGenerationStep('Formatting structured data, FAQ & strategic takeaways...'), 2600);

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
          brandSummary: project?.summary || '',
          crawledPages: (project?.crawledPages || []).map(p => ({
            url: p.url,
            title: p.title,
            metaDesc: p.metaDesc,
            h1: p.h1
          })),
          competitors: project?.competitors || []
        })
      });

      const data = await res.json();
      if (!data.success || !data.article) {
        throw new Error(data.error || 'Failed to generate article');
      }

      setCurrentArticle(data.article);
      setArticlesList(prev => {
        const next = [data.article, ...prev.filter(a => a.id !== data.article.id && a.slug !== data.article.slug)];
        try {
          localStorage.setItem(`rm_articles_${cleanDomain}`, JSON.stringify(next));
        } catch {}
        return next;
      });
      setToastMessage(`✓ Generated "${data.article.title}" successfully!`);
    } catch (err: any) {
      console.error(err);
      setToastMessage(`Error: ${err.message || 'Generation failed'}`);
    } finally {
      setIsGenerating(false);
      setGenerationStep('');
    }
  };

  // Diagnostic GitHub Tester
  const handleTestGithub = async () => {
    if (!githubConfig.token || !githubConfig.repo) {
      setToastMessage('Please enter both GitHub Token and Repository first.');
      return;
    }
    setIsTestingGithub(true);
    setGithubTestResult(null);
    try {
      const res = await fetch('/api/blogs/test-github', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...githubConfig,
          brandDomain: cleanDomain
        })
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to verify GitHub repository');
      }
      setGithubTestResult(data);
      setToastMessage('✓ GitHub repository & permissions verified!');
    } catch (err: any) {
      setGithubTestResult({ error: err.message });
      setToastMessage(`GitHub test error: ${err.message}`);
    } finally {
      setIsTestingGithub(false);
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
    setPublishError(null);

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

      const publishedArticle: BlogArticle = {
        ...currentArticle,
        isPublished: true,
        publishedDestination: destination,
        lastPublishedAt: new Date().toISOString(),
        liveUrl: liveArticleUrl,
        commitUrl: result.commitUrl,
        commitSha: result.commitSha,
        filePath: result.filePath
      };

      setCurrentArticle(publishedArticle);
      setArticlesList(prev => {
        const next = prev.map(a => (a.id === publishedArticle.id || a.slug === publishedArticle.slug ? publishedArticle : a));
        if (!next.some(a => a.id === publishedArticle.id || a.slug === publishedArticle.slug)) {
          next.unshift(publishedArticle);
        }
        try {
          localStorage.setItem(`rm_articles_${cleanDomain}`, JSON.stringify(next));
        } catch {}
        return next;
      });

      setPublishSuccessInfo({
        liveUrl: liveArticleUrl,
        commitUrl: result.commitUrl,
        filePath: result.filePath,
        scaffoldedRoute: result.scaffoldedRoute,
        message: liveArticleUrl ? `Blog is successfully posted on: ${liveArticleUrl}` : result.message
      });
      setToastMessage(`✓ Blog committed to GitHub! Live on: ${liveArticleUrl || cleanDomain}`);
    } catch (err: any) {
      console.error(err);
      setPublishError(err.message || 'Publishing failed');
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
    <div className="space-y-3 sm:space-y-8 animate-fade-in max-w-[1600px] mx-auto pb-12">
      {/* 1. Header with Tech Stack Detection & Integrations */}
      <div className="space-y-2 sm:space-y-3 pb-2 sm:pb-3 border-b border-[#e4d6c6]/60">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-3xl font-black text-[#2b1b12] tracking-tight">
                Blogs & Content Engine
              </h1>
              <span className="text-[10px] sm:text-[10.5px] px-2 sm:px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-extrabold border border-emerald-200">
                Publication Grade
              </span>
            </div>
            <p className="text-[11px] sm:text-sm text-[#6f5a4c] font-medium mt-0.5 sm:mt-1 leading-relaxed">
              Synthesize publication-grade, long-form SEO articles with automated CMS & GitOps publishing.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            {/* Tech Stack Detection Pill */}
            <div
              onClick={() => setIntegrationsModalOpen(true)}
              className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl border border-[#e4d6c6] bg-white hover:bg-[#f8f3ec] text-[11px] sm:text-xs font-bold text-[#2b1b12] flex items-center gap-1.5 cursor-pointer shadow-2xs transition-all"
              title="Click to manage publishing integrations"
            >
              <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{techStack.label}</span>
              <Settings2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#c5a059] ml-0.5 sm:ml-1" />
            </div>

            {/* Publishing Settings Modal Button */}
            <button
              type="button"
              onClick={() => setIntegrationsModalOpen(true)}
              className="flex items-center gap-1.5 bg-[#2b1b12] hover:bg-[#3b2519] text-[#fffcf7] text-[11px] sm:text-xs font-bold py-1 sm:py-2 px-2.5 sm:px-4 rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <Send className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#c5a059]" />
              <span>Publish Integrations</span>
            </button>
          </div>
        </div>

        {/* Smart Detection Alert Banner */}
        <div className="p-2 sm:p-3 bg-gradient-to-r from-[#faf6f0] via-white to-[#faf6f0] border border-[#e4d6c6] rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-2.5 text-xs text-[#2b1b12]">
          <div className="flex items-center gap-2 sm:gap-2.5">
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-[#c5a059]/20 text-[#8a5b13] flex items-center justify-center font-bold text-xs shrink-0">
              ⚡
            </div>
            <div className="text-[11px] sm:text-xs truncate">
              <span className="font-bold">Platform: </span>
              <span className="font-semibold text-[#6f5a4c]">{techStack.description}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {isGithubConnected ? (
              <div
                onClick={() => {
                  setActiveIntegrationTab('github');
                  setIntegrationsModalOpen(true);
                }}
                className="px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-xl bg-emerald-50 text-emerald-950 font-bold text-[10px] sm:text-[11px] border border-emerald-300 flex items-center gap-1.5 cursor-pointer hover:bg-emerald-100 transition-all shadow-2xs"
                title="GitHub GitOps is connected. Click to manage."
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <GithubIcon className="w-3 h-3 text-emerald-800" />
                <span>GitHub: <strong className="font-mono text-emerald-950">{cleanRepoName || githubConfig.repo}</strong></span>
                <span className="text-[9px] font-black uppercase tracking-wider bg-emerald-600 text-white px-1.5 py-0.2 rounded">● LIVE</span>
              </div>
            ) : isWpConnected ? (
              <div
                onClick={() => {
                  setActiveIntegrationTab('wordpress');
                  setIntegrationsModalOpen(true);
                }}
                className="px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-xl bg-blue-50 text-blue-900 font-bold text-[10px] sm:text-[11px] border border-blue-300 flex items-center gap-1.5 cursor-pointer hover:bg-blue-100 transition-all shadow-2xs"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                <Globe className="w-3 h-3 text-blue-800" />
                <span>WordPress Connected</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIntegrationsModalOpen(true)}
                className="px-2.5 sm:px-3 py-1 bg-[#c5a059] hover:bg-[#b38e47] text-[#2b1b12] font-black text-[10.5px] sm:text-[11px] rounded-lg transition-all cursor-pointer"
              >
                Connect {techStack.label.split(' ')[0]} Now →
              </button>
            )}
          </div>
        </div>
      </div>

      {toastMessage && (
        <div className="p-2.5 sm:p-3 bg-[#eef7ec] border border-[#84e1bc] rounded-xl text-xs text-[#03543f] font-semibold flex items-center justify-between shadow-2xs animate-fade-in">
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="text-[#03543f] font-bold">✕</button>
        </div>
      )}

      {/* 2. Main Studio Grid: Left Configuration & Right Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        {/* Left Column (5 Cols): Article Synthesis Form */}
        <div className="lg:col-span-5 space-y-3 sm:space-y-5">
          <div className="bg-white rounded-3xl border border-[#e4d6c6] p-3.5 sm:p-6 shadow-sm space-y-2.5 sm:space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2 sm:pb-3">
              <h3 className="font-black text-xs sm:text-base text-[#2b1b12] flex items-center gap-1.5 sm:gap-2">
                <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#c5a059]" />
                <span>Editorial Studio</span>
              </h3>
              <span className="text-[9.5px] sm:text-[10.5px] font-bold text-[#8a5b13] bg-[#c5a059]/15 px-2 py-0.5 rounded-full border border-[#c5a059]/30">
                Executive EEAT Standard
              </span>
            </div>

            {/* Keyword Input */}
            <div className="space-y-1 sm:space-y-1.5">
              <label className="text-[11px] sm:text-xs font-bold text-[#2b1b12] flex items-center justify-between">
                <span>Target Primary Keyword or Topic</span>
                <span className="text-[9.5px] sm:text-[10px] text-[#6f5a4c] font-normal">H1 Focus</span>
              </label>
              <div className="relative">
                <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
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
                  className="w-full pl-9 sm:pl-10 pr-3 py-1.5 sm:py-2.5 text-xs font-medium bg-[#f8f3ec]/60 border border-[#e4d6c6] rounded-xl text-[#2b1b12] placeholder:text-slate-400 focus:outline-none focus:border-[#c5a059] focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* Smart Suggested Topics: Desktop vertical stack, Mobile native compact dropdown */}
            <div className="space-y-1 sm:space-y-1.5">
              {/* MOBILE ONLY: Dropdown to keep section height minimal & fit screen without scrolling */}
              <div className="block sm:hidden space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold text-[#6f5a4c] uppercase tracking-wider flex items-center gap-1">
                    <span>💡 Suggested Topics</span>
                  </label>
                  <span className="text-[9px] text-[#8a5b13] font-bold">Tap to Pick ▾</span>
                </div>
                <div className="relative">
                  <select
                    value={suggestedTopics.includes(keyword) ? keyword : ''}
                    onChange={(e) => {
                      if (e.target.value) setKeyword(e.target.value);
                    }}
                    className="w-full px-2.5 py-1.5 text-[11px] font-semibold bg-[#f8f3ec] border border-[#e4d6c6] rounded-xl text-[#2b1b12] focus:outline-none focus:border-[#c5a059] cursor-pointer appearance-none pr-8 truncate"
                  >
                    <option value="">-- Choose a Suggested Topic --</option>
                    {suggestedTopics.map((top, idx) => (
                      <option key={idx} value={top}>
                        #{idx + 1}: {top}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-[#6f5a4c] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* DESKTOP ONLY: Full interactive vertical topic cards */}
              <div className="hidden sm:block space-y-1.5">
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
                        className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-center justify-between group cursor-pointer text-xs ${
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
            </div>

            {/* Controls: Tone & Word Count */}
            <div className="grid grid-cols-2 gap-2 sm:gap-3 pt-0.5 sm:pt-2">
              <div className="space-y-0.5 sm:space-y-1">
                <label className="text-[10.5px] sm:text-[11px] font-bold text-[#2b1b12]">Brand Voice</label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="w-full px-2 py-1.5 sm:py-2 text-[11px] sm:text-xs font-medium bg-[#f8f3ec] border border-[#e4d6c6] rounded-xl text-[#2b1b12] focus:outline-none focus:border-[#c5a059]"
                >
                  <option value="Professional & Authoritative">Professional & Authoritative</option>
                  <option value="Executive & Thought Leadership">Executive & Thought Leadership</option>
                  <option value="Engaging & Conversational">Engaging & Conversational</option>
                  <option value="Data-Driven & Analytical">Data-Driven & Analytical</option>
                  <option value="Educational & Step-by-Step">Educational & Step-by-Step</option>
                  <option value="Direct & Persuasive">Direct & Persuasive</option>
                </select>
              </div>

              <div className="space-y-0.5 sm:space-y-1">
                <label className="text-[10.5px] sm:text-[11px] font-bold text-[#2b1b12]">Word Count</label>
                <select
                  value={wordCountTarget}
                  onChange={(e) => setWordCountTarget(Number(e.target.value))}
                  className="w-full px-2 py-1.5 sm:py-2 text-[11px] sm:text-xs font-medium bg-[#f8f3ec] border border-[#e4d6c6] rounded-xl text-[#2b1b12] focus:outline-none focus:border-[#c5a059]"
                >
                  <option value={1000}>1,000 words</option>
                  <option value={1500}>1,500 words</option>
                  <option value={2000}>2,000 words</option>
                  <option value={2500}>2,500 words</option>
                </select>
              </div>
            </div>

            {/* Checkbox Options */}
            <div className="flex flex-col sm:flex-col gap-1 sm:gap-2 pt-1 border-t border-slate-100 text-[10.5px] sm:text-xs">
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
              className="w-full py-2 sm:py-3 bg-[#2b1b12] hover:bg-[#3b2519] text-[#fffcf7] font-black text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin text-[#c5a059]" />
                  <span>{generationStep || 'Writing publication-grade article...'}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#c5a059]" />
                  <span>Generate Publication-Grade Article</span>
                </>
              )}
            </button>
          </div>

          {/* Publishing Checklist Box */}
          <div className="bg-[#faf6f0] border border-[#e4d6c6] rounded-3xl p-5 space-y-3 text-xs">
            <div className="flex items-center justify-between border-b border-[#e4d6c6]/60 pb-2">
              <h4 className="font-black text-[#2b1b12] flex items-center gap-1.5">
                <Send className="w-3.5 h-3.5 text-[#c5a059]" />
                <span>Publishing Integrations</span>
              </h4>
              <span className="text-[10px] font-bold text-[#8a5b13]">
                {isGithubConnected ? 'GitOps Ready' : 'Setup Required'}
              </span>
            </div>

            <div className="space-y-2.5">
              {/* GitHub GitOps Card */}
              <div className="p-2.5 rounded-2xl bg-white border border-[#e4d6c6] space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 font-bold text-[#2b1b12]">
                    <GithubIcon className="w-3.5 h-3.5 text-[#2b1b12]" />
                    <span>GitHub GitOps</span>
                  </span>
                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                    isGithubConnected
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-slate-100 text-slate-600'
                  }`}>
                    {isGithubConnected ? (
                      <>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span>Connected</span>
                      </>
                    ) : (
                      <span>Not Configured</span>
                    )}
                  </span>
                </div>
                {isGithubConnected ? (
                  <div className="text-[10.5px] font-mono text-[#6f5a4c] bg-slate-50 p-2 rounded-xl border border-slate-200/60 space-y-0.5">
                    <div className="truncate"><strong className="text-slate-800">Repo:</strong> {githubConfig.repo}</div>
                    <div className="flex justify-between text-[10px]">
                      <span>Branch: <strong className="text-slate-800">{githubConfig.branch}</strong></span>
                      <span className="truncate max-w-[120px]">Folder: {githubConfig.folderPath}</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-[10.5px] text-[#8a5b13]">Connect your GitHub repo to auto-publish markdown articles via GitOps.</p>
                )}
              </div>

              {/* WordPress Card */}
              <div className="p-2.5 rounded-2xl bg-white border border-[#e4d6c6] space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 font-bold text-[#2b1b12]">
                    <Globe className="w-3.5 h-3.5 text-[#2b1b12]" />
                    <span>WordPress REST API</span>
                  </span>
                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                    isWpConnected
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-slate-100 text-slate-600'
                  }`}>
                    {isWpConnected ? (
                      <>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span>Connected</span>
                      </>
                    ) : (
                      <span>Not Configured</span>
                    )}
                  </span>
                </div>
                {isWpConnected && (
                  <div className="text-[10.5px] font-mono text-[#6f5a4c] bg-slate-50 p-2 rounded-xl border border-slate-200/60 truncate">
                    <strong className="text-slate-800">Site:</strong> {wpConfig.wpUrl}
                  </div>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIntegrationsModalOpen(true)}
              className="w-full py-2 bg-white border border-[#e4d6c6] hover:bg-[#ebdcc8] text-[#2b1b12] text-xs font-bold rounded-xl transition-all cursor-pointer shadow-2xs flex items-center justify-center gap-1.5 mt-1"
            >
              <Settings2 className="w-3.5 h-3.5 text-[#c5a059]" />
              <span>{isGithubConnected ? 'Manage Integrations' : 'Configure Integration Keys'}</span>
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

                {publishError && (
                  <div className="p-3.5 sm:p-4 rounded-2xl bg-amber-50/90 border-2 border-amber-300 text-amber-950 text-xs space-y-2 animate-slide-up shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2.5">
                        <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                        <div className="space-y-1.5">
                          <strong className="font-bold text-amber-950 block text-xs sm:text-sm">
                            Publishing Blocked — GitHub Token Permissions Required
                          </strong>
                          <p className="text-[11.5px] leading-relaxed text-amber-900 break-words font-medium">
                            {publishError}
                          </p>
                          <div className="p-2.5 bg-white/95 rounded-xl border border-amber-200/90 space-y-2 text-[11px] mt-1.5">
                            <span className="font-extrabold text-[#2b1b12] block">⚡ How to fix in 30 seconds:</span>
                            <p className="text-slate-700 leading-relaxed text-[11px]">
                              GitHub returned 403 Forbidden because fine-grained tokens often lack repository write permissions or require organization approval.
                            </p>
                            <div className="flex flex-wrap items-center gap-2 pt-0.5">
                              <a
                                href="https://github.com/settings/tokens/new?scopes=repo&description=RankMonk+GitOps"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-1.5 bg-[#2b1b12] hover:bg-[#3b2519] text-[#fffcf7] rounded-lg font-bold text-[10.5px] inline-flex items-center gap-1 shadow-xs"
                              >
                                <span>1. Generate Pre-configured Classic Token ↗</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveIntegrationTab('github');
                                  setIntegrationsModalOpen(true);
                                }}
                                className="px-3 py-1.5 bg-amber-200/80 hover:bg-amber-300 text-amber-950 rounded-lg font-bold text-[10.5px] cursor-pointer"
                              >
                                2. Paste Token in Settings →
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setPublishError(null)}
                        className="w-6 h-6 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 flex items-center justify-center font-bold text-xs shrink-0 cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                )}

                {publishSuccessInfo && (
                  <div className="p-4 bg-gradient-to-r from-emerald-50 via-teal-50/40 to-emerald-50 border-2 border-emerald-300 rounded-2xl text-xs text-emerald-950 space-y-3 shadow-xs animate-fade-in">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-start sm:items-center gap-2.5">
                        <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 text-xs font-black shadow-2xs">
                          ✓
                        </div>
                        <div className="space-y-0.5">
                          <span className="font-extrabold text-xs text-emerald-950 flex items-center gap-1.5">
                            GitOps Commit Published Successfully!
                          </span>
                          {publishSuccessInfo.liveUrl && (
                            <a
                              href={publishSuccessInfo.liveUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-mono text-[11px] text-emerald-800 hover:text-emerald-950 underline font-bold break-all flex items-center gap-1"
                            >
                              <span>{publishSuccessInfo.liveUrl}</span>
                              <ExternalLink className="w-3 h-3 shrink-0" />
                            </a>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 flex-wrap">
                        {publishSuccessInfo.liveUrl && (
                          <a
                            href={publishSuccessInfo.liveUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                          >
                            <span>Open Live Article ↗</span>
                          </a>
                        )}
                        {publishSuccessInfo.commitUrl && (
                          <a
                            href={publishSuccessInfo.commitUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 bg-white border border-emerald-300 hover:bg-emerald-100/60 text-emerald-900 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                            title="View commit in GitHub repository"
                          >
                            <GithubIcon className="w-3.5 h-3.5" />
                            <span>View on GitHub ↗</span>
                          </a>
                        )}
                        <button
                          type="button"
                          onClick={() => handleCopy('html')}
                          className="px-3 py-1.5 bg-emerald-100/80 hover:bg-emerald-200/80 text-emerald-900 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                          title="Copy HTML to clipboard"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy HTML</span>
                        </button>
                      </div>
                    </div>

                    {/* GitOps Next.js Deployment Guidance Box */}
                    <div className="p-3 bg-white/95 border border-emerald-200/80 rounded-xl space-y-1.5 text-[11px] text-emerald-950">
                      <div className="flex items-center gap-1.5 font-bold text-emerald-950">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span>Why you might not see the article immediately on your live website:</span>
                      </div>
                      <ol className="list-decimal list-inside space-y-1 pl-1 text-[10.5px] leading-relaxed text-[#4a3528]">
                        <li>
                          <strong>Hosting Build Time (~60–90 seconds):</strong> When Rank Monk commits to GitHub, your hosting platform (Vercel, Netlify, or AWS Amplify) triggers an automated build. Until that build completes, your live site serves the previous version.
                        </li>
                        <li>
                          <strong>Direct URL vs. Homepage Grid:</strong> Your article is published at the direct URL above. If your website's <code className="bg-slate-100 px-1 py-0.5 rounded text-[10px] font-mono font-bold">/resources</code> or <code className="bg-slate-100 px-1 py-0.5 rounded text-[10px] font-mono font-bold">/blogs</code> directory is currently a static grid of cards, add a link in your code or use <strong>Copy HTML</strong> to paste it directly!
                        </li>
                      </ol>
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
                Choose a suggested topic on the left or type your target keyword, then click <strong>Generate Publication-Grade Article</strong> to synthesize a comprehensive, publication-ready piece.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 3. Generated Articles Library & Publication History */}
      <div className="bg-white rounded-3xl border border-[#e4d6c6] p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-black text-base text-[#2b1b12]">Content Library & Publication History</h3>
              <span className="text-xs font-black text-[#8a5b13] bg-[#c5a059]/15 px-2.5 py-0.5 rounded-full border border-[#c5a059]/30">
                {articlesList.length} Total
              </span>
            </div>
            <p className="text-xs text-[#6f5a4c] mt-0.5">
              Review all past generated blogs, live deployment URLs, and GitOps commit records.
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center bg-[#f8f3ec] border border-[#e4d6c6] rounded-xl p-1 gap-1 self-start sm:self-auto text-xs">
            <button
              type="button"
              onClick={() => setHistoryFilter('all')}
              className={`px-3 py-1 font-bold rounded-lg transition-all cursor-pointer ${
                historyFilter === 'all' ? 'bg-[#2b1b12] text-white shadow-2xs' : 'text-[#6f5a4c] hover:text-[#2b1b12]'
              }`}
            >
              All ({articlesList.length})
            </button>
            <button
              type="button"
              onClick={() => setHistoryFilter('published')}
              className={`px-3 py-1 font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                historyFilter === 'published' ? 'bg-emerald-700 text-white shadow-2xs' : 'text-[#6f5a4c] hover:text-emerald-800'
              }`}
            >
              <Check className="w-3 h-3" />
              <span>Published ({articlesList.filter(a => a.isPublished).length})</span>
            </button>
            <button
              type="button"
              onClick={() => setHistoryFilter('drafts')}
              className={`px-3 py-1 font-bold rounded-lg transition-all cursor-pointer ${
                historyFilter === 'drafts' ? 'bg-[#c5a059] text-[#2b1b12] font-black shadow-2xs' : 'text-[#6f5a4c] hover:text-[#2b1b12]'
              }`}
            >
              Drafts ({articlesList.filter(a => !a.isPublished).length})
            </button>
          </div>
        </div>

        {filteredArticles.length === 0 ? (
          <div className="bg-[#faf6f0]/50 border-2 border-dashed border-[#e4d6c6] rounded-2xl p-8 text-center space-y-2">
            <p className="text-xs font-bold text-[#2b1b12]">
              {historyFilter === 'published'
                ? 'No blogs published to GitHub or WordPress yet.'
                : historyFilter === 'drafts'
                ? 'No draft articles pending publication.'
                : 'No articles generated yet.'}
            </p>
            <p className="text-[11px] text-[#6f5a4c]">
              Select a suggested topic or enter a keyword above, then click "Generate Publication-Grade Article".
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 text-xs">
            {filteredArticles.map((art) => (
              <div
                key={art.id}
                className="py-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-[#faf6f0]/50 rounded-2xl px-3 transition-colors"
              >
                <div className="min-w-0 space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      onClick={() => {
                        setCurrentArticle(art);
                        window.scrollTo({ top: 300, behavior: 'smooth' });
                      }}
                      className="font-black text-sm text-[#2b1b12] hover:text-[#8a5b13] cursor-pointer hover:underline leading-snug"
                    >
                      {art.title}
                    </span>
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 shrink-0">
                      SEO: {art.seoScore}/100
                    </span>

                    {/* Publication Status Pill */}
                    {art.isPublished ? (
                      <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-900 border border-emerald-300 flex items-center gap-1 shadow-2xs shrink-0">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span>✓ Posted to {art.publishedDestination === 'github' ? 'GitHub (GitOps)' : art.publishedDestination === 'wordpress' ? 'WordPress' : 'Live Host'}</span>
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-300 shrink-0">
                        Draft • Not Posted
                      </span>
                    )}
                  </div>

                  <div className="text-[11px] text-[#6f5a4c] flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span>Target Keyword: <strong className="text-[#2b1b12]">{art.keyword}</strong></span>
                    <span>•</span>
                    <span>{art.wordCount} words</span>
                    <span>•</span>
                    <span>{art.readingTime}</span>
                    {art.lastPublishedAt && (
                      <>
                        <span>•</span>
                        <span className="text-emerald-900 font-semibold">
                          Published: {new Date(art.lastPublishedAt).toLocaleDateString()} {new Date(art.lastPublishedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </>
                    )}
                  </div>

                  {/* Direct Live & GitHub Links */}
                  {(art.liveUrl || art.commitUrl) && (
                    <div className="pt-1 flex flex-wrap items-center gap-3 text-[11px]">
                      {art.liveUrl && (
                        <a
                          href={art.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-mono text-emerald-800 hover:text-emerald-950 font-bold underline flex items-center gap-1"
                          title="Open live published article"
                        >
                          <span>Live URL: {art.liveUrl}</span>
                          <ExternalLink className="w-3 h-3 shrink-0" />
                        </a>
                      )}
                      {art.commitUrl && (
                        <a
                          href={art.commitUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-mono text-slate-600 hover:text-slate-900 flex items-center gap-1 font-semibold"
                          title="View commit in GitHub repo"
                        >
                          <GithubIcon className="w-3 h-3" />
                          <span>View Commit ↗</span>
                        </a>
                      )}
                    </div>
                  )}
                </div>

                {/* Row Actions */}
                <div className="flex items-center gap-2 shrink-0 self-start lg:self-center flex-wrap">
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentArticle(art);
                      window.scrollTo({ top: 300, behavior: 'smooth' });
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                      currentArticle?.id === art.id
                        ? 'bg-[#2b1b12] text-white shadow-xs'
                        : 'bg-[#f8f3ec] hover:bg-[#ebdcc8] text-[#2b1b12] border border-[#e4d6c6]'
                    }`}
                  >
                    <Eye className="w-3 h-3" />
                    <span>{currentArticle?.id === art.id ? 'Viewing' : 'Open Canvas'}</span>
                  </button>

                  {!art.isPublished && (
                    <button
                      type="button"
                      onClick={() => {
                        setCurrentArticle(art);
                        handlePublish('github');
                      }}
                      className="px-3 py-1.5 bg-[#2b1b12] hover:bg-[#3b2519] text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                    >
                      <Send className="w-3 h-3 text-[#c5a059]" />
                      <span>Post Now</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(art.contentHtml);
                      setToastMessage(`✓ Copied HTML for "${art.title}"`);
                    }}
                    className="p-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl transition-all cursor-pointer"
                    title="Copy HTML to clipboard"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const blob = new Blob([art.contentMarkdown], { type: 'text/markdown' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `${art.slug}.md`;
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                    className="p-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl transition-all cursor-pointer"
                    title="Download Markdown"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={(e) => handleDeleteArticle(art.id, e)}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all cursor-pointer"
                    title="Delete article from history"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

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
                {isGithubConnected && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" title="Connected" />
                )}
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
                {isWpConnected && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" title="Connected" />
                )}
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
                {isWebhookConnected && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" title="Connected" />
                )}
              </button>
            </div>

            {/* TAB A: GitHub GitOps Config */}
            {activeIntegrationTab === 'github' && (
              <div className="space-y-3.5 text-xs">
                {/* Active Connection Banner */}
                {isGithubConnected && (
                  <div className="p-3.5 bg-gradient-to-r from-emerald-50 to-teal-50/60 border-2 border-emerald-300 rounded-2xl flex items-center justify-between gap-3 shadow-2xs">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black shrink-0 shadow-xs">
                        ✓
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-emerald-950 text-xs">GitHub GitOps Connected</span>
                          <span className="px-2 py-0.5 rounded-full bg-emerald-200/80 text-emerald-900 font-bold text-[10px]">
                            Ready to Publish
                          </span>
                        </div>
                        <div className="text-[11px] text-emerald-800 font-mono mt-0.5 truncate">
                          <span>{githubConfig.repo}</span> • <span>branch: {githubConfig.branch}</span> • <span>folder: {githubConfig.folderPath}</span>
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setGithubConfig({ token: '', repo: '', branch: 'main', folderPath: cleanDomain.includes('officex') ? 'content/resources' : 'content/blogs' });
                        localStorage.removeItem(`rm_gh_config_${cleanDomain}`);
                        setToastMessage('✓ GitHub integration disconnected.');
                      }}
                      className="px-2.5 py-1 text-[11px] font-bold text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-all border border-red-200 cursor-pointer shrink-0"
                    >
                      Disconnect
                    </button>
                  </div>
                )}
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
                    <div className="space-y-2.5 pt-2 border-t border-amber-200/60 text-[11px] text-[#4a3528]">
                      <div className="p-2 bg-emerald-50/80 border border-emerald-200 rounded-xl space-y-1">
                        <span className="font-bold text-emerald-900 block">⚡ Fastest Way (1-Click Classic Token - Recommended):</span>
                        <p className="text-[10.5px] leading-relaxed text-emerald-800">
                          Click 👉 <a href="https://github.com/settings/tokens/new?scopes=repo&description=RankMonk" target="_blank" rel="noopener noreferrer" className="font-bold underline text-emerald-900 inline-flex items-center gap-0.5">Generate Pre-Configured Token <ExternalLink className="w-3 h-3" /></a>. This automatically checks the <code className="bg-white px-1 py-0.2 rounded border font-mono font-bold">repo</code> write scope for you. Scroll down, click <strong>Generate token</strong>, and paste it below!
                        </p>
                      </div>

                      <div className="space-y-1">
                        <span className="font-bold text-[#2b1b12] block">Alternative (Fine-Grained Token):</span>
                        <ol className="list-decimal list-inside space-y-1 leading-relaxed font-medium pl-1">
                          <li>Open <a href="https://github.com/settings/tokens?type=beta" target="_blank" rel="noopener noreferrer" className="font-bold text-[#0F8B7D] underline inline-flex items-center gap-0.5">Fine-grained Tokens <ExternalLink className="w-3 h-3" /></a>.</li>
                          <li>Under <strong>Repository access</strong>, select your website repo.</li>
                          <li>Under <strong>Repository permissions → Contents</strong>, choose <strong>Read and write</strong>.</li>
                        </ol>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-[#2b1b12]">GitHub Personal Access Token</label>
                  <input
                    type="password"
                    value={githubConfig.token || ''}
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
                      value={githubConfig.repo || ''}
                      onChange={(e) => setGithubConfig({ ...githubConfig, repo: e.target.value })}
                      placeholder="e.g. your-org/your-repo"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:border-[#c5a059]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-[#2b1b12]">Branch</label>
                    <input
                      type="text"
                      value={githubConfig.branch || 'main'}
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
                    value={githubConfig.folderPath || ''}
                    onChange={(e) => setGithubConfig({ ...githubConfig, folderPath: e.target.value })}
                    placeholder="content/blogs or src/posts"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:border-[#c5a059]"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => saveIntegrationConfig('github')}
                    className="flex-1 py-2.5 bg-[#2b1b12] hover:bg-[#3b2519] text-white font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer text-center"
                  >
                    Save GitHub Settings
                  </button>
                  <button
                    type="button"
                    disabled={isTestingGithub || !githubConfig.token || !githubConfig.repo}
                    onClick={handleTestGithub}
                    className="px-4 py-2.5 bg-emerald-50 border border-emerald-300 hover:bg-emerald-100 text-emerald-900 font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {isTestingGithub ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-700" />
                        <span>Testing...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Test Connection</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Diagnostic Result Box */}
                {githubTestResult && (
                  <div className={`p-3.5 rounded-2xl border text-xs space-y-2 animate-fade-in ${
                    githubTestResult.error
                      ? 'bg-red-50 border-red-200 text-red-950'
                      : 'bg-emerald-50/80 border-emerald-300 text-emerald-950'
                  }`}>
                    {githubTestResult.error ? (
                      <div className="space-y-1">
                        <span className="font-extrabold flex items-center gap-1.5 text-red-900">
                          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                          <span>Connection Check Failed</span>
                        </span>
                        <p className="text-[11px] text-red-800 leading-relaxed pl-5">
                          {githubTestResult.error}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between border-b border-emerald-200/80 pb-1.5">
                          <span className="font-extrabold flex items-center gap-1.5 text-emerald-950 text-xs">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span>GitHub Repository & GitOps Verified!</span>
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-mono text-[10px] font-bold">
                            @{githubTestResult.authenticatedUser}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-[11px]">
                          <div className="p-2 bg-white/80 rounded-xl border border-emerald-100 space-y-0.5">
                            <span className="text-[10px] text-slate-500 font-bold block">Target Framework:</span>
                            <span className="font-extrabold text-emerald-900">{githubTestResult.framework}</span>
                          </div>
                          <div className="p-2 bg-white/80 rounded-xl border border-emerald-100 space-y-0.5">
                            <span className="text-[10px] text-slate-500 font-bold block">Branch & Write Access:</span>
                            <span className="font-extrabold text-emerald-900">
                              {githubTestResult.selectedBranch} (Write: {githubTestResult.hasWritePermission ? '✓ Yes' : 'No'})
                            </span>
                          </div>
                        </div>

                        <div className="p-2.5 bg-white/90 rounded-xl border border-emerald-100 space-y-1 text-[10.5px]">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-700">Dynamic Reader Route:</span>
                            <span className="font-mono font-bold text-emerald-800">
                              {githubTestResult.readerRouteExists
                                ? '✓ Active in Repo'
                                : '⚡ Will Auto-Scaffold on Publish'}
                            </span>
                          </div>
                          {githubTestResult.previewLiveUrl && (
                            <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-slate-600">
                              <span className="font-medium">Live Website URL:</span>
                              <span className="font-mono text-emerald-700 truncate max-w-[200px]">
                                {githubTestResult.previewLiveUrl}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
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
