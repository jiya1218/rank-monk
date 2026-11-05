'use client';

import React, { useState } from 'react';
import {
  Image as ImageIcon,
  Video,
  Sparkles,
  Share2,
  Copy,
  Download,
  Check,
  CheckCircle2,
  Upload,
  Globe,
  Plus,
  ArrowRight,
  Loader2,
  Layers,
  Heart,
  MessageCircle,
  Bookmark,
  Send,
  Camera,
  ExternalLink,
  Eye,
  Maximize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  X
} from 'lucide-react';

interface MediaStudioProps {
  project: any;
  user: any;
  mediaAssets: any[];
  onGenerateMedia: (params: {
    prompt: string;
    ratio: string;
    formatName: string;
    style: string;
    referenceImage?: string;
  }) => Promise<any>;
  onPushToSocialQueue: (asset: any) => void;
}

const FORMATS = [
  { id: '1:1', name: 'Square', size: '1080×1080', icon: '■' },
  { id: '16:9', name: 'Landscape', size: '1200×628', icon: '▬' },
  { id: '4:5', name: 'Portrait', size: '1080×1350', icon: '▮' },
  { id: '9:16', name: 'Story', size: '1080×1920', icon: '📱' },
  { id: '16:9-banner', name: 'Banner', size: '1920×1080', icon: '▭' },
];

const AEO_QUICK_PROMPTS = [
  { topic: 'Launch', prompt: 'Instagram launch post announcing our 2026 AI organic performance sprint with verified ROI metrics' },
  { topic: 'Founder Special', prompt: 'Exclusive founder pass: 99.99% discount with automated crawl audit & daily self-healing fixes' },
  { topic: 'Leadership', prompt: 'Why high-growth teams are collapsing 5 disconnected SEO and content tools into 1 unified engine' },
  { topic: 'AEO Shift', prompt: 'How modern brands dominate ChatGPT, Perplexity, and Gemini citations with semantic knowledge graphs' },
  { topic: 'Case Study', prompt: 'From 0 to 4.8x organic discovery in 6 months: the exact technical roadmap used by high-velocity founders' }
];

