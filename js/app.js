/* ==========================================================================
   RANK MONK - APPLICATION JAVASCRIPT
   Zen Minimalist & Luxury Dark Interactive Engine
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initMobileNav();
  initHeaderScroll();
  initHeroScanner();
  initHeroCanvas();
  initHeroSpotlight();
  initHeroParallax();
  initConsoleAutoplay();
});

/* --------------------------------------------------------------------------
   0. KINETIC CONSTELLATION HERO CANVAS ANIMATION
   -------------------------------------------------------------------------- */
function initHeroCanvas() {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  let width = (canvas.width = canvas.parentElement ? canvas.parentElement.offsetWidth : window.innerWidth);
  let height = (canvas.height = canvas.parentElement ? canvas.parentElement.offsetHeight : 640);

  function onResize() {
    if (!canvas.parentElement) return;
    width = canvas.width = canvas.parentElement.offsetWidth;
    height = canvas.height = canvas.parentElement.offsetHeight;
  }
  window.addEventListener('resize', onResize);

  const count = Math.min(32, Math.floor(width / 38));
  const particles = [];
  const palette = [
    'rgba(203, 173, 141, 0.5)',
    'rgba(185, 139, 106, 0.45)',
    'rgba(164, 131, 116, 0.35)',
    'rgba(216, 192, 158, 0.4)'
  ];

  for (let i = 0; i < count; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      radius: Math.random() * 2 + 1,
      color: palette[Math.floor(Math.random() * palette.length)]
    });
  }

  function frame() {
    ctx.clearRect(0, 0, width, height);

    // Subtle connecting lines
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < 115) {
          const alpha = (1 - d / 115) * 0.16;
          ctx.strokeStyle = `rgba(185, 139, 106, ${alpha})`;
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }

    // Nodes
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0) p.x = width;
      if (p.x > width) p.x = 0;
      if (p.y < 0) p.y = height;
      if (p.y > height) p.y = 0;

      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
    }

    requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
}

/* --------------------------------------------------------------------------
   1. MOBILE NAVIGATION DRAWER & APP MENU
   -------------------------------------------------------------------------- */
function initMobileNav() {
  const toggleBtn = document.getElementById('mobileNavToggle');
  const sheet = document.getElementById('mobileNavSheet');
  const closeBtn = document.getElementById('mobileSheetClose');
  if (!sheet) return;

  function closeSheet() {
    sheet.classList.remove('open');
    if (toggleBtn) toggleBtn.classList.remove('active');
    document.body.style.overflow = '';
  }

  function openSheet() {
    sheet.classList.add('open');
    if (toggleBtn) toggleBtn.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      const isOpen = sheet.classList.contains('open');
      if (isOpen) {
        closeSheet();
      } else {
        openSheet();
      }
    });
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', closeSheet);
  }

  // Close when tapping any link inside mobile sheet
  const links = sheet.querySelectorAll('.mobile-link');
  links.forEach(link => {
    link.addEventListener('click', closeSheet);
  });
}

/* --------------------------------------------------------------------------
   2. STICKY HEADER SHADOW ON SCROLL
   -------------------------------------------------------------------------- */
function initHeaderScroll() {
  const header = document.getElementById('siteHeader');
  if (!header) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }, { passive: true });
}

/* --------------------------------------------------------------------------
   3. HERO URL SCANNER FORM
   -------------------------------------------------------------------------- */
function initHeroScanner() {
  const form = document.getElementById('heroScannerForm');
  const input = document.getElementById('heroScannerInput');
  if (!form || !input) return;

  const domains = ['stripe.com', 'notion.so', 'figma.com', 'linear.app', 'shopify.com', 'substack.com'];
  let domainIdx = 0;
  let charIdx = 0;
  let isDeleting = false;
  let activeDomain = domains[0];

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const domain = input.value.trim() || activeDomain || 'stripe.com';
    showComingSoon(domain);
  });

  // Animated Placeholder Typing Effect
  function typeEffect() {
    if (document.activeElement === input || input.value.length > 0) {
      setTimeout(typeEffect, 1200);
      return;
    }

    const currentText = domains[domainIdx];
    activeDomain = currentText;

    if (!isDeleting) {
      charIdx++;
      input.setAttribute('placeholder', `Analyze e.g. ${currentText.substring(0, charIdx)}`);
      if (charIdx === currentText.length) {
        isDeleting = true;
        setTimeout(typeEffect, 2000);
        return;
      }
    } else {
      charIdx--;
      input.setAttribute('placeholder', `Analyze e.g. ${currentText.substring(0, charIdx)}`);
      if (charIdx === 0) {
        isDeleting = false;
        domainIdx = (domainIdx + 1) % domains.length;
        setTimeout(typeEffect, 350);
        return;
      }
    }
    setTimeout(typeEffect, isDeleting ? 40 : 85);
  }

  setTimeout(typeEffect, 900);
}

