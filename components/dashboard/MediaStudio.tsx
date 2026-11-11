'use client';

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Share2,
  Copy,
  Download,
  Check,
  Upload,
  ArrowRight,
  Loader2,
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
  X,
  Layers,
  Image as ImageIcon,
  CheckCircle2,
  Palette,
  Sliders,
  Smartphone
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
  { id: '1:1', name: 'Square', size: '1080 × 1080', platform: 'Instagram / LinkedIn', icon: '■' },
  { id: '4:5', name: 'Portrait', size: '1080 × 1350', platform: 'Feed Spotlight', icon: '▮' },
  { id: '9:16', name: 'Story', size: '1080 × 1920', platform: 'Stories & Reels', icon: '📱' },
  { id: '16:9', name: 'Landscape', size: '1200 × 675', platform: 'Blog & Twitter/X', icon: '▬' }
];

const DEFAULT_DEMO_ASSETS = [
  {
    id: 'officex_services_poster_sq',
    url: '/generated-media/officex_services_poster.png',
    rawImageUrl: '/generated-media/diwali_masterpiece_ultra.jpg',
    headline: 'Intelligent Space & Facility Operations',
    subheadline: 'The enterprise operating system to streamline commercial leases, automate maintenance, and maximize workspace utilization.',
    badge: 'ENTERPRISE CRE & FM PLATFORM',
    cta: 'Explore OfficeX Solutions ↗',
    caption: '🏢 Transforming modern commercial spaces and facility operations. Explore how OfficeX empowers enterprise operators to streamline leases, automate maintenance, and maximize workspace utilization.\n\n✓ Space Management: Dynamic desk allocation & heatmaps\n✓ Facility Operations: Predictive IoT maintenance & dispatch\n✓ Lease Administration: End-to-end tenant contracts & billing\n✓ Asset & ESG Analytics: Carbon reporting & telemetry\n\nVisit https://officex.pro to schedule a platform walk-through.',
    hashtags: ['#OfficeX', '#CommercialRealEstate', '#FacilityManagement', '#PropTech', '#EnterpriseSaaS'],
    ratio: '1:1',
    format: 'Square',
    postStyle: 'services_showcase',
    engine: 'Rank Monk Enterprise Bento Poster Engine',
    created_at: new Date().toISOString()
  },
  {
    id: 'officex_services_poster_story',
    url: '/generated-media/officex_services_poster_story.png',
    rawImageUrl: '/generated-media/diwali_story_masterpiece_ultra.jpg',
    headline: 'Intelligent Space & Facility Operations',
    subheadline: 'The enterprise operating system to streamline commercial leases, automate maintenance workflows, and optimize workspace density.',
    badge: 'ENTERPRISE CRE & FM PLATFORM',
    cta: 'Explore OfficeX Solutions ↗',
    caption: '🏢 Mobile Story Creative: Streamline your enterprise facilities and lease contracts seamlessly with OfficeX. Tap link in bio to learn more! 🚀',
    hashtags: ['#OfficeX', '#StoryCreative', '#CommercialRealEstate', '#PropTech'],
    ratio: '9:16',
    format: 'Story',
    postStyle: 'services_showcase',
    engine: 'Rank Monk Enterprise Bento Poster Engine (Vertical Story)',
    created_at: new Date().toISOString()
  },
  {
    id: 'diwali_festive_poster_sq',
    url: '/generated-media/diwali_festive_poster_square.png',
    rawImageUrl: '/generated-media/diwali_masterpiece_ultra.jpg',
    headline: 'Happy Diwali Warmest Wishes',
    subheadline: 'May the divine lights of Diwali illuminate your journey with boundless prosperity, peace, and enduring success. Warm festive greetings from OfficeX.',
    badge: 'SHUBH DEEPAVALI',
    cta: 'Warm Wishes from OfficeX ✦',
    caption: '🪔 Wishing you and your loved ones a joyous and prosperous Diwali! May this festival of lights illuminate new opportunities and endless growth. ✨\n\nWarm wishes from the OfficeX team.',
    hashtags: ['#HappyDiwali', '#FestivalOfLights', '#DiwaliCelebration', '#OfficeX', '#CommercialRealEstate'],
    ratio: '1:1',
    format: 'Square',
    postStyle: 'festive_greeting',
    engine: 'AWS Bedrock Stability Ultra 8K + Luxury Festive Poster',
    created_at: new Date().toISOString()
  },
  {
    id: 'diwali_festive_poster_story',
    url: '/generated-media/diwali_festive_poster_story.png',
    rawImageUrl: '/generated-media/diwali_story_masterpiece_ultra.jpg',
    headline: 'Happy Diwali Warmest Wishes',
    subheadline: 'May the divine lights of Diwali illuminate your journey with boundless prosperity, peace, and enduring success. Warm festive greetings from OfficeX.',
    badge: 'FESTIVAL OF LIGHTS',
    cta: 'Warm Wishes from OfficeX ✦',
    caption: '✨ A sparkling Diwali from the OfficeX family! Celebrating modern workspaces, shared prosperity, and luminous journeys ahead. 🪔',
    hashtags: ['#HappyDiwali', '#StoryCreative', '#OfficeX', '#FestivalOfLights'],
    ratio: '9:16',
    format: 'Story',
    postStyle: 'festive_greeting',
    engine: 'AWS Bedrock Stability Ultra 8K + Luxury Festive Story Poster',
    created_at: new Date().toISOString()
  }
];

