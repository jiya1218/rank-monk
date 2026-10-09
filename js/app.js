/* ==========================================================================
   RANK MONK - APPLICATION JAVASCRIPT
   Zen Minimalist & Luxury Dark Interactive Engine
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initMobileNav();
  initHeaderScroll();
  initHeroScanner();
});

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
   4. ZEN COMMAND CENTER INTERACTIVE TABS (Content / AEO / Healing / Social / Agency)
   -------------------------------------------------------------------------- */
function switchConsoleTab(tabKey) {
  const tabs = ['content', 'aeo', 'healing', 'social', 'agency'];
  
  tabs.forEach(key => {
    const btn = document.getElementById(`tabBtn-${key}`);
    const screen = document.getElementById(`screen-${key}`);
    
    if (btn) {
      btn.classList.toggle('active', key === tabKey);
    }
    if (screen) {
      screen.classList.toggle('active', key === tabKey);
    }
  });
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
    btn.textContent = '✓ Deployed to CMS';
    btn.style.background = 'var(--nude-sand)';
    btn.style.color = 'var(--nude-espresso)';
    btn.disabled = true;
    btn.style.cursor = 'default';
  }

  row.style.borderColor = 'var(--nude-sand)';
  if (row.classList.contains('healing-item-row')) {
    row.style.background = 'rgba(203, 173, 141, 0.12)';
  }

  if (currentHealingScore < 100) {
    currentHealingScore = Math.min(100, currentHealingScore + boostPoints);
    if (scoreEl) {
      scoreEl.textContent = currentHealingScore;
      if (currentHealingScore === 100) scoreEl.style.color = 'var(--nude-sand)';
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
    free: { monthly: "$0", annual: "$0" },
    starter: { monthly: "$189", annual: "$151" },
    growth: { monthly: "$599", annual: "$479" }
  },
  INR: {
    free: { monthly: "₹0", annual: "₹0" },
    starter: { monthly: "₹14,999", annual: "₹11,999" },
    growth: { monthly: "₹47,999", annual: "₹38,399" }
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
  
  const elFree = document.getElementById('priceVal-free');
  const elStarter = document.getElementById('priceVal-starter');
  const elGrowth = document.getElementById('priceVal-growth');

  if (elFree) elFree.textContent = rates.free[currentBilling];
  if (elStarter) elStarter.textContent = rates.starter[currentBilling];
  if (elGrowth) elGrowth.textContent = rates.growth[currentBilling];

  const pStarter = document.getElementById('pricePeriod-starter');
  const pGrowth = document.getElementById('pricePeriod-growth');

  const periodText = currentBilling === 'monthly' ? 'per month • billed monthly' : 'per month • billed annually (Save 20%)';
  if (pStarter) pStarter.textContent = periodText;
  if (pGrowth) pGrowth.textContent = periodText;
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