/* --------------------------------------------------------------------------
   3B. INTERACTIVE HERO CANVAS (Kinetic Particles & Constellation Growth Field)
   -------------------------------------------------------------------------- */
function initHeroCanvas() {
  const canvas = document.getElementById('heroCanvas');
  const heroSection = document.getElementById('heroSection');
  if (!canvas || !heroSection) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  let width = 0;
  let height = 0;
  let dpr = 1;
  let animationId = null;
  let isVisible = true;
  let particles = [];
  const palette = ['#CBAD8D', '#A48374', '#D1C7BD', '#EBE3DB'];

  const mouse = {
    x: -9999,
    y: -9999,
    active: false,
    radius: 140
  };

  function resize() {
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

  heroSection.addEventListener('mousemove', (e) => {
    const rect = heroSection.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
    mouse.active = true;
  });

  heroSection.addEventListener('mouseleave', () => {
    mouse.active = false;
    mouse.x = -9999;
    mouse.y = -9999;
  });

  let t = 0;
  function render() {
    if (!isVisible) return;
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

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      isVisible = entry.isIntersecting;
      if (isVisible) {
        cancelAnimationFrame(animationId);
        animationId = requestAnimationFrame(render);
      } else {
        cancelAnimationFrame(animationId);
      }
    });
  }, { threshold: 0.05 });

  observer.observe(heroSection);

  resize();
  createParticles();
  animationId = requestAnimationFrame(render);

  let resizeTimer = null;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      resize();
      createParticles();
    }, 150);
  }, { passive: true });
}

/* --------------------------------------------------------------------------
   3C. HERO ARCHITECTURAL GRID SPOTLIGHT
   -------------------------------------------------------------------------- */
function initHeroSpotlight() {
  const heroSection = document.getElementById('heroSection');
  if (!heroSection) return;

  heroSection.addEventListener('mousemove', (e) => {
    const rect = heroSection.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    heroSection.style.setProperty('--mouse-x', `${x.toFixed(1)}%`);
    heroSection.style.setProperty('--mouse-y', `${y.toFixed(1)}%`);
  }, { passive: true });
}

/* --------------------------------------------------------------------------
   3D. HERO FLOATING PILLS 3D PARALLAX TILT
   -------------------------------------------------------------------------- */
function initHeroParallax() {
  const heroSection = document.getElementById('heroSection');
  if (!heroSection) return;
  const pills = heroSection.querySelectorAll('.hero-floating-pill');
  if (!pills.length) return;

  heroSection.addEventListener('mousemove', (e) => {
    if (window.innerWidth <= 1024) return;
    const rect = heroSection.getBoundingClientRect();
    const nx = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
    const ny = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);

    pills.forEach(pill => {
      const depth = parseFloat(pill.getAttribute('data-depth')) || 1;
      const shiftX = nx * depth * 14;
      const shiftY = ny * depth * 12;
      pill.style.transform = `translate3d(${shiftX}px, ${shiftY}px, 0)`;
    });
  }, { passive: true });

  heroSection.addEventListener('mouseleave', () => {
    pills.forEach(pill => {
      pill.style.transform = '';
    });
  });
}

/* --------------------------------------------------------------------------
   3E. QUICK FILL DOMAIN FROM HERO CHIPS
   -------------------------------------------------------------------------- */
function quickFillDomain(domain) {
  const input = document.getElementById('heroScannerInput');
  if (input) {
    input.value = domain;
    input.focus();
    input.style.transition = 'box-shadow 0.3s ease, border-color 0.3s ease';
    input.style.boxShadow = '0 0 0 3px rgba(203, 173, 141, 0.45)';
    setTimeout(() => {
      input.style.boxShadow = '';
    }, 900);
  }
  showComingSoon(domain);
}

/* --------------------------------------------------------------------------
   4. ZEN COMMAND CENTER SEAMLESS ENGINE (Auto-Cycle, Progress Bars, Stream Mode)
   -------------------------------------------------------------------------- */
