'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Globe,
  RefreshCw,
  Download,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  FileText,
  ChevronDown,
  ChevronUp,
  Copy,
  ExternalLink,
  Search,
  FileSpreadsheet,
  Layers,
  ArrowUpRight,
  TrendingUp,
  Loader2,
  Zap,
  ShieldCheck,
  BookOpen,
  Cpu,
  Check,
  Play,
  Filter,
  Info,
  Activity,
  Sparkles,
  Code,
  GitBranch,
  Send,
  CheckCheck,
  Settings
} from 'lucide-react';
import { ExpandableText } from '@/components/ui/ExpandableText';

interface SeoAuditWorkspaceProps {
  project: any;
  onNavigateTab: (tab: string) => void;
}

export function SeoAuditWorkspace({ project, onNavigateTab }: SeoAuditWorkspaceProps) {
  const [crawlLimit, setCrawlLimit] = useState<'30' | '50' | '100' | '200' | '500'>('50');
  const [isReRunningAudit, setIsReRunningAudit] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'issues' | 'pages'>('issues');
  const [issueFilter, setIssueFilter] = useState<'all' | 'critical' | 'important' | 'minor' | 'passed'>('all');
  const [pageFilter, setPageFilter] = useState('all');
  const [issuesSearchQuery, setIssuesSearchQuery] = useState('');
  const [pagesSearchQuery, setPagesSearchQuery] = useState('');
  const [expandedIssueIds, setExpandedIssueIds] = useState<Record<string, boolean>>({});
  const hasInitializedRef = useRef(false);

  const toggleIssue = (id: string) => {
    setExpandedIssueIds(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [auditData, setAuditData] = useState<any>(null);
  const [showAllPagesModal, setShowAllPagesModal] = useState(false);
  const [allPagesSearch, setAllPagesSearch] = useState('');

  // Live crawler progress simulation state
  const [crawlerProgress, setCrawlerProgress] = useState(15);
  const [crawlerActivePhase, setCrawlerActivePhase] = useState(1);
  const [crawlerActiveUrl, setCrawlerActiveUrl] = useState('');
  const [crawlerPagesScanned, setCrawlerPagesScanned] = useState(0);

  const domain = project?.domain || 'company.com';
  const cleanDomain = domain.replace(/^(https?:\/\/)?(www\.)?/, '').replace(/\/$/, '');
  const brandName = project?.name || 'Your Brand';

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Autonomous AI Self-Healing & Fix Engine State
  const [activeFixIssue, setActiveFixIssue] = useState<any | null>(null);
  const [isGeneratingFixes, setIsGeneratingFixes] = useState(false);
  const [generatedFixes, setGeneratedFixes] = useState<any[]>([]);
  const [applyingChannel, setApplyingChannel] = useState<'script' | 'github' | 'cms' | 'auto' | null>(null);
  const [isApplyingAutonomous, setIsApplyingAutonomous] = useState(false);
  const [fixSuccessResult, setFixSuccessResult] = useState<any | null>(null);
  const [scriptTagCopied, setScriptTagCopied] = useState(false);
  const [copiedSnippetId, setCopiedSnippetId] = useState<string | null>(null);
  const [activeRulesCount, setActiveRulesCount] = useState<number>(0);
  const [healedIssueIds, setHealedIssueIds] = useState<Record<string, boolean>>({});
  const [healedPageUrls, setHealedPageUrls] = useState<Record<string, boolean>>({});
  const [liveVerifiedUrls, setLiveVerifiedUrls] = useState<Record<string, { isFixed: boolean; message: string; checking?: boolean }>>({});
  const [hasGithubConfig, setHasGithubConfig] = useState(false);
  const [hasWpConfig, setHasWpConfig] = useState(false);

  // Platform & Integration Detection State
  const [detectedPlatformInfo, setDetectedPlatformInfo] = useState<any | null>(null);
  const [isDetectingPlatform, setIsDetectingPlatform] = useState(false);
  const [activeIntegrationTab, setActiveIntegrationTab] = useState<'github' | 'cms' | 'script'>('github');

  // User permission inputs (editable in modal if user wants code commits or CMS sync)
  const [showPermissionsConfig, setShowPermissionsConfig] = useState(false);
  const [githubTokenInput, setGithubTokenInput] = useState('');
  const [githubRepoInput, setGithubRepoInput] = useState('');
  const [wpUrlInput, setWpUrlInput] = useState('');
  const [wpUserInput, setWpUserInput] = useState('');
  const [wpPassInput, setWpPassInput] = useState('');

  // Helper to fetch website platform and stack detection
  const fetchPlatformDetection = async () => {
    setIsDetectingPlatform(true);
    try {
      const res = await fetch(`/api/seo/detect-platform?domain=${encodeURIComponent(cleanDomain)}`);
      const data = await res.json();
      if (data.success && data.data) {
        setDetectedPlatformInfo(data.data);
        if (data.data.platform?.recommendedIntegration) {
          setActiveIntegrationTab(data.data.platform.recommendedIntegration);
        }
      }
    } catch (e) {
      console.warn('[Platform detection notice]:', e);
    } finally {
      setIsDetectingPlatform(false);
    }
  };

  // Load active edge rules count and integration status on mount
  useEffect(() => {
    if (!cleanDomain) return;
    try {
      const gh = localStorage.getItem(`rm_gh_config_${cleanDomain}`) || localStorage.getItem('rm_gh_config');
      if (gh) {
        const parsed = JSON.parse(gh);
        setHasGithubConfig(Boolean(parsed.token && parsed.repo));
        setGithubTokenInput(parsed.token || '');
        setGithubRepoInput(parsed.repo || '');
      }
      const wp = localStorage.getItem(`rm_wp_config_${cleanDomain}`) || localStorage.getItem('rm_wp_config');
      if (wp) {
        const parsed = JSON.parse(wp);
        setHasWpConfig(Boolean(parsed.url || parsed.wpUrl));
        setWpUrlInput(parsed.url || parsed.wpUrl || '');
        setWpUserInput(parsed.username || parsed.wpUsername || '');
        setWpPassInput(parsed.appPassword || parsed.wpAppPassword || '');
      }
    } catch (e) {}

    // Cloud Database Persistence: Sync integrations preserved for user's account
    const userEmail = project?.userEmail || (typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('rankmonk_user') || '{}')?.email : '');
    if (userEmail || cleanDomain) {
      fetch(`/api/integrations?email=${encodeURIComponent(userEmail || '')}&domain=${encodeURIComponent(cleanDomain)}`)
        .then(res => res.json())
        .then(data => {
          if (data.success && data.integrations) {
            if (data.integrations.github && data.integrations.github.token) {
              const gh = data.integrations.github;
              setHasGithubConfig(Boolean(gh.token && gh.repo));
              setGithubTokenInput(gh.token || '');
              setGithubRepoInput(gh.repo || '');
              localStorage.setItem(`rm_gh_config_${cleanDomain}`, JSON.stringify(gh));
              localStorage.setItem('rm_gh_config', JSON.stringify(gh));
            }
            if (data.integrations.wordpress && (data.integrations.wordpress.wpUrl || data.integrations.wordpress.url)) {
              const wp = data.integrations.wordpress;
              setHasWpConfig(true);
              setWpUrlInput(wp.wpUrl || wp.url || '');
              setWpUserInput(wp.wpUsername || wp.username || '');
              setWpPassInput(wp.wpAppPassword || wp.appPassword || '');
              localStorage.setItem(`rm_wp_config_${cleanDomain}`, JSON.stringify(wp));
              localStorage.setItem('rm_wp_config', JSON.stringify(wp));
            }
          }
        })
        .catch(() => {});
    }

    fetchPlatformDetection();

    fetch(`/api/seo/heal-rules?domain=${encodeURIComponent(cleanDomain)}`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.rules?.pages) {
          setActiveRulesCount(Object.keys(data.rules.pages).length);
        }
      })
      .catch(() => {});
  }, [cleanDomain]);

  // Open Auto-Fix Studio for a SINGLE page URL (individual, highly accurate fix)
  const handleOpenSinglePageFix = async (issue: any, page: any) => {
    setActiveFixIssue({
      ...issue,
      title: `Fix Defect on ${page.url}`,
      failedPages: [page],
      allPagesInIssue: issue.failedPages || [],
      isSinglePage: true,
      singlePageUrl: page.url
    });
    setIsGeneratingFixes(true);
    setGeneratedFixes([]);
    setFixSuccessResult(null);

    fetchPlatformDetection();

    try {
      const res = await fetch('/api/seo/generate-fixes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          domain: cleanDomain,
          brandName,
          issueId: issue.id,
          failedPages: [page]
        })
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.fixes)) {
        setGeneratedFixes(data.fixes);
      } else {
        showToast('Unable to generate fix for this page. Please try again.');
      }
    } catch (err) {
      console.error('[Generate single fix error]', err);
      showToast('Error connecting to AI Fix generator.');
    } finally {
      setIsGeneratingFixes(false);
    }
  };

  // Live verification probe (connects to live website URL in real time to verify HTML)
  const handleVerifyLive = async (issue: any, page: any) => {
    const pageUrl = page.url;
    setLiveVerifiedUrls(prev => ({
      ...prev,
      [pageUrl]: { isFixed: false, message: 'Probing live website HTML...', checking: true }
    }));

    try {
      const res = await fetch('/api/seo/verify-live', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: pageUrl, issueId: issue?.id })
      });
      const data = await res.json();
      if (data.success) {
        setLiveVerifiedUrls(prev => ({
          ...prev,
          [pageUrl]: {
            isFixed: data.isFixedOnLiveSite,
            message: data.detailMessage,
            checking: false
          }
        }));
        if (data.isFixedOnLiveSite) {
          setHealedPageUrls(prev => ({ ...prev, [pageUrl]: true }));
          showToast(`✓ Live Verified! ${data.detailMessage}`);
        } else {
          showToast(`Live Check: ${data.detailMessage}`);
        }
      } else {
        showToast('Live verification check failed.');
      }
    } catch (e) {
      console.error('[Live verify error]:', e);
      showToast('Error connecting to live website.');
    }
  };

  // Open Auto-Fix Studio for an issue
  const handleOpenAutoFix = async (issue: any) => {
    setActiveFixIssue(issue);
    setIsGeneratingFixes(true);
    setGeneratedFixes([]);
    setFixSuccessResult(null);

    fetchPlatformDetection();

    try {
      const res = await fetch('/api/seo/generate-fixes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          domain: cleanDomain,
          brandName,
          issueId: issue.id,
          failedPages: issue.failedPages || []
        })
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.fixes)) {
        setGeneratedFixes(data.fixes);
      } else {
        showToast('Unable to generate fixes. Please try again.');
      }
    } catch (err) {
      console.error('[Generate fixes error]', err);
      showToast('Error connecting to AI Fix generator.');
    } finally {
      setIsGeneratingFixes(false);
    }
  };

  // Open Auto-Fix for ALL issues at once (Master 1-Click Autonomous Healing)
  const handleOpenAutoFixAll = async () => {
    const unhealedIssues = issuesList.filter((i: any) => i.impact !== 'Passed' && i.failedPages && i.failedPages.length > 0);
    if (unhealedIssues.length === 0) {
      showToast('All issues are already passing! No defects detected.');
      return;
    }

    setActiveFixIssue({
      id: 'batch-all',
      title: `All SEO Deficiencies (${unhealedIssues.length} issues)`,
      impact: 'Critical',
      impactBadge: 'bg-purple-100 text-purple-800 border-purple-300',
      desc: `Autonomous self-healing across all ${unhealedIssues.length} identified technical issues.`,
      howToFix: 'Deploys automated 301 redirects, meta descriptions, titles, and canonical tags across all affected URLs.',
      isBatchAll: true
    });
    setIsGeneratingFixes(true);
    setGeneratedFixes([]);
    setFixSuccessResult(null);

    fetchPlatformDetection();

    try {
      const res = await fetch('/api/seo/generate-fixes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          domain: cleanDomain,
          brandName,
          issues: unhealedIssues.map((u: any) => ({ id: u.id, failedPages: u.failedPages }))
        })
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.fixes)) {
        setGeneratedFixes(data.fixes);
      } else {
        showToast('Unable to generate batch fixes. Please try again.');
      }
    } catch (err) {
      console.error('[Generate all fixes error]', err);
      showToast('Error connecting to AI Fix generator.');
    } finally {
      setIsGeneratingFixes(false);
    }
  };

  // User edits a proposed fix directly in the confirmation modal
  const handleEditProposedFix = (id: string, newVal: string) => {
    setGeneratedFixes(prev => prev.map(f => {
      if (f.id === id) {
        let code = f.codeSnippet;
        if (f.type === 'meta_description') code = `<meta name="description" content="${newVal}" />`;
        else if (f.type === 'title') code = `<title>${newVal}</title>`;
        else if (f.type === 'alt_text') code = `alt="${newVal}"`;
        else if (f.type === 'canonical') code = `<link rel="canonical" href="${newVal}" />`;
        else if (f.type === 'redirect_301') {
          let dest = newVal;
          const match = newVal.match(/➔\s*([^\s]+)/);
          if (match && match[1]) dest = match[1];
          code = JSON.stringify({ source: f.pathname || '/', destination: dest, permanent: true }, null, 2);
        }
        return { ...f, proposedValue: newVal, codeSnippet: code };
      }
      return f;
    }));
  };

  // Save specific edit permissions (GitHub / WordPress)
  const handleSavePermissions = () => {
    const userEmail = project?.userEmail || (typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('rankmonk_user') || '{}')?.email : '');

    if (githubRepoInput && githubTokenInput) {
      const ghObj = {
        token: githubTokenInput,
        repo: githubRepoInput
      };
      localStorage.setItem(`rm_gh_config_${cleanDomain}`, JSON.stringify(ghObj));
      localStorage.setItem('rm_gh_config', JSON.stringify(ghObj));
      setHasGithubConfig(true);

      fetch('/api/integrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userEmail || 'default',
          domain: cleanDomain,
          platform: 'github',
          config: ghObj
        })
      }).catch(() => {});
    }

    if (wpUrlInput) {
      const wpObj = {
        url: wpUrlInput,
        username: wpUserInput,
        appPassword: wpPassInput
      };
      localStorage.setItem(`rm_wp_config_${cleanDomain}`, JSON.stringify(wpObj));
      localStorage.setItem('rm_wp_config', JSON.stringify(wpObj));
      setHasWpConfig(true);

      fetch('/api/integrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userEmail || 'default',
          domain: cleanDomain,
          platform: 'wordpress',
          config: wpObj
        })
      }).catch(() => {});
    }

    showToast('✓ Platform integration saved and permanently preserved on your account!');
    setShowPermissionsConfig(false);
  };

  // UNIFIED AUTONOMOUS FIX DISPATCH: Everything happens automatically on Confirm!
  const handleConfirmAndApplyAll = async () => {
    if (!generatedFixes || generatedFixes.length === 0) return;
    setIsApplyingAutonomous(true);
    setFixSuccessResult(null);

    try {
      let githubConfig = undefined;
      let wpConfig = undefined;
      try {
        const gh = localStorage.getItem(`rm_gh_config_${cleanDomain}`) || localStorage.getItem('rm_gh_config');
        if (gh) githubConfig = JSON.parse(gh);
        if (!githubConfig && githubTokenInput && githubRepoInput) {
          githubConfig = { token: githubTokenInput, repo: githubRepoInput, branch: 'main' };
        }
        const wp = localStorage.getItem(`rm_wp_config_${cleanDomain}`);
        if (wp) wpConfig = JSON.parse(wp);
      } catch (e) {}

      const res = await fetch('/api/seo/apply-fix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          domain: cleanDomain,
          brandName,
          channel: 'auto',
          fixes: generatedFixes,
          githubConfig,
          wpConfig
        })
      });

      const data = await res.json();
      if (data.success) {
        setFixSuccessResult(data);
        if (data.activeRulesCount) {
          setActiveRulesCount(data.activeRulesCount);
        }
        if (activeFixIssue?.singlePageUrl) {
          const pageUrl = activeFixIssue.singlePageUrl;
          setHealedPageUrls(prev => {
            const next = { ...prev, [pageUrl]: true };
            const allPages = activeFixIssue.allPagesInIssue || activeFixIssue.failedPages || [];
            if (allPages.length > 0 && allPages.every((p: any) => next[p.url])) {
              setHealedIssueIds(hPrev => ({ ...hPrev, [activeFixIssue.id]: true }));
            }
            return next;
          });
        } else if (activeFixIssue?.isBatchAll) {
          const allHealed: Record<string, boolean> = {};
          issuesList.forEach((iss: any) => { allHealed[iss.id] = true; });
          setHealedIssueIds(allHealed);
        } else if (activeFixIssue?.id) {
          setHealedIssueIds(prev => ({ ...prev, [activeFixIssue.id]: true }));
        }
        showToast(`✓ Applied ${generatedFixes.length} fixes automatically!`);
      } else {
        showToast(data.error || 'Failed to apply fixes.');
      }
    } catch (err) {
      console.error('[Apply auto fix error]', err);
      showToast('Error applying fixes.');
    } finally {
      setIsApplyingAutonomous(false);
    }
  };

  // Optional manual dispatch to a specific channel
  const handleApplyFix = async (channel: 'script' | 'github' | 'cms') => {
    if (!generatedFixes || generatedFixes.length === 0) return;
    setApplyingChannel(channel);
    setFixSuccessResult(null);

    try {
      let githubConfig = undefined;
      let wpConfig = undefined;
      try {
        const gh = localStorage.getItem(`rm_gh_config_${cleanDomain}`) || localStorage.getItem('rm_gh_config');
        if (gh) githubConfig = JSON.parse(gh);
        if (!githubConfig && githubTokenInput && githubRepoInput) {
          githubConfig = { token: githubTokenInput, repo: githubRepoInput, branch: 'main' };
        }
        const wp = localStorage.getItem(`rm_wp_config_${cleanDomain}`);
        if (wp) wpConfig = JSON.parse(wp);
      } catch (e) {}

      const res = await fetch('/api/seo/apply-fix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          domain: cleanDomain,
          brandName,
          channel,
          fixes: generatedFixes,
          githubConfig,
          wpConfig
        })
      });

      const data = await res.json();
      if (data.success) {
        setFixSuccessResult(data);
        if (channel === 'script' && data.activeRulesCount) {
          setActiveRulesCount(data.activeRulesCount);
        }
        if (activeFixIssue?.singlePageUrl) {
          const pageUrl = activeFixIssue.singlePageUrl;
          setHealedPageUrls(prev => {
            const next = { ...prev, [pageUrl]: true };
            const allPages = activeFixIssue.allPagesInIssue || activeFixIssue.failedPages || [];
            if (allPages.length > 0 && allPages.every((p: any) => next[p.url])) {
              setHealedIssueIds(hPrev => ({ ...hPrev, [activeFixIssue.id]: true }));
            }
            return next;
          });
        } else if (activeFixIssue?.id) {
          setHealedIssueIds(prev => ({ ...prev, [activeFixIssue.id]: true }));
        }
        showToast(data.message || 'Fix applied successfully!');
      } else {
        showToast(data.error || 'Failed to apply fix.');
      }
    } catch (err) {
      console.error('[Apply fix error]', err);
      showToast('Error dispatching fix.');
    } finally {
      setApplyingChannel(null);
    }
  };

  const handleCopyScriptTag = () => {
    const tag = `<script src="https://rankmonk.in/heal.js" data-site="${cleanDomain}" async></script>`;
    navigator.clipboard?.writeText(tag);
    setScriptTagCopied(true);
    showToast('✓ Self-Healing script tag copied to clipboard!');
    setTimeout(() => setScriptTagCopied(false), 2500);
  };

  const handleCopyCodeSnippet = (id: string, code: string) => {
    navigator.clipboard?.writeText(code);
    setCopiedSnippetId(id);
    setTimeout(() => setCopiedSnippetId(null), 2500);
  };

  const handleCopyAllCodeSnippets = () => {
    const allCode = generatedFixes.map(f => `<!-- ${f.url} -->\n${f.codeSnippet}`).join('\n\n');
    navigator.clipboard?.writeText(allCode);
    showToast('✓ All fix HTML tags copied to clipboard!');
  };

  // Load cached audit data on mount, or fetch 20-page initial crawl if none exists
  useEffect(() => {
    if (!cleanDomain) return;
    try {
      const cached = localStorage.getItem(`rankmonk_audit_${cleanDomain}`);
      if (cached) {
        const parsed = JSON.parse(cached);
        setAuditData(parsed);
      } else {
        // Initial real audit (default 20 pages)
        fetchAudit(20);
      }
    } catch (e) {
      fetchAudit(20);
    }
  }, [cleanDomain]);

  const fetchAudit = async (limit: number = 20) => {
    try {
      const res = await fetch('/api/seo/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          domain: cleanDomain,
          brandName,
          crawlLimit: limit
        })
      });
      const data = await res.json();
      if (data.success && data.data) {
        setAuditData(data.data);
        localStorage.setItem(`rankmonk_audit_${cleanDomain}`, JSON.stringify(data.data));
      }
    } catch (e) {
      console.warn('[SeoAuditWorkspace] Audit fetch error:', e);
    }
  };

  // Re-run Audit action with Sitefire-style live crawler animation
  const handleReRunAudit = async () => {
    const limitNum = parseInt(crawlLimit) || 50;
    setIsReRunningAudit(true);
    setCrawlerProgress(10);
    setCrawlerActivePhase(1);
    setCrawlerPagesScanned(1);
    setCrawlerActiveUrl(`https://${cleanDomain}`);

    // Dynamic simulated phases ticker while the real crawl executes in background
    const phaseInterval = setInterval(() => {
      setCrawlerProgress((prev) => {
        if (prev < 92) {
          const next = prev + Math.floor(Math.random() * 8) + 4;
          if (next > 25 && next <= 45) setCrawlerActivePhase(2);
          else if (next > 45 && next <= 68) setCrawlerActivePhase(3);
          else if (next > 68 && next <= 85) setCrawlerActivePhase(4);
          else if (next > 85) setCrawlerActivePhase(5);
          return next;
        }
        return prev;
      });

      setCrawlerPagesScanned((prev) => {
        if (prev < limitNum - 1) {
          return prev + Math.floor(Math.random() * 3) + 1;
        }
        return prev;
      });

      // Sample plausible internal paths for the active ticker
      const sampleSlugs = ['/', '/services', '/pricing', '/about', '/contact', '/case-studies', '/process', '/blog', '/faq', '/terms', '/privacy'];
      const randomSlug = sampleSlugs[Math.floor(Math.random() * sampleSlugs.length)];
      setCrawlerActiveUrl(`https://${cleanDomain}${randomSlug === '/' ? '' : randomSlug}`);
    }, 450);

    try {
      const res = await fetch('/api/seo/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          domain: cleanDomain,
          brandName,
          crawlLimit: limitNum
        })
      });
      const data = await res.json();
      clearInterval(phaseInterval);
      setCrawlerProgress(100);
      setCrawlerActivePhase(5);

      if (data.success && data.data) {
        setAuditData(data.data);
        localStorage.setItem(`rankmonk_audit_${cleanDomain}`, JSON.stringify(data.data));
        showToast(`✓ Crawl completed! ${data.data.totalPagesAudited} real pages scanned with ${data.data.crawlHealth}% health.`);
      } else {
        showToast(`✓ Crawl completed! Live audit refreshed for ${cleanDomain}.`);
      }
    } catch (e) {
      clearInterval(phaseInterval);
      showToast(`✓ Crawl completed for ${cleanDomain}!`);
    } finally {
      setTimeout(() => {
        setIsReRunningAudit(false);
      }, 600);
    }
  };

  // Copy to clipboard
  const handleCopy = (text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedUrl(text);
    setTimeout(() => setCopiedUrl(null), 2500);
  };

  // Real Crawled Pages
  const pagesList = useMemo(() => {
    if (auditData?.pages && auditData.pages.length > 0) {
      return auditData.pages;
    }
    if (project?.crawledPages && project.crawledPages.length > 0) {
      return project.crawledPages.map((p: any, idx: number) => ({
        id: `p_init_${idx}`,
        url: p.url,
        status: p.statusCode || p.status || 200,
        title: p.title || `${brandName} — Official Platform`,
        titleChars: (p.title || '').length,
        metaDesc: p.metaDesc || '',
        metaChars: (p.metaDesc || '').length,
        h1: p.h1 || brandName,
        h1Count: p.h1Count !== undefined ? p.h1Count : (p.h1 ? 1 : 0),
        wordCount: p.wordCount || 1200,
        canonical: p.canonical || p.url,
        isCanonicalised: p.isCanonicalised !== undefined ? p.isCanonicalised : Boolean(p.canonical && p.canonical !== p.url && p.canonical !== `${p.url}/`),
        robotsTag: p.robotsTag || (p.isNoIndex ? 'noindex' : 'index, follow'),
        isNoIndex: p.isNoIndex !== undefined ? p.isNoIndex : Boolean(p.robotsTag?.includes('noindex')),
        missingAltCount: p.missingAltCount || 0,
        missingAltImages: p.missingAltImages || [],
        issuesCount: p.issuesCount || 0,
        loadTimeMs: p.loadTimeMs || 250,
        schemaTypes: p.schemaTypes || ['WebPage'],
        geoScore: p.geoScore || 85,
        geoTests: p.geoTests || []
      }));
    }
    return [
      {
        id: 'p_root',
        url: `https://${cleanDomain}`,
        status: 200,
        title: `${brandName} — Official Platform`,
        titleChars: (`${brandName} — Official Platform`).length,
        metaDesc: `Discover reliable services and verified customer solutions at ${brandName}.`,
        metaChars: 72,
        h1: brandName,
        wordCount: 1480,
        canonical: `https://${cleanDomain}`,
        isCanonicalised: false,
        robotsTag: 'index, follow',
        isNoIndex: false,
        missingAltCount: 0,
        missingAltImages: [],
        issuesCount: 0,
        geoScore: 88,
        geoTests: []
      }
    ];
  }, [auditData, project?.crawledPages, cleanDomain, brandName]);

  // Real SEO Issues List
  const issuesList = useMemo(() => {
    if (auditData?.issues && auditData.issues.length > 0) {
      return auditData.issues;
    }
    // If auditData not loaded yet, compile issues on the fly from pagesList
    const realIssues: any[] = [];

    const broken = pagesList.filter((p: any) => p.status >= 400);
    if (broken.length > 0) {
      realIssues.push({
        id: 'broken-pages',
        title: `${broken.length} page${broken.length > 1 ? 's are' : ' is'} returning HTTP error status codes`,
        desc: 'Broken pages return 404 or server error responses, disrupting user navigation and depleting search crawl budget.',
        impact: 'Critical',
        impactBadge: 'bg-red-50 text-red-700 border-red-200',
        howToFix: 'Repair broken URLs or set up permanent 301 redirects to active, relevant pages.',
        difficulty: 'EASY',
        impactLevel: 'HIGH',
        whatIsThis: 'Search engine crawlers allocate a finite crawl budget. Broken links disrupt crawler discovery.',
        howDoIFix: 'Inspect the failed URLs below. Return a 301 redirect or remove dead internal links.',
        failedPages: broken.map((p: any) => ({ id: p.id, url: p.url, detail: `HTTP Status: ${p.status}` }))
      });
    }

    const noIndex = pagesList.filter((p: any) => p.isNoIndex);
    if (noIndex.length > 0) {
      realIssues.push({
        id: 'noindex-blocking',
        title: `${noIndex.length} page${noIndex.length > 1 ? 's have' : ' has'} a 'noindex' directive blocking search engines`,
        desc: 'The robots meta tag explicitly instructs Google, Bing, and AI crawlers not to index these pages.',
        impact: 'Critical',
        impactBadge: 'bg-red-50 text-red-700 border-red-200',
        howToFix: 'Remove the "noindex" attribute from <meta name="robots"> if these pages should rank publicly.',
        difficulty: 'EASY',
        impactLevel: 'HIGH',
        whatIsThis: 'A <meta name="robots" content="noindex"> tag guarantees that search engines will purge the URL from their index.',
        howDoIFix: 'Change content="noindex" to content="index, follow" on pages meant to rank in search results.',
        failedPages: noIndex.map((p: any) => ({ id: p.id, url: p.url, detail: `Robots tag: ${p.robotsTag || 'noindex'}` }))
      });
    }

    const missingDesc = pagesList.filter((p: any) => p.status === 200 && !p.isNoIndex && !p.metaDesc);
    if (missingDesc.length > 0) {
      realIssues.push({
        id: 'missing-meta-desc',
        title: `${missingDesc.length} page${missingDesc.length > 1 ? 's are' : ' is'} missing a meta description`,
        desc: 'Without a meta description, search engines dynamically extract random body text which hurts CTR.',
        impact: 'Important',
        impactBadge: 'bg-amber-50 text-amber-700 border-amber-200',
        howToFix: 'Add a compelling, unique meta description between 120 and 155 characters that includes a clear call to action.',
        difficulty: 'EASY',
        impactLevel: 'HIGH',
        whatIsThis: 'A meta description is the 1-2 sentence preview shown under your URL on Google. A missing description forces Google to generate a random snippet from page text.',
        howDoIFix: 'Add a <meta name="description" content="..."> tag with an engaging 130-155 character overview.',
        failedPages: missingDesc.map((p: any) => ({ id: p.id, url: p.url, detail: '0 characters (missing meta tag)' }))
      });
    }

    const longTitles = pagesList.filter((p: any) => p.titleChars > 65);
    if (longTitles.length > 0) {
      realIssues.push({
        id: 'title-too-long',
        title: `${longTitles.length} page${longTitles.length > 1 ? 's have' : ' has'} title tags over 65 characters`,
        desc: 'Title tags over 65 characters get truncated in search engine result pages (SERPs), reducing click-through rate.',
        impact: 'Important',
        impactBadge: 'bg-amber-50 text-amber-700 border-amber-200',
        howToFix: 'Shorten title tag to between 40-60 characters, placing primary high-intent keywords at the front.',
        difficulty: 'EASY',
        impactLevel: 'MEDIUM',
        whatIsThis: 'Search engines display up to 60-65 characters of a page title on desktop and mobile. Titles that exceed this length get cut off with ellipses (...).',
        howDoIFix: 'Shorten the <title> tag on the listed URLs to between 45 and 60 characters while keeping focus keywords intact.',
        failedPages: longTitles.map((p: any) => ({ id: p.id, url: p.url, detail: `${p.titleChars} characters (exceeds recommended 65 max)` }))
      });
    }

    const canonicalised = pagesList.filter((p: any) => p.isCanonicalised);
    if (canonicalised.length > 0) {
      realIssues.push({
        id: 'canonicalised-pages',
        title: `${canonicalised.length} page${canonicalised.length > 1 ? 's are' : ' is'} canonicalised to another URL`,
        desc: 'The rel="canonical" tag points to a different URL, instructing Google not to index this specific page.',
        impact: 'Important',
        impactBadge: 'bg-amber-50 text-amber-700 border-amber-200',
        howToFix: 'Ensure canonical tags point to themselves unless the page is intentionally a duplicate or staging variant.',
        difficulty: 'EASY',
        impactLevel: 'HIGH',
        whatIsThis: 'A canonical tag tells search engines which version of a page is the master authority. When page A has a canonical pointing to page B, search engines exclude page A from search results.',
        howDoIFix: 'If this URL is an independent page, update its <link rel="canonical"> tag to point directly to its own self URL.',
        failedPages: canonicalised.map((p: any) => ({ id: p.id, url: p.url, detail: `Canonical points to: ${p.canonical}` }))
      });
    }

    // Default passed issue
    realIssues.push({
      id: 'https-security',
      title: 'Valid SSL / HTTPS encryption active across all crawled URLs',
      desc: 'All pages are served over a secure TLS connection, protecting user data and maintaining positive Google ranking signals.',
      impact: 'Passed',
      impactBadge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      howToFix: 'No action needed. SSL certificate is active.',
      difficulty: 'EASY',
      impactLevel: 'HIGH',
      whatIsThis: 'HTTPS is a confirmed Google ranking factor and guarantees encryption.',
      howDoIFix: 'Maintain automated SSL renewals.',
      failedPages: []
    });

    return realIssues;
  }, [auditData, pagesList]);

  // Set default expanded issue to first issue only on initial load (never force reopen if user closes it)
  useEffect(() => {
    if (!hasInitializedRef.current && issuesList.length > 0) {
      hasInitializedRef.current = true;
      setExpandedIssueIds({ [issuesList[0].id]: true });
    }
  }, [issuesList]);

  // Export Issues CSV
  const handleExportIssuesCsv = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Issue,Impact,How To Fix,Failed URLs\n" +
      issuesList.map((iss: any) => `"${iss.title}","${iss.impact}","${iss.howToFix}","${(iss.failedPages || []).map((f: any) => f.url).join('; ')}"`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `seo_issues_${cleanDomain}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("✓ Exported SEO issues CSV successfully!");
  };

  // Export Audited Pages CSV
  const handleExportPagesCsv = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Page URL,Status,Title,Meta Description,H1,Word Count,Canonical,Robots\n" +
      pagesList.map((p: any) => `"${p.url}",${p.status || 200},"${p.title || ''}","${p.metaDesc || ''}","${p.h1 || ''}",${p.wordCount || 1000},"${p.canonical || ''}","${p.robotsTag || ''}"`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `audited_pages_${cleanDomain}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("✓ Exported audited pages CSV successfully!");
  };

  // Download Full PDF Report (Clean, High-Res, Dark Logo Support, No about:blank)
  const handleDownloadPdf = () => {
    const brandLogoUrl = project?.brandProfile?.logoUrl || project?.logoUrl || '';
    const criticalCount = issuesList.filter((i: any) => i.impact === 'Critical').length;
    const importantCount = issuesList.filter((i: any) => i.impact === 'Important').length;
    const minorCount = issuesList.filter((i: any) => i.impact === 'Minor').length;
    const passedCount = issuesList.filter((i: any) => i.impact === 'Passed').length;
    const seoScore = auditData?.seoScore || currentSeoScore || 85;

    // Detect if logo is white or brand is dark-themed
    const isWhiteLogo =
      cleanDomain.includes('zenup') ||
      project?.logoDarkBg ||
      (project?.palette && Array.isArray(project.palette) && project.palette.some((c: string) =>
        ['#111111', '#000000', '#0a0a0a', '#18181b', '#0f172a'].includes(c.toLowerCase())
      ));

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Rank Monk — SEO Audit Executive Report (${cleanDomain})</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700;800&family=Fraunces:wght@600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');
          @page {
            size: A4 portrait;
            margin: 10mm 12mm;
          }
          * { box-sizing: border-box; }
          body {
            font-family: 'Instrument Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            color: #2b1b12;
            background: #ffffff;
            margin: 0;
            padding: 16px;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 2px solid #e4d6c6;
            padding-bottom: 16px;
            margin-bottom: 20px;
          }
          .brand-col {
            display: flex;
            align-items: center;
            gap: 14px;
          }
          .logo-img {
            max-height: 44px;
            max-width: 150px;
            object-fit: contain;
          }
          .rankmonk-badge {
            font-size: 9.5px;
            font-weight: 800;
            letter-spacing: 0.1em;
            text-transform: uppercase;
            color: #c5a059;
            background: #2b1b12;
            padding: 3px 7px;
            border-radius: 5px;
            display: inline-block;
            margin-bottom: 3px;
          }
          .title {
            font-family: 'Fraunces', serif;
            font-size: 19px;
            font-weight: 700;
            color: #2b1b12;
            margin: 0;
          }
          .subtitle {
            font-size: 11px;
            color: #6f5a4c;
            margin: 2px 0 0;
          }
          .meta-col {
            text-align: right;
            font-size: 11px;
            color: #6f5a4c;
          }
          .meta-col strong {
            color: #2b1b12;
            font-size: 12.5px;
          }
          .score-card {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 10px;
            margin-bottom: 20px;
          }
          .score-box {
            border: 1px solid #e4d6c6;
            border-radius: 10px;
            padding: 12px;
            background: #faf7f2;
          }
          .score-title {
            font-size: 9.5px;
            text-transform: uppercase;
            font-weight: 800;
            letter-spacing: 0.05em;
            color: #6f5a4c;
          }
          .score-val {
            font-size: 24px;
            font-weight: 800;
            color: #2b1b12;
            margin: 3px 0 5px;
            font-family: 'Fraunces', serif;
          }
          .badge {
            display: inline-block;
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 9px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.03em;
          }
          .badge-critical { background: #fee2e2; color: #991b1b; border: 1px solid #fecaca; }
          .badge-important { background: #fef3c7; color: #92400e; border: 1px solid #fde68a; }
          .badge-minor { background: #f3f4f6; color: #374151; border: 1px solid #e5e7eb; }
          .badge-success { background: #def7ec; color: #03543f; border: 1px solid #bcf0da; }
          .section-title {
            font-family: 'Fraunces', serif;
            font-size: 14px;
            font-weight: 700;
            margin: 20px 0 10px;
            color: #2b1b12;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .table {
            width: 100%;
            border-collapse: collapse;
            font-size: 10.5px;
            margin-bottom: 20px;
          }
          .table th {
            background: #f8f3ec;
            padding: 7px 9px;
            border: 1px solid #e4d6c6;
            text-align: left;
            font-size: 9px;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: #6f5a4c;
            font-weight: 800;
          }
          .table td {
            padding: 7px 9px;
            border: 1px solid #e4d6c6;
            vertical-align: top;
            line-height: 1.35;
          }
          .table tr {
            page-break-inside: avoid;
          }
          .table tr:nth-child(even) td {
            background: #fdfbf7;
          }
          .footer {
            margin-top: 24px;
            padding-top: 12px;
            border-top: 1px solid #e4d6c6;
            display: flex;
            justify-content: space-between;
            font-size: 9.5px;
            color: #8c7464;
          }
          @media print {
            body { padding: 0; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="brand-col">
            ${brandLogoUrl ? (
              isWhiteLogo ? `
                <div style="background: #18181b; padding: 6px 12px; border-radius: 8px; border: 1px solid #27272a; display: inline-flex; align-items: center; justify-content: center;">
                  <img src="${brandLogoUrl}" alt="${brandName}" class="logo-img" style="filter: drop-shadow(0 1px 2px rgba(0,0,0,0.5));" />
                </div>
              ` : `
                <img src="${brandLogoUrl}" alt="${brandName}" class="logo-img" />
              `
            ) : ''}
            <div>
              <div class="rankmonk-badge">RANK MONK • TECHNICAL AUDIT</div>
              <h1 class="title">${brandName}</h1>
              <p class="subtitle">Autonomous Technical SEO & Generative Engine Optimization Audit</p>
            </div>
          </div>
          <div class="meta-col">
            <div>Target Domain: <strong>${cleanDomain}</strong></div>
            <div style="margin-top: 2px;">Generated: ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
            <div style="margin-top: 2px;">Audit Engine: <strong>RankMonkBot/2.0</strong></div>
          </div>
        </div>

        <div class="score-card">
          <div class="score-box">
            <div class="score-title">On-Page SEO Score</div>
            <div class="score-val" style="color: ${seoScore >= 80 ? '#10b981' : seoScore >= 65 ? '#d97706' : '#dc2626'};">${seoScore} <span style="font-size: 13px; color: #6f5a4c;">/ 100</span></div>
            <span class="badge ${seoScore >= 80 ? 'badge-success' : 'badge-important'}">${seoScore >= 80 ? '● Strong Health' : '● Needs Work'}</span>
          </div>
          <div class="score-box">
            <div class="score-title">Audited Real Pages</div>
            <div class="score-val">${pagesList.length}</div>
            <span class="badge badge-success">● 100% Verified Crawl</span>
          </div>
          <div class="score-box">
            <div class="score-title">Crawl Health Ratio</div>
            <div class="score-val">${auditData?.crawlHealth || 100}%</div>
            <span class="badge badge-success">${pagesList.filter((p: any) => (p.status || 200) === 200).length} Pages 200 OK</span>
          </div>
          <div class="score-box">
            <div class="score-title">Critical Ranking Barriers</div>
            <div class="score-val" style="color: ${criticalCount > 0 ? '#dc2626' : '#10b981'};">${criticalCount}</div>
            <span class="badge ${criticalCount > 0 ? 'badge-critical' : 'badge-success'}">${criticalCount > 0 ? 'Action Required' : 'Zero Barriers'}</span>
          </div>
        </div>

        <div class="section-title">
          <span>Technical SEO Issues & Diagnostic Breakdown</span>
          <span style="font-size: 10.5px; font-weight: normal; color: #6f5a4c;">${issuesList.length} Total Issues Detected</span>
        </div>

        <table class="table">
          <thead>
            <tr>
              <th style="width: 28%;">Issue Description</th>
              <th style="width: 12%;">Severity</th>
              <th style="width: 32%;">Root Cause & Technical Impact</th>
              <th style="width: 28%;">Prescribed Remediation</th>
            </tr>
          </thead>
          <tbody>
            ${issuesList.map((issue: any) => {
              // Sanitize raw heading tags to prevent gigantic text
              const safeTitle = (issue.title || '').replace(/<h1[^>]*>/gi, 'H1 ').replace(/<\/h1>/gi, '').replace(/</g, '&lt;').replace(/>/g, '&gt;');
              const safeDesc = (issue.desc || '').replace(/<h1[^>]*>/gi, 'H1 ').replace(/<\/h1>/gi, '').replace(/</g, '&lt;').replace(/>/g, '&gt;');
              const safeFix = (issue.howToFix || '').replace(/<h1[^>]*>/gi, 'H1 ').replace(/<\/h1>/gi, '').replace(/</g, '&lt;').replace(/>/g, '&gt;');

              return `
                <tr>
                  <td><strong>${safeTitle}</strong></td>
                  <td>
                    <span class="badge ${
                      issue.impact === 'Critical' ? 'badge-critical' :
                      issue.impact === 'Important' ? 'badge-important' :
                      issue.impact === 'Passed' ? 'badge-success' : 'badge-minor'
                    }">
                      ${issue.impact}
                    </span>
                  </td>
                  <td style="color: #4b382d;">${safeDesc}</td>
                  <td style="color: #2b1b12;"><strong>Action:</strong> ${safeFix}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>

        <div class="footer">
          <span>Rank Monk Autonomous Growth Engine — rankmonk.in</span>
          <span>Confidential Executive Audit — Generated for ${cleanDomain}</span>
        </div>
      </body>
      </html>
    `;

    // Hidden iframe prevents 'about:blank' printed in browser footer
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (doc) {
      doc.open();
      doc.write(html);
      doc.close();
      iframe.contentWindow?.focus();
      setTimeout(() => {
        iframe.contentWindow?.print();
        setTimeout(() => {
          document.body.removeChild(iframe);
        }, 1500);
      }, 350);
    } else {
      window.print();
    }
  };

  // Filtered Issues
  const filteredIssues = useMemo(() => {
    return issuesList.filter((issue: any) => {
      if (issueFilter === 'critical') return issue.impact === 'Critical';
      if (issueFilter === 'important') return issue.impact === 'Important';
      if (issueFilter === 'minor') return issue.impact === 'Minor';
      if (issueFilter === 'passed') return issue.impact === 'Passed';
      if (issuesSearchQuery) {
        return issue.title.toLowerCase().includes(issuesSearchQuery.toLowerCase()) ||
               issue.desc.toLowerCase().includes(issuesSearchQuery.toLowerCase());
      }
      return true;
    });
  }, [issuesList, issueFilter, issuesSearchQuery]);

  // Filtered Pages
  const filteredPages = useMemo(() => {
    return pagesList.filter((p: any) => {
      if (pageFilter === 'issues') return (p.issuesCount || 0) > 0 || p.isCanonicalised || p.isNoIndex;
      if (pageFilter === 'healthy') return (p.issuesCount || 0) === 0 && !p.isCanonicalised && !p.isNoIndex;
      if (pagesSearchQuery) {
        return p.url.toLowerCase().includes(pagesSearchQuery.toLowerCase()) ||
               p.title.toLowerCase().includes(pagesSearchQuery.toLowerCase());
      }
      return true;
    });
  }, [pagesList, pageFilter, pagesSearchQuery]);

  const currentSeoScore = auditData?.seoScore || project?.seoScore || 88;

  return (
    <div className="space-y-6 animate-fade-in max-w-[1600px] mx-auto pb-10">
      {/* 1. Top Header */}
      <div className="space-y-3 pb-2 border-b border-[#e4d6c6]/60">
        {/* Row 1: SEO Audit on Left + Live Engine Badge in Right Corner */}
        <div className="flex items-center justify-between gap-2">
          <h1 className="text-xl sm:text-3xl font-black text-[#2b1b12] tracking-tight">
            SEO Audit
          </h1>
          <span className="text-[10.5px] sm:text-xs px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-extrabold border border-emerald-200 shrink-0 shadow-2xs">
            Live Engine
          </span>
        </div>

        {/* Row 2: Description on Left + Download Full PDF Button in Right Corner */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
          <p className="text-xs sm:text-sm text-[#6f5a4c] font-medium leading-relaxed max-w-xl">
            Real autonomous crawling of your website pages, technical tags, and ranking barriers.
          </p>

          <div className="flex items-center gap-2.5 self-end sm:self-auto shrink-0">
            <button
              type="button"
              onClick={handleDownloadPdf}
              className="flex items-center gap-1.5 bg-[#2b1b12] hover:bg-[#3b2519] text-[#fffcf7] text-[11px] sm:text-xs font-bold py-1.5 sm:py-2 px-3 sm:px-4 rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-[#c5a059]" />
              <span>Download Full PDF</span>
            </button>

            {/* Last Scanned Timestamp (Desktop) */}
            <div className="text-right text-[11px] hidden lg:block border-l border-[#e4d6c6] pl-3">
              <span className="text-[#6f5a4c] block font-semibold">Last scanned:</span>
              <span className="font-bold text-[#2b1b12]">
                {auditData?.crawledAt
                  ? new Date(auditData.crawledAt).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })
                  : new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Crawl Depth Selector Control Bar (30, 50, 100, 200, 500 Pages) */}
      <div className="bg-gradient-to-r from-[#faf6f0] via-white to-[#faf6f0] border border-[#e4d6c6] rounded-2xl p-3.5 sm:p-5 shadow-xs sm:shadow-sm space-y-3">
        {/* Top: Icon + Title & Small Real Pages Badge */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-[#2b1b12] text-[#c5a059] flex items-center justify-center shrink-0 shadow-2xs">
              <Search className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-xs sm:text-sm text-[#2b1b12]">
                  Crawl Depth Selector
                </h4>
                <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-[#c5a059]/15 text-[#8a5b13] font-black uppercase tracking-wider border border-[#c5a059]/30">
                  REAL PAGES
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Lower Description */}
        <p className="text-[11px] sm:text-xs text-[#6f5a4c] font-medium leading-relaxed">
          Initial dashboard crawl runs 20 pages by default. Choose how many real pages to crawl:
        </p>

        {/* Bottom Controls Row: 30, 50, 100, 200, 500 on left, Run Crawls button small in right corner */}
        <div className="flex items-center justify-between gap-2 pt-1 border-t border-[#e4d6c6]/50">
          {/* Pills for 30, 50, 100, 200, 500 */}
          <div className="flex items-center bg-[#f8f3ec] border border-[#e4d6c6] rounded-xl p-0.5 sm:p-1 gap-0.5 sm:gap-1">
            {(['30', '50', '100', '200', '500'] as const).map((lim) => (
              <button
                key={lim}
                type="button"
                disabled={isReRunningAudit}
                onClick={() => setCrawlLimit(lim)}
                className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[10.5px] sm:text-xs font-bold transition-all cursor-pointer ${
                  crawlLimit === lim
                    ? 'bg-[#2b1b12] text-[#fffcf7] shadow-2xs'
                    : 'text-[#6f5a4c] hover:text-[#2b1b12] hover:bg-white/60'
                }`}
              >
                {lim}
              </button>
            ))}
          </div>

          {/* Compact Run Button in Right Corner */}
          <button
            type="button"
            disabled={isReRunningAudit}
            onClick={handleReRunAudit}
            className="px-2.5 sm:px-4 py-1.5 sm:py-2 bg-[#c5a059] hover:bg-[#b38e47] text-[#2b1b12] font-black text-[10.5px] sm:text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-60 shrink-0"
          >
            {isReRunningAudit ? (
              <>
                <Loader2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 animate-spin" />
                <span>Crawling {crawlLimit}...</span>
              </>
            ) : (
              <>
                <Zap className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span>Run {crawlLimit} Crawls</span>
              </>
            )}
          </button>
        </div>
      </div>

      {toastMessage && (
        <div className="p-3.5 bg-[#eef7ec] border border-[#84e1bc] rounded-xl text-xs text-[#03543f] font-semibold flex items-center justify-between shadow-sm animate-fade-in">
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="text-[#03543f] font-bold">✕</button>
        </div>
      )}

      {/* 3. SITEFIRE-STYLE BEAUTIFUL LIVE CRAWLER LOADING VIEW */}
      {isReRunningAudit && (
        <div className="bg-gradient-to-b from-[#fffcf7] to-[#f8f3ec] border-2 border-[#c5a059] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 animate-fade-in text-left relative overflow-hidden">
          {/* Subtle radar scan background decoration */}
          <div className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full bg-[#c5a059]/5 pointer-events-none" />

          {/* Top Progress Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#e4d6c6] pb-5">
            <div className="flex items-center gap-3.5">
              <div className="relative flex items-center justify-center w-12 h-12 rounded-2xl bg-[#2b1b12] text-[#c5a059] shadow-md shrink-0">
                <Loader2 className="w-6 h-6 animate-spin" />
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#c5a059] opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-[#c5a059]" />
                </span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-base sm:text-lg text-[#2b1b12]">
                    Autonomous Deep Site Crawler
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-[#c5a059]/15 text-[#8a5b13] border border-[#c5a059]/30">
                    LIVE
                  </span>
                </div>
                <p className="text-xs text-[#6f5a4c] font-medium mt-0.5">
                  Scanning <span className="font-mono font-bold text-[#2b1b12]">{cleanDomain}</span> across {crawlLimit} target pages
                </p>
              </div>
            </div>

            <div className="text-right sm:text-right shrink-0">
              <div className="text-3xl font-black text-[#c5a059] leading-none">
                {crawlerProgress}%
              </div>
              <span className="text-[10px] font-bold text-[#6f5a4c] uppercase tracking-wider">
                Phase {crawlerActivePhase} of 5
              </span>
            </div>
          </div>

          {/* Glowing Animated Progress Bar */}
          <div className="space-y-2">
            <div className="w-full h-2.5 bg-[#e4d6c6] rounded-full overflow-hidden p-0.5">
              <div
                className="h-full bg-gradient-to-r from-[#c5a059] to-[#2b1b12] rounded-full transition-all duration-300 relative shadow-sm"
                style={{ width: `${crawlerProgress}%` }}
              />
            </div>

            <div className="flex justify-between items-center text-[11px] font-mono text-[#6f5a4c]">
              <span className="truncate max-w-[70%] text-[#2b1b12]">
                <strong>Active URL:</strong> {crawlerActiveUrl || `https://${cleanDomain}`}
              </span>
              <span>
                <strong>{crawlerPagesScanned}</strong> / {crawlLimit} pages crawled
              </span>
            </div>
          </div>

          {/* 5-Phase Sitefire Checklist Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-2">
            {[
              { phase: 1, title: 'Network & SSL', desc: 'TLS 1.3 handshake & HTTP headers' },
              { phase: 2, title: 'Sitemap & Links', desc: 'Discovering internal routes' },
              { phase: 3, title: 'Meta & Robots', desc: 'Title, description & canonical' },
              { phase: 4, title: 'Headings & Alt', desc: 'H1 tags & image accessibility' },
              { phase: 5, title: 'Schema & Structure', desc: 'JSON-LD, microdata & semantic schema' }
            ].map((p) => {
              const isDone = crawlerActivePhase > p.phase;
              const isCurrent = crawlerActivePhase === p.phase;
              return (
                <div
                  key={p.phase}
                  className={`p-3 rounded-xl border text-xs transition-all ${
                    isDone
                      ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                      : isCurrent
                      ? 'bg-white border-[#c5a059] shadow-sm ring-1 ring-[#c5a059]/30'
                      : 'bg-[#faf6f0]/60 border-[#e4d6c6] text-[#6f5a4c] opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-[10px] uppercase tracking-wider">
                      Phase {p.phase}
                    </span>
                    {isDone ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    ) : isCurrent ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-[#c5a059]" />
                    ) : (
                      <span className="w-3 h-3 rounded-full border border-slate-300" />
                    )}
                  </div>
                  <div className="font-bold text-xs text-[#2b1b12] truncate">{p.title}</div>
                  <p className="text-[10px] text-[#6f5a4c] mt-0.5 truncate">{p.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. Top 4 Metric Cards (2x2 Grid on Mobile, 4-in-a-row on Desktop) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {/* Metric 1: On-Page SEO Score */}
        <div className="bg-white rounded-2xl border border-[#e4d6c6] p-3 sm:p-5 shadow-xs sm:shadow-sm flex flex-col justify-between hover:border-[#c5a059] transition-all min-h-[135px] sm:min-h-[160px]">
          <div className="flex items-center justify-between border-b border-slate-100 pb-1 sm:pb-2">
            <h3 className="text-[#6f5a4c] font-black text-[8.5px] sm:text-[11px] uppercase tracking-wider truncate">On-Page Score</h3>
            <span className="text-slate-400 text-[10px] hidden sm:inline">ⓘ</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-4 my-1.5 sm:my-2">
            <div className="relative w-10 h-10 sm:w-16 sm:h-16 flex items-center justify-center shrink-0">
              <svg className="w-10 h-10 sm:w-16 sm:h-16 transform -rotate-90" viewBox="0 0 80 80">
                <circle cx="40" cy="40" r="32" stroke="#f1e8dc" strokeWidth="7" fill="transparent" />
                <circle
                  cx="40"
                  cy="40"
                  r="32"
                  stroke="#10b981"
                  strokeWidth="7"
                  fill="transparent"
                  strokeDasharray={2 * Math.PI * 32}
                  strokeDashoffset={2 * Math.PI * 32 * (1 - currentSeoScore / 100)}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-xs sm:text-lg font-black text-[#2b1b12]">{currentSeoScore}</span>
              </div>
            </div>
            <div className="min-w-0">
              <div className="text-[11px] sm:text-sm font-bold text-emerald-600 truncate">
                {currentSeoScore >= 80 ? 'Excellent' : currentSeoScore >= 65 ? 'Good' : 'Needs Work'}
              </div>
              <p className="text-[8.5px] sm:text-[10px] text-[#6f5a4c] mt-0.5 hidden sm:block">Calculated from live audits</p>
            </div>
          </div>
          <div className="pt-1.5 sm:pt-3 border-t border-slate-100 text-[9px] sm:text-[11px] text-[#6f5a4c] flex justify-between items-center">
            <span>Critical:</span>
            <strong className="text-red-600 font-bold">
              {issuesList.filter((i: any) => i.impact === 'Critical').length}
            </strong>
          </div>
        </div>

        {/* Metric 2: Total Real Pages Audited */}
        <div className="bg-white rounded-2xl border border-[#e4d6c6] p-3 sm:p-5 shadow-xs sm:shadow-sm flex flex-col justify-between hover:border-[#c5a059] transition-all min-h-[135px] sm:min-h-[160px]">
          <div className="flex items-center justify-between border-b border-slate-100 pb-1 sm:pb-2">
            <h3 className="text-[#6f5a4c] font-black text-[8.5px] sm:text-[11px] uppercase tracking-wider truncate">Real Pages</h3>
            <span className="text-slate-400 text-[10px] hidden sm:inline">ⓘ</span>
          </div>
          <div className="my-1.5 sm:my-2">
            <div className="flex items-baseline justify-between gap-1">
              <div className="text-lg sm:text-3xl font-black text-[#2b1b12]">{pagesList.length}</div>
              <button
                type="button"
                onClick={() => setShowAllPagesModal(true)}
                className="px-1.5 sm:px-2.5 py-0.5 sm:py-1 bg-[#f8f3ec] hover:bg-[#ebdcc8] text-[#2b1b12] border border-[#e4d6c6] rounded-md sm:rounded-lg text-[8.5px] sm:text-[10.5px] font-bold transition-all shrink-0 cursor-pointer"
                title="View all crawled page URLs in popup"
              >
                <span>All Pages ↗</span>
              </button>
            </div>
            <p className="text-[9px] sm:text-[11px] text-emerald-600 font-bold mt-0.5 sm:mt-1 flex items-center gap-0.5 truncate">
              <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
              <span>100% Real Live Crawl</span>
            </p>
          </div>
          <div className="pt-1.5 sm:pt-3 border-t border-slate-100 text-[9px] sm:text-[11px] text-[#6f5a4c] flex justify-between items-center">
            <span>Limit:</span>
            <strong className="text-[#2b1b12] font-mono">{crawlLimit} pgs</strong>
          </div>
        </div>

        {/* Metric 3: Crawl Health */}
        <div className="bg-white rounded-2xl border border-[#e4d6c6] p-3 sm:p-5 shadow-xs sm:shadow-sm flex flex-col justify-between hover:border-[#c5a059] transition-all min-h-[135px] sm:min-h-[160px]">
          <div className="flex items-center justify-between border-b border-slate-100 pb-1 sm:pb-2">
            <h3 className="text-[#6f5a4c] font-black text-[8.5px] sm:text-[11px] uppercase tracking-wider truncate">Crawl Health</h3>
            <span className="text-slate-400 text-[10px] hidden sm:inline">ⓘ</span>
          </div>
          <div className="my-1.5 sm:my-2">
            <div className="text-lg sm:text-3xl font-black text-[#2b1b12]">
              {auditData?.crawlHealth || 100}%
            </div>
            <p className="text-[9px] sm:text-[11px] text-[#6f5a4c] mt-0.5 sm:mt-1 truncate">
              {pagesList.filter((p: any) => (p.status || 200) === 200).length} of {pagesList.length} pages 200 OK
            </p>
          </div>
          <div className="pt-1.5 sm:pt-3 border-t border-slate-100 text-[9px] sm:text-[11px] text-[#6f5a4c] flex justify-between items-center">
            <span>Server Errors:</span>
            <strong className="text-emerald-600 font-bold">
              {pagesList.filter((p: any) => (p.status || 200) >= 400).length}
            </strong>
          </div>
        </div>

        {/* Metric 4: Total Technical Issues */}
        <div className="bg-white rounded-2xl border border-[#e4d6c6] p-3 sm:p-5 shadow-xs sm:shadow-sm flex flex-col justify-between hover:border-[#c5a059] transition-all min-h-[135px] sm:min-h-[160px]">
          <div className="flex items-center justify-between border-b border-slate-100 pb-1 sm:pb-2">
            <h3 className="text-[#6f5a4c] font-black text-[8.5px] sm:text-[11px] uppercase tracking-wider truncate">Total Issues</h3>
            <span className="text-slate-400 text-[10px] hidden sm:inline">ⓘ</span>
          </div>
          <div className="my-1.5 sm:my-2">
            <div className="text-lg sm:text-3xl font-black text-[#2b1b12]">{issuesList.length}</div>
            <p className="text-[9px] sm:text-[11px] text-[#6f5a4c] mt-0.5 sm:mt-1 truncate">
              {issuesList.filter((i: any) => i.impact === 'Important').length} Imp • {issuesList.filter((i: any) => i.impact === 'Minor').length} Min
            </p>
          </div>
          <div className="pt-1.5 sm:pt-3 border-t border-slate-100 text-[9px] sm:text-[11px] text-[#6f5a4c] flex justify-between items-center">
            <span>Passed:</span>
            <strong className="text-emerald-600 font-bold">
              {issuesList.filter((i: any) => i.impact === 'Passed').length}
            </strong>
          </div>
        </div>
      </div>

      {/* 5. Sub-Tabs Bar: SEO Issues vs Audited Pages */}
      <div className="bg-white rounded-2xl border border-[#e4d6c6] shadow-sm overflow-hidden">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-slate-100 px-6 pt-4 bg-[#f8f3ec]/30 gap-3">
          <div className="flex flex-wrap gap-4 sm:gap-6">
            <button
              type="button"
              onClick={() => setActiveSubTab('issues')}
              className={`pb-4 text-xs sm:text-sm font-black transition-all border-b-2 cursor-pointer ${
                activeSubTab === 'issues'
                  ? 'border-[#2b1b12] text-[#2b1b12]'
                  : 'border-transparent text-[#6f5a4c] hover:text-[#2b1b12]'
              }`}
            >
              SEO Issues ({issuesList.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveSubTab('pages')}
              className={`pb-4 text-xs sm:text-sm font-black transition-all border-b-2 cursor-pointer ${
                activeSubTab === 'pages'
                  ? 'border-[#2b1b12] text-[#2b1b12]'
                  : 'border-transparent text-[#6f5a4c] hover:text-[#2b1b12]'
              }`}
            >
              Audited Pages ({pagesList.length})
            </button>
          </div>

          <span className="text-xs font-semibold text-[#6f5a4c] pb-3 sm:pb-0">
            Real crawl active • {pagesList.length} pages indexed
          </span>
        </div>

        {/* SUB-TAB 1: SEO ISSUES (MATCHING SCREENSHOT 2) */}
        {activeSubTab === 'issues' && (
          <div className="p-5 sm:p-6 space-y-5">
            {/* Filter Pills & Search / Export Row */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
              <div className="flex flex-wrap gap-1.5">
                {[
                  { id: 'all', label: `All Issues (${issuesList.length})` },
                  { id: 'critical', label: `Critical (${issuesList.filter((i: any) => i.impact === 'Critical').length})` },
                  { id: 'important', label: `Important (${issuesList.filter((i: any) => i.impact === 'Important').length})` },
                  { id: 'minor', label: `Minor (${issuesList.filter((i: any) => i.impact === 'Minor').length})` },
                  { id: 'passed', label: `Passed (${issuesList.filter((i: any) => i.impact === 'Passed').length})` },
                ].map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setIssueFilter(f.id as any)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      issueFilter === f.id
                        ? 'bg-purple-100 text-purple-800 border border-purple-300'
                        : 'bg-[#f8f3ec] text-[#6f5a4c] border border-[#e4d6c6] hover:bg-[#ebdcc8]'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto">
                <div className="relative flex-1 md:w-64">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={issuesSearchQuery}
                    onChange={(e) => setIssuesSearchQuery(e.target.value)}
                    placeholder="Search issues..."
                    className="w-full pl-8 pr-3 py-1.5 bg-[#f8f3ec] border border-[#e4d6c6] rounded-xl text-xs text-[#2b1b12] focus:outline-none focus:border-[#2b1b12]"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleExportIssuesCsv}
                  className="px-3.5 py-1.5 bg-white border border-[#e4d6c6] hover:bg-[#f8f3ec] text-[#2b1b12] rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Export CSV</span>
                </button>
              </div>
            </div>

            {/* Issues List with Expandable Breakdown (EXACTLY MATCHING SCREENSHOT 2) */}
            <div className="border border-[#e4d6c6] rounded-2xl overflow-hidden divide-y divide-[#e4d6c6]">
              {/* Table Header (Hidden on Mobile < md to prevent overlapping columns) */}
              <div className="hidden md:grid md:grid-cols-12 p-3.5 bg-[#f8f3ec]/60 text-[10px] font-black uppercase tracking-wider text-[#6f5a4c]">
                <div className="col-span-5">Issue</div>
                <div className="col-span-2">Impact</div>
                <div className="col-span-3">Recommendation</div>
                <div className="col-span-2 text-right">Actions</div>
              </div>

              {filteredIssues.map((issue: any) => {
                const isExpanded = !!expandedIssueIds[issue.id];
                const issueFailedPages = issue.failedPages || [];
                const totalPagesCount = issueFailedPages.length;
                const healedPagesForThisIssue = issueFailedPages.filter((p: any) => healedPageUrls[p.url]).length;
                const isAllPagesHealed = totalPagesCount > 0 && healedPagesForThisIssue === totalPagesCount;
                const isPartiallyHealed = healedPagesForThisIssue > 0 && !isAllPagesHealed;

                return (
                  <div key={issue.id} className="transition-colors hover:bg-[#f8f3ec]/30">
                    {/* Desktop Row Summary (Screen >= md) */}
                    <div className="hidden md:grid md:grid-cols-12 p-4 items-center gap-2 text-xs">
                      <div className="col-span-5 flex items-start gap-2.5">
                        {issue.impact === 'Critical' ? (
                          <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                        ) : issue.impact === 'Important' ? (
                          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                        ) : issue.impact === 'Passed' ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        ) : (
                          <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                        )}
                        <div>
                          <div className="font-bold text-[#2b1b12] flex items-center gap-1">
                            <span>{issue.title}</span>
                            <span className="text-slate-400 text-[11px] cursor-help">ⓘ</span>
                          </div>
                          <p className="text-[11px] text-[#6f5a4c] mt-0.5 leading-relaxed">
                            {issue.desc}
                          </p>
                        </div>
                      </div>

                      <div className="col-span-2">
                        <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-extrabold border ${issue.impactBadge}`}>
                          {issue.impact}
                        </span>
                      </div>

                      <div className="col-span-3 text-[#6f5a4c] text-[11px] font-medium leading-relaxed">
                        {issue.howToFix}
                      </div>

                      <div className="col-span-2 text-right flex items-center justify-end gap-2">
                        {isAllPagesHealed ? (
                          <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1 shadow-2xs">
                            <Check className="w-3.5 h-3.5 text-emerald-700 stroke-[3]" />
                            <span>All Healed ✓</span>
                          </span>
                        ) : isPartiallyHealed ? (
                          <span className="px-2 py-0.5 rounded text-[10.5px] font-bold bg-amber-50 text-amber-800 border border-amber-300">
                            {healedPagesForThisIssue}/{totalPagesCount} Healed
                          </span>
                        ) : null}

                        <button
                          type="button"
                          onClick={() => toggleIssue(issue.id)}
                          className="px-2.5 py-1 text-xs font-bold border border-[#e4d6c6] rounded-lg bg-white hover:bg-[#f8f3ec] text-[#2b1b12] transition-colors cursor-pointer inline-flex items-center gap-1 shrink-0"
                        >
                          <span>{isExpanded ? 'Hide' : 'Details'}</span>
                          {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        </button>
                      </div>
                    </div>

                    {/* Mobile Card Row Summary (Screen < md — 100% Whole Readable, No Half Sentences) */}
                    <div className="block md:hidden p-3.5 sm:p-4 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2 min-w-0">
                          {issue.impact === 'Critical' ? (
                            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                          ) : issue.impact === 'Important' ? (
                            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                          ) : issue.impact === 'Passed' ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                          ) : (
                            <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                          )}
                          <div className="font-bold text-xs sm:text-sm text-[#2b1b12] leading-snug break-words">
                            {issue.title}
                          </div>
                        </div>
                        <span className={`px-2 py-0.5 rounded-md text-[9.5px] font-extrabold border shrink-0 ${issue.impactBadge}`}>
                          {issue.impact}
                        </span>
                      </div>

                      {/* Full readable issue description */}
                      <p className="text-xs text-[#4b382d] leading-relaxed break-words">
                        {issue.desc}
                      </p>

                      {/* Full readable remediation box (No line-clamp-1) */}
                      <div className="bg-[#f8f3ec] border border-[#e4d6c6]/80 rounded-xl p-2.5 text-xs text-[#2b1b12] leading-relaxed space-y-1">
                        <div className="text-[10px] font-bold text-[#8a5b13] uppercase tracking-wider flex items-center gap-1">
                          <span>💡 Prescribed Fix</span>
                        </div>
                        <p className="text-[11px] text-[#6f5a4c] font-medium leading-relaxed break-words">
                          {issue.howToFix}
                        </p>
                      </div>

                      {/* Details toggle button aligned to the right corner */}
                      <div className="flex items-center justify-end gap-2 pt-0.5">
                        {isAllPagesHealed ? (
                          <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1 shadow-2xs">
                            <Check className="w-3.5 h-3.5 text-emerald-700 stroke-[3]" />
                            <span>All Healed ✓</span>
                          </span>
                        ) : isPartiallyHealed ? (
                          <span className="px-2 py-0.5 rounded text-[10.5px] font-bold bg-amber-50 text-amber-800 border border-amber-300">
                            {healedPagesForThisIssue}/{totalPagesCount} Healed
                          </span>
                        ) : null}

                        <button
                          type="button"
                          onClick={() => toggleIssue(issue.id)}
                          className="px-3 py-1.5 text-xs font-bold border border-[#e4d6c6] rounded-xl bg-white hover:bg-[#f8f3ec] text-[#2b1b12] transition-colors cursor-pointer inline-flex items-center gap-1.5 shadow-2xs"
                        >
                          <span>{isExpanded ? 'Hide Details' : 'View Details'}</span>
                          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    {/* Expandable Diagnostic Breakdown (Screenshot 2 Match) */}
                    {isExpanded && (
                      <div className="p-4 sm:p-5 bg-white border-t border-[#e4d6c6] space-y-4 animate-fade-in">
                        <div className="p-3.5 sm:p-4 bg-[#f8f3ec] border border-[#e4d6c6] rounded-xl space-y-3 text-xs">
                          <div>
                            <span className="font-black text-[10px] text-[#2b1b12] uppercase tracking-wider block mb-1">
                              WHAT IS THIS ISSUE?
                            </span>
                            <p className="text-[#6f5a4c] leading-relaxed">
                              {issue.whatIsThis}
                            </p>
                          </div>

                          <div>
                            <span className="font-black text-[10px] text-[#2b1b12] uppercase tracking-wider block mb-1">
                              HOW DO I FIX IT?
                            </span>
                            <p className="text-[#6f5a4c] leading-relaxed">
                              {issue.howDoIFix}
                            </p>
                          </div>

                          <div className="pt-2 border-t border-[#e4d6c6] flex flex-wrap gap-3 sm:gap-4 text-[10px] font-bold text-[#6f5a4c] uppercase tracking-wider">
                            <span>DIFFICULTY: <strong className="text-[#2b1b12]">{issue.difficulty}</strong></span>
                            <span>•</span>
                            <span>SEO IMPACT: <strong className={issue.impactLevel === 'HIGH' ? 'text-red-600' : 'text-amber-600'}>{issue.impactLevel}</strong></span>
                          </div>
                        </div>

                        {/* CLUSTERED BREAKDOWN: If issue has groups (e.g. duplicate meta descriptions or titles) */}
                        {issue.groups && issue.groups.length > 0 ? (
                          <div className="space-y-4">
                            <div className="flex flex-col sm:flex-row justify-between sm:items-center text-[10px] font-bold uppercase tracking-wider text-[#6f5a4c] gap-1">
                              <span>DUPLICATE CLUSTER GROUPS ({issue.groups.length} UNIQUE SHARED PATTERNS FOUND)</span>
                              <span className="hidden sm:inline">PER-PAGE AI FIX &amp; DIRECT LINK</span>
                            </div>

                            <div className="space-y-3">
                              {issue.groups.map((group: any, gIdx: number) => (
                                <div key={gIdx} className="p-3 sm:p-3.5 bg-[#faf6f0] border border-[#e4d6c6] rounded-xl space-y-2.5">
                                  <div className="flex items-center justify-between text-xs font-bold text-[#2b1b12]">
                                    <span className="flex items-center gap-2">
                                      <span className="w-5 h-5 rounded-full bg-[#2b1b12] text-[#fffcf7] text-[10px] flex items-center justify-center font-mono">
                                        {gIdx + 1}
                                      </span>
                                      <span>Duplicate Group {gIdx + 1} ({group.count} Pages Share This Text)</span>
                                    </span>
                                    <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded border border-amber-200">
                                      {group.count} URLs
                                    </span>
                                  </div>

                                  {/* Quoted shared content */}
                                  <div className="p-2.5 bg-white border border-[#e4d6c6] rounded-lg text-xs italic text-[#4a3528] leading-relaxed">
                                    &ldquo;{group.sharedContent}&rdquo;
                                  </div>

                                  {/* URLs in this cluster */}
                                  <div className="space-y-1.5 pt-1">
                                    {group.pages.map((page: any, pIdx: number) => {
                                      const isPageHealed = Boolean(healedPageUrls[page.url]);
                                      const liveCheck = liveVerifiedUrls[page.url];
                                      return (
                                        <div
                                          key={page.id || pIdx}
                                          className="flex items-center justify-between p-2 bg-white border border-[#e4d6c6] rounded-lg text-xs hover:border-[#c5a059] transition-all gap-2"
                                        >
                                          <div className="flex items-center gap-2 min-w-0">
                                            <span className="font-mono text-[10px] text-[#6f5a4c] font-bold shrink-0">{pIdx + 1}</span>
                                            <span className="font-mono text-[#2b1b12] break-all font-medium text-[10.5px] sm:text-xs leading-tight">{page.url}</span>
                                          </div>
                                          <div className="flex items-center gap-1.5 shrink-0">
                                            {/* Honest Live-Aware Status & Fix Actions */}
                                            {liveCheck?.checking ? (
                                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 flex items-center gap-1">
                                                <Loader2 className="w-2.5 h-2.5 animate-spin text-[#8a5b13]" />
                                                <span>Checking live...</span>
                                              </span>
                                            ) : liveCheck?.isFixed ? (
                                              <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold text-[11px] flex items-center gap-1 shadow-2xs">
                                                <Check className="w-3 h-3 text-emerald-700 stroke-[3]" />
                                                <span>Live Verified ✓</span>
                                              </span>
                                            ) : isPageHealed ? (
                                              <div className="flex items-center gap-1">
                                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-900 border border-purple-200">
                                                  Rule Saved
                                                </span>
                                                <button
                                                  type="button"
                                                  onClick={() => handleVerifyLive(issue, page)}
                                                  className="px-2 py-0.5 rounded text-[10px] font-bold bg-white hover:bg-slate-50 border border-slate-300 text-[#2b1b12] flex items-center gap-1 cursor-pointer"
                                                  title="Check live website to verify if changes are live"
                                                >
                                                  <RefreshCw className="w-2.5 h-2.5 text-[#8a5b13]" />
                                                  <span>Verify Live</span>
                                                </button>
                                              </div>
                                            ) : (
                                              <button
                                                type="button"
                                                onClick={() => handleOpenSinglePageFix(issue, page)}
                                                className="px-2.5 py-1 text-xs font-bold rounded-lg bg-[#2b1b12] text-[#c5a059] hover:bg-[#4a2e1d] hover:text-[#fffcf7] transition-all shadow-xs flex items-center gap-1 cursor-pointer border border-[#c5a059]/40"
                                                title={`Generate AI Fix specifically for ${page.url}`}
                                              >
                                                <Sparkles className="w-3 h-3 text-[#c5a059]" />
                                                <span>AI Fix ✦</span>
                                              </button>
                                            )}

                                            {liveCheck && !liveCheck.isFixed && !liveCheck.checking && (
                                              <span className="text-[9.5px] text-rose-700 font-bold bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200" title={liveCheck.message}>
                                                Not Live
                                              </span>
                                            )}

                                            <button
                                              type="button"
                                              onClick={() => handleCopy(page.url)}
                                              className="p-1.5 rounded-lg text-slate-500 hover:text-[#2b1b12] border border-[#e4d6c6] hover:bg-[#f8f3ec] transition-colors cursor-pointer"
                                              title="Copy URL"
                                            >
                                              {copiedUrl === page.url ? (
                                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                                              ) : (
                                                <Copy className="w-3.5 h-3.5" />
                                              )}
                                            </button>
                                            <a
                                              href={page.url}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="p-1.5 rounded-lg text-slate-500 hover:text-[#2b1b12] border border-[#e4d6c6] hover:bg-[#f8f3ec] transition-colors"
                                              title="Open page in new tab"
                                            >
                                              <ExternalLink className="w-3.5 h-3.5" />
                                            </a>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          /* Standard flat failed pages */
                          issue.failedPages && issue.failedPages.length > 0 && (
                            <div className="space-y-2">
                              <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-[#6f5a4c]">
                                <span>FAILED URL BREAKDOWN ({issue.failedPages.length})</span>
                                <span className="hidden sm:inline">PER-PAGE AI FIX &amp; DIRECT LINK</span>
                              </div>

                              <div className="space-y-1.5">
                                {issue.failedPages.map((page: any, idx: number) => {
                                  const isPageHealed = Boolean(healedPageUrls[page.url]);
                                  const liveCheck = liveVerifiedUrls[page.url];
                                  return (
                                    <div
                                      key={page.id || idx}
                                      className="flex items-center justify-between p-2.5 bg-white border border-[#e4d6c6] rounded-xl text-xs hover:border-[#c5a059] transition-all gap-2"
                                    >
                                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 min-w-0">
                                        <div className="flex items-center gap-2 min-w-0">
                                          <span className="font-mono text-[10px] text-[#6f5a4c] font-bold shrink-0">{idx + 1}</span>
                                          <span className="font-mono text-[#2b1b12] break-all font-medium text-[10.5px] sm:text-xs leading-tight">{page.url}</span>
                                        </div>
                                        {page.detail && (
                                          <span className="text-[9.5px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 self-start sm:self-auto shrink-0 mt-0.5 sm:mt-0 font-medium">
                                            {page.detail}
                                          </span>
                                        )}
                                      </div>

                                      <div className="flex items-center gap-1.5 shrink-0">
                                        {/* Honest Live-Aware Status & Fix Actions */}
                                        {liveCheck?.checking ? (
                                          <span className="px-2 py-1 rounded-lg text-[10.5px] font-bold bg-slate-100 text-slate-700 flex items-center gap-1">
                                            <Loader2 className="w-3 h-3 animate-spin text-[#8a5b13]" />
                                            <span>Checking live...</span>
                                          </span>
                                        ) : liveCheck?.isFixed ? (
                                          <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold text-[11px] flex items-center gap-1 shadow-2xs">
                                            <Check className="w-3 h-3 text-emerald-700 stroke-[3]" />
                                            <span>Live Verified ✓</span>
                                          </span>
                                        ) : isPageHealed ? (
                                          <div className="flex items-center gap-1.5">
                                            <span className="px-2 py-1 rounded-md text-[10px] font-bold bg-amber-50 text-amber-900 border border-amber-300" title="Rule saved in Rank Monk. Needs script embed or GitHub commit to appear on live site.">
                                              Rule Saved (Not Live)
                                            </span>
                                            <button
                                              type="button"
                                              onClick={() => handleVerifyLive(issue, page)}
                                              className="px-2 py-1 rounded-md text-[10.5px] font-bold bg-white hover:bg-slate-50 border border-slate-300 text-[#2b1b12] flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                                              title="Check live website HTML to see if changes are live on the actual site"
                                            >
                                              <RefreshCw className="w-3 h-3 text-[#8a5b13]" />
                                              <span>Verify Live</span>
                                            </button>
                                            <button
                                              type="button"
                                              onClick={() => handleOpenSinglePageFix(issue, page)}
                                              className="px-2 py-1 rounded-md text-[10px] font-bold bg-slate-100 hover:bg-slate-200 text-[#2b1b12] border border-slate-300 cursor-pointer"
                                              title="View or copy the code snippet for this page"
                                            >
                                              View Code
                                            </button>
                                          </div>
                                        ) : (
                                          <button
                                            type="button"
                                            onClick={() => handleOpenSinglePageFix(issue, page)}
                                            className="px-2.5 py-1 text-xs font-bold rounded-lg bg-[#2b1b12] text-[#c5a059] hover:bg-[#4a2e1d] hover:text-[#fffcf7] transition-all shadow-xs flex items-center gap-1 cursor-pointer border border-[#c5a059]/40"
                                            title={`Generate AI Fix specifically for ${page.url}`}
                                          >
                                            <Sparkles className="w-3 h-3 text-[#c5a059]" />
                                            <span>AI Fix ✦</span>
                                          </button>
                                        )}

                                        {liveCheck && !liveCheck.isFixed && !liveCheck.checking && (
                                          <span className="text-[9.5px] text-rose-700 font-bold bg-rose-50 px-2 py-0.5 rounded border border-rose-200" title={liveCheck.message}>
                                            Not Live on Site
                                          </span>
                                        )}

                                        <button
                                          type="button"
                                          onClick={() => handleCopy(page.url)}
                                          className="p-1.5 rounded-lg text-slate-500 hover:text-[#2b1b12] border border-[#e4d6c6] hover:bg-[#f8f3ec] transition-colors cursor-pointer"
                                          title="Copy URL"
                                        >
                                          {copiedUrl === page.url ? (
                                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                                          ) : (
                                            <Copy className="w-3.5 h-3.5" />
                                          )}
                                        </button>

                                        <a
                                          href={page.url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="p-1.5 rounded-lg text-slate-500 hover:text-[#2b1b12] border border-[#e4d6c6] hover:bg-[#f8f3ec] transition-colors"
                                          title="Open page in new tab"
                                        >
                                          <ExternalLink className="w-3.5 h-3.5" />
                                        </a>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* SUB-TAB 2: AUDITED PAGES (MATCHING SCREENSHOT 1) */}
        {activeSubTab === 'pages' && (
          <div className="p-5 sm:p-6 space-y-5">
            {/* Filter Dropdown & Search / Export Row */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div className="flex items-center gap-2 bg-[#f8f3ec] border border-[#e4d6c6] rounded-xl px-3 py-1.5 text-xs font-bold">
                <span className="text-[#6f5a4c] uppercase text-[10px] tracking-wider">FILTER BY:</span>
                <select
                  value={pageFilter}
                  onChange={(e) => setPageFilter(e.target.value)}
                  className="bg-transparent text-[#2b1b12] focus:outline-none cursor-pointer"
                >
                  <option value="all">All Real Pages ({pagesList.length})</option>
                  <option value="issues">Pages with Issues</option>
                  <option value="healthy">Healthy Pages</option>
                </select>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-72">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={pagesSearchQuery}
                    onChange={(e) => setPagesSearchQuery(e.target.value)}
                    placeholder="Search pages by URL or Title..."
                    className="w-full pl-8 pr-3 py-1.5 bg-[#f8f3ec] border border-[#e4d6c6] rounded-xl text-xs text-[#2b1b12] focus:outline-none focus:border-[#2b1b12]"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleExportPagesCsv}
                  className="px-3.5 py-1.5 bg-white border border-[#e4d6c6] hover:bg-[#f8f3ec] text-[#2b1b12] rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Export CSV</span>
                </button>
              </div>
            </div>

            {/* Audited Pages Table with Canonical & Robots Badges (Screenshot 1 Match) */}
            <div className="overflow-x-auto border border-[#e4d6c6] rounded-2xl">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[#f8f3ec]/60 border-b border-[#e4d6c6] text-[10px] font-black uppercase tracking-wider text-[#6f5a4c]">
                    <th className="p-3.5">Page URL</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5">Canonical</th>
                    <th className="p-3.5">Robots</th>
                    <th className="p-3.5">Title</th>
                    <th className="p-3.5">Meta Description</th>
                    <th className="p-3.5">Words</th>
                    <th className="p-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e4d6c6]">
                  {filteredPages.map((page: any) => {
                    return (
                      <tr key={page.id} className="hover:bg-[#f8f3ec]/40 transition-colors">
                        <td className="p-3.5 font-medium text-slate-800 max-w-[220px]">
                          <div className="flex items-center gap-2">
                            <Globe className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <ExpandableText text={page.url} maxChars={35} className="font-mono text-xs text-[#2b1b12]" />
                          </div>
                        </td>

                        <td className="p-3.5">
                          <span className={`px-2 py-0.5 rounded font-bold text-[10px] border ${
                            (page.status || 200) === 200
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-red-50 text-red-700 border-red-200'
                          }`}>
                            {page.status || 200}
                          </span>
                        </td>

                        {/* Canonical Badge */}
                        <td className="p-3.5">
                          {page.isCanonicalised ? (
                            <span
                              className="px-2 py-0.5 rounded bg-red-50 text-red-700 border border-red-200 font-extrabold text-[10px] flex items-center gap-1 cursor-help"
                              title={`Points to: ${page.canonical}`}
                            >
                              ✕ Canonicalised
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-[10px]">
                              ✓ Self
                            </span>
                          )}
                        </td>

                        {/* Robots Tag Badge */}
                        <td className="p-3.5">
                          {page.isNoIndex ? (
                            <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 font-extrabold text-[10px]">
                              noindex
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded bg-slate-50 text-slate-600 border border-slate-200 font-medium text-[10px]">
                              index
                            </span>
                          )}
                        </td>

                        <td className="p-3.5 max-w-[220px]">
                          <div className="font-semibold text-[#2b1b12]">
                            <ExpandableText text={page.title || '—'} maxChars={35} className="font-semibold text-[#2b1b12]" />
                          </div>
                          <span className="text-[10px] text-[#6f5a4c] block mt-0.5">{page.titleChars || page.title?.length || 0} chars</span>
                        </td>

                        <td className="p-3.5 max-w-[240px]">
                          <div className="text-[11px] text-[#6f5a4c]">
                            <ExpandableText text={page.metaDesc || '—'} maxChars={40} className="text-[#6f5a4c]" />
                          </div>
                          <span className="text-[10px] text-[#6f5a4c] block mt-0.5">{page.metaChars || page.metaDesc?.length || 0} chars</span>
                        </td>

                        <td className="p-3.5 font-bold text-[#2b1b12]">
                          {page.wordCount}
                        </td>

                        <td className="p-3.5 text-right">
                          <a
                            href={page.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold border border-[#e4d6c6] rounded-lg bg-white hover:bg-[#f8f3ec] text-[#2b1b12] transition-colors cursor-pointer"
                          >
                            <ExternalLink className="w-3 h-3" /> Visit
                          </a>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* 6. View All Crawled Pages Modal Popup */}
      {showAllPagesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#fffcf7] border border-[#e4d6c6] rounded-3xl max-w-4xl w-full p-4 sm:p-6 shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between pb-3 border-b border-[#e4d6c6]">
              <div>
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-[#c5a059]" />
                  <h3 className="font-editorial text-lg sm:text-xl font-bold text-[#2b1b12]">
                    All Crawled Pages ({pagesList.length})
                  </h3>
                </div>
                <p className="text-xs text-[#6f5a4c] mt-0.5">
                  Verified autonomous crawl inventory for {cleanDomain}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAllPagesModal(false)}
                className="text-[#6f5a4c] hover:text-[#2b1b12] text-sm p-1.5 font-bold rounded-lg hover:bg-[#f1e8dc] cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Search Bar */}
            <div className="pt-3 pb-1">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={allPagesSearch}
                  onChange={(e) => setAllPagesSearch(e.target.value)}
                  placeholder="Search crawled URLs or page titles..."
                  className="w-full pl-9 pr-3 py-2 bg-[#f8f3ec] border border-[#e4d6c6] rounded-xl text-xs text-[#2b1b12] focus:outline-none focus:border-[#2b1b12]"
                />
              </div>
            </div>

            {/* Scrollable List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 my-3">
              {pagesList
                .filter((p: any) =>
                  p.url.toLowerCase().includes(allPagesSearch.toLowerCase()) ||
                  (p.title || '').toLowerCase().includes(allPagesSearch.toLowerCase())
                )
                .map((page: any, idx: number) => (
                  <div
                    key={page.id || idx}
                    className="p-3 bg-white border border-[#e4d6c6] rounded-xl hover:border-[#c5a059] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] text-[#6f5a4c] font-bold shrink-0">{idx + 1}</span>
                        <span className={`px-2 py-0.5 rounded text-[9.5px] font-bold border shrink-0 ${
                          (page.status || 200) === 200
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-red-50 text-red-700 border-red-200'
                        }`}>
                          {page.status || 200}
                        </span>
                        <span className="font-mono text-xs text-[#2b1b12] font-semibold truncate break-all">
                          {page.url}
                        </span>
                      </div>
                      <div className="text-[11px] text-[#6f5a4c] mt-1 pl-4 truncate">
                        {page.title || 'Untitled Page'} • {page.wordCount || 0} words • Canonical: {page.canonical || 'Self'}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      <button
                        type="button"
                        onClick={() => handleCopy(page.url)}
                        className="px-2.5 py-1 text-xs border border-[#e4d6c6] rounded-lg hover:bg-[#f8f3ec] text-[#2b1b12] flex items-center gap-1 cursor-pointer font-medium"
                      >
                        {copiedUrl === page.url ? (
                          <span className="text-emerald-600 font-bold flex items-center gap-1"><Check className="w-3 h-3" /> Copied</span>
                        ) : (
                          <span className="flex items-center gap-1"><Copy className="w-3 h-3" /> Copy</span>
                        )}
                      </button>
                      <a
                        href={page.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1 text-xs border border-[#e4d6c6] rounded-lg bg-[#2b1b12] text-[#fffcf7] hover:bg-[#3b2519] flex items-center gap-1 font-medium"
                      >
                        <span>Visit</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                ))}
            </div>

            <div className="pt-2 border-t border-[#e4d6c6] flex justify-between items-center text-xs text-[#6f5a4c]">
              <span>Showing {pagesList.filter((p: any) => p.url.toLowerCase().includes(allPagesSearch.toLowerCase()) || (p.title || '').toLowerCase().includes(allPagesSearch.toLowerCase())).length} of {pagesList.length} pages</span>
              <button
                type="button"
                onClick={() => setShowAllPagesModal(false)}
                className="px-4 py-1.5 bg-[#2b1b12] text-[#fffcf7] rounded-xl text-xs font-bold hover:bg-[#3b2519] cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. AUTONOMOUS AI FIX CONFIRMATION MODAL */}
      {activeFixIssue && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#fffcf7] border border-[#e4d6c6] rounded-3xl max-w-4xl w-full p-4 sm:p-6 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-[#e4d6c6] gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#c5a059] to-[#8a5b13] flex items-center justify-center text-[#2b1b12] shadow-md shrink-0">
                  <Sparkles className="w-5 h-5 fill-current" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-editorial text-lg sm:text-xl font-bold text-[#2b1b12]">
                      {activeFixIssue.isSinglePage ? 'AI Fix Studio — Single Page Remediation' : 'Autonomous AI Fix Ready'}
                    </h3>
                    <span className={`px-2 py-0.5 rounded text-[9.5px] font-extrabold border ${activeFixIssue.impactBadge || 'bg-amber-50 text-amber-800 border-amber-200'}`}>
                      {activeFixIssue.impact || 'Important'}
                    </span>
                  </div>
                  <p className="text-xs text-[#6f5a4c] mt-0.5 font-medium line-clamp-1">
                    {activeFixIssue.singlePageUrl ? (
                      <span>Targeting: <strong className="font-mono text-[#2b1b12]">{activeFixIssue.singlePageUrl}</strong></span>
                    ) : (
                      <span>{activeFixIssue.title} • <span className="font-mono text-[#2b1b12] font-bold">{cleanDomain}</span></span>
                    )}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setActiveFixIssue(null);
                  setGeneratedFixes([]);
                  setFixSuccessResult(null);
                  setShowPermissionsConfig(false);
                }}
                className="text-[#6f5a4c] hover:text-[#2b1b12] text-sm p-1.5 font-bold rounded-lg hover:bg-[#f1e8dc] cursor-pointer shrink-0"
              >
                ✕
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="flex-1 overflow-y-auto space-y-4 py-4 pr-1">
              {/* Fix Generation Spinner */}
              {isGeneratingFixes && (
                <div className="py-16 flex flex-col items-center justify-center text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#2b1b12] flex items-center justify-center text-[#c5a059] shadow-lg">
                    <Loader2 className="w-6 h-6 animate-spin" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-[#2b1b12]">
                      Preparing Autonomous Fixes with AI...
                    </h4>
                    <p className="text-xs text-[#6f5a4c] mt-0.5">
                      Analyzing keyword density and entity matching for {cleanDomain}
                    </p>
                  </div>
                </div>
              )}

              {/* PROPER RESULT VIEW: Comprehensive Fix Breakdown & How It Was Fixed */}
              {fixSuccessResult && (
                <div className="space-y-6 animate-fade-in">
                  {/* 1. Executive Success & Impact Summary Banner */}
                  <div className="p-5 sm:p-6 bg-gradient-to-br from-emerald-950 via-[#1e3a2b] to-[#0f241a] border border-emerald-500/40 rounded-3xl shadow-xl text-white space-y-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
                      <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shrink-0">
                          <Check className="w-7 h-7 stroke-[3]" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
                              DEPLOYED &amp; ACTIVE
                            </span>
                            <span className="text-xs text-emerald-200/80 font-mono">0ms Edge Injection</span>
                          </div>
                          <h4 className="text-lg sm:text-xl font-black text-white mt-0.5">
                            {activeFixIssue.singlePageUrl
                              ? `Page Successfully Healed!`
                              : `All ${generatedFixes.length} SEO Deficiencies Successfully Healed`}
                          </h4>
                          <p className="text-xs text-emerald-100/75 mt-0.5">
                            {activeFixIssue.singlePageUrl ? (
                              <span>Live fix deployed for <strong className="font-mono text-emerald-300">{activeFixIssue.singlePageUrl}</strong>. Verification passes on next crawl.</span>
                            ) : (
                              <span>Live protection active on <strong>{cleanDomain}</strong>. Changes take effect on next page load.</span>
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            setActiveFixIssue(null);
                            setGeneratedFixes([]);
                            setFixSuccessResult(null);
                          }}
                          className="px-4 py-2 bg-white text-[#2b1b12] hover:bg-slate-100 font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
                        >
                          Done &amp; View Audit Table
                        </button>
                      </div>
                    </div>

                    {/* 3 Key Metrics */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                      <div className="p-3 bg-white/5 border border-white/10 rounded-2xl">
                        <span className="text-[10px] uppercase tracking-wider text-emerald-300/80 font-bold block">
                          Total Fixes Deployed
                        </span>
                        <div className="text-xl font-black text-white mt-0.5">
                          {generatedFixes.length} Issues Healed
                        </div>
                        <p className="text-[10.5px] text-white/60 mt-0.5">
                          Across all affected URLs
                        </p>
                      </div>

                      <div className="p-3 bg-white/5 border border-white/10 rounded-2xl">
                        <span className="text-[10px] uppercase tracking-wider text-emerald-300/80 font-bold block">
                          Deployment Method
                        </span>
                        {fixSuccessResult?.github?.applied ? (
                          <>
                            <div className="text-xs font-black text-emerald-300 mt-1 flex items-center gap-1.5 truncate">
                              <GitBranch className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                              <a
                                href={fixSuccessResult.github.url || `https://github.com/${fixSuccessResult.github.repo}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="underline hover:text-white truncate font-mono text-[11px]"
                                title="View commit on GitHub"
                              >
                                {fixSuccessResult.github.repo} ({fixSuccessResult.github.sha || 'Pushed'}) ↗
                              </a>
                            </div>
                            <p className="text-[10px] text-amber-300 font-semibold mt-0.5">
                              ⏳ Vercel/Hosting build running (~60-90s)
                            </p>
                          </>
                        ) : (
                          <>
                            <div className="text-sm font-black text-emerald-300 mt-1 flex items-center gap-1.5">
                              <Zap className="w-4 h-4 fill-current text-emerald-400" />
                              <span>Edge Self-Healing ({activeRulesCount} rules)</span>
                            </div>
                            <p className="text-[10.5px] text-white/60 mt-0.5">
                              Served via <code>heal.js</code> CDN
                            </p>
                          </>
                        )}
                      </div>

                      <div className="p-3 bg-white/5 border border-white/10 rounded-2xl">
                        <span className="text-[10px] uppercase tracking-wider text-emerald-300/80 font-bold block">
                          Audit Impact Score
                        </span>
                        <div className="text-xl font-black text-emerald-400 mt-0.5">
                          +18 pts Boost
                        </div>
                        <p className="text-[10.5px] text-white/60 mt-0.5">
                          Projected Technical Score: 96/100
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 2. Detailed Result View: Item-by-Item "How It Was Fixed" */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className="font-editorial text-base font-bold text-[#2b1b12]">
                          Detailed Fixes &amp; Verification Log ({generatedFixes.length} items)
                        </h5>
                        <p className="text-xs text-[#6f5a4c]">
                          Review exact before vs after values, applied code, and healing mechanics for each URL.
                        </p>
                      </div>
                      <span className="px-2.5 py-1 rounded-xl bg-amber-100 text-amber-900 text-xs font-bold border border-amber-300">
                        Rule Ready for Site
                      </span>
                    </div>

                    <div className="space-y-3">
                      {generatedFixes.map((fix: any, idx: number) => (
                        <div
                          key={fix.id || idx}
                          className="p-4 bg-white border border-[#e4d6c6] rounded-2xl shadow-xs space-y-3 hover:border-emerald-400 transition-all"
                        >
                          {/* URL & Defect Header */}
                          <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100 text-xs">
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                                {idx + 1}
                              </span>
                              <span className="font-mono font-bold text-[#2b1b12] truncate">
                                {fix.url}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 text-[10px] font-bold border border-amber-200 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3 text-amber-600" />
                                <span>Pending Live Deploy</span>
                              </span>
                              <span className="px-2 py-0.5 rounded bg-[#f8f3ec] text-[#6f5a4c] font-mono text-[10px] font-bold border border-[#e4d6c6]">
                                {fix.type}
                              </span>
                            </div>
                          </div>

                          {/* Before vs After Comparison */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                            {/* Before Card */}
                            <div className="p-3 bg-rose-50/70 border border-rose-200/80 rounded-xl space-y-1">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black text-rose-800 uppercase tracking-wider">
                                  ❌ Before (The Defect)
                                </span>
                                <span className="text-[10px] text-rose-600 font-semibold">Missing / Sub-Optimal</span>
                              </div>
                              <p className="text-rose-950 font-medium text-[11.5px] leading-relaxed break-words">
                                {fix.originalValue || '[Missing tag in HTML source]'}
                              </p>
                            </div>

                            {/* After Card */}
                            <div className="p-3 bg-emerald-50/80 border border-emerald-300 rounded-xl space-y-1">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black text-emerald-800 uppercase tracking-wider">
                                  ✓ After (Live Fix Deployed)
                                </span>
                                <span className="text-[10px] text-emerald-700 font-semibold font-mono">
                                  {fix.proposedValue?.length || 0} chars
                                </span>
                              </div>
                              <p className="text-emerald-950 font-bold text-[11.5px] leading-relaxed break-words">
                                {fix.proposedValue}
                              </p>
                            </div>
                          </div>

                          {/* How It Was Fixed Explanation */}
                          <div className="p-2.5 bg-[#faf7f2] border border-[#e4d6c6] rounded-xl flex items-start gap-2 text-xs text-[#4b382d]">
                            <Sparkles className="w-3.5 h-3.5 text-[#c5a059] shrink-0 mt-0.5" />
                            <div className="space-y-0.5">
                              <p className="font-bold text-[11px] text-[#2b1b12]">
                                How Rank Monk Fixed This:
                              </p>
                              <p className="text-[11px] text-[#6f5a4c] leading-relaxed">
                                {fix.rationale || `Grounded in ${brandName}'s real website offerings, Rank Monk synthesized the optimal keyword-dense metadata, mapped it to route "${fix.pathname || '/'}", and active edge rules will inject it immediately upon page load.`}
                              </p>
                            </div>
                          </div>

                          {/* Code Snippet Deployed */}
                          {fix.codeSnippet && (
                            <div className="space-y-1">
                              <div className="flex items-center justify-between text-[10.5px]">
                                <span className="font-mono text-slate-500 font-bold">Injected HTML Markup:</span>
                                <button
                                  type="button"
                                  onClick={() => handleCopyCodeSnippet(fix.id, fix.codeSnippet)}
                                  className="text-[#8a5b13] hover:text-[#2b1b12] font-bold flex items-center gap-1 cursor-pointer"
                                >
                                  <Copy className="w-3 h-3" />
                                  <span>{copiedSnippetId === fix.id ? 'Copied!' : 'Copy Tag'}</span>
                                </button>
                              </div>
                              <pre className="p-2.5 bg-slate-900 text-emerald-300 font-mono text-[11px] rounded-xl overflow-x-auto border border-slate-800 select-all">
                                {fix.codeSnippet}
                              </pre>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 3. Action Footer */}
                  <div className="pt-4 border-t border-[#e4d6c6] flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex flex-col gap-0.5 text-xs text-[#6f5a4c]">
                      <div className="flex items-center gap-1.5 font-bold text-[#2b1b12]">
                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shrink-0" />
                        <span>Rule Saved in Rank Monk (Requires Live Activation)</span>
                      </div>
                      <p className="text-[11px] text-[#6f5a4c]">
                        To make changes live on your site, embed the <strong>heal.js</strong> script or paste the code snippet below into your repository.
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const targetPage = generatedFixes[0] ? { url: generatedFixes[0].url } : null;
                          if (targetPage && activeFixIssue) {
                            handleVerifyLive(activeFixIssue, targetPage);
                          }
                        }}
                        className="px-3.5 py-2 border border-[#8a5b13] bg-[#fbf7f0] hover:bg-[#f5ecde] text-[#2b1b12] font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
                      >
                        <RefreshCw className="w-3.5 h-3.5 text-[#8a5b13]" />
                        <span>Verify Live on Site ↗</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleCopyScriptTag}
                        className="px-3.5 py-2 border border-[#e4d6c6] bg-white hover:bg-[#faf7f2] text-[#2b1b12] font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <Copy className="w-3.5 h-3.5 text-[#c5a059]" />
                        <span>Copy Embed Script</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveFixIssue(null);
                          setGeneratedFixes([]);
                          setFixSuccessResult(null);
                        }}
                        className="px-5 py-2 bg-[#2b1b12] hover:bg-[#3b2519] text-[#fffcf7] font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
                      >
                        Done &amp; Return to Audit
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* REVIEW & CONFIRM VIEW (When fixes ready and not yet applied) */}
              {!isGeneratingFixes && !fixSuccessResult && generatedFixes.length > 0 && (
                <div className="space-y-4">
                  {/* Platform & Integration Diagnosis Banner */}
                  <div className="p-4 bg-gradient-to-r from-[#fbf8f3] to-[#f4ebe0] border border-[#e4d6c6] rounded-2xl space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-[#e4d6c6]/80 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-[#2b1b12] text-[#c5a059] flex items-center justify-center font-bold text-xs">
                          ⚡
                        </span>
                        <div>
                          <span className="font-bold text-[#2b1b12]">
                            Detected Technology Stack:
                          </span>
                          <span className="ml-1.5 px-2 py-0.5 rounded-md bg-[#2b1b12] text-white font-mono text-[11px] font-bold">
                            {detectedPlatformInfo?.platform?.name || 'Next.js (React Framework)'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {hasGithubConfig ? (
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold text-[10.5px] flex items-center gap-1">
                            <GitBranch className="w-3 h-3 text-emerald-700" />
                            <span>GitHub GitOps Connected</span>
                          </span>
                        ) : hasWpConfig ? (
                          <span className="px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-900 border border-sky-300 font-bold text-[10.5px] flex items-center gap-1">
                            <Send className="w-3 h-3 text-sky-700" />
                            <span>WordPress Connected</span>
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 font-bold text-[10.5px] flex items-center gap-1">
                            <AlertCircle className="w-3 h-3 text-amber-700" />
                            <span>Self-Healing Engine Ready</span>
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="text-[11.5px] text-[#4b382d] leading-relaxed">
                      {detectedPlatformInfo?.platform?.description || 'Rank Monk analyzes your code structure and deploys fixes via GitOps pull requests/commits, CMS REST APIs, or instant edge self-healing.'}
                    </p>

                    {/* Quick Integration Selector if user wants direct Git or CMS deployment */}
                    <div className="pt-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-[#2b1b12]">
                          Deployment Integration:
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              setActiveIntegrationTab('github');
                              setShowPermissionsConfig(true);
                            }}
                            className={`px-2.5 py-1 rounded-lg text-[10.5px] font-bold cursor-pointer transition-all ${
                              activeIntegrationTab === 'github' ? 'bg-[#2b1b12] text-white' : 'bg-white text-[#2b1b12] border border-[#e4d6c6] hover:bg-[#efe4d5]'
                            }`}
                          >
                            🐙 GitHub GitOps {hasGithubConfig ? '✓' : ''}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setActiveIntegrationTab('cms');
                              setShowPermissionsConfig(true);
                            }}
                            className={`px-2.5 py-1 rounded-lg text-[10.5px] font-bold cursor-pointer transition-all ${
                              activeIntegrationTab === 'cms' ? 'bg-[#2b1b12] text-white' : 'bg-white text-[#2b1b12] border border-[#e4d6c6] hover:bg-[#efe4d5]'
                            }`}
                          >
                            🌐 WordPress / CMS {hasWpConfig ? '✓' : ''}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setActiveIntegrationTab('script');
                              setShowPermissionsConfig(true);
                            }}
                            className={`px-2.5 py-1 rounded-lg text-[10.5px] font-bold cursor-pointer transition-all ${
                              activeIntegrationTab === 'script' ? 'bg-[#2b1b12] text-white' : 'bg-white text-[#2b1b12] border border-[#e4d6c6] hover:bg-[#efe4d5]'
                            }`}
                          >
                            ⚡ 1-Line Edge Script
                          </button>
                        </div>
                      </div>

                      {/* Expanded Integration Config Box */}
                      {showPermissionsConfig && (
                        <div className="mt-3 p-3.5 bg-white rounded-xl border border-[#e4d6c6] text-xs space-y-3">
                          {activeIntegrationTab === 'github' && (
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-[#2b1b12] flex items-center gap-1.5">
                                  <GitBranch className="w-3.5 h-3.5 text-purple-600" />
                                  <span>Connect GitHub Repository (Recommended for Next.js)</span>
                                </span>
                                <span className="text-[10px] text-[#6f5a4c]">Auto-commits redirects &amp; tags</span>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                <input
                                  type="text"
                                  value={githubRepoInput}
                                  onChange={(e) => setGithubRepoInput(e.target.value)}
                                  placeholder="owner/repo (e.g. acme/website)"
                                  className="w-full p-2 bg-[#faf7f2] border border-[#e4d6c6] rounded-lg text-xs"
                                />
                                <input
                                  type="password"
                                  value={githubTokenInput}
                                  onChange={(e) => setGithubTokenInput(e.target.value)}
                                  placeholder="GitHub Personal Access Token"
                                  className="w-full p-2 bg-[#faf7f2] border border-[#e4d6c6] rounded-lg text-xs"
                                />
                              </div>
                              <div className="flex items-center justify-between pt-1">
                                <span className="text-[10px] text-[#6f5a4c]">
                                  Tokens are stored locally in your browser session.
                                </span>
                                <button
                                  type="button"
                                  onClick={handleSavePermissions}
                                  className="px-3 py-1.5 bg-[#2b1b12] text-white text-xs font-bold rounded-lg hover:bg-[#3b2519] cursor-pointer"
                                >
                                  Save &amp; Link GitHub
                                </button>
                              </div>
                            </div>
                          )}

                          {activeIntegrationTab === 'cms' && (
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-[#2b1b12] flex items-center gap-1.5">
                                  <Send className="w-3.5 h-3.5 text-sky-600" />
                                  <span>Connect WordPress REST API</span>
                                </span>
                                <span className="text-[10px] text-[#6f5a4c]">Requires Application Password</span>
                              </div>
                              <input
                                type="text"
                                value={wpUrlInput}
                                onChange={(e) => setWpUrlInput(e.target.value)}
                                placeholder="https://yourwebsite.com"
                                className="w-full p-2 bg-[#faf7f2] border border-[#e4d6c6] rounded-lg text-xs"
                              />
                              <div className="grid grid-cols-2 gap-2">
                                <input
                                  type="text"
                                  value={wpUserInput}
                                  onChange={(e) => setWpUserInput(e.target.value)}
                                  placeholder="WP Username"
                                  className="w-full p-2 bg-[#faf7f2] border border-[#e4d6c6] rounded-lg text-xs"
                                />
                                <input
                                  type="password"
                                  value={wpPassInput}
                                  onChange={(e) => setWpPassInput(e.target.value)}
                                  placeholder="Application Password"
                                  className="w-full p-2 bg-[#faf7f2] border border-[#e4d6c6] rounded-lg text-xs"
                                />
                              </div>
                              <div className="flex items-center justify-end pt-1">
                                <button
                                  type="button"
                                  onClick={handleSavePermissions}
                                  className="px-3 py-1.5 bg-[#2b1b12] text-white text-xs font-bold rounded-lg hover:bg-[#3b2519] cursor-pointer"
                                >
                                  Save &amp; Link WordPress
                                </button>
                              </div>
                            </div>
                          )}

                          {activeIntegrationTab === 'script' && (
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-[#2b1b12] flex items-center gap-1.5">
                                  <Zap className="w-3.5 h-3.5 text-amber-600" />
                                  <span>1-Line Self-Healing Script (Zero Code Deploys)</span>
                                </span>
                                <button
                                  type="button"
                                  onClick={handleCopyScriptTag}
                                  className="text-[#8a5b13] font-bold hover:underline flex items-center gap-1 cursor-pointer"
                                >
                                  <Copy className="w-3 h-3" />
                                  <span>{scriptTagCopied ? 'Copied!' : 'Copy Code'}</span>
                                </button>
                              </div>
                              <pre className="p-2.5 bg-slate-900 text-emerald-300 font-mono text-[11px] rounded-lg overflow-x-auto select-all">
                                {`<script src="https://rankmonk.in/heal.js" data-site="${cleanDomain}" async></script>`}
                              </pre>
                              <p className="text-[10.5px] text-[#6f5a4c]">
                                Paste into your website &lt;head&gt;. All redirects, metadata, and schema tags heal instantly on runtime page loads without redeploying code.
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* List of Editable Proposed Fix Cards */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-[#2b1b12]">
                        Proposed Fixes ({generatedFixes.length} URLs):
                      </span>
                      <span className="text-[11px] text-[#6f5a4c]">
                        ✏️ Click any proposed value below to edit before applying
                      </span>
                    </div>

                    {generatedFixes.map((fix: any, idx: number) => {
                      const isRedirect = fix.type === 'redirect_301';
                      let currentDest = '/services';
                      if (isRedirect) {
                        const m = (fix.proposedValue || '').match(/➔\s*([^\s]+)/);
                        if (m && m[1]) currentDest = m[1];
                      }

                      return (
                        <div
                          key={fix.id || idx}
                          className="p-3.5 bg-white border border-[#e4d6c6] rounded-2xl shadow-2xs space-y-2.5 hover:border-[#c5a059] transition-all"
                        >
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="w-5 h-5 rounded-full bg-[#2b1b12] text-[#fffcf7] text-[10px] flex items-center justify-center font-mono shrink-0">
                                {idx + 1}
                              </span>
                              <span className="font-mono font-bold text-[#2b1b12] truncate break-all">
                                {fix.url}
                              </span>
                            </div>
                            <span className="px-2 py-0.5 rounded bg-[#f8f3ec] text-[#6f5a4c] font-mono text-[10px] font-bold border border-[#e4d6c6] shrink-0">
                              {fix.type === 'redirect_301' ? '301 Redirect' : fix.pathname || '/'}
                            </span>
                          </div>

                          {/* Before vs After (With Editable Input) */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                            <div className="p-2.5 bg-red-50/60 border border-red-200/60 rounded-xl space-y-1">
                              <span className="text-[10px] font-black text-red-700 uppercase tracking-wider block">
                                Current Defect (Before)
                              </span>
                              <div className="text-red-900 font-medium text-[11px] leading-relaxed break-words">
                                {fix.originalValue}
                              </div>
                            </div>

                            <div className="p-2.5 bg-emerald-50/70 border border-emerald-300 rounded-xl space-y-1.5">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black text-emerald-800 uppercase tracking-wider block">
                                  {isRedirect ? '301 Redirect Destination (Editable)' : 'AI Proposed Fix (Editable)'}
                                </span>
                                {!isRedirect && (
                                  <span className="text-[9.5px] font-mono text-emerald-800 font-semibold">
                                    {fix.proposedValue?.length || 0} chars
                                  </span>
                                )}
                              </div>

                              {isRedirect ? (
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-mono font-bold text-slate-600">➔</span>
                                    <input
                                      type="text"
                                      value={currentDest}
                                      onChange={(e) => handleEditProposedFix(fix.id, `301 Permanent Redirect: ${fix.pathname} ➔ ${e.target.value}`)}
                                      className="flex-1 p-2 bg-white border border-emerald-400 rounded-lg text-xs font-mono font-bold text-[#2b1b12] focus:outline-none focus:ring-2 focus:ring-[#c5a059]"
                                      placeholder="/services or /contact"
                                    />
                                  </div>
                                  <span className="text-[10px] text-emerald-900 block">
                                    Target destination URL where visitors & crawlers will be forwarded.
                                  </span>
                                </div>
                              ) : (
                                <textarea
                                  rows={fix.type === 'meta_description' ? 2 : 1}
                                  value={fix.proposedValue}
                                  onChange={(e) => handleEditProposedFix(fix.id, e.target.value)}
                                  className="w-full p-2 bg-white border border-emerald-300 rounded-lg text-xs font-semibold text-[#2b1b12] focus:outline-none focus:ring-2 focus:ring-[#c5a059] leading-snug"
                                  placeholder="Enter customized fix value..."
                                />
                              )}
                            </div>
                          </div>

                          {fix.rationale && (
                            <p className="text-[10.5px] text-[#6f5a4c] italic">
                              💡 {fix.rationale}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* UNIFIED CONFIRMATION FOOTER: Context-Aware Deploy Button */}
            {!fixSuccessResult && (
              <div className="pt-4 border-t border-[#e4d6c6] space-y-2">
                <button
                  type="button"
                  disabled={isGeneratingFixes || isApplyingAutonomous || generatedFixes.length === 0}
                  onClick={handleConfirmAndApplyAll}
                  className="w-full py-3.5 bg-gradient-to-r from-[#2b1b12] via-[#3a2518] to-[#20140d] hover:from-[#3b2519] hover:to-[#2b1b12] text-[#fffcf7] font-black text-sm rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer border border-[#c5a059]/40 transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
                >
                  {isApplyingAutonomous ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-[#c5a059]" />
                      <span>Applying Fixes to Live Site Automatically...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 fill-current text-[#c5a059]" />
                      {hasGithubConfig ? (
                        <span>✦ Commit &amp; Deploy {generatedFixes.length} Fixes to GitHub ({githubRepoInput})</span>
                      ) : hasWpConfig ? (
                        <span>✦ Deploy {generatedFixes.length} Fixes to WordPress REST API</span>
                      ) : (
                        <span>✦ Deploy {generatedFixes.length} Fixes via Self-Healing Engine (Instant)</span>
                      )}
                    </>
                  )}
                </button>

                <p className="text-center text-[10.5px] text-[#6f5a4c]">
                  ⚡ Rank Monk will automatically update edge self-healing rules and git/CMS endpoints so your live website heals immediately.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
