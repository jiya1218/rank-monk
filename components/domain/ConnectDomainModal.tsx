'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';

interface ConnectDomainModalProps {
  isOpen: boolean;
  onClose?: () => void;
  onSuccess?: (project: any) => void;
}

export function ConnectDomainModal({ isOpen, onClose, onSuccess }: ConnectDomainModalProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [domainInput, setDomainInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [stepText, setStepText] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = domainInput.trim().toLowerCase().replace(/^https?:\/\//i, '').replace(/^www\./i, '').split('/')[0];
    if (!clean || !clean.includes('.')) {
      setError('Please enter a valid website domain (e.g. yourcompany.com)');
      return;
    }

    setLoading(true);
    setError('');

    try {
      setStepText(`Connecting to https://${clean}...`);
      await new Promise(r => setTimeout(r, 600));

      setStepText('Extracting official logo, favicon, and brand metadata...');
      await new Promise(r => setTimeout(r, 700));

      setStepText('Analyzing visual identity, color scheme, and typography...');
      
      const res = await fetch('/api/brand/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: clean })
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to extract website branding.');
      }

      setStepText('Benchmarking competitors & calibrating AEO citation readiness...');
      await new Promise(r => setTimeout(r, 600));

      const brand = json.data;

      // Create active project workspace
      const activeProject = {
        id: `proj_${clean.replace(/[^a-z0-9]/g, '_')}`,
        name: brand.name,
        domain: brand.domain,
        website: brand.website,
        industry: brand.industry,
        businessCategory: brand.businessCategory,
        targetAudience: brand.targetAudience,
        summary: brand.summary,
        logoUrl: brand.logoUrl,
        faviconUrl: brand.faviconUrl,
        palette: brand.palette,
        competitors: brand.competitors,
        aeoScore: brand.aeoScore,
        seoScore: brand.seoScore,
        voiceSliders: brand.voiceSliders,
        voiceTags: brand.voiceTags,
        crawledPages: brand.crawledPages,
        articles: brand.articles,
        mediaAssets: [
          {
            id: `media_${Date.now()}`,
            prompt: `${brand.name} Brand Command Center and Performance Analytics`,
            url: brand.logoUrl || '/assets/rank-monk-logo-horizontal.png',
            ratio: '16:9',
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
          }
        ]
      };

      // Lock single fixed domain into user session
      try {
        const rawUser = localStorage.getItem('rankmonk_user') || localStorage.getItem('rankmonk_active_user_v3');
        if (rawUser) {
          const u = JSON.parse(rawUser);
          u.domain = clean;
          localStorage.setItem('rankmonk_user', JSON.stringify(u));
          localStorage.setItem('rankmonk_active_user_v3', JSON.stringify(u));
        }
        localStorage.setItem('rankmonk_active_project', JSON.stringify(activeProject));
      } catch (err) {}

      if (onSuccess) {
        onSuccess(activeProject);
      } else if (onClose) {
        onClose();
        router.refresh();
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
      setStepText('');
    }
  };

    return createPortal(
      <div
        onClick={(e) => {
          if (e.target === e.currentTarget && onClose) onClose();
        }}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 999999,
          backgroundColor: 'rgba(43, 27, 18, 0.72)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px'
        }}
      >
        <div style={{ backgroundColor: '#fffcf7', border: '1px solid #e4d6c6', borderRadius: '24px', maxWidth: '520px', width: '100%', padding: '32px', boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.45)', position: 'relative', color: '#2b1b12', margin: 'auto' }}>
          {onClose && (
            <button
              onClick={onClose}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: '#f1e8dc',
                border: '1px solid #e4d6c6',
                color: '#2b1b12',
                fontWeight: 800,
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
              aria-label="Close modal"
            >
              ✕
            </button>
          )}

          <div className="text-center space-y-2 mb-6">
            <div className="w-12 h-12 bg-[#f1e8dc] border border-[#d8c09e] rounded-2xl flex items-center justify-center mx-auto text-[#c5a059] text-xl font-bold">
              ✦
            </div>
            <h3 className="font-editorial text-2xl font-bold text-[#2b1b12]">
              Connect Your Website Domain
            </h3>
            <p className="text-xs text-[#6f5a4c] leading-relaxed">
              Rank Monk locks one fixed domain to your account to conduct deep continuous technical audits, brand identity extraction, and autonomous AI search calibration.
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-[#fdf2f2] border border-[#f8b4b4] rounded-xl text-xs text-[#9b1c1c]">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#2b1b12] uppercase tracking-wider mb-2">
                Website Domain
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-[#6f5a4c] font-medium">
                  https://
                </span>
                <input
                  type="text"
                  value={domainInput}
                  onChange={(e) => setDomainInput(e.target.value)}
                  placeholder="yourcompany.com"
                  required
                  disabled={loading}
                  className="w-full pl-20 pr-4 py-3 bg-[#f8f3ec] border border-[#e4d6c6] rounded-xl text-xs text-[#2b1b12] focus:outline-none focus:border-[#c5a059] placeholder-[#a69282]"
                />
              </div>
              <p className="text-[11px] text-[#6f5a4c] mt-1.5">
                Enter your live root domain. This will be locked as your fixed website workspace.
              </p>
            </div>

            {loading ? (
              <div className="p-4 bg-[#f8f3ec] border border-[#e4d6c6] rounded-2xl text-center space-y-2">
                <div className="w-6 h-6 border-2 border-[#c5a059] border-t-transparent rounded-full animate-spin mx-auto" />
                <div className="text-xs font-bold text-[#2b1b12] animate-pulse">
                  {stepText || 'Analyzing website...'}
                </div>
                <div className="text-[10px] text-[#6f5a4c]">
                  Please wait while we crawl DOM tags, logos, colors and AEO scores.
                </div>
              </div>
            ) : (
              <button
                type="submit"
                className="w-full py-3.5 bg-[#2b1b12] hover:bg-[#3b2519] text-[#fffcf7] rounded-xl text-xs font-bold transition-all shadow-md active:scale-[0.98] cursor-pointer"
              >
                Analyze & Lock Fixed Domain ✦
              </button>
            )}
          </form>
        </div>
      </div>,
      document.body
    );
}