const consoleTabs = ['content', 'aeo', 'healing', 'social', 'agency'];
let currentConsoleTabIndex = 0;
let consoleAutoplayActive = true;
let consoleViewMode = 'auto'; // 'auto' or 'stream'
let autoplayTimer = null;
let progressStartTime = 0;
let progressAnimFrameId = null;
const CYCLE_DURATION = 4500; // 4.5s per engine screen

function initConsoleAutoplay() {
  const consoleFrame = document.getElementById('mainConsoleFrame') || document.querySelector('.console-frame');
  if (!consoleFrame) return;

  // Pause on hover so users can inspect details peacefully
  consoleFrame.addEventListener('mouseenter', () => {
    pauseConsoleAutoplay(true);
  });

  consoleFrame.addEventListener('mouseleave', () => {
    if (consoleViewMode === 'auto') {
      resumeConsoleAutoplay();
    }
  });

  // Start auto-cycle loop
  startConsoleCycle();
}

function startConsoleCycle() {
  if (!consoleAutoplayActive || consoleViewMode !== 'auto') return;
  progressStartTime = Date.now();
  cancelAnimationFrame(progressAnimFrameId);
  animateProgressBar();

  clearTimeout(autoplayTimer);
  autoplayTimer = setTimeout(() => {
    if (consoleAutoplayActive && consoleViewMode === 'auto') {
      currentConsoleTabIndex = (currentConsoleTabIndex + 1) % consoleTabs.length;
      switchConsoleTab(consoleTabs[currentConsoleTabIndex], false);
      startConsoleCycle();
    }
  }, CYCLE_DURATION);
}

function animateProgressBar() {
  if (!consoleAutoplayActive || consoleViewMode !== 'auto') return;
  const activeTabKey = consoleTabs[currentConsoleTabIndex];
  const activeBtn = document.getElementById(`tabBtn-${activeTabKey}`);
  const bar = activeBtn ? activeBtn.querySelector('.tab-progress-bar') : null;

  if (bar) {
    const elapsed = Date.now() - progressStartTime;
    const pct = Math.min(100, (elapsed / CYCLE_DURATION) * 100);
    bar.style.width = `${pct}%`;

    if (elapsed < CYCLE_DURATION && consoleAutoplayActive) {
      progressAnimFrameId = requestAnimationFrame(animateProgressBar);
    }
  }
}

function resetProgressBars() {
  cancelAnimationFrame(progressAnimFrameId);
  consoleTabs.forEach(key => {
    const btn = document.getElementById(`tabBtn-${key}`);
    const bar = btn ? btn.querySelector('.tab-progress-bar') : null;
    if (bar) bar.style.width = '0%';
  });
}

function switchConsoleTab(tabKey, manual = true) {
  const targetIndex = consoleTabs.indexOf(tabKey);
  if (targetIndex !== -1) {
    currentConsoleTabIndex = targetIndex;
  }

  resetProgressBars();

  consoleTabs.forEach(key => {
    const btn = document.getElementById(`tabBtn-${key}`);
    const screen = document.getElementById(`screen-${key}`);
    
    if (btn) {
      btn.classList.toggle('active', key === tabKey);
    }
    if (screen) {
      screen.classList.toggle('active', key === tabKey);
    }
  });

  if (manual) {
    clearTimeout(autoplayTimer);
    if (consoleAutoplayActive && consoleViewMode === 'auto') {
      startConsoleCycle();
    }
  }
}

function pauseConsoleAutoplay(isHover = false) {
  clearTimeout(autoplayTimer);
  cancelAnimationFrame(progressAnimFrameId);
  const pauseBtn = document.getElementById('cyclePauseBtn');
  const timerText = document.getElementById('cycleTimerText');
  if (!isHover) {
    consoleAutoplayActive = false;
    if (pauseBtn) pauseBtn.textContent = '▶';
    if (timerText) timerText.textContent = 'Auto-cycle paused';
  }
}

function resumeConsoleAutoplay() {
  consoleAutoplayActive = true;
  const pauseBtn = document.getElementById('cyclePauseBtn');
  const timerText = document.getElementById('cycleTimerText');
  if (pauseBtn) pauseBtn.textContent = '⏸';
  if (timerText) timerText.textContent = 'Auto-advancing every 4.5s';
  startConsoleCycle();
}

