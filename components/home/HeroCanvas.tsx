'use client';

import React, { useEffect, useRef } from 'react';

export function HeroCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const heroSection = canvas.parentElement;
    if (!heroSection) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let animationId: number;
    let particles: any[] = [];
    const palette = ['#CBAD8D', '#A48374', '#D1C7BD', '#EBE3DB'];

    const mouse = {
      x: -9999,
      y: -9999,
      active: false,
      radius: 140
    };

    function resize() {
      if (!canvas || !heroSection || !ctx) return;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = heroSection.offsetWidth;
      height = heroSection.offsetHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function createParticles() {
      particles = [];
      const count = width > 768 ? Math.min(50, Math.floor(width / 24)) : 22;
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.45,
          vy: -0.15 - Math.random() * 0.35,
          radius: Math.random() * 1.8 + 1.2,
          baseAlpha: Math.random() * 0.4 + 0.3,
          alpha: 0.4,
          pulseOffset: Math.random() * Math.PI * 2,
          pulseSpeed: 0.02 + Math.random() * 0.03,
          color: palette[Math.floor(Math.random() * palette.length)]
        });
      }
    }

    const handleMouseMove = (e: MouseEvent) => {
      const rect = heroSection.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      mouse.active = true;
    };

    const handleMouseLeave = () => {
      mouse.active = false;
      mouse.x = -9999;
      mouse.y = -9999;
    };

    heroSection.addEventListener('mousemove', handleMouseMove);
    heroSection.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('resize', () => {
      resize();
      createParticles();
    });

    resize();
    createParticles();

    let t = 0;
    function render() {
      if (!ctx) return;
      t += 0.02;
      ctx.clearRect(0, 0, width, height);

      if (mouse.active) {
        const grad = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, mouse.radius);
        grad.addColorStop(0, 'rgba(203, 173, 141, 0.16)');
        grad.addColorStop(0.5, 'rgba(203, 173, 141, 0.05)');
        grad.addColorStop(1, 'rgba(203, 173, 141, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, mouse.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        p.x += p.vx + Math.sin(t + p.pulseOffset) * 0.2;
        p.y += p.vy;

        if (mouse.active) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const dist = Math.hypot(dx, dy);
          if (dist < mouse.radius && dist > 1) {
            const force = (1 - dist / mouse.radius) * 1.6;
            p.x += (dx / dist) * force;
            p.y += (dy / dist) * force;
          }
        }

        if (p.x < -20) p.x = width + 20;
        if (p.x > width + 20) p.x = -20;
        if (p.y < -20) p.y = height + 20;
        if (p.y > height + 20) p.y = -20;

        p.alpha = Math.max(0.15, Math.min(0.85, p.baseAlpha + Math.sin(t * 1.5 + p.pulseOffset) * 0.2));

        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.fill();
        ctx.restore();

        if (mouse.active) {
          const dMouse = Math.hypot(p.x - mouse.x, p.y - mouse.y);
          if (dMouse < 110) {
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.strokeStyle = '#CBAD8D';
            ctx.globalAlpha = (1 - dMouse / 110) * 0.28;
            ctx.lineWidth = 0.9;
            ctx.stroke();
            ctx.restore();
          }
        }

        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.hypot(dx, dy);
          const maxDist = width > 768 ? 120 : 90;

          if (dist < maxDist) {
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = '#CBAD8D';
            ctx.globalAlpha = (1 - dist / maxDist) * 0.22;
            ctx.lineWidth = 0.8;
            ctx.stroke();
            ctx.restore();
          }
        }
      }

      animationId = requestAnimationFrame(render);
    }

    render();

    return () => {
      cancelAnimationFrame(animationId);
      heroSection.removeEventListener('mousemove', handleMouseMove);
      heroSection.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="hero-interactive-canvas"
      id="heroCanvas"
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 1
      }}
    />
  );
}