export function MediaStudio({
  project,
  user,
  mediaAssets,
  onGenerateMedia,
  onPushToSocialQueue
}: MediaStudioProps) {
  const brandName = project?.name || 'OfficeX';
  const brandDomain = project?.domain || 'officex.pro';
  const industry = project?.industry || 'Commercial Real Estate & Facility Management SaaS';

  const [prompt, setPrompt] = useState('i need post for marketing of my services that i provide in officex');
  const [activeFormat, setActiveFormat] = useState('1:1');
  const [generating, setGenerating] = useState(false);
  const [activeAsset, setActiveAsset] = useState<any>(
    mediaAssets && mediaAssets.length > 0 ? mediaAssets[0] : DEFAULT_DEMO_ASSETS[0]
  );
  const [copiedCaptionToast, setCopiedCaptionToast] = useState(false);
  const [referenceFile, setReferenceFile] = useState<string | null>(null);
  const [referenceImage, setReferenceImage] = useState<string | null>(null);

  // Preview & View Options
  const [previewMode, setPreviewMode] = useState<'canvas' | 'mobile_feed'>('canvas');
  const [viewSource, setViewSource] = useState<'poster' | 'raw'>('poster');
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);

  // Sync activeAsset if mediaAssets updates
  useEffect(() => {
    if (mediaAssets && mediaAssets.length > 0) {
      setActiveAsset(mediaAssets[0]);
    } else if (!activeAsset) {
      setActiveAsset(DEFAULT_DEMO_ASSETS[0]);
    }
  }, [mediaAssets]);

  useEffect(() => {
    if (activeAsset) {
      if (activeAsset.postStyle === 'pure_image' || !activeAsset.url) {
        setViewSource('raw');
      } else {
        setViewSource('poster');
      }
    }
  }, [activeAsset]);

  // Escape key handler for fullscreen lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isLightboxOpen) {
        setIsLightboxOpen(false);
        setZoomLevel(1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen]);

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

  // AI Prompt Enhancer
  const handleEnhancePrompt = () => {
    if (!prompt.trim()) {
      setPrompt(`High-impact commercial marketing campaign for ${brandName} (${brandDomain}): cinematic luxury visual, rich golden ambiance, warm depth of field, sharp 8k resolution, award-winning advertising composition.`);
      return;
    }
    const enhanced = `${prompt.trim()}. Brand identity: ${brandName} (${brandDomain}). Creative aesthetic: cinematic luxury commercial photography, warm ambient lighting, razor-sharp 8k resolution, award-winning editorial composition, no text overlays, no watermarks.`;
    setPrompt(enhanced);
  };

  // Generate Media Submission - AI automatically understands everything directly from prompt
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setGenerating(true);
    try {
      const selectedFormatObj = FORMATS.find(f => f.id === activeFormat) || FORMATS[0];
      const newAsset = await onGenerateMedia({
        prompt,
        ratio: activeFormat,
        formatName: selectedFormatObj.name,
        style: 'auto',
        referenceImage: referenceImage || undefined
      });
      if (newAsset) {
        setActiveAsset(newAsset);
        setViewSource(newAsset.postStyle === 'pure_image' ? 'raw' : 'poster');
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

  const currentDisplayUrl = (viewSource === 'raw' && activeAsset?.rawImageUrl)
    ? activeAsset.rawImageUrl
    : (activeAsset?.url || activeAsset?.rawImageUrl || '');

  return (
    <div className="space-y-6 animate-fade-in max-w-[1600px] mx-auto pb-12">
      {/* 1. Header Bar: Studio Title + Brand Status */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-[#e4d6c6] shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-black text-[#2b1b12] tracking-tight">
              Media Studio
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-black uppercase tracking-wider border border-emerald-200">
              PRO STUDIO
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#6f5a4c] font-medium mt-1">
            Produce publication-ready festive greetings, commercial brand creatives, and social campaigns.
          </p>
        </div>

        {/* Right Active Brand Info */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#faf7f2] border border-[#e4d6c6]">
            <img
              src={project?.logoUrl || '/assets/rank-monk-logo-horizontal.png'}
              alt={brandName}
              className="h-4 w-auto object-contain max-w-[60px]"
              onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
            />
            <span className="text-xs font-bold text-[#2b1b12]">https://{brandDomain}</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Brand Context Grounded" />
          </div>

          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 border border-purple-200 text-purple-900 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            <span>FLUX.1 Neural + Bedrock Studio</span>
          </div>
        </div>
      </div>

      {/* 2. Main Dual-Column Layout: Controls (Left 5 Cols) vs Production Canvas (Right 7 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: Generation Controls */}
        <div className="lg:col-span-5 space-y-5">
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-[#e4d6c6] shadow-sm p-5 sm:p-6 space-y-5">
            
            {/* Step 1: Prompt Input */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black uppercase tracking-wider text-[#2b1b12] flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-[#2b1b12] text-white flex items-center justify-center text-[10px]">1</span>
                  <span>Creative Prompt &amp; Goal</span>
                </label>
                <button
                  type="button"
                  onClick={handleEnhancePrompt}
                  className="flex items-center gap-1 text-[11px] font-bold text-[#c5a059] hover:text-[#99732f] transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>✦ Magic Enhance</span>
                </button>
              </div>

              <div className="relative">
                <textarea
                  rows={4}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Enter your prompt (e.g. 'i need post for marketing of my services that i provide in officex' or 'happy diwali festival greeting for officex'). AI will autonomously understand and generate the exact visual and layout."
                  className="w-full rounded-xl border border-[#e4d6c6] bg-[#faf8f5] p-3.5 text-xs text-[#2b1b12] font-medium focus:border-[#2b1b12] focus:bg-white focus:outline-none leading-relaxed transition-all resize-none shadow-2xs"
                />
              </div>
            </div>

            {/* Step 2: Format & Aspect Ratio */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="text-xs font-black uppercase tracking-wider text-[#2b1b12] flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-[#2b1b12] text-white flex items-center justify-center text-[10px]">2</span>
                <span>Aspect Ratio &amp; Canvas</span>
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {FORMATS.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => {
                      setActiveFormat(f.id);
                      if (activeAsset?.id?.startsWith('officex_services_poster')) {
                        if (f.id === '9:16') {
                          setActiveAsset(DEFAULT_DEMO_ASSETS[1]);
                        } else {
                          setActiveAsset(DEFAULT_DEMO_ASSETS[0]);
                        }
                      } else if (activeAsset?.id?.startsWith('diwali_festive_poster')) {
                        if (f.id === '9:16') {
                          setActiveAsset(DEFAULT_DEMO_ASSETS[3]);
                        } else {
                          setActiveAsset(DEFAULT_DEMO_ASSETS[2]);
                        }
                      }
                    }}
                    className={`rounded-xl border p-2.5 text-center transition-all cursor-pointer flex flex-col justify-between ${
                      activeFormat === f.id
                        ? 'border-[#2b1b12] bg-[#2b1b12] text-white shadow-sm ring-1 ring-[#2b1b12]'
                        : 'border-[#e4d6c6] bg-white text-[#4a3528] hover:bg-[#faf7f2]'
                    }`}
                  >
                    <div className="text-sm font-mono mb-1">{f.icon}</div>
                    <p className="text-xs font-bold leading-tight truncate">{f.name}</p>
                    <p className={`text-[10px] mt-0.5 truncate ${activeFormat === f.id ? 'text-amber-200' : 'text-slate-400'}`}>
                      {f.id}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 3: Optional Style Reference File */}
            <div className="pt-2 border-t border-slate-100">
              {referenceImage ? (
                <div className="flex items-center justify-between p-2.5 border border-[#c5a059] rounded-xl bg-[#fffcf7]">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={referenceImage}
                      alt="Style Reference"
                      className="w-8 h-8 rounded-lg object-cover border border-[#e4d6c6] shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[#2b1b12] truncate">{referenceFile}</p>
                      <p className="text-[10px] text-emerald-600 font-semibold">Visual Style Active</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveReference}
                    className="px-2 py-1 text-[11px] font-bold text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                  >
                    ✕ Remove
                  </button>
                </div>
              ) : (
                <label className="flex items-center justify-center gap-2 p-2.5 border border-dashed border-[#e4d6c6] rounded-xl bg-[#faf8f5] hover:bg-[#f3ebe1] transition-colors cursor-pointer text-xs font-semibold text-[#6f5a4c]">
                  <Upload className="w-3.5 h-3.5 text-slate-400" />
                  <span>Attach style reference image (optional)</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </label>
              )}
            </div>

            {/* Primary Submit Button */}
            <button
              type="submit"
              disabled={generating || !prompt.trim()}
              className="w-full py-3.5 bg-[#2b1b12] hover:bg-[#3b2519] text-[#fffcf7] rounded-xl text-xs font-bold tracking-wide uppercase shadow-md transition-all active:scale-[0.99] cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {generating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#c5a059]" />
                  <span>Synthesizing Studio Creative...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-[#c5a059]" />
                  <span>Generate Creative Campaign ✦</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* RIGHT COLUMN: Canvas & Production Suite */}
        <div className="lg:col-span-7 space-y-5">
          <div className="bg-white rounded-2xl border border-[#e4d6c6] shadow-sm p-5 sm:p-6 space-y-4">
            
            {/* Control Bar: FIXED & COHESIVE (Zero clipping or overflowing) */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
              
              {/* Left View Switches */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Mode: Canvas vs Mobile Feed */}
                <div className="flex items-center p-1 bg-[#f8f3ec] rounded-xl border border-[#e4d6c6]">
                  <button
                    type="button"
                    onClick={() => setPreviewMode('canvas')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                      previewMode === 'canvas'
                        ? 'bg-[#2b1b12] text-white shadow-xs'
                        : 'text-[#6f5a4c] hover:bg-white/80'
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Canvas</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewMode('mobile_feed')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                      previewMode === 'mobile_feed'
                        ? 'bg-[#2b1b12] text-white shadow-xs'
                        : 'text-[#6f5a4c] hover:bg-white/80'
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>Mobile Mockup</span>
                  </button>
                </div>

                {/* Source Toggle: Proper Poster View vs Pure AI Visual */}
                {activeAsset && (
                  <div className="flex items-center p-1 bg-[#fffcf7] rounded-xl border border-[#d8c09e]">
                    {activeAsset.url && activeAsset.url !== activeAsset.rawImageUrl ? (
                      <>
                        <button
                          type="button"
                          onClick={() => setViewSource('poster')}
                          className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                            viewSource === 'poster'
                              ? 'bg-[#14b8a6] text-white shadow-2xs'
                              : 'text-[#6f5a4c] hover:bg-[#faf6ee]'
                          }`}
                        >
                          🎨 Proper Poster View
                        </button>
                        <button
                          type="button"
                          onClick={() => setViewSource('raw')}
                          className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                            viewSource === 'raw'
                              ? 'bg-[#2b1b12] text-white shadow-2xs'
                              : 'text-[#6f5a4c] hover:bg-[#faf6ee]'
                          }`}
                        >
                          🖼️ Pure AI Visual
                        </button>
                      </>
                    ) : (
                      <span className="px-3 py-1 text-xs font-bold text-[#2b1b12]">
                        🖼️ Pure AI Masterpiece
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Right Action Icons */}
              {activeAsset && (
                <div className="flex items-center gap-2">
                  <a
                    href={currentDisplayUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1.5 bg-white hover:bg-[#f8f3ec] text-[#2b1b12] border border-[#e4d6c6] rounded-xl text-xs font-bold transition-all flex items-center gap-1 shadow-2xs cursor-pointer"
                    title="Open Full Resolution"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Open</span>
                  </a>
                  <a
                    href={currentDisplayUrl}
                    download={`creative_${Date.now()}.png`}
                    className="px-3.5 py-1.5 bg-[#2b1b12] hover:bg-[#3b2519] text-[#fffcf7] rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                    title="Download High-Resolution PNG"
                  >
                    <Download className="w-3.5 h-3.5 text-[#c5a059]" />
                    <span>Download HD</span>
                  </a>
                </div>
              )}
            </div>

            {copiedCaptionToast && (
              <div className="p-2.5 bg-[#eef7ec] border border-[#84e1bc] rounded-xl text-xs text-[#03543f] font-semibold flex items-center gap-1.5 animate-fade-in">
                <Check className="w-3.5 h-3.5" />
                <span>Copied post caption &amp; hashtags to clipboard!</span>
              </div>
            )}

            {/* Display Body: Generating / Empty / Active Canvas */}
            {generating ? (
              <div className="py-20 px-6 flex flex-col items-center justify-center text-center space-y-4 rounded-xl bg-[#faf7f2] border border-[#e4d6c6] animate-pulse">
                <div className="w-14 h-14 rounded-2xl bg-[#2b1b12] text-[#c5a059] flex items-center justify-center shadow-md">
                  <Sparkles className="w-7 h-7 animate-spin" />
                </div>
                <div className="space-y-1 max-w-sm">
                  <h4 className="font-black text-sm text-[#2b1b12]">Rendering Studio Creative</h4>
                  <p className="text-xs text-[#6f5a4c] font-medium leading-relaxed">
                    Executing neural synthesis, applying brand palette, and generating festival typography...
                  </p>
                </div>
              </div>
            ) : activeAsset ? (
              previewMode === 'canvas' ? (
                /* Mode A: Clean Studio Canvas */
                <div className="space-y-4 animate-fade-in">
                  <div
                    onClick={() => {
                      setZoomLevel(1);
                      setIsLightboxOpen(true);
                    }}
                    className="relative group rounded-2xl overflow-hidden bg-[#faf8f5] border border-[#e4d6c6] p-2 sm:p-4 flex items-center justify-center cursor-zoom-in hover:border-[#c5a059] transition-all shadow-xs"
                    title="Click to view full-screen zoom"
                  >
                    <img
                      src={currentDisplayUrl}
                      alt={activeAsset.prompt}
                      className="w-full h-auto max-h-[620px] object-contain rounded-xl shadow-md transition-transform duration-300 group-hover:scale-[1.01]"
                    />

                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3.5 py-1.5 bg-black/80 hover:bg-black text-white text-xs font-bold rounded-full backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all flex items-center gap-2 shadow-lg pointer-events-none">
                      <Maximize2 className="w-3.5 h-3.5 text-amber-300" />
                      <span>Click to Zoom HD</span>
                    </div>
                  </div>

                  {/* Action Toolbar */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <a
                      href={currentDisplayUrl}
                      download={`rankmonk_${Date.now()}.png`}
                      className="py-2.5 bg-[#2b1b12] hover:bg-[#3b2519] text-[#fffcf7] rounded-xl text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-1.5 text-center cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5 text-[#c5a059]" />
                      <span>Download {viewSource === 'raw' ? 'AI Image' : 'Creative'}</span>
                    </a>
                    <button
                      type="button"
                      onClick={handleCopyCaption}
                      className="py-2.5 bg-[#faf8f5] hover:bg-[#efe4d5] text-[#2b1b12] border border-[#e4d6c6] rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Caption</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onPushToSocialQueue(activeAsset)}
                      className="py-2.5 bg-white hover:bg-[#faf8f5] text-[#2b1b12] border border-[#e4d6c6] rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <Share2 className="w-3.5 h-3.5 text-blue-600" />
                      <span>Push to Social</span>
                    </button>
                  </div>

                  {/* Caption & Post Context */}
                  <div className="p-4 rounded-xl bg-[#fffcf7] border border-[#e4d6c6] space-y-2 text-xs">
                    {activeAsset.headline && (
                      <h4 className="font-black text-sm text-[#2b1b12]">
                        {activeAsset.headline}
                      </h4>
                    )}
                    <p className="text-[#4a3528] text-xs leading-relaxed whitespace-pre-line font-medium">
                      {activeAsset.caption || activeAsset.prompt}
                    </p>
                    {activeAsset.hashtags && activeAsset.hashtags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1 border-t border-[#f1e8dc]">
                        {activeAsset.hashtags.map((tag: string, i: number) => (
                          <span key={i} className="text-[11px] font-semibold text-blue-600 bg-blue-50/70 px-2 py-0.5 rounded-md">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* Mode B: Mobile Feed Mockup */
                <div className="space-y-4 animate-fade-in max-w-sm mx-auto">
                  <div className="bg-white border border-[#e4d6c6] rounded-2xl overflow-hidden shadow-sm">
                    {/* Header */}
                    <div className="p-3 flex items-center justify-between border-b border-slate-100 bg-[#fffcf7]">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-[#2b1b12] text-white flex items-center justify-center font-bold text-[9px]">
                          {brandName.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-xs text-[#2b1b12] flex items-center gap-1">
                            <span>{brandDomain}</span>
                            <span className="text-blue-500 text-[10px]">✓</span>
                          </div>
                        </div>
                      </div>
                      <span className="text-xs text-slate-400 font-bold">•••</span>
                    </div>

                    {/* Image */}
                    <div
                      onClick={() => {
                        setZoomLevel(1);
                        setIsLightboxOpen(true);
                      }}
                      className="w-full bg-[#f8f6f0] flex items-center justify-center cursor-zoom-in group relative"
                    >
                      <img
                        src={currentDisplayUrl}
                        alt={activeAsset.prompt}
                        className="w-full h-auto object-contain"
                      />
                    </div>

                    {/* Actions */}
                    <div className="p-3 border-b border-slate-50 flex items-center justify-between text-[#2b1b12]">
                      <div className="flex items-center gap-3">
                        <Heart className="w-4 h-4 cursor-pointer hover:text-red-500 transition-colors" />
                        <MessageCircle className="w-4 h-4 cursor-pointer" />
                        <Send className="w-4 h-4 cursor-pointer" />
                      </div>
                      <Bookmark className="w-4 h-4 cursor-pointer" />
                    </div>

                    {/* Caption */}
                    <div className="p-3.5 bg-[#fffcf7] space-y-1.5 text-xs">
                      {activeAsset.headline && (
                        <h4 className="font-bold text-[#2b1b12] text-xs">
                          {activeAsset.headline}
                        </h4>
                      )}
                      <p className="text-[#6f5a4c] text-[11px] leading-relaxed whitespace-pre-line">
                        {activeAsset.caption || activeAsset.prompt}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <a
                      href={currentDisplayUrl}
                      download={`rankmonk_${Date.now()}.png`}
                      className="py-2.5 bg-[#2b1b12] text-white rounded-xl text-xs font-bold text-center flex items-center justify-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5 text-[#c5a059]" />
                      <span>Download</span>
                    </a>
                    <button
                      type="button"
                      onClick={() => onPushToSocialQueue(activeAsset)}
                      className="py-2.5 bg-white border border-[#e4d6c6] text-[#2b1b12] rounded-xl text-xs font-bold text-center flex items-center justify-center gap-1.5 shadow-2xs"
                    >
                      <Share2 className="w-3.5 h-3.5 text-blue-600" />
                      <span>Push Social</span>
                    </button>
                  </div>
                </div>
              )
            ) : (
              <div className="p-12 text-center border-2 border-dashed border-[#e4d6c6] rounded-2xl bg-[#faf8f5] space-y-2">
                <ImageIcon className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-xs font-bold text-[#2b1b12]">Ready to Synthesize Your Visual</p>
                <p className="text-[11px] text-[#6f5a4c] max-w-xs mx-auto">
                  Type your prompt on the left and select your style to produce high-resolution branded creative.
                </p>
              </div>
            )}
          </div>

          {/* Past Generated Assets Library */}
          {mediaAssets && mediaAssets.length > 1 && (
            <div className="bg-white rounded-2xl border border-[#e4d6c6] p-4 sm:p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-xs uppercase tracking-wider text-[#6f5a4c]">
                  Asset History ({mediaAssets.length})
                </h4>
                <span className="text-[11px] text-[#7a5242]">Click any asset to preview</span>
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                {mediaAssets.map((asset, idx) => (
                  <button
                    key={asset.id || idx}
                    type="button"
                    onClick={() => {
                      setActiveAsset(asset);
                      setViewSource(asset.postStyle === 'pure_image' ? 'raw' : 'poster');
                    }}
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
        <div className="fixed inset-0 z-50 bg-black/92 backdrop-blur-md flex flex-col justify-between animate-fade-in p-4 sm:p-6 select-none">
          <div className="flex items-center justify-between text-white pb-3 border-b border-white/10 shrink-0">
            <div className="flex items-center gap-3">
              <h3 className="font-bold text-sm sm:text-base text-white truncate max-w-xs sm:max-w-md">
                {activeAsset.headline || activeAsset.prompt || 'Generated Media Creative'}
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-white/10 text-white/80 border border-white/20">
                HD Preview
              </span>
            </div>

            <div className="flex items-center gap-2">
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

              <a
                href={currentDisplayUrl}
                download={`rankmonk_asset_${Date.now()}.png`}
                className="px-4 py-2 bg-[#5d7a4f] hover:bg-[#4a633e] text-white rounded-lg text-xs font-bold transition-all flex items-center gap-2 shadow-md cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download PNG</span>
              </a>

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
                src={currentDisplayUrl}
                alt={activeAsset.prompt}
                className="max-h-[82vh] max-w-[85vw] object-contain rounded-xl shadow-2xl ring-1 ring-white/10"
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-white/70 pt-2 border-t border-white/10 shrink-0">
            <div className="flex items-center gap-2">
              <span>Engine: <strong className="text-white">{activeAsset.engine || 'FLUX.1 Neural + Bedrock Studio'}</strong></span>
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