function toggleConsoleAutoplay() {
  if (consoleAutoplayActive) {
    pauseConsoleAutoplay(false);
  } else {
    resumeConsoleAutoplay();
  }
}

function setConsoleViewMode(mode) {
  consoleViewMode = mode;
  const consoleFrame = document.getElementById('mainConsoleFrame') || document.querySelector('.console-frame');
  const btnAuto = document.getElementById('btnModeAuto');
  const btnStream = document.getElementById('btnModeStream');

  if (btnAuto) btnAuto.classList.toggle('active', mode === 'auto');
  if (btnStream) btnStream.classList.toggle('active', mode === 'stream');

  if (consoleFrame) {
    if (mode === 'stream') {
      consoleFrame.classList.add('console-view-stream');
      pauseConsoleAutoplay(false);
      const timerText = document.getElementById('cycleTimerText');
      if (timerText) timerText.textContent = 'Streaming all 5 engines';
    } else {
      consoleFrame.classList.remove('console-view-stream');
      switchConsoleTab(consoleTabs[currentConsoleTabIndex], false);
      resumeConsoleAutoplay();
    }
  }
}

/* --------------------------------------------------------------------------
   5. INTERACTIVE 1-CLICK SELF-HEALING ACTION
   -------------------------------------------------------------------------- */
let currentHealingScore = 92;

function applyHealingFix(rowId, boostPoints = 3) {
  const row = document.getElementById(rowId);
  const scoreEl = document.getElementById('healingScoreVal');
  const miniScoreEl = document.getElementById('miniHealthVal');
  if (!row) return;

  const btn = row.querySelector('.btn-fix-action');
  if (btn) {
    btn.innerHTML = '<span>✓ Auto-Patched (0.4s)</span>';
    btn.style.background = '#10B981';
    btn.style.color = '#FFFFFF';
    btn.style.boxShadow = '0 0 14px rgba(16, 185, 129, 0.6)';
    btn.disabled = true;
    btn.style.cursor = 'default';
  }

  row.style.borderColor = '#10B981';
  row.style.background = 'rgba(16, 185, 129, 0.12)';

  if (currentHealingScore < 100) {
    currentHealingScore = Math.min(100, currentHealingScore + boostPoints);
    if (scoreEl) {
      scoreEl.textContent = currentHealingScore;
      scoreEl.style.transform = 'scale(1.2)';
      setTimeout(() => {
        scoreEl.style.transform = 'scale(1)';
      }, 300);
      if (currentHealingScore === 100) {
        scoreEl.style.color = '#34D399';
        scoreEl.style.textShadow = '0 0 20px #34D399';
      }
    }
    if (miniScoreEl) {
      miniScoreEl.textContent = `${currentHealingScore} / 100`;
    }
  }
}

/* --------------------------------------------------------------------------
   6. PRICING CONTROLS (Monthly / Yearly & USD / INR)
   -------------------------------------------------------------------------- */
let currentBilling = 'monthly';
let currentCurrency = 'USD';

const pricingRates = {
  USD: {
    starter: { monthly: "$200", annual: "$160" },
    pro: { monthly: "$500", annual: "$400" },
    agency: { monthly: "$1,000", annual: "$800" }
  },
  INR: {
    starter: { monthly: "₹7,999", annual: "₹6,399" },
    pro: { monthly: "₹14,999", annual: "₹11,999" },
    agency: { monthly: "₹29,999", annual: "₹23,999" }
  }
};

function setBillingCycle(cycle) {
  currentBilling = cycle;
  document.getElementById('btnBillingMonthly')?.classList.toggle('active', cycle === 'monthly');
  document.getElementById('btnBillingAnnual')?.classList.toggle('active', cycle === 'annual');
  updatePricingCards();
}

function setCurrency(curr) {
  currentCurrency = curr;
  document.getElementById('btnCurrencyUSD')?.classList.toggle('active', curr === 'USD');
  document.getElementById('btnCurrencyINR')?.classList.toggle('active', curr === 'INR');
  updatePricingCards();
}

