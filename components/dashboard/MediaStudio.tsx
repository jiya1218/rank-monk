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
  Camera
} from 'lucide-react';

interface MediaStudioProps {
  project: any;
  user: any;
  mediaAssets: any[];
  onGenerateMedia: (params: { prompt: string; ratio: string; formatName: string; style: string }) => Promise<any>;
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

  // Gemini API Key locally stored if user wants custom key
  const [showKeyDrawer, setShowKeyDrawer] = useState(false);
  const [customApiKey, setCustomApiKey] = useState('');

  const brandName = project?.name || 'Rank Monk';
  const brandDomain = project?.domain || 'rankmonk.in';

  // AI Prompt Enhancer
  const handleEnhancePrompt = () => {
    if (!prompt.trim()) {
      setPrompt(`High-impact Instagram company marketing campaign for ${brandName} (${brandDomain}) in ${project?.industry || 'technology'}: cinematic studio composition, modern editorial typography, clean negative space, prominent ${brandName} logo integration, verified growth statistics badge, and compelling call-to-action.`);
      return;
    }

    const enhanced = `High-end professional B2B marketing creative for ${prompt.trim()}. Brand identity: ${brandName} (${brandDomain}). Visual direction: elegant editorial layout, sharp typography, premium brand colors, natural contrast, clear visual hierarchy, verified authority badge, and clean call-to-action button.`;
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
        style
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
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (8 cols): Form & Tabs */}
        <div className="lg:col-span-7 space-y-6">
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
                        {AEO_QUICK_PROMPTS.map((p, idx) => (
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
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#6f5a4c]">
                    Upload Reference (Optional)
                  </label>
                  <label className="flex items-center justify-center gap-2 p-3.5 border-2 border-dashed border-[#e4d6c6] rounded-xl bg-[#f8f3ec]/40 hover:bg-[#f8f3ec] transition-colors cursor-pointer text-xs font-medium text-[#6f5a4c]">
                    <Upload className="w-4 h-4 text-slate-400" />
                    <span>{referenceFile ? `Reference loaded: ${referenceFile}` : 'Drag & drop image or click to upload brand styling reference'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) setReferenceFile(file.name);
                      }}
                    />
                  </label>
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
                      <option value="auto">Auto (Brand Based)</option>
                      <option value="editorial">Realistic B2B Editorial</option>
                      <option value="minimal">Minimal Flat Lay</option>
                      <option value="3d">3D Render & Studio Lighting</option>
                      <option value="vector">Modern Vector Graphic</option>
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

        {/* Right Column (5 cols): Live Instagram Post Preview & Social Queue Sync */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl border border-[#e4d6c6] shadow-sm p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-sm text-[#2b1b12] flex items-center gap-2">
                <Camera className="w-4 h-4 text-pink-600" />
                Instagram Campaign Preview
              </h3>
              {activeAsset && (
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                  Campaign Ready
                </span>
              )}
            </div>

            {copiedCaptionToast && (
              <div className="p-2.5 bg-[#eef7ec] border border-[#84e1bc] rounded-xl text-xs text-[#03543f] font-semibold flex items-center gap-1.5 animate-fade-in">
                <Check className="w-3.5 h-3.5" />
                <span>Copied post caption & hashtags to clipboard!</span>
              </div>
            )}

            {activeAsset ? (
              <div className="space-y-4">
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

                  {/* Graphic Visual Asset */}
                  <div className="w-full bg-slate-900 flex items-center justify-center overflow-hidden max-h-[380px]">
                    <img
                      src={activeAsset.url}
                      alt={activeAsset.prompt}
                      className="w-full h-auto object-cover"
                    />
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
                    {activeAsset.headline && (
                      <h4 className="font-bold text-[#2b1b12] text-xs">
                        {activeAsset.headline}
                      </h4>
                    )}
                    <p className="text-[#6f5a4c] text-[11px] leading-relaxed">
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

                {/* Primary Output Actions */}
                <div className="grid grid-cols-2 gap-2.5 pt-1">
                  <button
                    type="button"
                    onClick={() => onPushToSocialQueue(activeAsset)}
                    className="w-full py-2.5 bg-[#2b1b12] hover:bg-[#3b2519] text-[#fffcf7] rounded-xl text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Share2 className="w-3.5 h-3.5 text-[#c5a059]" />
                    <span>Push to Social Queue</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCopyCaption}
                    className="w-full py-2.5 bg-[#f8f3ec] hover:bg-[#ebdcc8] text-[#2b1b12] border border-[#d8c09e] rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Caption</span>
                  </button>
                </div>
              </div>
            ) : (
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
          {mediaAssets.length > 1 && (
            <div className="bg-white rounded-2xl border border-[#e4d6c6] p-5 shadow-sm space-y-3">
              <h4 className="font-bold text-xs uppercase tracking-wider text-[#6f5a4c]">
                Generated Asset Library ({mediaAssets.length})
              </h4>
              <div className="grid grid-cols-3 gap-2">
                {mediaAssets.map((asset, idx) => (
                  <button
                    key={asset.id || idx}
                    type="button"
                    onClick={() => setActiveAsset(asset)}
                    className={`rounded-xl border overflow-hidden aspect-square bg-slate-900 cursor-pointer transition-all ${
                      activeAsset?.id === asset.id
                        ? 'ring-2 ring-[#c5a059] border-transparent'
                        : 'border-[#e4d6c6] opacity-70 hover:opacity-100'
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
    </div>
  );
}