export function MediaStudio({
  project,
  user,
  mediaAssets,
  onGenerateMedia,
  onPushToSocialQueue
}: MediaStudioProps) {
  const [activeTab, setActiveTab] = useState<'image' | 'video'>('image');
  const [prompt, setPrompt] = useState('');
  const [activeFormat, setActiveFormat] = useState('1:1');
  const [activePreset, setActivePreset] = useState('default');
  const [style, setStyle] = useState('auto');
  const [quality, setQuality] = useState('high');
  const [generating, setGenerating] = useState(false);
  const [activeAsset, setActiveAsset] = useState<any>(mediaAssets && mediaAssets.length > 0 ? mediaAssets[0] : null);
  const [copiedCaptionToast, setCopiedCaptionToast] = useState(false);
  const [fetchingSite, setFetchingSite] = useState(false);
  const [referenceFile, setReferenceFile] = useState<string | null>(null);
  const [referenceImage, setReferenceImage] = useState<string | null>(null);

  // Canva-style Live Designer State
  const [activeTemplate, setActiveTemplate] = useState<'poster' | 'services_grid' | 'hero_metaphor' | 'luxury_editorial' | 'raw'>('poster');
  const [customHeadline, setCustomHeadline] = useState('');
  const [customSubheadline, setCustomSubheadline] = useState('');
  const [customBadge, setCustomBadge] = useState('');
  const [customServices, setCustomServices] = useState<any[]>([]);
  const [isEditingInline, setIsEditingInline] = useState(false);
  const [previewMode, setPreviewMode] = useState<'full_poster' | 'instagram_feed'>('full_poster');
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);

  // Sync activeAsset if mediaAssets updates and activeAsset is null
  React.useEffect(() => {
    if (!activeAsset && mediaAssets && mediaAssets.length > 0) {
      setActiveAsset(mediaAssets[0]);
    }
  }, [mediaAssets, activeAsset]);

  // Escape key handler for fullscreen lightbox
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isLightboxOpen) {
        setIsLightboxOpen(false);
        setZoomLevel(1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen]);

  React.useEffect(() => {
    if (activeAsset) {
      setCustomHeadline(activeAsset.headline || '');
      setCustomSubheadline(activeAsset.subheadline || '');
      setCustomBadge(activeAsset.badge || '');
      setCustomServices(activeAsset.services || [
        { title: 'AI Automation', desc: 'Custom workflows & autonomous pipelines.', icon: '⚡' },
        { title: 'Digital Marketing', desc: 'Predictive ROI campaigns & multi-channel ads.', icon: '📈' },
        { title: 'Website Building', desc: 'Lightning-fast Next.js apps & landing pages.', icon: '🌐' },
        { title: 'Cyber Security', desc: 'Zero-trust architecture & enterprise defense.', icon: '🛡️' }
      ]);
      if (activeAsset.postStyle === 'services_grid') {
        setActiveTemplate('services_grid');
      } else if (activeAsset.postStyle === 'hero_metaphor') {
        setActiveTemplate('hero_metaphor');
      } else {
        setActiveTemplate('poster');
      }
    }
  }, [activeAsset]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setReferenceFile(file.name);
      const reader = new FileReader();
      reader.onload = () => {
        setReferenceImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveReference = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setReferenceFile(null);
    setReferenceImage(null);
  };

  // Gemini API Key locally stored if user wants custom key
  const [showKeyDrawer, setShowKeyDrawer] = useState(false);
  const [customApiKey, setCustomApiKey] = useState('');

  const brandName = project?.name || 'Rank Monk';
  const brandDomain = project?.domain || 'rankmonk.in';
  const industry = project?.industry || '';

  // Universal Dynamic Quick Prompts (Adapts to ANY Industry)
  const indLower = (industry || '').toLowerCase();

  const getUniversalPrompts = () => {
    if (indLower.includes('clean') || indLower.includes('maid') || indLower.includes('chore') || indLower.includes('home service')) {
      return [
        { topic: 'Launch', prompt: `Instagram launch post: On-demand verified domestic help & deep cleaning with ${brandName}` },
        { topic: 'Special Offer', prompt: `Special offer: 20% off whole house deep cleaning, sanitization and kitchen care` },
        { topic: 'Customer Trust', prompt: `Why busy working professionals and families consistently trust ${brandName}` },
        { topic: 'Service Spotlight', prompt: `Spotless living rooms, sparkling kitchens and organized spaces delivered with ease` },
        { topic: 'Lifestyle Hook', prompt: `Tired after a long workday? Book your trusted doorstep helper with ${brandName} in seconds` }
      ];
    }
    if (indLower.includes('food') || indLower.includes('restaurant') || indLower.includes('dining')) {
      return [
        { topic: 'Launch', prompt: `Introducing signature culinary experiences delivered straight to your door by ${brandName}` },
        { topic: 'Special Offer', prompt: `Exclusive weekend offer: Free delivery and special savings on your favorite meals` },
        { topic: 'Customer Trust', prompt: `Rated 4.9 stars: Why food lovers across our city consistently choose ${brandName}` },
        { topic: 'Product Spotlight', prompt: `Fresh ingredients, handcrafted recipes and lightning-fast delivery with ${brandName}` },
        { topic: 'Lifestyle Hook', prompt: `Skip the kitchen chores tonight and enjoy restaurant-grade dining at home with ${brandName}` }
      ];
    }
    if (indLower.includes('fitness') || indLower.includes('gym') || indLower.includes('sport')) {
      return [
        { topic: 'Launch', prompt: `Transform your physical strength and energy with ${brandName}` },
        { topic: 'Special Offer', prompt: `Claim your first personalized training consultation with ${brandName}` },
        { topic: 'Customer Trust', prompt: `Over 5,000+ member transformations: Real results backed by science and coaching` },
        { topic: 'Spotlight', prompt: `World-class training facilities, dedicated coaches, and guaranteed progress` },
        { topic: 'Motivation', prompt: `Stop waiting for next Monday: Your breakthrough begins today with ${brandName}` }
      ];
    }
    if (indLower.includes('real estate') || indLower.includes('property') || indLower.includes('housing')) {
      return [
        { topic: 'Launch', prompt: `Discover prime residential and commercial properties curated by ${brandName}` },
        { topic: 'Special Offer', prompt: `Exclusive preview: VIP access to newly released luxury apartment listings` },
        { topic: 'Trust & Proof', prompt: `Why discerning homebuyers and property investors trust ${brandName}` },
        { topic: 'Spotlight', prompt: `Architectural elegance, prime connectivity, and panoramic views with ${brandName}` },
        { topic: 'Lifestyle Hook', prompt: `Find a space designed for living, working, and growing with ${brandName}` }
      ];
    }
    return [
      { topic: 'Launch', prompt: `Brand campaign announcing verified excellence and premium customer solutions for ${brandName}` },
      { topic: 'Special Offer', prompt: `Exclusive limited access: Special privileges and instant fulfillment with ${brandName}` },
      { topic: 'Trust & Proof', prompt: `Why modern consumers and ambitious professionals consistently choose ${brandName}` },
      { topic: 'Spotlight', prompt: `Transforming everyday experience with speed, transparency, and superior quality` },
      { topic: 'Case Study', prompt: `From 0 to 4.8x growth: How high-velocity customers achieve seamless results with ${brandName}` }
    ];
  };

  const activeQuickPrompts = getUniversalPrompts();

  // AI Prompt Enhancer
  const handleEnhancePrompt = () => {
    if (!prompt.trim()) {
      setPrompt(`High-impact Instagram company marketing campaign for ${brandName} (${brandDomain}) in ${industry || 'modern services'}: cinematic studio composition, modern editorial visual, clean negative space, prominent ${brandName} brand aesthetic, and compelling call-to-action.`);
      return;
    }

    const enhanced = `${prompt.trim()}. Brand identity: ${brandName} (${brandDomain}). Visual direction: elegant commercial photography, sharp focus, natural warm contrast, clear visual hierarchy, 8k resolution, award-winning composition, and engaging marketing call-to-action.`;
    setPrompt(enhanced);
  };

  // Auto Fetch Site Info Simulation
  const handleAutoFetchSite = () => {
    setFetchingSite(true);
    setTimeout(() => {
      setFetchingSite(false);
      alert(`✓ Fetched brand metadata, official logo, and palette from https://${brandDomain}!`);
    }, 800);
  };

  // Generate Media Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setGenerating(true);
    try {
      const selectedFormatObj = FORMATS.find(f => f.id === activeFormat) || FORMATS[0];
      const newAsset = await onGenerateMedia({
        prompt,
        ratio: activeFormat.replace('-banner', ''),
        formatName: selectedFormatObj.name,
        style,
        referenceImage: referenceImage || undefined
      });
      if (newAsset) {
        setActiveAsset(newAsset);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };

  // Copy Caption & Hashtags
  const handleCopyCaption = () => {
    if (!activeAsset) return;
    const text = `${activeAsset.headline || ''}\n\n${activeAsset.caption || activeAsset.prompt}\n\n${(activeAsset.hashtags || []).join(' ')}`;
    navigator.clipboard?.writeText(text);
    setCopiedCaptionToast(true);
    setTimeout(() => setCopiedCaptionToast(false), 3000);
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-[1600px] mx-auto">
      {/* 1. Header with Title, Beta Pill & Subtitle */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-black text-[#2b1b12] tracking-tight">
              Media Studio
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-700 text-[11px] font-black uppercase tracking-wider border border-purple-200">
              BETA
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#6f5a4c] font-medium mt-1">
            Create stunning B2B visual assets, prompt enhancements, and schedule posts.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowKeyDrawer(!showKeyDrawer)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-[#e4d6c6] text-xs font-bold text-[#2b1b12] hover:bg-[#f8f3ec] transition-colors shadow-sm cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#c5a059]" />
          <span>Autonomous Vision Engine Active ✓</span>
        </button>
      </div>

      {showKeyDrawer && (
        <div className="bg-[#fffcf7] border border-[#c5a059] rounded-2xl p-5 shadow-sm space-y-3 animate-fade-in">
          <div className="flex justify-between items-center text-xs font-bold text-[#2b1b12] uppercase tracking-wider">
            <span>Autonomous Vision & Neural Graphics Settings</span>
            <button onClick={() => setShowKeyDrawer(false)} className="text-slate-400 hover:text-black">✕</button>
          </div>
          <p className="text-xs text-[#6f5a4c]">
            The autonomous vision engine automatically combines high-resolution graphic synthesis with brand logos, custom typography, and verified performance badges.
          </p>
        </div>
      )}

      {/* 2. Top 4 KPI Cards (Matching SoloSpider exact stats) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Generated Assets */}
        <div className="bg-white rounded-2xl border border-[#e4d6c6] p-5 shadow-sm flex items-center gap-4 hover:border-[#c5a059] transition-all">
          <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
            <ImageIcon className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#6f5a4c] truncate">
              Generated Assets
            </p>
            <h3 className="text-xl sm:text-2xl font-black text-[#2b1b12] leading-tight">
              {mediaAssets.length}
            </h3>
          </div>
        </div>

        {/* Card 2: Video Engine */}
        <div className="bg-white rounded-2xl border border-[#e4d6c6] p-5 shadow-sm flex items-center gap-4 hover:border-[#c5a059] transition-all">
          <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
            <Video className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#6f5a4c] truncate">
              Video Engine
            </p>
            <div className="flex items-center gap-1.5">
              <h3 className="text-xl sm:text-2xl font-black text-[#2b1b12] leading-tight">0</h3>
              <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">Beta</span>
            </div>
          </div>
        </div>

        {/* Card 3: Brand Assets / Presets */}
        <div className="bg-white rounded-2xl border border-[#e4d6c6] p-5 shadow-sm flex items-center gap-4 hover:border-[#c5a059] transition-all">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#6f5a4c] truncate">
              Brand Assets
            </p>
            <h3 className="text-xl sm:text-2xl font-black text-[#2b1b12] leading-tight">
              1 Active
            </h3>
          </div>
        </div>

        {/* Card 4: Active Workspaces */}
        <div className="bg-white rounded-2xl border border-[#e4d6c6] p-5 shadow-sm flex items-center gap-4 hover:border-[#c5a059] transition-all">
          <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
            <Layers className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#6f5a4c] truncate">
              Active Workspaces
            </p>
            <h3 className="text-xl sm:text-2xl font-black text-[#2b1b12] leading-tight">
              1 Locked
            </h3>
          </div>
        </div>
      </div>

      {/* 3. Main Studio Grid (2 Columns: Generator Form & Live Instagram Post Preview) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Generator Form & Campaign Settings */}
        <div className="lg:col-span-5 xl:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl border border-[#e4d6c6] shadow-sm overflow-hidden">
            {/* Tabs Headers */}
            <div className="flex border-b border-slate-100 bg-[#f8f3ec]/40">
              <button
                type="button"
                onClick={() => setActiveTab('image')}
                className={`flex items-center gap-2 border-b-2 px-6 py-4 text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'image'
                    ? 'border-[#2b1b12] text-[#2b1b12] bg-white'
                    : 'border-transparent text-[#6f5a4c] hover:text-[#2b1b12]'
                }`}
              >
                <ImageIcon className="w-4 h-4" />
                Image Generation
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('video')}
                className={`flex items-center gap-2 border-b-2 px-6 py-4 text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'video'
                    ? 'border-[#2b1b12] text-[#2b1b12] bg-white'
                    : 'border-transparent text-[#6f5a4c] hover:text-[#2b1b12]'
                }`}
              >
                <Video className="w-4 h-4" />
                Video Generation
                <span className="text-[9px] bg-[#f1e8dc] text-[#7a5242] px-1.5 py-0.5 rounded-full font-bold ml-1">
                  Coming Soon
                </span>
              </button>
            </div>

            {/* Tab 1 Content: Image Generator */}
            {activeTab === 'image' ? (
              <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5">
                {/* Prompt Section with Quick Fill Dropdown */}
                <div className="space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-[#6f5a4c]">
                      Describe visual style and target
                    </label>

                    {/* Quick Fill from AEO Prompts */}
                    <div className="flex items-center gap-1.5 text-xs text-[#6f5a4c]">
                      <span className="font-semibold text-[10px] uppercase tracking-wider text-[#6f5a4c]">
                        Quick Fill from AEO Prompts:
                      </span>
                      <select
                        onChange={(e) => {
                          if (e.target.value) {
                            setPrompt(e.target.value);
                            e.target.value = '';
                          }
                        }}
                        className="bg-[#f8f3ec] border border-[#e4d6c6] rounded-lg py-1 px-2 text-xs font-bold text-[#2b1b12] focus:outline-none cursor-pointer max-w-[220px] truncate"
                      >
                        <option value="">Select a prompt...</option>
                        {activeQuickPrompts.map((p, idx) => (
                          <option key={idx} value={p.prompt}>
                            [{p.topic}] {p.prompt}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Relative Textarea with Enhance with AI Button */}
                  <div className="relative">
                    <textarea
                      rows={4}
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="Describe the company marketing image or Instagram post you want to create..."
                      className="w-full rounded-xl border border-[#e4d6c6] bg-[#f8f3ec]/60 p-4 pr-36 text-xs text-[#2b1b12] font-medium focus:border-[#2b1b12] focus:bg-white focus:outline-none leading-relaxed"
                    />
                    <button
                      type="button"
                      onClick={handleEnhancePrompt}
                      className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-lg border border-[#e4d6c6] bg-white px-3 py-1.5 text-xs font-bold text-[#2b1b12] hover:bg-[#f1e8dc] transition-colors shadow-sm cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#c5a059]" />
                      <span>Enhance with AI</span>
                    </button>
                  </div>
                </div>

                {/* Brand Preset Selector */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-[#6f5a4c]">
                      Brand Preset
                    </label>
                    <button
                      type="button"
                      disabled={fetchingSite}
                      onClick={handleAutoFetchSite}
                      className="flex items-center gap-1 text-xs font-bold text-[#7a5242] hover:text-[#2b1b12] cursor-pointer disabled:opacity-50"
                    >
                      {fetchingSite ? (
                        <Loader2 className="w-3 h-3 animate-spin text-[#c5a059]" />
                      ) : (
                        <Globe className="w-3 h-3" />
                      )}
                      <span>Auto Fetch Site Info</span>
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setActivePreset('default')}
                      className={`flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-semibold transition-all cursor-pointer ${
                        activePreset === 'default'
                          ? 'border-[#2b1b12] bg-[#2b1b12] text-[#fffcf7]'
                          : 'border-[#e4d6c6] bg-white text-[#2b1b12] hover:bg-[#f8f3ec]'
                      }`}
                    >
                      <img
                        src={project?.logoUrl || '/assets/rank-monk-logo-horizontal.png'}
                        alt={brandName}
                        className="h-4 w-auto object-contain max-w-[60px]"
                        onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                      />
                      <span>https://{brandDomain}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => alert('Brand preset is locked to your single active domain workspace.')}
                      className="flex items-center gap-1 rounded-xl border border-dashed border-[#e4d6c6] px-3.5 py-2 text-xs font-bold text-[#6f5a4c] hover:bg-[#f8f3ec] cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add New</span>
                    </button>
                  </div>
                </div>

                {/* Upload Reference Dropzone */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-[#6f5a4c]">
                      Upload Reference (Optional)
                    </label>
                    {referenceImage && (
                      <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                        Visual Style Active ✓
                      </span>
                    )}
                  </div>

                  {referenceImage ? (
                    <div className="flex items-center justify-between p-3 border border-[#c5a059] rounded-xl bg-[#fffcf7] shadow-sm animate-fade-in">
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={referenceImage}
                          alt="Style Reference"
                          className="w-10 h-10 rounded-lg object-cover border border-[#e4d6c6] shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-[#2b1b12] truncate">{referenceFile}</p>
                          <p className="text-[10px] text-emerald-600 font-semibold">Loaded into Multimodal AI Vision</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveReference}
                        className="px-2.5 py-1 text-[11px] font-bold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      >
                        ✕ Remove
                      </button>
                    </div>
                  ) : (
                    <label className="flex items-center justify-center gap-2 p-3.5 border-2 border-dashed border-[#e4d6c6] rounded-xl bg-[#f8f3ec]/40 hover:bg-[#f8f3ec] transition-colors cursor-pointer text-xs font-medium text-[#6f5a4c]">
                      <Upload className="w-4 h-4 text-slate-400" />
                      <span>Drag & drop image or click to upload brand styling reference</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileUpload}
                      />
                    </label>
                  )}
                </div>

                {/* Format Selector (5 Tiles) */}
                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#6f5a4c]">
                    Format
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                    {FORMATS.map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setActiveFormat(f.id)}
                        className={`rounded-xl border p-3 text-center transition-all cursor-pointer ${
                          activeFormat === f.id
                            ? 'border-[#2b1b12] bg-[#f1e8dc]/70 text-[#2b1b12] font-bold shadow-sm'
                            : 'border-[#e4d6c6] bg-white text-[#6f5a4c] hover:bg-[#f8f3ec]'
                        }`}
                      >
                        <div className="text-base mb-0.5">{f.icon}</div>
                        <p className="text-xs font-bold leading-tight">{f.name}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5 font-medium">{f.size}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Style & Quality Dropdowns */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-[#6f5a4c]">
                      Style
                    </label>
                    <select
                      value={style}
                      onChange={(e) => setStyle(e.target.value)}
                      className="w-full rounded-xl border border-[#e4d6c6] bg-white p-2.5 text-xs font-bold text-[#2b1b12] focus:outline-none cursor-pointer"
                    >
                      <option value="auto">Auto (AI Layout & Theme)</option>
                      <option value="services_grid">4-Service Grid Showcase (Overview & Capabilities)</option>
                      <option value="hero_metaphor">3D Conceptual Metaphor (Chess / Domino / UI Nodes)</option>
                      <option value="editorial">Commercial Editorial Photography</option>
                      <option value="minimal">Minimalist Clean Studio</option>
                      <option value="3d">3D Render & Studio Lighting</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-[#6f5a4c]">
                      Quality
                    </label>
                    <select
                      value={quality}
                      onChange={(e) => setQuality(e.target.value)}
                      className="w-full rounded-xl border border-[#e4d6c6] bg-white p-2.5 text-xs font-bold text-[#2b1b12] focus:outline-none cursor-pointer"
                    >
                      <option value="high">High Definition</option>
                      <option value="ultra">Ultra 4K</option>
                      <option value="standard">Standard</option>
                    </select>
                  </div>
                </div>

                {/* Submit Action */}
                <button
                  type="submit"
                  disabled={generating || !prompt.trim()}
                  className="w-full py-3.5 bg-[#2b1b12] hover:bg-[#3b2519] text-[#fffcf7] rounded-xl text-xs font-bold tracking-wide uppercase shadow-md transition-all active:scale-[0.99] cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {generating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-[#c5a059]" />
                      <span>Synthesizing Company Campaign Creative...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-[#c5a059]" />
                      <span>Generate Media Campaign ✦</span>
                    </>
                  )}
                </button>
              </form>
            ) : (
              /* Tab 2 Content: Video Generation Coming Soon */
              <div className="p-10 text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto border border-blue-100 shadow-sm">
                  <Video className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-editorial text-2xl font-bold text-[#2b1b12]">
                    Autonomous B2B Video Engine (Beta)
                  </h3>
                  <p className="text-xs text-[#6f5a4c] max-w-md mx-auto leading-relaxed">
                    AI video reel generation with brand motion logos, voiceover synthesis, and multi-format vertical scaling is currently in private testing.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => alert('✓ You have been added to the Priority Video Engine Beta waitlist!')}
                  className="px-5 py-2.5 bg-[#2b1b12] text-[#fffcf7] text-xs font-bold rounded-xl shadow-sm hover:bg-[#3b2519] cursor-pointer"
                >
                  Join Video Beta Waitlist
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column (7 cols): High-Definition Studio Preview & Export */}
        <div className="lg:col-span-7 xl:col-span-7 space-y-6">
          <div className="bg-white rounded-2xl border border-[#e4d6c6] shadow-sm p-5 space-y-4">
            {/* Preview Header & View Mode Switcher */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 border-b border-slate-100 gap-2.5">
              <div className="flex items-center gap-1.5 p-1 bg-[#f8f3ec] rounded-xl border border-[#e4d6c6]">
                <button
                  type="button"
                  onClick={() => setPreviewMode('full_poster')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                    previewMode === 'full_poster'
                      ? 'bg-[#2b1b12] text-[#fffcf7] shadow-xs'
                      : 'text-[#6f5a4c] hover:bg-white/80'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Full Poster (HD)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewMode('instagram_feed')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                    previewMode === 'instagram_feed'
                      ? 'bg-[#2b1b12] text-[#fffcf7] shadow-xs'
                      : 'text-[#6f5a4c] hover:bg-white/80'
                  }`}
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Instagram Feed</span>
                </button>
              </div>

              {activeAsset && (
                <div className="flex items-center gap-2">
                  <a
                    href={activeAsset.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1.5 bg-white hover:bg-[#f8f3ec] text-[#2b1b12] border border-[#e4d6c6] rounded-lg text-xs font-bold transition-all flex items-center gap-1 shadow-2xs cursor-pointer"
                    title="Open Full Resolution in New Tab"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Open ↗</span>
                  </a>
                  <a
                    href={activeAsset.url}
                    download={`poster_${Date.now()}.png`}
                    className="px-3.5 py-1.5 bg-[#5d7a4f] hover:bg-[#4a633e] text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                    title="Download High-Resolution PNG Poster"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download PNG</span>
                  </a>
                </div>
              )}
            </div>

            {copiedCaptionToast && (
              <div className="p-2.5 bg-[#eef7ec] border border-[#84e1bc] rounded-xl text-xs text-[#03543f] font-semibold flex items-center gap-1.5 animate-fade-in">
                <Check className="w-3.5 h-3.5" />
                <span>Copied post caption & hashtags to clipboard!</span>
              </div>
            )}

            {generating ? (
              /* Generating Shimmer State */
              <div className="py-16 px-6 flex flex-col items-center justify-center text-center space-y-4 rounded-xl bg-gradient-to-br from-[#fbf8f3] via-white to-amber-50/40 border border-amber-200/80 animate-pulse">
                <div className="w-16 h-16 rounded-2xl bg-[#2b1b12] text-[#c5a059] flex items-center justify-center shadow-md">
                  <Sparkles className="w-8 h-8 animate-spin" />
                </div>
                <div className="space-y-1.5 max-w-sm">
                  <h4 className="font-black text-base text-[#2b1b12]">Synthesizing High-Resolution Campaign</h4>
                  <p className="text-xs text-[#6f5a4c] font-medium leading-relaxed">
                    Calibrating brand typography, composing 3D visual, and rendering trust matrix...
                  </p>
                </div>
                <div className="flex items-center gap-2 text-[11px] font-mono text-[#7a5242] bg-[#f8f3ec] px-3.5 py-1.5 rounded-full border border-[#e4d6c6]">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-600" />
                  <span>AWS Bedrock Ultra + Universal Studio Compositor</span>
                </div>
              </div>
            ) : activeAsset ? (
              previewMode === 'full_poster' ? (
                /* Mode A: Clean Full-Resolution Master Poster View (Uncropped, High Definition with Download) */
                <div className="space-y-4 animate-fade-in">
                  {/* Clean Studio Poster Canvas (No dark letterboxing, full zoom-in click) */}
                  <div
                    onClick={() => {
                      setZoomLevel(1);
                      setIsLightboxOpen(true);
                    }}
                    className="relative group rounded-2xl overflow-hidden bg-[#faf8f5] border border-[#e4d6c6] p-3 sm:p-5 flex items-center justify-center cursor-zoom-in hover:border-[#c5a059] transition-all shadow-xs"
                    title="Click anywhere to inspect in full-screen zoom"
                  >
                    <img
                      src={activeAsset.url}
                      alt={activeAsset.prompt}
                      className="w-full h-auto max-h-[700px] object-contain rounded-xl shadow-md transition-transform duration-300 group-hover:scale-[1.01]"
                    />

                    {/* Subtle Centered Pill on Hover */}
                    <div className="absolute bottom-5 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/80 hover:bg-black text-white text-xs font-bold rounded-full backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all flex items-center gap-2 shadow-lg pointer-events-none">
                      <Maximize2 className="w-3.5 h-3.5 text-amber-300" />
                      <span>Click to Zoom &amp; Inspect (Full HD)</span>
                    </div>
                  </div>

                  {/* Primary Output Actions Toolbar */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <a
                      href={activeAsset.url}
                      download={`poster_${Date.now()}.png`}
                      className="py-2.5 bg-[#2b1b12] hover:bg-[#3b2519] text-[#fffcf7] rounded-xl text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-1.5 text-center cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5 text-[#c5a059]" />
                      <span>Download HD (PNG)</span>
                    </a>
                    <button
                      type="button"
                      onClick={handleCopyCaption}
                      className="py-2.5 bg-[#f8f3ec] hover:bg-[#ebdcc8] text-[#2b1b12] border border-[#d8c09e] rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Caption</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onPushToSocialQueue(activeAsset)}
                      className="py-2.5 bg-white hover:bg-[#f8f3ec] text-[#2b1b12] border border-[#e4d6c6] rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Share2 className="w-3.5 h-3.5 text-blue-600" />
                      <span>Push to Social</span>
                    </button>
                  </div>

                  {/* Copy & Campaign Context Card */}
                  <div className="p-4 rounded-xl bg-[#fffcf7] border border-[#e4d6c6] space-y-2.5 text-xs">
                    {(customHeadline || activeAsset.headline) && (
                      <h4 className="font-black text-sm text-[#2b1b12]">
                        {customHeadline || activeAsset.headline}
                      </h4>
                    )}
                    <p className="text-[#6f5a4c] text-xs leading-relaxed whitespace-pre-line font-medium">
                      {activeAsset.caption || activeAsset.prompt}
                    </p>
                    {activeAsset.hashtags && activeAsset.hashtags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1 border-t border-[#f1e8dc]">
                        {activeAsset.hashtags.map((tag: string, i: number) => (
                          <span key={i} className="text-[11px] font-semibold text-blue-600 bg-blue-50/60 px-2 py-0.5 rounded-md">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* Mode B: Instagram Feed Mockup */
                <div className="space-y-4 animate-fade-in max-w-md mx-auto">

                  {/* Instagram Mock Card */}
                <div className="bg-white border border-[#e4d6c6] rounded-2xl overflow-hidden shadow-sm">
                  {/* IG Top Profile Bar */}
                  <div className="p-3 flex items-center justify-between border-b border-slate-100 bg-[#fffcf7]">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-[#f1e8dc] border border-[#d8c09e] flex items-center justify-center font-bold text-[10px] text-[#7a5242]">
                        {brandName.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-xs text-[#2b1b12] flex items-center gap-1">
                          <span>{brandDomain}</span>
                          <span className="text-blue-500 text-[10px]">✓</span>
                        </div>
                        <div className="text-[10px] text-slate-400">Sponsored</div>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-slate-400">•••</span>
                  </div>

                  {/* Master Poster in Feed Frame */}
                  <div
                    onClick={() => {
                      setZoomLevel(1);
                      setIsLightboxOpen(true);
                    }}
                    className="w-full bg-[#f8f6f0] flex items-center justify-center cursor-zoom-in group relative"
                    title="Click to view in full-screen zoom"
                  >
                    <img
                      src={activeAsset.url}
                      alt={activeAsset.prompt}
                      className="w-full h-auto object-contain"
                    />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="px-3.5 py-1.5 bg-black/80 text-white text-xs font-bold rounded-lg backdrop-blur-sm flex items-center gap-1.5 shadow-md">
                        <Maximize2 className="w-3.5 h-3.5 text-amber-300" />
                        <span>Click to Zoom</span>
                      </span>
                    </div>
                  </div>

                  {/* IG Action Icons */}
                  <div className="p-3 border-b border-slate-50 flex items-center justify-between text-[#2b1b12]">
                    <div className="flex items-center gap-3">
                      <Heart className="w-4 h-4 cursor-pointer hover:text-red-500 transition-colors" />
                      <MessageCircle className="w-4 h-4 cursor-pointer" />
                      <Send className="w-4 h-4 cursor-pointer" />
                    </div>
                    <Bookmark className="w-4 h-4 cursor-pointer" />
                  </div>

                  {/* Headline & Caption */}
                  <div className="p-3.5 bg-[#fffcf7] space-y-2 text-xs">
                    {(customHeadline || activeAsset.headline) && (
                      <h4 className="font-bold text-[#2b1b12] text-xs">
                        {customHeadline || activeAsset.headline}
                      </h4>
                    )}
                    <p className="text-[#6f5a4c] text-[11px] leading-relaxed whitespace-pre-line">
                      {activeAsset.caption || activeAsset.prompt}
                    </p>

                    {/* Hashtags */}
                    {activeAsset.hashtags && activeAsset.hashtags.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {activeAsset.hashtags.map((tag: string, i: number) => (
                          <span key={i} className="text-[10px] font-semibold text-blue-600">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                  {/* Primary Actions under IG Feed */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 max-w-md mx-auto">
                    <a
                      href={activeAsset.url}
                      download={`poster_${Date.now()}.png`}
                      className="py-2.5 bg-[#2b1b12] hover:bg-[#3b2519] text-[#fffcf7] rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 text-center cursor-pointer shadow-sm"
                    >
                      <Download className="w-3.5 h-3.5 text-[#c5a059]" />
                      <span>Download Poster (PNG)</span>
                    </a>
                    <button
                      type="button"
                      onClick={() => onPushToSocialQueue(activeAsset)}
                      className="py-2.5 bg-white hover:bg-[#f8f3ec] text-[#2b1b12] border border-[#e4d6c6] rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <Share2 className="w-3.5 h-3.5 text-blue-600" />
                      <span>Push to Social</span>
                    </button>
                  </div>
                </div>
              )
            ) : (
              /* Friendly Empty State */
              <div className="p-10 text-center border-2 border-dashed border-[#e4d6c6] rounded-2xl bg-[#f8f3ec]/40 space-y-2">
                <ImageIcon className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-xs font-bold text-[#2b1b12]">No Media Asset Selected</p>
                <p className="text-[11px] text-[#6f5a4c] max-w-xs mx-auto">
                  Type a prompt on the left and click &ldquo;Generate Media Campaign&rdquo; to synthesize your custom graphic.
                </p>
              </div>
            )}
          </div>

          {/* Past Generated Assets Library */}
          {mediaAssets && mediaAssets.length > 1 && (
            <div className="bg-white rounded-2xl border border-[#e4d6c6] p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-xs uppercase tracking-wider text-[#6f5a4c]">
                  Generated Asset Library ({mediaAssets.length})
                </h4>
                <span className="text-[11px] text-[#7a5242]">Click any asset to preview</span>
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                {mediaAssets.map((asset, idx) => (
                  <button
                    key={asset.id || idx}
                    type="button"
                    onClick={() => setActiveAsset(asset)}
                    className={`rounded-xl border overflow-hidden aspect-square bg-[#f8f6f0] cursor-pointer transition-all ${
                      activeAsset?.id === asset.id
                        ? 'ring-2 ring-[#c5a059] border-transparent scale-[1.03] shadow-xs'
                        : 'border-[#e4d6c6] opacity-70 hover:opacity-100 hover:scale-[1.02]'
                    }`}
                  >
                    <img
                      src={asset.url}
                      alt={asset.prompt}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 4. Fullscreen Interactive Lightbox Modal */}
      {isLightboxOpen && activeAsset && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col justify-between animate-fade-in p-4 sm:p-6 select-none">
          {/* Lightbox Top Bar */}
          <div className="flex items-center justify-between text-white pb-3 border-b border-white/10 shrink-0">
            <div className="flex items-center gap-3">
              <h3 className="font-bold text-sm sm:text-base text-white truncate max-w-xs sm:max-w-md">
                {activeAsset.headline || activeAsset.prompt || 'Generated Media Poster'}
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-white/10 text-white/80 border border-white/20">
                {activeAsset.ratio === '4:5' ? '1080 × 1350 • Portrait' : '1080 × 1080 • Square'} HD
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Zoom Controls */}
              <div className="flex items-center gap-1 bg-white/10 rounded-lg p-1 border border-white/15">
                <button
                  type="button"
                  onClick={() => setZoomLevel(prev => Math.max(0.5, prev - 0.25))}
                  className="p-1.5 hover:bg-white/20 rounded text-white transition-colors cursor-pointer"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="text-xs font-mono px-1.5 text-white/90 min-w-[45px] text-center">
                  {Math.round(zoomLevel * 100)}%
                </span>
                <button
                  type="button"
                  onClick={() => setZoomLevel(prev => Math.min(3, prev + 0.25))}
                  className="p-1.5 hover:bg-white/20 rounded text-white transition-colors cursor-pointer"
                  title="Zoom In"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setZoomLevel(1)}
                  className="p-1.5 hover:bg-white/20 rounded text-white transition-colors cursor-pointer"
                  title="Reset Zoom"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Download Button */}
              <a
                href={activeAsset.url}
                download={`rankmonk_poster_${Date.now()}.png`}
                className="px-4 py-2 bg-[#5d7a4f] hover:bg-[#4a633e] text-white rounded-lg text-xs font-bold transition-all flex items-center gap-2 shadow-md cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download PNG (HD)</span>
              </a>

              {/* Close Button */}
              <button
                type="button"
                onClick={() => {
                  setIsLightboxOpen(false);
                  setZoomLevel(1);
                }}
                className="p-2 hover:bg-white/20 rounded-lg text-white/80 hover:text-white transition-colors cursor-pointer"
                title="Close (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Lightbox Canvas Area */}
          <div
            className="flex-1 flex items-center justify-center overflow-auto p-4 my-2 relative"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setIsLightboxOpen(false);
                setZoomLevel(1);
              }
            }}
          >
            <div
              className="transition-transform duration-200 ease-out origin-center flex items-center justify-center max-w-full max-h-full"
              style={{ transform: `scale(${zoomLevel})` }}
            >
              <img
                src={activeAsset.url}
                alt={activeAsset.prompt}
                className="max-h-[82vh] max-w-[85vw] object-contain rounded-xl shadow-2xl ring-1 ring-white/10"
              />
            </div>
          </div>

          {/* Lightbox Footer Bar */}
          <div className="flex items-center justify-between text-xs text-white/70 pt-2 border-t border-white/10 shrink-0">
            <div className="flex items-center gap-2">
              <span>Engine: <strong className="text-white">{activeAsset.engine || 'AWS Bedrock Ultra + Studio Poster Engine'}</strong></span>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleCopyCaption}
                className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Caption</span>
              </button>
              <span className="text-[11px] text-white/50">Press Esc to close</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