function updatePricingCards() {
  const rates = pricingRates[currentCurrency];
  if (!rates) return;
  
  const elStarter = document.getElementById('priceVal-starter');
  const elPro = document.getElementById('priceVal-pro');
  const elAgency = document.getElementById('priceVal-agency');

  if (elStarter) elStarter.textContent = rates.starter[currentBilling];
  if (elPro) elPro.textContent = rates.pro[currentBilling];
  if (elAgency) elAgency.textContent = rates.agency[currentBilling];

  const pStarter = document.getElementById('pricePeriod-starter');
  const pPro = document.getElementById('pricePeriod-pro');
  const pAgency = document.getElementById('pricePeriod-agency');

  const periodText = currentBilling === 'monthly' ? 'per month • billed monthly' : 'per month • billed annually (Save 20%)';
  if (pStarter) pStarter.textContent = periodText;
  if (pPro) pPro.textContent = periodText;
  if (pAgency) pAgency.textContent = periodText;
}

/* --------------------------------------------------------------------------
   7. FAQ ACCORDION
   -------------------------------------------------------------------------- */
function toggleFaq(btn) {
  const item = btn.parentElement;
  if (!item) return;
  const isActive = item.classList.contains('active');

  // Close other open FAQs
  document.querySelectorAll('.faq-item').forEach(el => {
    if (el !== item) el.classList.remove('active');
  });

  if (isActive) {
    item.classList.remove('active');
  } else {
    item.classList.add('active');
  }
}

/* --------------------------------------------------------------------------
   8. LIVE SIMULATED AUDIT MODAL (HUD Diagnostic Style)
   -------------------------------------------------------------------------- */
