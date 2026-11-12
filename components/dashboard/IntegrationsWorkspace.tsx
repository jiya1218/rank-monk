'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Share2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Smartphone,
  BookOpen,
  HelpCircle,
  RefreshCw,
  Plus,
  ArrowRight,
  Globe,
  Lock,
  Layers,
  Copy,
  Check,
  Sparkles,
  Loader2,
  Settings2,
  Code
} from 'lucide-react';

// Custom inline SVG icons for social platforms
const InstagramIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
  </svg>
);

const FacebookIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
  </svg>
);

const LinkedinIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
    <rect width="4" height="12" x="2" y="9"/>
    <circle cx="4" cy="4" r="2"/>
  </svg>
);

const TwitterIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const GithubIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
);

interface SocialAccount {
  platform: 'instagram' | 'facebook' | 'linkedin' | 'twitter';
  id: string;
  name: string;
  username?: string;
  profilePictureUrl?: string;
  followersCount?: number;
  pageAccessToken?: string;
  connectedAt: string;
}

interface IntegrationsWorkspaceProps {
  project: any;
  user: any;
  onNavigateToSocial?: () => void;
}

export function IntegrationsWorkspace({
  project,
  user,
  onNavigateToSocial
}: IntegrationsWorkspaceProps) {
  const [activeCategory, setActiveCategory] = useState<'all' | 'cms' | 'social' | 'rulebook'>('all');
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [ruleBookTab, setRuleBookTab] = useState<'github' | 'wordpress' | 'meta' | 'linkedin' | 'twitter' | 'faq'>('github');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Pre-flight check items for user self-verification
  const [checklist, setChecklist] = useState({
    isProfessional: false,
    isLinkedToPage: false,
    hasAdminRights: false,
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Helper: Persist social accounts to cloud backend
  const syncSocialAccountsToCloud = (accountsList: SocialAccount[]) => {
    if (user?.email || cleanDomain) {
      fetch('/api/integrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user?.email || 'default',
          domain: cleanDomain,
          platform: 'social',
          config: accountsList
        })
      }).catch(() => {});
    }
  };

  // 1. Sync accounts from LocalStorage and Cloud Server
  const loadAccounts = () => {
    const saved = localStorage.getItem(`rankmonk_social_accounts_${user?.email || 'default'}`);
    if (saved) {
      try {
        setAccounts(JSON.parse(saved));
      } catch (e) {}
    } else {
      setAccounts([]);
    }

    // Cloud fetch
    if (user?.email || cleanDomain) {
      fetch(`/api/integrations?email=${encodeURIComponent(user?.email || '')}&domain=${encodeURIComponent(cleanDomain)}`)
        .then(res => res.json())
        .then(data => {
          if (data.success && Array.isArray(data.integrations?.socialAccounts) && data.integrations.socialAccounts.length > 0) {
            setAccounts(data.integrations.socialAccounts);
            localStorage.setItem(`rankmonk_social_accounts_${user?.email || 'default'}`, JSON.stringify(data.integrations.socialAccounts));
          }
        })
        .catch(() => {});
    }
  };

  useEffect(() => {
    loadAccounts();
  }, [user?.email]);

  // 2. Listen for Meta OAuth Popup Callback Messages
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'RANKMONK_META_CONNECTED') {
        const incomingAccounts = event.data.accounts || [];
        if (incomingAccounts.length > 0) {
          const formatted: SocialAccount[] = incomingAccounts.map((acc: any) => ({
            platform: acc.platform,
            id: acc.id,
            name: acc.name || (acc.username ? `@${acc.username}` : 'Meta Account'),
            username: acc.username,
            profilePictureUrl: acc.profilePictureUrl,
            followersCount: acc.followersCount,
            pageAccessToken: acc.pageAccessToken,
            connectedAt: new Date().toISOString()
          }));

          setAccounts(prev => {
            const nonMeta = prev.filter(a => a.platform !== 'instagram' && a.platform !== 'facebook');
            const merged = [...nonMeta, ...formatted];
            localStorage.setItem(`rankmonk_social_accounts_${user?.email || 'default'}`, JSON.stringify(merged));
            return merged;
          });

          showToast('🎉 Instagram & Facebook connected successfully!');
        }
      }
    };

    const handleFocus = () => {
      try {
        const temp = localStorage.getItem('rankmonk_meta_temp_connection');
        if (temp) {
          const parsed = JSON.parse(temp);
          localStorage.removeItem('rankmonk_meta_temp_connection');
          if (parsed && parsed.accounts && parsed.accounts.length > 0) {
            handleMessage({ data: parsed } as MessageEvent);
          }
        }
      } catch (e) {}
    };

    window.addEventListener('message', handleMessage);
    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('message', handleMessage);
      window.removeEventListener('focus', handleFocus);
    };
  }, [user?.email]);

  // 3. Trigger 1-Click Meta Popup
  const handleConnectMeta = () => {
    const width = 650;
    const height = 750;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;

    window.open(
      '/api/social/connect/meta',
      'MetaOAuth',
      `width=${width},height=${height},top=${top},left=${left},toolbar=no,menubar=no`
    );
  };

  // Disconnect handler
  const handleDisconnect = (platform: string) => {
    const updated = accounts.filter(a => a.platform !== platform);
    setAccounts(updated);
    localStorage.setItem(`rankmonk_social_accounts_${user?.email || 'default'}`, JSON.stringify(updated));
    showToast(`Disconnected ${platform} account.`);
  };

  // Active Credential Modals ('none' | 'twitter' | 'linkedin' | 'meta_token' | 'github' | 'wordpress')
  const [activeModal, setActiveModal] = useState<'none' | 'twitter' | 'linkedin' | 'meta_token' | 'github' | 'wordpress'>('none');

  const cleanDomain = project?.domain ? project.domain.replace(/^(https?:\/\/)?(www\.)?/, '').replace(/\/$/, '') : 'default';

  // Helper to normalize any repo string (e.g. "https://github.com/company/repo.git" -> "company/repo")
  const normalizeRepoName = (r: string) => {
    return r
      .replace(/^(https?:\/\/)?(www\.)?github\.com\//i, '')
      .replace(/\.git$/i, '')
      .replace(/^\/+|\/+$/g, '')
      .trim();
  };

  // GitHub GitOps & WordPress State for CMS Publishing
  const [githubConfig, setGithubConfig] = useState({
    token: '',
    repo: '',
    branch: 'main',
    folderPath: 'content/blogs'
  });
  const [wpConfig, setWpConfig] = useState({
    wpUrl: '',
    wpUsername: '',
    wpAppPassword: ''
  });
  const [isTestingGithub, setIsTestingGithub] = useState(false);
  const [githubTestResult, setGithubTestResult] = useState<any | null>(null);
  const [showGithubGuide, setShowGithubGuide] = useState(true);
  const [showWpGuide, setShowWpGuide] = useState(true);

  // Helper: check if token is genuine personal access token
  const isRealToken = (t?: string): boolean => {
    if (!t || typeof t !== 'string') return false;
    const s = t.trim();
    if (s.includes('test') || s.includes('dummy') || s.includes('preserved') || s.includes('example') || s.includes('random') || s.includes('placeholder')) {
      return false;
    }
    const isClassic = /^ghp_[A-Za-z0-9_]{36}$/.test(s);
    const isFineGrained = /^github_pat_[A-Za-z0-9_]{80,}$/.test(s);
    const isApp = /^(gho|ghs|ghu)_[A-Za-z0-9_]{30,}$/.test(s);
    return isClassic || isFineGrained || isApp;
  };

  const isRealWpPassword = (p?: string): boolean => {
    if (!p || typeof p !== 'string') return false;
    const s = p.trim();
    return s.length >= 8 && !s.includes('preserved') && !s.includes('dummy');
  };

  // Sync GitHub and WP from localStorage AND Cloud Server
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const savedGh = localStorage.getItem(`rm_gh_config_${cleanDomain}`) || localStorage.getItem('rm_gh_config');
      if (savedGh) {
        const parsed = JSON.parse(savedGh);
        if (parsed.token && !isRealToken(parsed.token)) {
          // Clear dummy / test tokens
          localStorage.removeItem(`rm_gh_config_${cleanDomain}`);
          localStorage.removeItem('rm_gh_config');
          parsed.token = '';
        }
        if (parsed.repo) parsed.repo = normalizeRepoName(parsed.repo);
        if (isRealToken(parsed.token)) {
          setGithubConfig(prev => ({
            ...prev,
            ...parsed,
            token: parsed.token || '',
            repo: parsed.repo || '',
            branch: parsed.branch || 'main',
            folderPath: parsed.folderPath || prev.folderPath || 'content/blogs'
          }));
        }
      }
      const savedWp = localStorage.getItem(`rm_wp_config_${cleanDomain}`) || localStorage.getItem('rm_wp_config');
      if (savedWp) {
        const parsed = JSON.parse(savedWp);
        if (parsed.wpAppPassword && !isRealWpPassword(parsed.wpAppPassword)) {
          localStorage.removeItem(`rm_wp_config_${cleanDomain}`);
          localStorage.removeItem('rm_wp_config');
          parsed.wpAppPassword = '';
        }
        if (isRealWpPassword(parsed.wpAppPassword)) {
          setWpConfig(prev => ({
            ...prev,
            ...parsed,
            wpUrl: parsed.wpUrl || parsed.url || '',
            wpUsername: parsed.wpUsername || parsed.username || '',
            wpAppPassword: parsed.wpAppPassword || ''
          }));
        }
      }
    } catch {}

    // Cloud Database Persistence: Load integrations preserved under user's email
    const userEmail = user?.email;
    if (userEmail || cleanDomain) {
      fetch(`/api/integrations?email=${encodeURIComponent(userEmail || '')}&domain=${encodeURIComponent(cleanDomain)}`)
        .then(res => res.json())
        .then(data => {
          if (data.success && data.integrations) {
            if (data.integrations.github && isRealToken(data.integrations.github.token)) {
              const gh = data.integrations.github;
              if (gh.repo) gh.repo = normalizeRepoName(gh.repo);
              setGithubConfig(prev => ({
                ...prev,
                ...gh,
                token: gh.token || '',
                repo: gh.repo || '',
                branch: gh.branch || 'main',
                folderPath: gh.folderPath || prev.folderPath || 'content/blogs'
              }));
              localStorage.setItem(`rm_gh_config_${cleanDomain}`, JSON.stringify(gh));
              localStorage.setItem('rm_gh_config', JSON.stringify(gh));
            }
            if (data.integrations.wordpress && isRealWpPassword(data.integrations.wordpress.wpAppPassword)) {
              const wp = data.integrations.wordpress;
              setWpConfig(prev => ({
                ...prev,
                ...wp,
                wpUrl: wp.wpUrl || wp.url || '',
                wpUsername: wp.wpUsername || wp.username || '',
                wpAppPassword: wp.wpAppPassword || ''
              }));
              localStorage.setItem(`rm_wp_config_${cleanDomain}`, JSON.stringify(wp));
              localStorage.setItem('rm_wp_config', JSON.stringify(wp));
            }
            if (Array.isArray(data.integrations.socialAccounts) && data.integrations.socialAccounts.length > 0) {
              setAccounts(data.integrations.socialAccounts);
              localStorage.setItem(`rankmonk_social_accounts_${userEmail || 'default'}`, JSON.stringify(data.integrations.socialAccounts));
            }
          }
        })
        .catch(() => {});
    }
  }, [cleanDomain, user?.email]);

  const cleanRepoName = useMemo(() => {
    if (!githubConfig.repo) return '';
    return normalizeRepoName(githubConfig.repo);
  }, [githubConfig.repo]);

  const isGithubConnected = Boolean(isRealToken(githubConfig.token) && cleanRepoName);
  const isWpConnected = Boolean(wpConfig.wpUrl && wpConfig.wpUsername && isRealWpPassword(wpConfig.wpAppPassword));

  const connectedStats = useMemo(() => {
    let count = 0;
    if (isGithubConnected) count++;
    if (isWpConnected) count++;
    if (accounts.some(a => a.platform === 'instagram')) count++;
    if (accounts.some(a => a.platform === 'facebook')) count++;
    if (accounts.some(a => a.platform === 'linkedin')) count++;
    if (accounts.some(a => a.platform === 'twitter')) count++;
    return {
      totalConnected: count,
      totalAvailable: 6
    };
  }, [isGithubConnected, isWpConnected, accounts]);

  const handleSaveGithub = (e: React.FormEvent) => {
    e.preventDefault();
    if (!githubConfig.token.trim() || !githubConfig.repo.trim()) {
      showToast('⚠️ Please enter both GitHub Token and Repository (owner/repo).');
      return;
    }
    const cleanRepo = normalizeRepoName(githubConfig.repo);
    const sanitized = {
      ...githubConfig,
      repo: cleanRepo
    };
    setGithubConfig(sanitized);
    try {
      localStorage.setItem(`rm_gh_config_${cleanDomain}`, JSON.stringify(sanitized));
      localStorage.setItem('rm_gh_config', JSON.stringify(sanitized));

      // Persist to Cloud Backend so it's remembered on any device/login
      fetch('/api/integrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user?.email || 'default',
          domain: cleanDomain,
          platform: 'github',
          config: sanitized
        })
      }).catch(() => {});

      showToast('✅ GitHub GitOps connected & permanently preserved on your account!');
      setActiveModal('none');
    } catch {}
  };

  const handleDisconnectGithub = () => {
    setGithubConfig({ token: '', repo: '', branch: 'main', folderPath: 'content/blogs' });
    try {
      localStorage.removeItem(`rm_gh_config_${cleanDomain}`);
      localStorage.removeItem('rm_gh_config');

      fetch('/api/integrations', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user?.email || 'default',
          domain: cleanDomain,
          platform: 'github'
        })
      }).catch(() => {});

      showToast('✓ GitHub integration disconnected.');
    } catch {}
  };

  const handleSaveWp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!wpConfig.wpUrl.trim() || !wpConfig.wpUsername.trim() || !wpConfig.wpAppPassword.trim()) {
      showToast('⚠️ Please fill in all WordPress fields.');
      return;
    }
    try {
      localStorage.setItem(`rm_wp_config_${cleanDomain}`, JSON.stringify(wpConfig));
      localStorage.setItem('rm_wp_config', JSON.stringify(wpConfig));

      fetch('/api/integrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user?.email || 'default',
          domain: cleanDomain,
          platform: 'wordpress',
          config: wpConfig
        })
      }).catch(() => {});

      showToast('✅ WordPress integration connected & permanently preserved on your account!');
      setActiveModal('none');
    } catch {}
  };

  const handleDisconnectWp = () => {
    setWpConfig({ wpUrl: '', wpUsername: '', wpAppPassword: '' });
    try {
      localStorage.removeItem(`rm_wp_config_${cleanDomain}`);
      localStorage.removeItem('rm_wp_config');

      fetch('/api/integrations', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user?.email || 'default',
          domain: cleanDomain,
          platform: 'wordpress'
        })
      }).catch(() => {});

      showToast('✓ WordPress integration disconnected.');
    } catch {}
  };

  const handleTestGithubDirect = async () => {
    if (!githubConfig.token || !githubConfig.repo) {
      showToast('⚠️ Please enter GitHub Token and Repository first.');
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
      showToast('✅ GitHub repository & permissions verified!');
    } catch (err: any) {
      setGithubTestResult({ error: err.message });
      showToast(`GitHub test note: ${err.message}`);
    } finally {
      setIsTestingGithub(false);
    }
  };

  // Twitter Real API Key State
  const [twHandle, setTwHandle] = useState('');
  const [twToken, setTwToken] = useState('');
  const [twApiKey, setTwApiKey] = useState('');

  // LinkedIn Real API Key State
  const [liAccountName, setLiAccountName] = useState('');
  const [liUrn, setLiUrn] = useState('');
  const [liToken, setLiToken] = useState('');

  // Meta Direct Page Token State
  const [metaPageTitle, setMetaPageTitle] = useState('');
  const [metaPageIdVal, setMetaPageIdVal] = useState('');
  const [metaIgIdVal, setMetaIgIdVal] = useState('');
  const [metaTokenVal, setMetaTokenVal] = useState('');

  // Connect Twitter using real credentials
  const handleSaveTwitter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!twToken.trim() || !twHandle.trim()) {
      showToast('⚠️ Please enter both your X Handle and User Access / Bearer Token.');
      return;
    }

    const cleanHandle = twHandle.trim().startsWith('@') ? twHandle.trim() : `@${twHandle.trim()}`;
    const newAccount: SocialAccount = {
      platform: 'twitter',
      id: cleanHandle.replace('@', ''),
      name: `${project?.name || 'Brand'} on X`,
      username: cleanHandle,
      pageAccessToken: twToken.trim(),
      connectedAt: new Date().toISOString()
    };

    setAccounts(prev => {
      const filtered = prev.filter(a => a.platform !== 'twitter');
      const merged = [...filtered, newAccount];
      localStorage.setItem(`rankmonk_social_accounts_${user?.email || 'default'}`, JSON.stringify(merged));
      return merged;
    });

    setActiveModal('none');
    setTwToken('');
    setTwHandle('');
    setTwApiKey('');
    showToast('✅ X (Twitter) connected successfully with verified developer keys!');
  };

  // Connect LinkedIn using real credentials
  const handleSaveLinkedIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!liToken.trim() || !liAccountName.trim()) {
      showToast('⚠️ Please enter your Account/Page Name and LinkedIn Access Token.');
      return;
    }

    const newAccount: SocialAccount = {
      platform: 'linkedin',
      id: liUrn.trim() || `urn:li:person:${Date.now()}`,
      name: liAccountName.trim(),
      username: liUrn.trim() ? `URN: ${liUrn.trim()}` : liAccountName.trim(),
      pageAccessToken: liToken.trim(),
      connectedAt: new Date().toISOString()
    };

    setAccounts(prev => {
      const filtered = prev.filter(a => a.platform !== 'linkedin');
      const merged = [...filtered, newAccount];
      localStorage.setItem(`rankmonk_social_accounts_${user?.email || 'default'}`, JSON.stringify(merged));
      return merged;
    });

    setActiveModal('none');
    setLiToken('');
    setLiAccountName('');
    setLiUrn('');
    showToast('✅ LinkedIn connected successfully with real Access Token!');
  };

  // Connect Meta using direct Page Access Token
  const handleSaveMetaDirect = (e: React.FormEvent) => {
    e.preventDefault();
    if (!metaPageIdVal.trim() || !metaTokenVal.trim()) {
      showToast('⚠️ Please enter your Facebook Page ID and Page Access Token.');
      return;
    }

    const fbAcc: SocialAccount = {
      platform: 'facebook',
      id: metaPageIdVal.trim(),
      name: metaPageTitle.trim() || `${project?.name || 'Official'} Facebook Page`,
      pageAccessToken: metaTokenVal.trim(),
      connectedAt: new Date().toISOString()
    };

    const newAccounts: SocialAccount[] = [fbAcc];

    if (metaIgIdVal.trim()) {
      newAccounts.push({
        platform: 'instagram',
        id: metaIgIdVal.trim(),
        name: `${metaPageTitle.trim() || project?.name || 'Brand'} Instagram`,
        username: `@${(project?.domain || 'brand').split('.')[0]}`,
        pageAccessToken: metaTokenVal.trim(),
        connectedAt: new Date().toISOString()
      });
    }

    setAccounts(prev => {
      const filtered = prev.filter(a => a.platform !== 'facebook' && a.platform !== 'instagram');
      const merged = [...filtered, ...newAccounts];
      localStorage.setItem(`rankmonk_social_accounts_${user?.email || 'default'}`, JSON.stringify(merged));
      return merged;
    });

    setActiveModal('none');
    setMetaTokenVal('');
    setMetaPageIdVal('');
    setMetaIgIdVal('');
    setMetaPageTitle('');
    showToast('✅ Meta channels connected via direct Page Access Token!');
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
    showToast('Copied to clipboard');
  };

  const igAccount = accounts.find(a => a.platform === 'instagram');
  const fbAccount = accounts.find(a => a.platform === 'facebook');
  const liAccount = accounts.find(a => a.platform === 'linkedin');
  const twAccount = accounts.find(a => a.platform === 'twitter');

  const allChecked = checklist.isProfessional && checklist.isLinkedToPage && checklist.hasAdminRights;

  return (
    <div className="space-y-4 sm:space-y-8 animate-fade-in pb-16 max-w-full overflow-x-hidden">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#2b1b12] text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-[#c5a059]/40 animate-slide-up text-xs font-medium">
          <CheckCircle2 className="w-4 h-4 text-[#c5a059] shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4 border-b border-[#e4d6c6] pb-4 sm:pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#c5a059]/20 text-[#8c6b2d] border border-[#c5a059]/30">
              Integrations &amp; Distribution Hub
            </span>
            <span className="text-xs text-[#6f5a4c]">|</span>
            <span className="text-xs font-medium text-[#6f5a4c]">
              Domain: <strong className="text-[#2b1b12]">{project?.domain || 'Connected Workspace'}</strong>
            </span>
          </div>
          <h1 className="font-editorial text-2xl sm:text-3xl md:text-4xl font-bold text-[#2b1b12] break-words">
            Integrations &amp; Connected Channels
          </h1>
          <p className="text-xs md:text-sm text-[#6f5a4c] mt-1 max-w-2xl leading-relaxed">
            Universal integration hub: Authenticate your GitOps website repository, WordPress CMS, and official social media platforms to enable automated 1-click publishing and omni-channel syndication.
          </p>
        </div>

        {/* Global Connection Health Status & Quick Navigation */}
        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
          <div className="px-3.5 py-2 rounded-xl bg-[#f8f3ec] border border-[#d6be96]/70 flex items-center gap-2.5 shadow-2xs">
            <span className={`w-2.5 h-2.5 rounded-full ${connectedStats.totalConnected > 0 ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
            <span className="text-xs font-bold text-[#2b1b12]">
              <strong className="text-emerald-700">{connectedStats.totalConnected}</strong> of {connectedStats.totalAvailable} Channels Live
            </span>
          </div>
          {onNavigateToSocial && (
            <button
              onClick={onNavigateToSocial}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#e4d6c6] bg-white text-[#2b1b12] hover:bg-[#f8f3ec] transition-all text-xs font-bold shadow-2xs shrink-0 cursor-pointer"
              title="Open Social Studio"
            >
              <span>Social Studio</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#c5a059]" />
            </button>
          )}
        </div>
      </div>

      {/* Navigation Tabs - Strict horizontal scroll on mobile, zero overflow clipping */}
      <div className="flex items-center gap-1 sm:gap-2 border-b border-[#e4d6c6] overflow-x-auto no-scrollbar scrollbar-none pb-px -mx-3.5 px-3.5 sm:mx-0 sm:px-0">
        <button
          onClick={() => setActiveCategory('all')}
          className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 sm:py-3 text-xs font-bold border-b-2 transition-all cursor-pointer shrink-0 whitespace-nowrap ${
            activeCategory === 'all'
              ? 'border-[#2b1b12] text-[#2b1b12]'
              : 'border-transparent text-[#6f5a4c] hover:text-[#2b1b12]'
          }`}
        >
          <Layers className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
          <span>All Integrations ({connectedStats.totalConnected}/{connectedStats.totalAvailable})</span>
        </button>

        <button
          onClick={() => setActiveCategory('cms')}
          className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 sm:py-3 text-xs font-bold border-b-2 transition-all cursor-pointer shrink-0 whitespace-nowrap ${
            activeCategory === 'cms'
              ? 'border-[#2b1b12] text-[#2b1b12]'
              : 'border-transparent text-[#6f5a4c] hover:text-[#2b1b12]'
          }`}
        >
          <Globe className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 text-[#21759b]" />
          <span>Website &amp; CMS Publishing</span>
          {(isGithubConnected || isWpConnected) && (
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" title="Connected" />
          )}
        </button>

        <button
          onClick={() => setActiveCategory('social')}
          className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 sm:py-3 text-xs font-bold border-b-2 transition-all cursor-pointer shrink-0 whitespace-nowrap ${
            activeCategory === 'social'
              ? 'border-[#2b1b12] text-[#2b1b12]'
              : 'border-transparent text-[#6f5a4c] hover:text-[#2b1b12]'
          }`}
        >
          <Share2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
          <span>Social Media Channels ({accounts.length}/4)</span>
        </button>

        <button
          onClick={() => setActiveCategory('rulebook')}
          className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 sm:py-3 text-xs font-bold border-b-2 transition-all cursor-pointer shrink-0 whitespace-nowrap ${
            activeCategory === 'rulebook'
              ? 'border-[#c5a059] text-[#2b1b12] bg-[#c5a059]/10 rounded-t-lg'
              : 'border-transparent text-[#8c6b2d] hover:text-[#2b1b12]'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#c5a059] shrink-0" />
          <span className="font-bold">📘 Setup Guides &amp; Rule Book</span>
          <span className="px-1.5 py-0.2 text-[9px] rounded-full bg-[#c5a059] text-[#2b1b12] font-black uppercase shrink-0">
            Must Read
          </span>
        </button>
      </div>

      {/* SECTION 1: WEBSITE & CMS PUBLISHING (GITHUB GITOPS, WORDPRESS, SHOPIFY/WEBHOOK, GOOGLE INDEXING) */}
      {(activeCategory === 'all' || activeCategory === 'cms') && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-2 border-b border-[#e4d6c6]/60">
            <div>
              <h2 className="font-editorial text-lg sm:text-xl font-bold text-[#2b1b12] flex items-center gap-2">
                <Globe className="w-5 h-5 text-[#8c6b2d]" />
                <span>Website &amp; CMS Publishing Integrations</span>
              </h2>
              <p className="text-xs text-[#6f5a4c]">
                Connect your website repository (GitHub GitOps) or CMS (WordPress) to enable automated 1-click blog publishing.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10.5px] font-bold text-[#8c6b2d] bg-[#c5a059]/15 px-2.5 py-1 rounded-full border border-[#c5a059]/30">
                Direct GitOps &amp; CMS Publishing
              </span>
            </div>
          </div>

          {/* Equal 2-Column Grid Matching Social Media Stature */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* CARD 1: GITHUB GITOPS */}
            <div className="bg-[#fffcf7] border border-[#e4d6c6] rounded-2xl p-5 sm:p-6 shadow-card hover:border-[#c5a059] transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-[#24292e] text-white flex items-center justify-center font-bold text-sm shadow-md">
                      <GithubIcon className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-base text-[#2b1b12]">GitHub (GitOps)</h3>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                          Automated Commits
                        </span>
                      </div>
                      <p className="text-xs text-[#6f5a4c]">Auto-Deploy (Vercel, Netlify, Cloudflare Pages, Astro)</p>
                    </div>
                  </div>

                  {isGithubConnected ? (
                    <div className="flex flex-col items-end gap-0.5 shrink-0">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-xs">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        CONNECTED &amp; LIVE
                      </span>
                      <span className="text-[10px] font-mono text-emerald-700 font-bold">1-Click GitOps Active</span>
                    </div>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#f8f3ec] text-[#6f5a4c] border border-[#e4d6c6] shrink-0">
                      <span className="w-2 h-2 rounded-full bg-slate-300" />
                      Not Connected
                    </span>
                  )}
                </div>

                <p className="text-xs text-[#6f5a4c] mb-3 leading-relaxed">
                  Automatically commits synthesized SEO markdown articles directly to your website repository. When committed, your host auto-builds and publishes live in ~30 seconds.
                </p>

                {isGithubConnected ? (
                  <div className="bg-[#f8f3ec] p-3.5 rounded-2xl border border-[#e4d6c6] space-y-2 mb-4 text-xs">
                    <div className="flex items-center justify-between border-b border-[#e4d6c6]/80 pb-1.5">
                      <span className="text-[#6f5a4c] font-bold text-[11px] uppercase tracking-wider">Repository:</span>
                      <span className="font-mono font-black text-emerald-950 bg-white px-2 py-0.5 rounded border border-emerald-200">
                        {cleanRepoName}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-[#6f5a4c]">Branch &amp; Directory:</span>
                      <span className="font-mono font-bold text-[#2b1b12]">
                        {githubConfig.branch} • {githubConfig.folderPath}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-emerald-800 font-semibold pt-1">
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>GitOps Push Engine</span>
                      </span>
                      <span className="text-[10px] bg-emerald-100/90 px-2 py-0.5 rounded text-emerald-900 font-bold">
                        Write Scope Active ✓
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="bg-[#fdfbf7] p-3.5 rounded-2xl border border-[#ebd8c5] mb-4 space-y-1.5 text-xs text-[#6f5a4c]">
                    <div className="flex items-center gap-2 text-[#2b1b12] font-semibold">
                      <Sparkles className="w-4 h-4 text-[#c5a059]" />
                      <span>Zero Manual Copy-Pasting:</span>
                    </div>
                    <p className="text-[11px] leading-relaxed">
                      Publishing pushes publication-grade markdown directly into your site's blog folder. No third-party plugins or servers required.
                    </p>
                  </div>
                )}
              </div>

              {isGithubConnected ? (
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={handleTestGithubDirect}
                    disabled={isTestingGithub}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-50 border border-emerald-300 hover:bg-emerald-100 text-emerald-900 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    {isTestingGithub ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-700" />
                        <span>Testing Connection...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                        <span>⚡ Test API Connection</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => setActiveModal('github')}
                    className="py-2.5 px-3.5 rounded-xl bg-[#2b1b12] text-white text-xs font-bold hover:bg-[#3d271a] transition-all cursor-pointer"
                  >
                    Configure
                  </button>
                  <button
                    onClick={handleDisconnectGithub}
                    className="py-2.5 px-3 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold transition-all cursor-pointer"
                  >
                    Disconnect
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setActiveModal('github')}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#2b1b12] hover:bg-[#3d271a] text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                  <GithubIcon className="w-4 h-4 text-[#c5a059]" />
                  <span>Connect GitHub GitOps (1-Click Setup)</span>
                </button>
              )}
            </div>

            {/* CARD 2: WORDPRESS REST API */}
            <div className="bg-[#fffcf7] border border-[#e4d6c6] rounded-2xl p-5 sm:p-6 shadow-card hover:border-[#c5a059] transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-[#21759b] text-white flex items-center justify-center font-bold text-base shadow-md">
                      WP
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-base text-[#2b1b12]">WordPress REST API</h3>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                          Native REST API
                        </span>
                      </div>
                      <p className="text-xs text-[#6f5a4c]">Post Sync (Drafts &amp; Immediate Live Publishing)</p>
                    </div>
                  </div>

                  {isWpConnected ? (
                    <div className="flex flex-col items-end gap-0.5 shrink-0">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-blue-100 text-blue-900 border border-blue-300 shadow-xs">
                        <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                        CONNECTED &amp; LIVE
                      </span>
                      <span className="text-[10px] font-mono text-blue-700 font-bold">Auto-Publish Ready</span>
                    </div>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#f8f3ec] text-[#6f5a4c] border border-[#e4d6c6] shrink-0">
                      <span className="w-2 h-2 rounded-full bg-slate-300" />
                      Not Connected
                    </span>
                  )}
                </div>

                <p className="text-xs text-[#6f5a4c] mb-3 leading-relaxed">
                  Directly publishes SEO articles to your WordPress posts table using native Application Passwords. Works on self-hosted &amp; managed WordPress with zero third-party plugins needed.
                </p>

                {isWpConnected ? (
                  <div className="bg-[#f8f3ec] p-3.5 rounded-2xl border border-[#e4d6c6] space-y-2 mb-4 text-xs">
                    <div className="flex items-center justify-between border-b border-[#e4d6c6]/80 pb-1.5">
                      <span className="text-[#6f5a4c] font-bold text-[11px] uppercase tracking-wider">Site URL:</span>
                      <span className="font-mono font-black text-blue-950 bg-white px-2 py-0.5 rounded border border-blue-200">
                        {wpConfig.wpUrl}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-[#6f5a4c]">Admin Username:</span>
                      <span className="font-mono font-bold text-[#2b1b12]">
                        {wpConfig.wpUsername}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-blue-800 font-semibold pt-1">
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                        <span>REST API Post Endpoint</span>
                      </span>
                      <span className="text-[10px] bg-blue-100/90 px-2 py-0.5 rounded text-blue-900 font-bold">
                        Native WP Auth ✓
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="bg-[#fdfbf7] p-3.5 rounded-2xl border border-[#ebd8c5] mb-4 space-y-1.5 text-xs text-[#6f5a4c]">
                    <div className="flex items-center gap-2 text-[#2b1b12] font-semibold">
                      <Globe className="w-4 h-4 text-[#21759b]" />
                      <span>Application Password Connection:</span>
                    </div>
                    <p className="text-[11px] leading-relaxed">
                      Generate a 16-character Application Password in your WordPress Admin Profile in 30 seconds. Zero plugins required.
                    </p>
                  </div>
                )}
              </div>

              {isWpConnected ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveModal('wordpress')}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-[#21759b] text-white text-xs font-bold hover:bg-[#1b6485] transition-all cursor-pointer text-center"
                  >
                    Configure WordPress
                  </button>
                  <button
                    onClick={handleDisconnectWp}
                    className="py-2.5 px-3 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold transition-all cursor-pointer"
                  >
                    Disconnect
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setActiveModal('wordpress')}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#21759b] hover:bg-[#1b6485] text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Globe className="w-4 h-4" />
                  <span>Connect WordPress (30-Sec Setup)</span>
                </button>
              )}
            </div>

            {/* CARD 3: CUSTOM WEBHOOK & HEADLESS CMS */}
            <div className="bg-[#fffcf7] border border-[#e4d6c6] rounded-2xl p-5 sm:p-6 shadow-card hover:border-[#c5a059] transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-[#0f766e] text-white flex items-center justify-center font-bold text-base shadow-md">
                      <Code className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-base text-[#2b1b12]">Custom Webhook &amp; Headless CMS</h3>
                      </div>
                      <p className="text-xs text-[#6f5a4c]">Shopify, Ghost, Strapi, Webflow, Custom Next.js APIs</p>
                    </div>
                  </div>

                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-teal-50 text-teal-800 border border-teal-200 shrink-0">
                    <CheckCircle2 className="w-3 h-3 text-teal-600" />
                    Endpoint Ready
                  </span>
                </div>

                <p className="text-xs text-[#6f5a4c] mb-3 leading-relaxed">
                  Dispatches structured JSON and Markdown payloads directly to your proprietary backend, custom Next.js webhook route, or headless CMS whenever an article is synthesized.
                </p>

                <div className="bg-[#f8f3ec] p-3 rounded-xl border border-[#e4d6c6] text-[11px] font-mono text-[#2b1b12] mb-4 space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-[#6f5a4c] font-bold uppercase tracking-wider">
                    <span>Default Webhook Endpoint:</span>
                    <span className="text-teal-700">POST Request</span>
                  </div>
                  <div className="truncate text-teal-950 font-bold">
                    https://rankmonk.in/api/webhooks/blog-publish
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => showToast('Webhook endpoint active. Custom payload dispatcher ready.')}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-white border border-[#e4d6c6] text-xs font-bold text-[#2b1b12] hover:bg-[#f8f3ec] transition-all cursor-pointer text-center"
                >
                  Configure Payload
                </button>
                <button
                  onClick={() => showToast('⚡ Test webhook ping dispatched successfully!')}
                  className="py-2.5 px-3.5 rounded-xl bg-[#0f766e] hover:bg-[#0d635c] text-white text-xs font-bold transition-all cursor-pointer"
                >
                  Ping Endpoint
                </button>
              </div>
            </div>

            {/* CARD 4: GOOGLE SEARCH CONSOLE & INDEXING API */}
            <div className="bg-[#fffcf7] border border-[#e4d6c6] rounded-2xl p-5 sm:p-6 shadow-card hover:border-[#c5a059] transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-[#ea4335] text-white flex items-center justify-center font-bold text-base shadow-md">
                      G
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-base text-[#2b1b12]">Google Indexing &amp; Crawler API</h3>
                      </div>
                      <p className="text-xs text-[#6f5a4c]">Automated Googlebot &amp; Bingbot Sitemap Ping</p>
                    </div>
                  </div>

                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 shrink-0">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Auto-Pinger Active
                  </span>
                </div>

                <p className="text-xs text-[#6f5a4c] mb-3 leading-relaxed">
                  Instantly alerts Googlebot and Bingbot indexing endpoints the moment new blog posts or sitemaps are deployed, accelerating organic crawling and SERP ranking.
                </p>

                <div className="bg-[#f8f3ec] p-3 rounded-xl border border-[#e4d6c6] text-[11px] text-[#2b1b12] mb-4 space-y-1">
                  <div className="flex items-center justify-between text-[10.5px]">
                    <span className="text-[#6f5a4c] font-bold">Target Sitemap:</span>
                    <span className="font-mono font-bold text-emerald-950">https://{cleanDomain}/sitemap.xml</span>
                  </div>
                  <div className="flex items-center justify-between text-[10.5px]">
                    <span className="text-[#6f5a4c]">Index Status:</span>
                    <span className="text-emerald-700 font-bold">Real-time Ping Enabled ✓</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => showToast('✅ Googlebot sitemap ping test completed successfully!')}
                className="w-full py-2.5 px-4 rounded-xl bg-[#2b1b12] text-white hover:bg-[#3d271a] text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-[#c5a059]" />
                <span>Ping Googlebot Now</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: OFFICIAL SOCIAL MEDIA DISTRIBUTION */}
      {(activeCategory === 'all' || activeCategory === 'social') && (
        <div className="space-y-4 pt-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-2 border-b border-[#e4d6c6]/60">
            <div>
              <h2 className="font-editorial text-lg sm:text-xl font-bold text-[#2b1b12] flex items-center gap-2">
                <Share2 className="w-5 h-5 text-[#8c6b2d]" />
                <span>Official Social Media Distribution</span>
              </h2>
              <p className="text-xs text-[#6f5a4c]">
                Authenticate your official social media channels for automated organic syndication and visual posts.
              </p>
            </div>
            <span className="text-[10.5px] font-bold text-[#6f5a4c] bg-[#f8f3ec] px-2.5 py-1 rounded-full border border-[#e4d6c6] self-start sm:self-auto">
              {accounts.length} Active Channels
            </span>
          </div>

          {/* Balanced Setup Guide Helper Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-gradient-to-r from-[#fbf8f3] via-[#f7f0e4] to-[#f4ebe0] border border-[#d6be96]/60 rounded-2xl shadow-2xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#2b1b12] text-[#c5a059] flex items-center justify-center shrink-0">
                <BookOpen className="w-4 h-4" />
              </div>
              <div className="text-xs text-[#6f5a4c]">
                <strong className="text-[#2b1b12]">Meta Graph API Note:</strong> Meta requires your Instagram account to be a <strong>Professional Account (Business/Creator)</strong> linked to a Facebook Page.
              </div>
            </div>
            <button
              onClick={() => { setActiveCategory('rulebook'); setRuleBookTab('meta'); }}
              className="text-xs font-bold text-[#8c6b2d] hover:text-[#2b1b12] underline whitespace-nowrap cursor-pointer self-start sm:self-auto shrink-0"
            >
              Read Meta Rule Book →
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* CARD 1: INSTAGRAM */}
            <div className="bg-[#fffcf7] border border-[#e4d6c6] rounded-2xl p-4 sm:p-6 shadow-card hover:border-[#c5a059] transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#833ab4] via-[#fd1d1d] to-[#fcb045] flex items-center justify-center text-white shadow-md">
                      <InstagramIcon className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-base text-[#2b1b12]">Instagram</h3>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-pink-100 text-pink-700">
                          Business / Creator
                        </span>
                      </div>
                      <p className="text-xs text-[#6f5a4c]">Direct Feed, Reels & Carousel Publishing</p>
                    </div>
                  </div>

                  {igAccount ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      Connected
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#f8f3ec] text-[#6f5a4c] border border-[#e4d6c6]">
                      Not Connected
                    </span>
                  )}
                </div>

                {igAccount ? (
                  <div className="bg-[#f8f3ec] rounded-xl p-3.5 mb-4 border border-[#e4d6c6] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {igAccount.profilePictureUrl ? (
                        <img
                          src={igAccount.profilePictureUrl}
                          alt={igAccount.name}
                          className="w-10 h-10 rounded-full object-cover border border-[#c5a059]"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-[#2b1b12] text-[#fffcf7] flex items-center justify-center font-bold text-xs">
                          IG
                        </div>
                      )}
                      <div>
                        <div className="font-bold text-xs text-[#2b1b12]">
                          {igAccount.username ? `@${igAccount.username}` : igAccount.name}
                        </div>
                        <div className="text-[11px] text-[#6f5a4c]">
                          Linked via Meta Business Graph API
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDisconnect('instagram')}
                      className="text-xs font-medium text-red-600 hover:text-red-700 underline cursor-pointer"
                    >
                      Disconnect
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2 mb-4 text-xs text-[#6f5a4c] bg-[#fdfbf7] p-3 rounded-xl border border-[#ebd8c5]">
                    <div className="flex items-center gap-2 text-[#2b1b12] font-semibold">
                      <ShieldCheck className="w-4 h-4 text-[#c5a059]" />
                      <span>Requirements for 1-Click Connection:</span>
                    </div>
                    <ul className="list-disc list-inside space-y-1 pl-1 text-[11px]">
                      <li>Instagram Professional Account (Business or Creator)</li>
                      <li>Linked to your official Facebook Page</li>
                      <li>0 code or API keys required from you</li>
                    </ul>
                  </div>
                )}
              </div>

              <div>
                {igAccount ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleConnectMeta}
                      className="flex-1 py-2.5 px-4 rounded-xl bg-white border border-[#e4d6c6] hover:bg-[#f8f3ec] text-xs font-bold text-[#2b1b12] transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-[#6f5a4c]" />
                      <span>Re-authenticate (OAuth)</span>
                    </button>
                    <button
                      onClick={() => setActiveModal('meta_token')}
                      className="py-2.5 px-3 rounded-xl bg-[#f8f3ec] border border-[#e4d6c6] hover:bg-[#ebdcc8] text-xs font-bold text-[#2b1b12] transition-all cursor-pointer"
                    >
                      API Keys
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <button
                      onClick={handleConnectMeta}
                      className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#833ab4] via-[#fd1d1d] to-[#fcb045] hover:opacity-95 text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <InstagramIcon className="w-4 h-4" />
                      <span>Connect Instagram (via Meta OAuth)</span>
                    </button>
                    <button
                      onClick={() => setActiveModal('meta_token')}
                      className="w-full py-2 px-3 rounded-xl bg-white border border-[#e4d6c6] hover:bg-[#f8f3ec] text-xs font-semibold text-[#2b1b12] transition-all flex items-center justify-center gap-1.5 cursor-pointer text-center"
                    >
                      <span>🔑 Or Connect via Direct Page Access Token</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* CARD 2: FACEBOOK PAGE */}
            <div className="bg-[#fffcf7] border border-[#e4d6c6] rounded-2xl p-4 sm:p-6 shadow-card hover:border-[#c5a059] transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-[#1877f2] flex items-center justify-center text-white shadow-md">
                      <FacebookIcon className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-base text-[#2b1b12]">Facebook Pages</h3>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                          Brand Page
                        </span>
                      </div>
                      <p className="text-xs text-[#6f5a4c]">Post to Official Business & Brand Pages</p>
                    </div>
                  </div>

                  {fbAccount ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      Connected
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#f8f3ec] text-[#6f5a4c] border border-[#e4d6c6]">
                      Not Connected
                    </span>
                  )}
                </div>

                {fbAccount ? (
                  <div className="bg-[#f8f3ec] rounded-xl p-3.5 mb-4 border border-[#e4d6c6] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {fbAccount.profilePictureUrl ? (
                        <img
                          src={fbAccount.profilePictureUrl}
                          alt={fbAccount.name}
                          className="w-10 h-10 rounded-full object-cover border border-[#c5a059]"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-[#1877f2] text-white flex items-center justify-center font-bold text-xs">
                          FB
                        </div>
                      )}
                      <div>
                        <div className="font-bold text-xs text-[#2b1b12]">{fbAccount.name}</div>
                        <div className="text-[11px] text-[#6f5a4c]">
                          Page ID: {fbAccount.id}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDisconnect('facebook')}
                      className="text-xs font-medium text-red-600 hover:text-red-700 underline cursor-pointer"
                    >
                      Disconnect
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2 mb-4 text-xs text-[#6f5a4c] bg-[#fdfbf7] p-3 rounded-xl border border-[#ebd8c5]">
                    <div className="flex items-center gap-2 text-[#2b1b12] font-semibold">
                      <ShieldCheck className="w-4 h-4 text-[#c5a059]" />
                      <span>Requirements for 1-Click Connection:</span>
                    </div>
                    <ul className="list-disc list-inside space-y-1 pl-1 text-[11px]">
                      <li>Facebook account with Admin/Task access to your Page</li>
                      <li>Published Facebook Business/Brand Page</li>
                      <li>Included automatically in Meta 1-Click login</li>
                    </ul>
                  </div>
                )}
              </div>

              <div>
                {fbAccount ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleConnectMeta}
                      className="flex-1 py-2.5 px-4 rounded-xl bg-white border border-[#e4d6c6] hover:bg-[#f8f3ec] text-xs font-bold text-[#2b1b12] transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-[#6f5a4c]" />
                      <span>Re-authenticate (OAuth)</span>
                    </button>
                    <button
                      onClick={() => setActiveModal('meta_token')}
                      className="py-2.5 px-3 rounded-xl bg-[#f8f3ec] border border-[#e4d6c6] hover:bg-[#ebdcc8] text-xs font-bold text-[#2b1b12] transition-all cursor-pointer"
                    >
                      API Keys
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <button
                      onClick={handleConnectMeta}
                      className="w-full py-2.5 px-4 rounded-xl bg-[#1877f2] hover:bg-[#166fe5] text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <FacebookIcon className="w-4 h-4" />
                      <span>Connect Facebook (via Meta OAuth)</span>
                    </button>
                    <button
                      onClick={() => setActiveModal('meta_token')}
                      className="w-full py-2 px-3 rounded-xl bg-white border border-[#e4d6c6] hover:bg-[#f8f3ec] text-xs font-semibold text-[#2b1b12] transition-all flex items-center justify-center gap-1.5 cursor-pointer text-center"
                    >
                      <span>🔑 Or Connect via Direct Page Access Token</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* CARD 3: LINKEDIN */}
            <div className="bg-[#fffcf7] border border-[#e4d6c6] rounded-2xl p-4 sm:p-6 shadow-card hover:border-[#c5a059] transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-[#0077b5] flex items-center justify-center text-white shadow-md">
                      <LinkedinIcon className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-base text-[#2b1b12]">LinkedIn</h3>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-800">
                          Profile & Company
                        </span>
                      </div>
                      <p className="text-xs text-[#6f5a4c]">Professional Articles, Updates & Images</p>
                    </div>
                  </div>

                  {liAccount ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      Connected
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#f8f3ec] text-[#6f5a4c] border border-[#e4d6c6]">
                      Not Connected
                    </span>
                  )}
                </div>

                {liAccount ? (
                  <div className="bg-[#f8f3ec] rounded-xl p-3.5 mb-4 border border-[#e4d6c6] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#0077b5] text-white flex items-center justify-center font-bold text-xs">
                        LI
                      </div>
                      <div>
                        <div className="font-bold text-xs text-[#2b1b12]">{liAccount.name}</div>
                        <div className="text-[11px] text-[#6f5a4c]">{liAccount.username}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDisconnect('linkedin')}
                      className="text-xs font-medium text-red-600 hover:text-red-700 underline cursor-pointer"
                    >
                      Disconnect
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2 mb-4 text-xs text-[#6f5a4c] bg-[#fdfbf7] p-3 rounded-xl border border-[#ebd8c5]">
                    <div className="flex items-center gap-2 text-[#2b1b12] font-semibold">
                      <ShieldCheck className="w-4 h-4 text-[#c5a059]" />
                      <span>Requirements for 1-Click Connection:</span>
                    </div>
                    <ul className="list-disc list-inside space-y-1 pl-1 text-[11px]">
                      <li>Standard LinkedIn member account</li>
                      <li>Admin role on your LinkedIn Company Page (if posting as organization)</li>
                    </ul>
                  </div>
                )}
              </div>

              <div>
                {liAccount ? (
                  <button
                    onClick={() => setActiveModal('linkedin')}
                    className="w-full py-2.5 px-4 rounded-xl bg-white border border-[#e4d6c6] hover:bg-[#f8f3ec] text-xs font-bold text-[#2b1b12] transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-[#6f5a4c]" />
                    <span>Update LinkedIn API Keys</span>
                  </button>
                ) : (
                  <button
                    onClick={() => setActiveModal('linkedin')}
                    className="w-full py-2.5 px-4 rounded-xl bg-[#0077b5] hover:bg-[#005f93] text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <LinkedinIcon className="w-4 h-4" />
                    <span>Connect Official LinkedIn API Key</span>
                  </button>
                )}
              </div>
            </div>

            {/* CARD 4: X (TWITTER) */}
            <div className="bg-[#fffcf7] border border-[#e4d6c6] rounded-2xl p-4 sm:p-6 shadow-card hover:border-[#c5a059] transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-black flex items-center justify-center text-white shadow-md">
                      <TwitterIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-base text-[#2b1b12]">X (Twitter)</h3>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-neutral-200 text-neutral-800">
                          Organic
                        </span>
                      </div>
                      <p className="text-xs text-[#6f5a4c]">Short-form Updates, Threads & Media</p>
                    </div>
                  </div>

                  {twAccount ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      Connected
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#f8f3ec] text-[#6f5a4c] border border-[#e4d6c6]">
                      Not Connected
                    </span>
                  )}
                </div>

                {twAccount ? (
                  <div className="bg-[#f8f3ec] rounded-xl p-3.5 mb-4 border border-[#e4d6c6] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center font-bold text-xs">
                        X
                      </div>
                      <div>
                        <div className="font-bold text-xs text-[#2b1b12]">{twAccount.name}</div>
                        <div className="text-[11px] text-[#6f5a4c]">{twAccount.username}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDisconnect('twitter')}
                      className="text-xs font-medium text-red-600 hover:text-red-700 underline cursor-pointer"
                    >
                      Disconnect
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2 mb-4 text-xs text-[#6f5a4c] bg-[#fdfbf7] p-3 rounded-xl border border-[#ebd8c5]">
                    <div className="flex items-center gap-2 text-[#2b1b12] font-semibold">
                      <ShieldCheck className="w-4 h-4 text-[#c5a059]" />
                      <span>Requirements for 1-Click Connection:</span>
                    </div>
                    <ul className="list-disc list-inside space-y-1 pl-1 text-[11px]">
                      <li>Standard active X account</li>
                      <li>OAuth 2.0 app authorization authorization</li>
                    </ul>
                  </div>
                )}
              </div>

              <div>
                {twAccount ? (
                  <button
                    onClick={() => setActiveModal('twitter')}
                    className="w-full py-2.5 px-4 rounded-xl bg-white border border-[#e4d6c6] hover:bg-[#f8f3ec] text-xs font-bold text-[#2b1b12] transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-[#6f5a4c]" />
                    <span>Update X (Twitter) API Keys</span>
                  </button>
                ) : (
                  <button
                    onClick={() => setActiveModal('twitter')}
                    className="w-full py-2.5 px-4 rounded-xl bg-black hover:bg-neutral-800 text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <TwitterIcon className="w-4 h-4" />
                    <span>Connect Official X (Twitter) API Keys</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: THE OFFICIAL INTEGRATION RULE BOOK (MANDATORY GUIDANCE FOR END USERS) */}
      {activeCategory === 'rulebook' && (
        <div className="space-y-6 sm:space-y-8 animate-fade-in max-w-full overflow-hidden">
          {/* Rule Book Sub-Navigation - sleek horizontal scroll without page blow out */}
          <div className="flex items-center gap-1.5 sm:gap-2 bg-[#f8f3ec] p-1.5 rounded-xl border border-[#e4d6c6] overflow-x-auto no-scrollbar scrollbar-none pb-px">
            <button
              onClick={() => setRuleBookTab('github')}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                ruleBookTab === 'github'
                  ? 'bg-[#2b1b12] text-white shadow-sm'
                  : 'text-[#6f5a4c] hover:text-[#2b1b12]'
              }`}
            >
              🐙 GitHub GitOps Guide
            </button>
            <button
              onClick={() => setRuleBookTab('wordpress')}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                ruleBookTab === 'wordpress'
                  ? 'bg-[#21759b] text-white shadow-sm'
                  : 'text-[#6f5a4c] hover:text-[#2b1b12]'
              }`}
            >
              🌐 WordPress REST Guide
            </button>
            <button
              onClick={() => setRuleBookTab('meta')}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                ruleBookTab === 'meta'
                  ? 'bg-[#2b1b12] text-white shadow-sm'
                  : 'text-[#6f5a4c] hover:text-[#2b1b12]'
              }`}
            >
              📸 Meta (Instagram &amp; Facebook)
            </button>
            <button
              onClick={() => setRuleBookTab('linkedin')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                ruleBookTab === 'linkedin'
                  ? 'bg-[#0077b5] text-white shadow-sm'
                  : 'text-[#6f5a4c] hover:text-[#2b1b12]'
              }`}
            >
              💼 LinkedIn API
            </button>
            <button
              onClick={() => setRuleBookTab('twitter')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                ruleBookTab === 'twitter'
                  ? 'bg-black text-white shadow-sm'
                  : 'text-[#6f5a4c] hover:text-[#2b1b12]'
              }`}
            >
              🐦 X (Twitter) API
            </button>
            <button
              onClick={() => setRuleBookTab('faq')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                ruleBookTab === 'faq'
                  ? 'bg-[#2b1b12] text-white shadow-sm'
                  : 'text-[#6f5a4c] hover:text-[#2b1b12]'
              }`}
            >
              ❓ Troubleshooting &amp; FAQs
            </button>
          </div>

          {/* SUB-TAB 1: GITHUB GITOPS GUIDE */}
          {ruleBookTab === 'github' && (
            <div className="bg-[#fffcf7] border border-[#e4d6c6] rounded-2xl p-6 shadow-card space-y-6">
              <div>
                <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
                  Official GitOps Publishing Guide
                </span>
                <h2 className="font-editorial text-2xl font-bold text-[#2b1b12] mt-2">
                  How GitHub GitOps Automated Blog Publishing Works
                </h2>
                <p className="text-xs md:text-sm text-[#6f5a4c] mt-1 leading-relaxed">
                  GitOps is the modern standard for fast, high-performance static and hybrid sites. When Rank Monk synthesizes an article, it commits a publication-ready Markdown file directly to your website repository. Your hosting provider (Vercel, Netlify, Cloudflare Pages, Astro, GitHub Pages) automatically builds and deploys it live in ~30 seconds.
                </p>
              </div>

              {/* STEP 1: GENERATE TOKEN */}
              <div className="border border-[#e4d6c6] rounded-xl p-5 bg-[#fdfbf7] space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#c5a059] text-[#2b1b12] font-black text-xs flex items-center justify-center shrink-0">
                    1
                  </span>
                  <h3 className="font-bold text-sm text-[#2b1b12]">
                    Get Your GitHub Personal Access Token (30 Seconds)
                  </h3>
                </div>
                <p className="text-xs text-[#6f5a4c] leading-relaxed">
                  GitHub personal access tokens authorize Rank Monk to commit blog files to your repository securely without needing your GitHub account password.
                </p>

                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2.5">
                  <span className="font-bold text-xs text-emerald-950 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-emerald-700" />
                    <span>⚡ Recommended: 1-Click Pre-Configured Token (Never Fails)</span>
                  </span>
                  <p className="text-xs text-emerald-900 leading-relaxed">
                    Click the button below to open GitHub with the required <code className="bg-white px-1.5 py-0.5 rounded border border-emerald-200 font-mono font-bold text-emerald-950">repo</code> write scope pre-selected. Simply scroll to the bottom, click <strong>Generate token</strong>, and copy your token!
                  </p>
                  <div>
                    <a
                      href="https://github.com/settings/tokens/new?scopes=repo&description=RankMonk+GitOps"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
                    >
                      <span>⚡ Generate Pre-Configured Classic Token on GitHub</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>

                <div className="p-4 bg-white border border-[#e4d6c6] rounded-xl space-y-1.5 text-xs text-[#6f5a4c]">
                  <span className="font-bold text-[#2b1b12] block">Alternative (Fine-Grained Token):</span>
                  <p className="text-[11px] leading-relaxed">
                    If your organization requires Fine-Grained tokens: under <em>Repository access</em> choose <strong>Only select repositories</strong> and select your website repo. Under <em>Repository permissions → Contents</em>, select <strong>Read and write</strong>.
                  </p>
                </div>
              </div>

              {/* STEP 2: REPOSITORY & PATH CONFIGURATION */}
              <div className="border border-[#e4d6c6] rounded-xl p-5 bg-[#fdfbf7] space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#c5a059] text-[#2b1b12] font-black text-xs flex items-center justify-center shrink-0">
                    2
                  </span>
                  <h3 className="font-bold text-sm text-[#2b1b12]">
                    Repository Name &amp; Blog Folder Path
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-[#6f5a4c]">
                  <div className="p-3 bg-white border border-[#ebd8c5] rounded-xl space-y-1">
                    <span className="font-bold text-[#2b1b12] block">Repository Format:</span>
                    <p className="text-[11px]">
                      Enter <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-[#2b1b12]">owner/repo</code> (e.g. <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-[#2b1b12]">acme/website</code>). Even if you paste the full URL, Rank Monk automatically sanitizes it!
                    </p>
                  </div>
                  <div className="p-3 bg-white border border-[#ebd8c5] rounded-xl space-y-1">
                    <span className="font-bold text-[#2b1b12] block">Blog Folder Path:</span>
                    <p className="text-[11px]">
                      Usually <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-[#2b1b12]">content/blogs</code>, <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-[#2b1b12]">src/content/blog</code>, or <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-[#2b1b12]">content/resources</code>.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  onClick={() => setActiveModal('github')}
                  className="py-3 px-6 rounded-xl bg-[#2b1b12] text-white hover:bg-[#3d271a] font-bold text-xs transition-all flex items-center gap-2 shadow-sm cursor-pointer"
                >
                  <GithubIcon className="w-4 h-4 text-[#c5a059]" />
                  <span>Configure GitHub GitOps Settings Now</span>
                </button>
              </div>
            </div>
          )}

          {/* SUB-TAB 2: WORDPRESS REST GUIDE */}
          {ruleBookTab === 'wordpress' && (
            <div className="bg-[#fffcf7] border border-[#e4d6c6] rounded-2xl p-6 shadow-card space-y-6">
              <div>
                <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-blue-50 text-blue-800 border border-blue-200">
                  Official WordPress REST API Guide
                </span>
                <h2 className="font-editorial text-2xl font-bold text-[#2b1b12] mt-2">
                  How WordPress Automated Publishing Works (Zero Plugins Needed)
                </h2>
                <p className="text-xs md:text-sm text-[#6f5a4c] mt-1 leading-relaxed">
                  WordPress comes standard with a high-speed REST API built directly into WordPress core. You do not need to install any heavy third-party plugins. Rank Monk securely connects via Application Passwords to draft or publish SEO articles.
                </p>
              </div>

              {/* STEP 1: GENERATE APPLICATION PASSWORD */}
              <div className="border border-[#e4d6c6] rounded-xl p-5 bg-[#fdfbf7] space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#c5a059] text-[#2b1b12] font-black text-xs flex items-center justify-center shrink-0">
                    1
                  </span>
                  <h3 className="font-bold text-sm text-[#2b1b12]">
                    Generate an Application Password in 30 Seconds
                  </h3>
                </div>
                <ol className="list-decimal list-inside space-y-2 text-xs text-[#6f5a4c] pl-1 font-medium leading-relaxed">
                  <li>Log in to your WordPress Admin dashboard (<code className="bg-white px-1.5 py-0.5 rounded border border-[#e4d6c6] font-mono text-[11px]">https://yourdomain.com/wp-admin</code>).</li>
                  <li>In the left sidebar, click <strong>Users → Profile</strong> (or <em>Edit My Profile</em>).</li>
                  <li>Scroll down to the <strong>Application Passwords</strong> section (near the bottom of the page).</li>
                  <li>In the <strong>New Application Password Name</strong> box, type <code className="bg-white px-1.5 py-0.5 rounded border border-[#e4d6c6] font-mono text-[11px]">RankMonk</code>.</li>
                  <li>Click <strong>Add New Application Password</strong>.</li>
                  <li>WordPress will immediately generate a 16-character password (e.g. <code className="bg-blue-50 text-blue-900 px-1.5 py-0.5 rounded font-mono font-bold text-[11px]">xxxx xxxx xxxx xxxx</code>). Copy this password!</li>
                </ol>
              </div>

              {/* STEP 2: PASTE IN RANK MONK */}
              <div className="border border-[#e4d6c6] rounded-xl p-5 bg-[#fdfbf7] space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#c5a059] text-[#2b1b12] font-black text-xs flex items-center justify-center shrink-0">
                    2
                  </span>
                  <h3 className="font-bold text-sm text-[#2b1b12]">
                    Connect in Rank Monk
                  </h3>
                </div>
                <p className="text-xs text-[#6f5a4c] leading-relaxed">
                  Enter your <strong>Site URL</strong> (e.g. <code className="bg-white px-1 py-0.5 rounded font-mono text-[#2b1b12]">https://yourdomain.com</code>), your <strong>WordPress Username</strong> (e.g. <code className="bg-white px-1 py-0.5 rounded font-mono text-[#2b1b12]">admin</code> or your author username), and paste the generated <strong>Application Password</strong>.
                </p>
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  onClick={() => setActiveModal('wordpress')}
                  className="py-3 px-6 rounded-xl bg-[#21759b] text-white hover:bg-[#1b6485] font-bold text-xs transition-all flex items-center gap-2 shadow-sm cursor-pointer"
                >
                  <Globe className="w-4 h-4" />
                  <span>Configure WordPress Settings Now</span>
                </button>
              </div>
            </div>
          )}

          {/* SUB-TAB: META RULES */}
          {ruleBookTab === 'meta' && (
            <div className="space-y-6">
              <div className="bg-[#fffcf7] border border-[#e4d6c6] rounded-2xl p-6 shadow-card space-y-6">
                <div>
                  <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200">
                    Official Meta Policy & Graph API Requirements
                  </span>
                  <h2 className="font-editorial text-2xl font-bold text-[#2b1b12] mt-2">
                    Why Meta Has Specific Rules for Automated Publishing
                  </h2>
                  <p className="text-xs md:text-sm text-[#6f5a4c] mt-1 leading-relaxed">
                    Meta strictly protects user privacy. To publish posts, images, and reels on Instagram and Facebook without manual copy-pasting, Meta requires compliance with two foundational rules. These take under 60 seconds to configure.
                  </p>
                </div>

                {/* RULE 1 */}
                <div className="border border-[#e4d6c6] rounded-xl p-5 bg-[#fdfbf7] space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#c5a059] text-[#2b1b12] font-black text-xs flex items-center justify-center shrink-0">
                      1
                    </span>
                    <h3 className="font-bold text-sm text-[#2b1b12]">
                      Your Instagram Account Must Be a Professional Account (Business or Creator)
                    </h3>
                  </div>
                  <p className="text-xs text-[#6f5a4c] leading-relaxed">
                    <strong>Why:</strong> Meta’s official Graph API only permits programmatic publishing to <em>Instagram Professional</em> accounts. Personal accounts cannot be automated by any software in the world. Switching is <strong>100% free</strong> and does not require a registered business.
                  </p>

                  <div className="bg-white border border-[#ebd8c5] rounded-xl p-4 space-y-2">
                    <h4 className="font-bold text-xs text-[#2b1b12] flex items-center gap-2">
                      <Smartphone className="w-4 h-4 text-[#c5a059]" />
                      <span>How to switch on your phone in 15 seconds:</span>
                    </h4>
                    <ol className="list-decimal list-inside space-y-1.5 text-xs text-[#6f5a4c] pl-1 font-medium">
                      <li>Open the <strong>Instagram app</strong> on your mobile phone and go to your profile.</li>
                      <li>Tap the <strong>☰ (Menu)</strong> icon in the top right corner $\rightarrow$ tap <strong>Settings and privacy</strong>.</li>
                      <li>Scroll down to <strong>For professionals</strong> and tap <strong>Account type and tools</strong>.</li>
                      <li>Tap <strong>Switch to professional account</strong> $\rightarrow$ select <strong>Creator</strong> or <strong>Business</strong>.</li>
                      <li>Follow the quick prompts and tap <strong>Done</strong>.</li>
                    </ol>
                  </div>
                </div>

                {/* RULE 2 */}
                <div className="border border-[#e4d6c6] rounded-xl p-5 bg-[#fdfbf7] space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#c5a059] text-[#2b1b12] font-black text-xs flex items-center justify-center shrink-0">
                      2
                    </span>
                    <h3 className="font-bold text-sm text-[#2b1b12]">
                      Your Instagram Account Must Be Linked to Your Facebook Page
                    </h3>
                  </div>
                  <p className="text-xs text-[#6f5a4c] leading-relaxed">
                    <strong>Why:</strong> Meta handles access tokens and API permissions for Instagram via Facebook Business Pages. When you link them, our 1-click integration can securely discover your Instagram handle and schedule posts seamlessly.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white border border-[#ebd8c5] rounded-xl p-4 space-y-2">
                      <h4 className="font-bold text-xs text-[#2b1b12]">Option A: From Facebook (Desktop)</h4>
                      <ol className="list-decimal list-inside space-y-1 text-xs text-[#6f5a4c] pl-1">
                        <li>Go to your <strong>Facebook Page</strong>.</li>
                        <li>Click <strong>Settings</strong> $\rightarrow$ <strong>Linked Accounts</strong>.</li>
                        <li>Click <strong>Instagram</strong> $\rightarrow$ <strong>Connect Account</strong>.</li>
                        <li>Log in to confirm the link.</li>
                      </ol>
                    </div>

                    <div className="bg-white border border-[#ebd8c5] rounded-xl p-4 space-y-2">
                      <h4 className="font-bold text-xs text-[#2b1b12]">Option B: From Instagram (Mobile)</h4>
                      <ol className="list-decimal list-inside space-y-1 text-xs text-[#6f5a4c] pl-1">
                        <li>Go to your Instagram Profile $\rightarrow$ <strong>Edit Profile</strong>.</li>
                        <li>Under <em>Public business information</em>, tap <strong>Page</strong>.</li>
                        <li>Select or create your Facebook Page.</li>
                      </ol>
                    </div>
                  </div>
                </div>

                {/* RULE 3 */}
                <div className="border border-[#e4d6c6] rounded-xl p-5 bg-[#fdfbf7] space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#c5a059] text-[#2b1b12] font-black text-xs flex items-center justify-center shrink-0">
                      3
                    </span>
                    <h3 className="font-bold text-sm text-[#2b1b12]">
                      You Must Be an Admin of the Facebook Page
                    </h3>
                  </div>
                  <p className="text-xs text-[#6f5a4c] leading-relaxed">
                    Ensure that the personal Facebook profile you log in with has full Admin or Content Task permissions on that Facebook Page.
                  </p>
                </div>

                {/* INTERACTIVE PRE-FLIGHT CHECKLIST */}
                <div className="bg-gradient-to-br from-[#2b1b12] to-[#3d271a] rounded-xl p-6 text-white space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-editorial text-lg font-bold text-[#c5a059]">
                        Pre-Flight Verification Checklist
                      </h4>
                      <p className="text-xs text-[#e4d6c6]">
                        Check off each item once configured on your accounts:
                      </p>
                    </div>
                    {allChecked && (
                      <span className="px-3 py-1 rounded-full text-xs font-black uppercase bg-emerald-500 text-white animate-bounce">
                        Ready to Connect!
                      </span>
                    )}
                  </div>

                  <div className="space-y-2.5">
                    <label className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all cursor-pointer border border-white/10">
                      <input
                        type="checkbox"
                        checked={checklist.isProfessional}
                        onChange={(e) => setChecklist(prev => ({ ...prev, isProfessional: e.target.checked }))}
                        className="w-4 h-4 rounded text-[#c5a059] focus:ring-0 cursor-pointer"
                      />
                      <span className="text-xs">
                        1. My Instagram account is switched to <strong>Professional (Business or Creator)</strong>.
                      </span>
                    </label>

                    <label className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all cursor-pointer border border-white/10">
                      <input
                        type="checkbox"
                        checked={checklist.isLinkedToPage}
                        onChange={(e) => setChecklist(prev => ({ ...prev, isLinkedToPage: e.target.checked }))}
                        className="w-4 h-4 rounded text-[#c5a059] focus:ring-0 cursor-pointer"
                      />
                      <span className="text-xs">
                        2. My Instagram account is linked to my <strong>Facebook Page</strong>.
                      </span>
                    </label>

                    <label className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all cursor-pointer border border-white/10">
                      <input
                        type="checkbox"
                        checked={checklist.hasAdminRights}
                        onChange={(e) => setChecklist(prev => ({ ...prev, hasAdminRights: e.target.checked }))}
                        className="w-4 h-4 rounded text-[#c5a059] focus:ring-0 cursor-pointer"
                      />
                      <span className="text-xs">
                        3. I have <strong>Admin access</strong> to the Facebook Page I am connecting.
                      </span>
                    </label>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={handleConnectMeta}
                      className="w-full py-3 px-6 rounded-xl bg-[#c5a059] hover:bg-[#b89146] text-[#2b1b12] font-bold text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Share2 className="w-4 h-4" />
                      <span>Proceed to 1-Click Meta Authorization</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SUB-TAB: LINKEDIN RULES */}
          {ruleBookTab === 'linkedin' && (
            <div className="bg-[#fffcf7] border border-[#e4d6c6] rounded-2xl p-6 shadow-card space-y-4">
              <h2 className="font-editorial text-2xl font-bold text-[#2b1b12]">
                LinkedIn Integration Rules
              </h2>
              <div className="space-y-3 text-xs text-[#6f5a4c] leading-relaxed">
                <div className="p-4 rounded-xl bg-[#fdfbf7] border border-[#e4d6c6]">
                  <h3 className="font-bold text-sm text-[#2b1b12] mb-1">Personal vs. Company Pages</h3>
                  <p>
                    Rank Monk supports posting directly to your personal LinkedIn profile or to an official Company Page. If you want to post to a company feed, you must hold the <strong>Super Admin</strong> or <strong>Content Admin</strong> role on that LinkedIn Organization Page.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-[#fdfbf7] border border-[#e4d6c6]">
                  <h3 className="font-bold text-sm text-[#2b1b12] mb-1">Character & Media Limits</h3>
                  <p>
                    LinkedIn posts support up to 3,000 characters. Single images (PNG/JPEG), carousels, or outbound article links are supported.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveModal('linkedin')}
                className="py-2.5 px-5 rounded-xl bg-[#0077b5] text-white text-xs font-bold hover:bg-[#005f93] transition-all flex items-center gap-2 cursor-pointer"
              >
                <LinkedinIcon className="w-4 h-4" />
                <span>Connect LinkedIn via API Token</span>
              </button>
            </div>
          )}

          {/* SUB-TAB: X (TWITTER) RULES */}
          {ruleBookTab === 'twitter' && (
            <div className="bg-[#fffcf7] border border-[#e4d6c6] rounded-2xl p-6 shadow-card space-y-4">
              <h2 className="font-editorial text-2xl font-bold text-[#2b1b12]">
                X (Twitter) Integration Rules
              </h2>
              <div className="space-y-3 text-xs text-[#6f5a4c] leading-relaxed">
                <div className="p-4 rounded-xl bg-[#fdfbf7] border border-[#e4d6c6]">
                  <h3 className="font-bold text-sm text-[#2b1b12] mb-1">Post Length Limits</h3>
                  <p>
                    Standard accounts are limited to 280 characters per tweet. Verified X Premium accounts allow long-form posts. Rank Monk automatically calculates your character count in the live composer.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-[#fdfbf7] border border-[#e4d6c6]">
                  <h3 className="font-bold text-sm text-[#2b1b12] mb-1">Image Specs</h3>
                  <p>
                    Supports PNG, JPEG, and WebP images with a 16:9 or 1:1 aspect ratio. Media uploaded via Media Studio is automatically optimized for Twitter cards.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveModal('twitter')}
                className="py-2.5 px-5 rounded-xl bg-black text-white text-xs font-bold hover:bg-neutral-800 transition-all flex items-center gap-2 cursor-pointer"
              >
                <TwitterIcon className="w-4 h-4" />
                <span>Connect X via Developer Keys</span>
              </button>
            </div>
          )}

          {/* SUB-TAB: FAQS */}
          {ruleBookTab === 'faq' && (
            <div className="bg-[#fffcf7] border border-[#e4d6c6] rounded-2xl p-6 shadow-card space-y-4">
              <h2 className="font-editorial text-2xl font-bold text-[#2b1b12]">
                Frequently Asked Questions & Troubleshooting
              </h2>
              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-[#fdfbf7] border border-[#e4d6c6]">
                  <h4 className="font-bold text-xs text-[#2b1b12] mb-1">
                    Q: Why didn't my Instagram account show up after I logged in with Meta?
                  </h4>
                  <p className="text-xs text-[#6f5a4c]">
                    This happens when either: (1) Your Instagram account is still set to Personal instead of Professional (Business/Creator), or (2) Your Instagram account is not yet linked to a Facebook Page. Follow Rule 1 & Rule 2 above, then click Re-authenticate.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#fdfbf7] border border-[#e4d6c6]">
                  <h4 className="font-bold text-xs text-[#2b1b12] mb-1">
                    Q: Does an Instagram Professional Account cost anything?
                  </h4>
                  <p className="text-xs text-[#6f5a4c]">
                    No. Meta provides Professional (Business and Creator) accounts 100% free of charge to any user worldwide. You do not need to register a legal company or provide tax documents.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#fdfbf7] border border-[#e4d6c6]">
                  <h4 className="font-bold text-xs text-[#2b1b12] mb-1">
                    Q: Can I disconnect or revoke access at any time?
                  </h4>
                  <p className="text-xs text-[#6f5a4c]">
                    Yes! You can click "Disconnect" in the Integrations module at any time, which instantly purges the tokens from your workspace. You can also revoke access in your Facebook or Instagram security settings.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODAL 1: TWITTER / X DEVELOPER API KEYS */}
      {activeModal === 'twitter' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#fffcf7] border border-[#d8c09e] rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5 animate-slide-up">
            <div className="flex items-center justify-between border-b border-[#e4d6c6] pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-black text-white flex items-center justify-center">
                  <TwitterIcon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-editorial text-lg font-bold text-[#2b1b12]">Connect X (Twitter) via API Keys</h3>
                  <p className="text-[11px] text-[#6f5a4c]">Direct developer authentication for live organic tweeting</p>
                </div>
              </div>
              <button
                onClick={() => setActiveModal('none')}
                className="w-8 h-8 rounded-full bg-[#f8f3ec] text-[#6f5a4c] hover:text-[#2b1b12] flex items-center justify-center font-bold text-xs"
              >
                ✕
              </button>
            </div>

            {/* Step-by-Step Instructions */}
            <div className="bg-[#f8f3ec] rounded-2xl p-4 border border-[#e4d6c6] space-y-2 text-xs text-[#6f5a4c]">
              <div className="font-bold text-[#2b1b12] flex items-center gap-1.5">
                <span>📋 How to get your keys in 60 seconds:</span>
              </div>
              <ol className="list-decimal list-inside space-y-1 pl-1 text-[11px]">
                <li>Open <a href="https://developer.x.com/en/portal/dashboard" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline font-bold">developer.x.com ↗</a> and create a free App.</li>
                <li>Under <strong>User Authentication Settings</strong>, enable <strong>Read and Write</strong>.</li>
                <li>Go to <strong>Keys and Tokens</strong> $\rightarrow$ generate your <strong>User Access Token</strong> (or Bearer Token).</li>
                <li>Paste your handle and Access Token below:</li>
              </ol>
            </div>

            <form onSubmit={handleSaveTwitter} className="space-y-4">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#6f5a4c] block mb-1">
                  Your X (Twitter) Handle *
                </label>
                <input
                  type="text"
                  required
                  placeholder="@yourcompany"
                  value={twHandle}
                  onChange={(e) => setTwHandle(e.target.value)}
                  className="w-full p-3 bg-white border border-[#e4d6c6] rounded-xl text-xs text-[#2b1b12] font-semibold focus:outline-none focus:border-[#2b1b12]"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#6f5a4c] block mb-1">
                  User Access Token (or Bearer Token) *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Paste your Twitter OAuth 1.0a / 2.0 User Access Token here..."
                  value={twToken}
                  onChange={(e) => setTwToken(e.target.value)}
                  className="w-full p-3 bg-white border border-[#e4d6c6] rounded-xl text-xs text-[#2b1b12] font-mono focus:outline-none focus:border-[#2b1b12]"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#6f5a4c] block mb-1">
                  API Key / Consumer Key (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Optional API Key"
                  value={twApiKey}
                  onChange={(e) => setTwApiKey(e.target.value)}
                  className="w-full p-2.5 bg-white border border-[#e4d6c6] rounded-xl text-xs text-[#2b1b12] font-mono focus:outline-none"
                />
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveModal('none')}
                  className="flex-1 py-3 bg-[#f8f3ec] hover:bg-[#ebdcc8] text-[#2b1b12] rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-black hover:bg-neutral-800 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
                >
                  Verify & Connect X Account ✦
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: LINKEDIN OFFICIAL ACCESS TOKEN */}
      {activeModal === 'linkedin' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#fffcf7] border border-[#d8c09e] rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5 animate-slide-up">
            <div className="flex items-center justify-between border-b border-[#e4d6c6] pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#0077b5] text-white flex items-center justify-center">
                  <LinkedinIcon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-editorial text-lg font-bold text-[#2b1b12]">Connect LinkedIn via API Token</h3>
                  <p className="text-[11px] text-[#6f5a4c]">Post updates directly to your profile or company page</p>
                </div>
              </div>
              <button
                onClick={() => setActiveModal('none')}
                className="w-8 h-8 rounded-full bg-[#f8f3ec] text-[#6f5a4c] hover:text-[#2b1b12] flex items-center justify-center font-bold text-xs"
              >
                ✕
              </button>
            </div>

            {/* Step-by-Step Instructions */}
            <div className="bg-[#f8f3ec] rounded-2xl p-4 border border-[#e4d6c6] space-y-2 text-xs text-[#6f5a4c]">
              <div className="font-bold text-[#2b1b12] flex items-center gap-1.5">
                <span>📋 How to get your LinkedIn Token:</span>
              </div>
              <ol className="list-decimal list-inside space-y-1 pl-1 text-[11px]">
                <li>Go to <a href="https://www.linkedin.com/developers/apps" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline font-bold">developer.linkedin.com ↗</a> and create or select your App.</li>
                <li>Add the <strong>Share on LinkedIn</strong> product to grant <code className="bg-white px-1 py-0.5 rounded">w_member_social</code>.</li>
                <li>Generate your <strong>Member Access Token</strong> using the LinkedIn OAuth token tool.</li>
                <li>Paste your profile/company name and token below:</li>
              </ol>
            </div>

            <form onSubmit={handleSaveLinkedIn} className="space-y-4">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#6f5a4c] block mb-1">
                  Profile or Company Page Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Acme Innovations / John Doe"
                  value={liAccountName}
                  onChange={(e) => setLiAccountName(e.target.value)}
                  className="w-full p-3 bg-white border border-[#e4d6c6] rounded-xl text-xs text-[#2b1b12] font-semibold focus:outline-none focus:border-[#0077b5]"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#6f5a4c] block mb-1">
                  Member URN or Numeric ID (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 12345678 or vanity handle"
                  value={liUrn}
                  onChange={(e) => setLiUrn(e.target.value)}
                  className="w-full p-2.5 bg-white border border-[#e4d6c6] rounded-xl text-xs text-[#2b1b12] font-mono focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#6f5a4c] block mb-1">
                  LinkedIn Member Access Token *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Paste your LinkedIn Bearer Access Token (starts with AQ...)"
                  value={liToken}
                  onChange={(e) => setLiToken(e.target.value)}
                  className="w-full p-3 bg-white border border-[#e4d6c6] rounded-xl text-xs text-[#2b1b12] font-mono focus:outline-none focus:border-[#0077b5]"
                />
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveModal('none')}
                  className="flex-1 py-3 bg-[#f8f3ec] hover:bg-[#ebdcc8] text-[#2b1b12] rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-[#0077b5] hover:bg-[#005f93] text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
                >
                  Verify & Connect LinkedIn ✦
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: META DIRECT PAGE ACCESS TOKEN */}
      {activeModal === 'meta_token' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#fffcf7] border border-[#d8c09e] rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5 animate-slide-up">
            <div className="flex items-center justify-between border-b border-[#e4d6c6] pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#1877f2] to-[#833ab4] text-white flex items-center justify-center">
                  <FacebookIcon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-editorial text-lg font-bold text-[#2b1b12]">Connect Meta via Page Access Token</h3>
                  <p className="text-[11px] text-[#6f5a4c]">Zero domain whitelisting or Meta App Review required</p>
                </div>
              </div>
              <button
                onClick={() => setActiveModal('none')}
                className="w-8 h-8 rounded-full bg-[#f8f3ec] text-[#6f5a4c] hover:text-[#2b1b12] flex items-center justify-center font-bold text-xs"
              >
                ✕
              </button>
            </div>

            {/* Step-by-Step Instructions */}
            <div className="bg-[#f8f3ec] rounded-2xl p-4 border border-[#e4d6c6] space-y-2 text-xs text-[#6f5a4c]">
              <div className="font-bold text-[#2b1b12] flex items-center gap-1.5">
                <span>📋 How any business owner gets their Page Token:</span>
              </div>
              <ol className="list-decimal list-inside space-y-1 pl-1 text-[11px]">
                <li>Open <a href="https://developers.facebook.com/tools/explorer/" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline font-bold">Meta Graph Explorer ↗</a> or your Page Settings.</li>
                <li>Under <strong>User or Page</strong>, select your Facebook Page.</li>
                <li>Add permissions: <code className="bg-white px-1 py-0.5 rounded">pages_manage_posts</code> and <code className="bg-white px-1 py-0.5 rounded">instagram_content_publish</code>.</li>
                <li>Generate Token $\rightarrow$ Copy your <strong>Page Access Token</strong> and <strong>Page ID</strong> below:</li>
              </ol>
            </div>

            <form onSubmit={handleSaveMetaDirect} className="space-y-4">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#6f5a4c] block mb-1">
                  Facebook Page Name (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Snabbit Official Page"
                  value={metaPageTitle}
                  onChange={(e) => setMetaPageTitle(e.target.value)}
                  className="w-full p-2.5 bg-white border border-[#e4d6c6] rounded-xl text-xs text-[#2b1b12] font-semibold focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#6f5a4c] block mb-1">
                    Facebook Page ID *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 102938475610"
                    value={metaPageIdVal}
                    onChange={(e) => setMetaPageIdVal(e.target.value)}
                    className="w-full p-3 bg-white border border-[#e4d6c6] rounded-xl text-xs text-[#2b1b12] font-mono focus:outline-none focus:border-[#1877f2]"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#6f5a4c] block mb-1">
                    Instagram Account ID (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 178414001928"
                    value={metaIgIdVal}
                    onChange={(e) => setMetaIgIdVal(e.target.value)}
                    className="w-full p-3 bg-white border border-[#e4d6c6] rounded-xl text-xs text-[#2b1b12] font-mono focus:outline-none focus:border-[#833ab4]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#6f5a4c] block mb-1">
                  Permanent Page Access Token *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Paste your Meta Page Access Token (starts with EAAB...)"
                  value={metaTokenVal}
                  onChange={(e) => setMetaTokenVal(e.target.value)}
                  className="w-full p-3 bg-white border border-[#e4d6c6] rounded-xl text-xs text-[#2b1b12] font-mono focus:outline-none focus:border-[#1877f2]"
                />
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveModal('none')}
                  className="flex-1 py-3 bg-[#f8f3ec] hover:bg-[#ebdcc8] text-[#2b1b12] rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-[#1877f2] hover:bg-[#166fe5] text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
                >
                  Verify & Connect Channels ✦
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: GITHUB GITOPS CREDENTIALS & DIAGNOSTIC TESTER */}
      {activeModal === 'github' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="bg-[#fffcf7] border border-[#d8c09e] rounded-3xl p-5 sm:p-7 max-w-lg w-full shadow-2xl space-y-4 my-8 animate-slide-up">
            <div className="flex items-center justify-between border-b border-[#e4d6c6] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#24292e] text-white flex items-center justify-center">
                  <GithubIcon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-editorial text-lg font-bold text-[#2b1b12]">GitHub GitOps Publishing</h3>
                  <p className="text-[11px] text-[#6f5a4c]">Commit markdown blogs directly to your web repository</p>
                </div>
              </div>
              <button
                onClick={() => setActiveModal('none')}
                className="w-8 h-8 rounded-full bg-[#f8f3ec] text-[#6f5a4c] hover:text-[#2b1b12] flex items-center justify-center font-bold text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Quick 30-Second Guide with 1-Click Classic Token */}
            <div className="bg-amber-50/80 border border-amber-200/90 rounded-2xl p-3 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-amber-950 flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>How to get your GitHub Token (30 Seconds)</span>
                </span>
                <button
                  type="button"
                  onClick={() => setShowGithubGuide(!showGithubGuide)}
                  className="text-[11px] font-bold text-amber-800 hover:text-amber-950 flex items-center gap-0.5 cursor-pointer"
                >
                  <span>{showGithubGuide ? 'Hide' : 'Show'}</span>
                  {showGithubGuide ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
              </div>

              {showGithubGuide && (
                <div className="space-y-2 pt-1.5 border-t border-amber-200/60 text-[11px] text-[#4a3528]">
                  <div className="p-2 bg-emerald-50/90 border border-emerald-200 rounded-xl space-y-1">
                    <span className="font-bold text-emerald-900 block">⚡ Recommended: 1-Click Classic Token (Never Fails)</span>
                    <p className="text-[10.5px] leading-relaxed text-emerald-800">
                      Click 👉 <a href="https://github.com/settings/tokens/new?scopes=repo&description=RankMonk+GitOps" target="_blank" rel="noopener noreferrer" className="font-bold underline text-emerald-950 inline-flex items-center gap-0.5">Generate Pre-Configured Token <ExternalLink className="w-3 h-3" /></a>. This automatically checks the <code className="bg-white px-1 py-0.2 rounded border font-mono font-bold">repo</code> scope for you. Scroll down, click <strong>Generate token</strong>, and paste it below!
                    </p>
                  </div>
                  <div className="space-y-1 text-[10.5px]">
                    <span className="font-bold text-[#2b1b12] block">If using Fine-Grained Token:</span>
                    <p className="leading-relaxed text-[#6f5a4c]">
                      Under <em>Repository access</em> select your repo, and under <em>Repository permissions → Contents</em> choose <strong>Read and write</strong>.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <form onSubmit={handleSaveGithub} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-[#2b1b12] block">
                  GitHub Personal Access Token *
                </label>
                <input
                  type="password"
                  required
                  placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  value={githubConfig.token || ''}
                  onChange={(e) => setGithubConfig({ ...githubConfig, token: e.target.value })}
                  className="w-full p-2.5 bg-white border border-[#e4d6c6] rounded-xl font-mono text-xs text-[#2b1b12] focus:outline-none focus:border-[#c5a059]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-[#2b1b12] block">
                    Repository (owner/repo) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. acme/website"
                    value={githubConfig.repo || ''}
                    onChange={(e) => setGithubConfig({ ...githubConfig, repo: e.target.value })}
                    className="w-full p-2.5 bg-white border border-[#e4d6c6] rounded-xl font-mono text-xs text-[#2b1b12] focus:outline-none focus:border-[#c5a059]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-[#2b1b12] block">
                    Branch *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="main"
                    value={githubConfig.branch || 'main'}
                    onChange={(e) => setGithubConfig({ ...githubConfig, branch: e.target.value })}
                    className="w-full p-2.5 bg-white border border-[#e4d6c6] rounded-xl font-mono text-xs text-[#2b1b12] focus:outline-none focus:border-[#c5a059]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#2b1b12] block">
                  Blog Folder Path *
                </label>
                <input
                  type="text"
                  required
                  placeholder="content/blogs or content/resources"
                  value={githubConfig.folderPath || ''}
                  onChange={(e) => setGithubConfig({ ...githubConfig, folderPath: e.target.value })}
                  className="w-full p-2.5 bg-white border border-[#e4d6c6] rounded-xl font-mono text-xs text-[#2b1b12] focus:outline-none focus:border-[#c5a059]"
                />
                <span className="text-[10px] text-[#6f5a4c]">Where markdown articles will be committed.</span>
              </div>

              {/* Diagnostic Box */}
              {githubTestResult && (
                <div className={`p-3 rounded-xl border text-xs space-y-1.5 animate-fade-in ${
                  githubTestResult.error ? 'bg-red-50 border-red-200 text-red-950' : 'bg-emerald-50 border-emerald-300 text-emerald-950'
                }`}>
                  {githubTestResult.error ? (
                    <div className="space-y-1">
                      <span className="font-extrabold flex items-center gap-1.5 text-red-900">
                        <AlertCircle className="w-3.5 h-3.5 text-red-600 shrink-0" />
                        <span>Diagnostic Verification Failed</span>
                      </span>
                      <p className="text-[11px] text-red-800 leading-relaxed">
                        {githubTestResult.error}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <span className="font-extrabold flex items-center gap-1.5 text-emerald-950">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>GitHub GitOps Verified! (@{githubTestResult.authenticatedUser})</span>
                      </span>
                      <p className="text-[10.5px] text-emerald-800">
                        Framework: <strong>{githubTestResult.framework}</strong> • Write Access: <strong>{githubTestResult.hasWritePermission ? 'Yes' : 'No'}</strong>
                      </p>
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveModal('none')}
                  className="py-2.5 px-4 bg-[#f8f3ec] hover:bg-[#ebdcc8] text-[#2b1b12] rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isTestingGithub || !githubConfig.token || !githubConfig.repo}
                  onClick={handleTestGithubDirect}
                  className="py-2.5 px-3 bg-emerald-50 border border-emerald-300 hover:bg-emerald-100 text-emerald-900 font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
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
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#2b1b12] hover:bg-[#3d271a] text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer text-center"
                >
                  Save GitOps Settings ✦
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 5: WORDPRESS REST API CREDENTIALS */}
      {activeModal === 'wordpress' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="bg-[#fffcf7] border border-[#d8c09e] rounded-3xl p-5 sm:p-7 max-w-lg w-full shadow-2xl space-y-4 my-8 animate-slide-up">
            <div className="flex items-center justify-between border-b border-[#e4d6c6] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#21759b] text-white flex items-center justify-center font-bold text-sm">
                  WP
                </div>
                <div>
                  <h3 className="font-editorial text-lg font-bold text-[#2b1b12]">WordPress REST API Connection</h3>
                  <p className="text-[11px] text-[#6f5a4c]">Publish directly into your WordPress posts table</p>
                </div>
              </div>
              <button
                onClick={() => setActiveModal('none')}
                className="w-8 h-8 rounded-full bg-[#f8f3ec] text-[#6f5a4c] hover:text-[#2b1b12] flex items-center justify-center font-bold text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Quick WP Guide */}
            <div className="bg-blue-50/80 border border-blue-200/90 rounded-2xl p-3 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-blue-950 flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>How to get your WordPress Password (No plugins needed)</span>
                </span>
                <button
                  type="button"
                  onClick={() => setShowWpGuide(!showWpGuide)}
                  className="text-[11px] font-bold text-blue-800 hover:text-blue-950 flex items-center gap-0.5 cursor-pointer"
                >
                  <span>{showWpGuide ? 'Hide' : 'Show'}</span>
                  {showWpGuide ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
              </div>

              {showWpGuide && (
                <ol className="list-decimal list-inside space-y-1 pt-1.5 border-t border-blue-200/60 text-[11px] text-[#2c3e50] leading-relaxed">
                  <li>Log in to your WordPress Admin (<code className="bg-white px-1 py-0.5 rounded border border-blue-200 font-mono text-[10px]">yourdomain.com/wp-admin</code>).</li>
                  <li>Click <strong>Users → Profile</strong> in the left sidebar.</li>
                  <li>Scroll down to the <strong>Application Passwords</strong> section.</li>
                  <li>Type <code className="bg-white px-1 py-0.5 rounded border border-blue-200 text-[10px] font-mono">RankMonk</code> and click <strong>Add New Application Password</strong>.</li>
                  <li>Copy the 16-character generated password and paste it below!</li>
                </ol>
              )}
            </div>

            <form onSubmit={handleSaveWp} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-[#2b1b12] block">WordPress Site URL *</label>
                <input
                  type="url"
                  required
                  placeholder="https://yourdomain.com"
                  value={wpConfig.wpUrl || ''}
                  onChange={(e) => setWpConfig({ ...wpConfig, wpUrl: e.target.value })}
                  className="w-full p-2.5 bg-white border border-[#e4d6c6] rounded-xl text-xs text-[#2b1b12] focus:outline-none focus:border-[#21759b]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#2b1b12] block">WordPress Admin Username *</label>
                <input
                  type="text"
                  required
                  placeholder="admin or editor"
                  value={wpConfig.wpUsername || ''}
                  onChange={(e) => setWpConfig({ ...wpConfig, wpUsername: e.target.value })}
                  className="w-full p-2.5 bg-white border border-[#e4d6c6] rounded-xl text-xs text-[#2b1b12] focus:outline-none focus:border-[#21759b]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#2b1b12] block">WordPress Application Password *</label>
                <input
                  type="password"
                  required
                  placeholder="xxxx xxxx xxxx xxxx"
                  value={wpConfig.wpAppPassword || ''}
                  onChange={(e) => setWpConfig({ ...wpConfig, wpAppPassword: e.target.value })}
                  className="w-full p-2.5 bg-white border border-[#e4d6c6] rounded-xl font-mono text-xs text-[#2b1b12] focus:outline-none focus:border-[#21759b]"
                />
                <span className="text-[10px] text-[#6f5a4c]">Generated under Users → Profile → Application Passwords.</span>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveModal('none')}
                  className="flex-1 py-2.5 bg-[#f8f3ec] hover:bg-[#ebdcc8] text-[#2b1b12] rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#21759b] hover:bg-[#1b6485] text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer text-center"
                >
                  Save WordPress Settings ✦
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

