'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  X,
  Download,
  Copy,
  Check,
  Maximize2,
  ExternalLink,
  Sun,
  Moon,
  Grid
} from 'lucide-react';

export interface UniversalZoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string | null;
  title?: string;
  subtitle?: string;
  initialCanvasBg?: 'light' | 'dark' | 'grid';
}

export function UniversalZoomModal({
  isOpen,
  onClose,
  imageUrl,
  title = 'Asset Preview & Inspection',
  subtitle,
  initialCanvasBg = 'grid'
}: UniversalZoomModalProps) {
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [canvasBg, setCanvasBg] = useState<'light' | 'dark' | 'grid'>(initialCanvasBg);
  const [copied, setCopied] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Reset state when opening/closing
  useEffect(() => {
    if (isOpen) {
      setZoomLevel(1);
      setPosition({ x: 0, y: 0 });
      setCanvasBg(initialCanvasBg);
    }
  }, [isOpen, initialCanvasBg, imageUrl]);

  // Keyboard navigation (+, -, 0, Esc)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === '+' || e.key === '=') {
        e.preventDefault();
        setZoomLevel(prev => Math.min(5, Number((prev + 0.25).toFixed(2))));
      } else if (e.key === '-' || e.key === '_') {
        e.preventDefault();
        setZoomLevel(prev => Math.max(0.25, Number((prev - 0.25).toFixed(2))));
      } else if (e.key === '0') {
        e.preventDefault();
        setZoomLevel(1);
        setPosition({ x: 0, y: 0 });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Mouse wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.15 : -0.15;
    setZoomLevel(prev => {
      const next = Math.min(5, Math.max(0.25, Number((prev + delta).toFixed(2))));
      return next;
    });
  };

  // Drag pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoomLevel <= 1) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || zoomLevel <= 1) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleCopyLink = () => {
    if (!imageUrl) return;
    navigator.clipboard.writeText(imageUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen || !imageUrl) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-black/85 backdrop-blur-md animate-fade-in text-white select-none"
      onMouseUp={handleMouseUp}
    >
      {/* Top Header Controls Bar */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-white/10 bg-black/40 backdrop-blur-sm shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center shrink-0">
            <Maximize2 className="w-4 h-4 text-[#c5a059]" />
          </div>
          <div className="min-w-0 truncate">
            <h3 className="font-editorial text-sm sm:text-base font-bold text-white truncate">
              {title}
            </h3>
            {subtitle && (
              <p className="text-[11px] text-white/60 truncate font-mono">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Action & Zoom Tools */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Canvas Background Selector */}
          <div className="hidden sm:flex items-center gap-1 bg-white/10 p-1 rounded-xl border border-white/15">
            <button
              type="button"
              onClick={() => setCanvasBg('light')}
              className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                canvasBg === 'light' ? 'bg-white text-slate-950 shadow-xs' : 'text-white/70 hover:text-white'
              }`}
              title="Light background"
            >
              <Sun className="w-3.5 h-3.5" />
              <span className="text-[10px]">Light</span>
            </button>
            <button
              type="button"
              onClick={() => setCanvasBg('dark')}
              className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                canvasBg === 'dark' ? 'bg-slate-900 text-white shadow-xs border border-white/20' : 'text-white/70 hover:text-white'
              }`}
              title="Dark background"
            >
              <Moon className="w-3.5 h-3.5" />
              <span className="text-[10px]">Dark</span>
            </button>
            <button
              type="button"
              onClick={() => setCanvasBg('grid')}
              className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                canvasBg === 'grid' ? 'bg-white text-slate-950 shadow-xs' : 'text-white/70 hover:text-white'
              }`}
              title="Checkerboard grid (transparent inspection)"
            >
              <Grid className="w-3.5 h-3.5" />
              <span className="text-[10px]">Grid</span>
            </button>
          </div>

          {/* Zoom Controls */}
          <div className="flex items-center gap-1 bg-white/10 p-1 rounded-xl border border-white/15 shadow-sm">
            <button
              type="button"
              onClick={() => setZoomLevel(prev => Math.max(0.25, Number((prev - 0.25).toFixed(2))))}
              className="p-1.5 hover:bg-white/20 rounded-lg text-white transition-colors cursor-pointer"
              title="Zoom Out (-)"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => {
                setZoomLevel(1);
                setPosition({ x: 0, y: 0 });
              }}
              className="px-2 py-1 hover:bg-white/20 rounded-lg text-xs font-mono font-bold text-white transition-colors min-w-[50px] text-center cursor-pointer"
              title="Click to reset to 100%"
            >
              {Math.round(zoomLevel * 100)}%
            </button>
            <button
              type="button"
              onClick={() => setZoomLevel(prev => Math.min(5, Number((prev + 0.25).toFixed(2))))}
              className="p-1.5 hover:bg-white/20 rounded-lg text-white transition-colors cursor-pointer"
              title="Zoom In (+)"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => {
                setZoomLevel(1);
                setPosition({ x: 0, y: 0 });
              }}
              className="p-1.5 hover:bg-white/20 rounded-lg text-white/80 hover:text-white transition-colors cursor-pointer"
              title="Reset Zoom & Pan (0)"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Download & Copy */}
          <button
            type="button"
            onClick={handleCopyLink}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold transition-all border border-white/15 cursor-pointer"
            title="Copy Direct Image URL"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy URL'}</span>
          </button>

          <a
            href={imageUrl}
            download={`rankmonk_asset_${Date.now()}.png`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#c5a059] hover:bg-[#b89146] text-[#2b1b12] text-xs font-bold transition-all shadow-sm cursor-pointer"
            title="Download or open original"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Download</span>
          </a>

          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-xl text-white/80 hover:text-white transition-colors cursor-pointer"
            title="Close (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Interactive Zoom Canvas Area */}
      <div
        ref={containerRef}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        className={`flex-1 flex items-center justify-center overflow-hidden relative ${
          zoomLevel > 1 ? (isDragging ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-default'
        } ${
          canvasBg === 'dark'
            ? 'bg-slate-950'
            : canvasBg === 'light'
            ? 'bg-white'
            : 'bg-[repeating-conic-gradient(#334155_0%_25%,#1e293b_0%_50%)] bg-[length:24px_24px]'
        }`}
      >
        <div
          className="transition-transform duration-100 ease-out origin-center flex items-center justify-center p-4 sm:p-8"
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${zoomLevel})`
          }}
        >
          <img
            src={imageUrl}
            alt={title}
            draggable={false}
            className="max-h-[75vh] max-w-[85vw] object-contain drop-shadow-2xl rounded-lg pointer-events-none transition-all"
          />
        </div>

        {/* Floating Quick Hint Badge */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[11px] text-white/70 flex items-center gap-2 pointer-events-none">
          <span>Scroll wheel to zoom</span>
          <span>•</span>
          <span>Click &amp; drag to pan</span>
          <span>•</span>
          <span className="font-mono">{Math.round(zoomLevel * 100)}%</span>
        </div>
      </div>
    </div>
  );
}