function showComingSoon(feature = 'Rank Monk Autonomous OS') {
  const backdrop = document.getElementById('auditModalBackdrop') || document.getElementById('comingSoonModal');
  if (!backdrop) return;
  backdrop.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeComingSoonModal() {
  const backdrop = document.getElementById('auditModalBackdrop') || document.getElementById('comingSoonModal');
  if (backdrop) {
    backdrop.classList.remove('open');
    document.body.style.overflow = '';
  }
}

// Backward compatibility alias
function runLiveAudit(domain) {
  showComingSoon(domain);
}

function closeAuditModal() {
  closeComingSoonModal();
}

// Close modal on backdrop click
document.getElementById('auditModalBackdrop')?.addEventListener('click', (e) => {
  if (e.target.id === 'auditModalBackdrop') {
    closeComingSoonModal();
  }
});

/* --------------------------------------------------------------------------
   8. INTERACTIVE STACK CALCULATOR (comparison.html)
   -------------------------------------------------------------------------- */
function updateStackCalc() {
  const checkboxes = document.querySelectorAll('.calc-checkbox');
  let totalCost = 0;
  let totalHours = 0;

  checkboxes.forEach(cb => {
    if (cb.checked) {
      totalCost += parseFloat(cb.getAttribute('data-cost') || 0);
      totalHours += parseFloat(cb.getAttribute('data-hours') || 0);
    }
  });

  const costEl = document.getElementById('calcCurrentCost');
  const hoursEl = document.getElementById('calcHoursWasted');
  const savingsEl = document.getElementById('calcNetSavings');

  if (costEl) costEl.textContent = `$${totalCost}/mo`;
  if (hoursEl) hoursEl.textContent = `${totalHours} hrs`;
  if (savingsEl) {
    const annualSavings = Math.max(0, (totalCost - 189) * 12);
    savingsEl.textContent = `+$${annualSavings.toLocaleString()}/yr`;
  }
}

/* --------------------------------------------------------------------------
   9. INTERACTIVE TRAFFIC ROI ESTIMATOR SLIDER (pricing.html)
   -------------------------------------------------------------------------- */
function updateRoiCalc(val) {
  const count = parseInt(val, 10) || 30;
  const sliderDisplay = document.getElementById('sliderValDisplay');
  const trafficEl = document.getElementById('roiTrafficEst');
  const adsValEl = document.getElementById('roiAdsVal');
  const multiplierEl = document.getElementById('roiNetMultiplier');

  const estVisits = count * 1500;
  const cpcVal = Math.round(estVisits * 0.70);
  const netMultiplier = Math.max(1, Math.round(cpcVal / 189));

  if (sliderDisplay) sliderDisplay.textContent = `${count} articles`;
  if (trafficEl) trafficEl.textContent = estVisits.toLocaleString();
  if (adsValEl) adsValEl.textContent = `$${cpcVal.toLocaleString()} / mo`;
  if (multiplierEl) multiplierEl.textContent = `${netMultiplier}x Alpha`;
}

/* --------------------------------------------------------------------------
   10. REAL-TIME FAQ SEARCH FILTER (faq.html)
   -------------------------------------------------------------------------- */
function filterFaqQuestions(query) {
  const term = (query || '').toLowerCase().trim();
  const items = document.querySelectorAll('.faq-item');

  items.forEach(item => {
    const meta = (item.getAttribute('data-faq-text') || '').toLowerCase();
    const text = item.textContent.toLowerCase();
    if (!term || meta.includes(term) || text.includes(term)) {
      item.style.display = 'block';
    } else {
      item.style.display = 'none';
    }
  });
}

/* --------------------------------------------------------------------------
   11. VIP EARLY ACCESS / FOUNDING COHORT WAITLIST
   -------------------------------------------------------------------------- */
function handleWaitlistSubmit(form) {
  if (!form) return;
  const input = form.querySelector('input[type="email"]');
  const email = input ? input.value.trim() : '';
  if (!email) return;

  const parent = form.parentElement;
  if (parent) {
    parent.innerHTML = `
      <div style="padding: 20px; border-radius: var(--radius-md); background: rgba(203, 173, 141, 0.15); border: 1px solid var(--nude-sand); text-align: center;">
        <div style="font-size: 24px; margin-bottom: 8px;">🎉</div>
        <div style="font-size: 17px; font-weight: 800; color: #FFFFFF; margin-bottom: 6px;">Founding Invitation Confirmed!</div>
        <p style="font-size: 13.5px; color: #F1EDE6; line-height: 1.5; margin: 0;">
          <strong style="color: var(--nude-sand);">${email}</strong> has been assigned priority queue #142 with the <strong style="color: #FFFFFF;">50% Lifetime Founder Privilege</strong> locked in. We will notify you the moment pricing is unveiled.
        </p>
      </div>
    `;
  }
}

/* --------------------------------------------------------------------------
   12. FEATURE SHOWCASE FILTER (features.html)
   -------------------------------------------------------------------------- */
function filterFeatures(cat, el) {
  const pills = document.querySelectorAll('.feature-filter-pill');
  pills.forEach(p => p.classList.remove('active'));
  if (el) el.classList.add('active');

  const cards = document.querySelectorAll('.feature-card-full');
  cards.forEach(card => {
    const cardCat = card.getAttribute('data-category');
    if (cat === 'all' || cardCat === cat) {
      card.style.display = 'flex';
    } else {
      card.style.display = 'none';
    }
  });
}

// Expose handlers to global window for inline onclick attributes
window.switchConsoleTab = switchConsoleTab;
window.applyHealingFix = applyHealingFix;
window.setBillingCycle = setBillingCycle;
window.setCurrency = setCurrency;
window.toggleFaq = toggleFaq;
window.showComingSoon = showComingSoon;
window.closeComingSoonModal = closeComingSoonModal;
window.runLiveAudit = runLiveAudit;
window.closeAuditModal = closeAuditModal;
window.updateStackCalc = updateStackCalc;
window.updateRoiCalc = updateRoiCalc;
window.filterFaqQuestions = filterFaqQuestions;
window.handleWaitlistSubmit = handleWaitlistSubmit;
window.filterFeatures = filterFeatures;
window.quickFillDomain = quickFillDomain;
window.toggleConsoleAutoplay = toggleConsoleAutoplay;
window.setConsoleViewMode = setConsoleViewMode;

/* --------------------------------------------------------------------------
   13. LIGHT / DARK THEME TOGGLE (Local Storage & System Preference)
   -------------------------------------------------------------------------- */
const THEME_KEY = "rankmonk-theme";

function applyTheme(t) {
  document.documentElement.setAttribute("data-theme", t);
  const btn = document.getElementById("theme-toggle");
  if (btn) {
    btn.setAttribute("aria-label", t === "dark" ? "Switch to light mode" : "Switch to dark mode");
    btn.textContent = t === "dark" ? "☀" : "☾";
  }
}

function toggleTheme() {
  const current = document.documentElement.getAttribute("data-theme") || "light";
  const next = current === "dark" ? "light" : "dark";
  try { localStorage.setItem(THEME_KEY, next); } catch (e) {}
  applyTheme(next);
}

document.addEventListener("DOMContentLoaded", () => {
  const themeBtn = document.getElementById("theme-toggle");
  if (themeBtn) {
    themeBtn.addEventListener("click", toggleTheme);
    const initialTheme = document.documentElement.getAttribute("data-theme") || "light";
    applyTheme(initialTheme);
  }
});

window.toggleTheme = toggleTheme;


