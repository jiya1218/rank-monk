const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

function escapeXml(unsafe) {
  return String(unsafe)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

async function renderFestive(sqOrStory) {
  const isStory = sqOrStory === 'story';
  const cWidth = 1080;
  const cHeight = isStory ? 1920 : 1080;
  const imgPath = isStory 
    ? path.join(process.cwd(), 'public/generated-media/diwali_story_masterpiece_ultra.jpg')
    : path.join(process.cwd(), 'public/generated-media/diwali_masterpiece_ultra.jpg');
  
  const base64Image = fs.readFileSync(imgPath).toString('base64');
  const cleanBrand = 'OfficeX';
  const cleanDomain = 'officex.pro';
  const badgeText = 'SHUBH DEEPAVALI';
  const cleanPart1 = 'Happy';
  const cleanPart2 = 'Diwali';
  const cleanSub = 'May the divine lights of Diwali illuminate your journey with boundless prosperity, peace, and enduring success. Warm festive greetings from OfficeX.';
  const headlineFontSize = isStory ? 54 : 48;
  const bottomScrimH = isStory ? 700 : 420;
  const bottomY = isStory ? (cHeight - 480) : (cHeight - 310);

  const svg = `<svg width="${cWidth}" height="${cHeight}" viewBox="0 0 ${cWidth} ${cHeight}" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="festive_top_scrim" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#050302" stop-opacity="0.82" />
        <stop offset="100%" stop-color="#050302" stop-opacity="0" />
      </linearGradient>
      <linearGradient id="festive_bottom_scrim" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#050302" stop-opacity="0" />
        <stop offset="25%" stop-color="#050302" stop-opacity="0.7" />
        <stop offset="60%" stop-color="#050302" stop-opacity="0.9" />
        <stop offset="100%" stop-color="#050302" stop-opacity="0.98" />
      </linearGradient>
      <filter id="festive_glow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="4" stdDeviation="12" flood-color="#f59e0b" flood-opacity="0.4" />
      </filter>
    </defs>

    <!-- Full-Bleed 8K Photorealistic Diwali Scene -->
    <image href="data:image/jpeg;base64,${base64Image}" x="0" y="0" width="${cWidth}" height="${cHeight}" preserveAspectRatio="xMidYMid slice" />

    <!-- Top & Bottom Contrast Gradients -->
    <rect width="${cWidth}" height="240" fill="url(#festive_top_scrim)" />
    <rect y="${cHeight - bottomScrimH}" width="${cWidth}" height="${bottomScrimH}" fill="url(#festive_bottom_scrim)" />

    <!-- Header Brand Mark -->
    <g transform="translate(65, ${isStory ? 80 : 55})">
      <rect width="220" height="48" rx="24" fill="rgba(255, 255, 255, 0.16)" stroke="rgba(255, 215, 0, 0.5)" stroke-width="1.2" />
      <circle cx="28" cy="24" r="6" fill="#f59e0b" />
      <text x="46" y="30" font-family="'Inter', -apple-system, sans-serif" font-weight="900" font-size="16.5" fill="#ffffff">${cleanBrand}</text>
      <text x="148" y="29" font-family="'Inter', sans-serif" font-weight="700" font-size="10.5" fill="#fcd34d" letter-spacing="1.5">OFFICIAL</text>
    </g>

    <!-- Header Festive Tag -->
    <g transform="translate(${cWidth - 285}, ${isStory ? 80 : 55})">
      <rect width="220" height="48" rx="24" fill="rgba(245, 158, 11, 0.22)" stroke="rgba(245, 158, 11, 0.65)" stroke-width="1.2" />
      <text x="110" y="29" font-family="'Inter', sans-serif" font-weight="800" font-size="11" fill="#fef08a" text-anchor="middle" letter-spacing="2">✨ ${badgeText}</text>
    </g>

    <!-- Greeting Typography -->
    <g transform="translate(65, ${bottomY})">
      <text font-family="'Georgia', serif" font-weight="800" font-size="${headlineFontSize}" fill="#fef08a" letter-spacing="-0.5" filter="url(#festive_glow)">
        ${cleanPart1} <tspan fill="#f59e0b">${cleanPart2}</tspan>
      </text>

      <text y="${isStory ? 70 : 58}" font-family="'Inter', -apple-system, sans-serif" font-weight="500" font-size="${isStory ? 21 : 17}" fill="#f8fafc" letter-spacing="0.1">
        ${cleanSub.slice(0, 80)}
      </text>
      <text y="${isStory ? 104 : 86}" font-family="'Inter', -apple-system, sans-serif" font-weight="500" font-size="${isStory ? 21 : 17}" fill="#f8fafc">
        ${cleanSub.slice(80, 180)}
      </text>

      <!-- Signature Divider -->
      <g transform="translate(0, ${isStory ? 170 : 135})">
        <line x1="0" y1="0" x2="${cWidth - 130}" y2="0" stroke="rgba(255, 215, 0, 0.35)" stroke-width="1.2" />
        <text x="0" y="36" font-family="'Inter', sans-serif" font-weight="700" font-size="${isStory ? 15 : 13}" fill="#cbd5e1" letter-spacing="2.5">
          WARM WISHES FROM ${cleanBrand.toUpperCase()} • ${cleanDomain.toUpperCase()}
        </text>
      </g>
    </g>
  </svg>`;

  const outName = isStory ? 'diwali_festive_poster_story.png' : 'diwali_festive_poster_square.png';
  const outPath = path.join(process.cwd(), 'public/generated-media', outName);
  await sharp(Buffer.from(svg)).png().toFile(outPath);
  console.log('Generated:', outName);
}

// Also render a vertical 9:16 Bento Services Poster for Story format!
async function renderServicesStory() {
  const cWidth = 1080;
  const cHeight = 1920;
  const imgPath = path.join(process.cwd(), 'public/generated-media/diwali_story_masterpiece_ultra.jpg');
  const base64Image = fs.readFileSync(imgPath).toString('base64');
  const cleanBrand = 'OfficeX';
  const cleanDomain = 'officex.pro';
  const badgeText = 'ENTERPRISE CRE &amp; FM PLATFORM';
  const headline = 'Intelligent Space &amp; Facility Operations';
  const subLine1 = 'The enterprise operating system to streamline commercial leases,';
  const subLine2 = 'automate maintenance workflows, and optimize workspace density.';

  const bentoServices = [
    { num: '01', title: 'Space Management', desc1: 'Dynamic desk allocation &amp; zone utilization', desc2: 'Live IoT occupancy sensor telemetry', tag: 'SPACE SUITE ↗' },
    { num: '02', title: 'Facility Operations', desc1: 'Predictive maintenance &amp; auto work orders', desc2: 'Automated vendor SLAs &amp; dispatch', tag: 'FACILITY OPS ↗' },
    { num: '03', title: 'Lease Administration', desc1: 'End-to-end lease contracts &amp; tenant billing', desc2: 'Automated indexation &amp; compliance alerts', tag: 'LEASE ADMIN ↗' },
    { num: '04', title: 'Asset &amp; ESG Telemetry', desc1: 'Equipment telemetry &amp; predictive lifecycle', desc2: 'Automated ESG carbon footprint reporting', tag: 'ESG METRICS ↗' }
  ];

  const svg = `<svg width="${cWidth}" height="${cHeight}" viewBox="0 0 ${cWidth} ${cHeight}" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="services_story_bg" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#040813" stop-opacity="0.94" />
        <stop offset="50%" stop-color="#081020" stop-opacity="0.88" />
        <stop offset="100%" stop-color="#02050b" stop-opacity="0.97" />
      </linearGradient>
      <linearGradient id="services_card_grad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="rgba(30, 41, 59, 0.88)" />
        <stop offset="100%" stop-color="rgba(15, 23, 42, 0.95)" />
      </linearGradient>
      <linearGradient id="services_teal_glow" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#14b8a6" />
        <stop offset="100%" stop-color="#06b6d4" />
      </linearGradient>
      <filter id="services_shadow" x="-10%" y="-10%" width="120%" height="120%">
        <feDropShadow dx="0" dy="10" stdDeviation="16" flood-color="#000000" flood-opacity="0.6" />
      </filter>
    </defs>

    <!-- Background AI Image -->
    <image href="data:image/jpeg;base64,${base64Image}" x="0" y="0" width="${cWidth}" height="${cHeight}" preserveAspectRatio="xMidYMid slice" opacity="0.28" />

    <!-- Dark Contrast Scrim -->
    <rect width="${cWidth}" height="${cHeight}" fill="url(#services_story_bg)" />

    <!-- Ambient Glowing Orbs -->
    <circle cx="900" cy="300" r="400" fill="#14b8a6" fill-opacity="0.14" />
    <circle cx="150" cy="1500" r="350" fill="#06b6d4" fill-opacity="0.12" />

    <!-- 1. Header Bar -->
    <g transform="translate(65, 90)">
      <rect width="220" height="52" rx="26" fill="rgba(255, 255, 255, 0.08)" stroke="rgba(20, 184, 166, 0.45)" stroke-width="1.2" />
      <circle cx="28" cy="26" r="7" fill="#14b8a6" />
      <text x="48" y="33" font-family="'Inter', -apple-system, sans-serif" font-weight="900" font-size="18" fill="#ffffff">${cleanBrand}</text>
      <text x="145" y="32" font-family="'Inter', sans-serif" font-weight="700" font-size="11" fill="#5eead4" letter-spacing="1.5">ENTERPRISE</text>
    </g>

    <g transform="translate(${cWidth - 375}, 90)">
      <rect width="310" height="52" rx="26" fill="rgba(20, 184, 166, 0.12)" stroke="rgba(20, 184, 166, 0.35)" stroke-width="1.2" />
      <text x="155" y="32" font-family="'Inter', sans-serif" font-weight="800" font-size="11.5" fill="#2dd4bf" text-anchor="middle" letter-spacing="2">✦ ${badgeText}</text>
    </g>

    <!-- 2. Hero Headline -->
    <g transform="translate(65, 205)">
      <text font-family="'Inter', -apple-system, sans-serif" font-weight="900" font-size="52" fill="#ffffff" letter-spacing="-1">
        Intelligent Space &amp;
      </text>
      <text y="62" font-family="'Inter', -apple-system, sans-serif" font-weight="900" font-size="52" fill="url(#services_teal_glow)" letter-spacing="-1">
        Facility Operations
      </text>
      <text y="125" font-family="'Inter', sans-serif" font-weight="500" font-size="19" fill="#94a3b8" letter-spacing="0.1">
        ${subLine1}
      </text>
      <text y="155" font-family="'Inter', sans-serif" font-weight="500" font-size="19" fill="#94a3b8" letter-spacing="0.1">
        ${subLine2}
      </text>
    </g>

    <!-- 3. Vertical Stack of 4 Bento Cards (Story 9:16 layout) -->
    ${bentoServices.map((card, idx) => {
      const cardY = 430 + (idx * 270);
      return `
      <g transform="translate(65, ${cardY})" filter="url(#services_shadow)">
        <rect width="950" height="240" rx="24" fill="url(#services_card_grad)" stroke="rgba(255, 255, 255, 0.12)" stroke-width="1.2" />
        
        <!-- Card Icon & Sequence -->
        <rect x="35" y="35" width="56" height="56" rx="16" fill="rgba(20, 184, 166, 0.15)" stroke="rgba(20, 184, 166, 0.4)" stroke-width="1.2" />
        <text x="63" y="70" font-family="'Inter', monospace" font-weight="900" font-size="20" fill="#2dd4bf" text-anchor="middle">${card.num}</text>
        
        <text x="115" y="72" font-family="'Inter', sans-serif" font-weight="800" font-size="26" fill="#ffffff">${card.title}</text>
        
        <!-- Feature Bullets -->
        <text x="38" y="135" font-family="'Inter', sans-serif" font-weight="600" font-size="17" fill="#f1f5f9">✓ ${card.desc1}</text>
        <text x="38" y="172" font-family="'Inter', sans-serif" font-weight="400" font-size="16" fill="#94a3b8">• ${card.desc2}</text>
        
        <!-- Tag Pill -->
        <g transform="translate(760, 42)">
          <rect width="150" height="36" rx="18" fill="rgba(20, 184, 166, 0.15)" stroke="rgba(20, 184, 166, 0.35)" stroke-width="1" />
          <text x="75" y="23" font-family="'Inter', sans-serif" font-weight="700" font-size="12" fill="#5eead4" text-anchor="middle" letter-spacing="1">${card.tag}</text>
        </g>
      </g>`;
    }).join('')}

    <!-- 4. Trust Bar -->
    <g transform="translate(65, 1580)">
      <line x1="0" y1="0" x2="950" y2="0" stroke="rgba(255, 255, 255, 0.15)" stroke-width="1.2" />
      <text x="475" y="40" font-family="'Inter', sans-serif" font-weight="700" font-size="15" fill="#94a3b8" letter-spacing="2.5" text-anchor="middle">
        ENTERPRISE SECURITY  •  99.9% UPTIME SLA  •  PAN-INDIA DEPLOYMENT
      </text>
    </g>

    <!-- 5. Bottom Call to Action -->
    <g transform="translate(65, 1680)">
      <rect width="950" height="82" rx="41" fill="url(#services_teal_glow)" filter="url(#services_shadow)" />
      <text x="475" y="50" font-family="'Inter', -apple-system, sans-serif" font-weight="900" font-size="20" fill="#042f2e" text-anchor="middle" letter-spacing="1">
        EXPLORE OFFICEX SOLUTIONS ↗
      </text>
    </g>

    <text x="540" y="1815" font-family="'Inter', sans-serif" font-weight="800" font-size="16" fill="#64748b" text-anchor="middle" letter-spacing="3">
      WWW.${cleanDomain.toUpperCase()} • FACILITY MANAGEMENT &amp; CRE SAAS
    </text>
  </svg>`;

  const outName = 'officex_services_poster_story.png';
  const outPath = path.join(process.cwd(), 'public/generated-media', outName);
  await sharp(Buffer.from(svg)).png().toFile(outPath);
  console.log('Generated:', outName);
}

(async () => {
  try {
    await renderFestive('square');
    await renderFestive('story');
    await renderServicesStory();
    console.log('All posters rendered successfully!');
  } catch (e) {
    console.error('Error rendering posters:', e);
  }
})();

