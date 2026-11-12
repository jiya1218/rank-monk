import { NextResponse } from 'next/server';
import { BedrockRuntimeClient, ConverseCommand, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import fs from 'fs';
import path from 'path';

// Clean XML / text characters
function escapeXml(unsafe: string): string {
  return String(unsafe || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// Split text into natural word-bounded lines without severing words
function wrapText(text: string, maxLen: number = 75): string[] {
  const words = (text || '').trim().split(/\s+/);
  const lines: string[] = [];
  let current = '';

  for (const w of words) {
    if (!current) {
      current = w;
    } else if ((current + ' ' + w).length <= maxLen) {
      current += ' ' + w;
    } else {
      lines.push(current);
      current = w;
    }
  }
  if (current) lines.push(current);
  return lines;
}

// Generate Dynamic Marketing Copy & Visual Prompt via AWS Bedrock (Claude Sonnet 4.5 / Llama 3.3 / Nova Pro)
async function generateMarketingWithBedrock(params: {
  prompt: string;
  brandName: string;
  industry: string;
  domain: string;
  palette?: string[];
  referenceImage?: string;
  websiteContext?: string;
  voiceTags?: string[];
}) {
  const token = process.env.AWS_BEARER_TOKEN_BEDROCK || process.env.VITE_BEDROCK_API_KEY;
  if (!token) return null;

  try {
    process.env.AWS_BEARER_TOKEN_BEDROCK = token;
    const client = new BedrockRuntimeClient({ region: 'us-east-1' });

    const isFestive = /diwali|deepavali|christmas|xmas|new year|newyear|holiday|festival|celebrat|eid|thanksgiving|holi|greeting|wishing|wishes/i.test(params.prompt);
    const isExplicitMultiService = !isFestive && /service|solution|capabilit|feature|offering|product|what we do|agency showcase|our platform|marketing of my services|marketing of services|my services/i.test(params.prompt);
    const isLightTheme = /light\s*(theme|mode|bg|background)?|white|clean\s*light|bright|cream|ivory/i.test(params.prompt);

    const systemPrompt = `You are an elite creative director and commercial advertising designer at a top-tier creative studio.
A client needs a high-converting, publication-grade commercial Instagram promotional visual for:
- Brand Name: "${params.brandName}"
- Domain: "${params.domain}"
- Industry: "${params.industry}"
- Client's Prompt / Campaign Brief: "${params.prompt}"
- Theme Preference: ${isLightTheme ? 'STRICT LIGHT THEME (Clean ivory/white backdrop, airy sunlit daylight aesthetic, high contrast dark charcoal text, crisp modern cards)' : 'Dark theme (Midnight luxury & glowing accents)'}
${params.websiteContext ? `- Real Scraped Site Context: "${params.websiteContext}"` : ''}
${params.palette && params.palette.length > 0 ? `- Brand Palette: ${params.palette.join(', ')}` : ''}
${params.voiceTags && params.voiceTags.length > 0 ? `- Brand Voice Tags: ${params.voiceTags.join(', ')}` : ''}
${params.referenceImage ? `- NOTE: The user has attached a brand styling reference image. Study its visual mood, lighting, color tones, layout, and composition style, and reflect this visual aesthetic.` : ''}

POSTER LAYOUT SELECTION:
${isFestive ? `- This is a FESTIVAL / CELEBRATION / HOLIDAY GREETING (e.g. Diwali, Christmas, New Year).
  Set "postStyle": "festive_greeting".
  Provide:
  - "headline": "Happy Diwali" (or appropriate festive greeting matching the prompt)
  - "subheadline": "May the divine lights illuminate your path with prosperity, joy, and boundless success. Warm festive greetings from ${params.brandName}."
  - "badge": "FESTIVE GREETINGS"
  - "motto": "Light • Prosperity • Success"
  - "cta": "Warm Wishes from ${params.brandName} ✦"
  - "services": [] (STRICTLY EMPTY ARRAY - ZERO software buttons or SaaS checklists)
  - "featureNodes": ["Warmest Wishes", "Joy & Light", "Prosperity"]
  - "trustBadges": []
  - "visualPrompt": "Ultra-luxury celebratory scene at twilight, decorated for the holiday. Radiant warm ambient lighting, glowing suspended lanterns, mirror-polished floors, fresh floral arrangements. Cinematic atmosphere, award-winning commercial advertising photography, Hasselblad 85mm f/1.4, razor-sharp focus, 8k resolution, no text, no watermarks, no split screen, no stairs"` : (isExplicitMultiService ? `- This is an EXPLICIT SERVICES / PRODUCT OFFERING SHOWCASE REQUEST.
  Set "postStyle": "agency_showcase".
  Provide:
  - "headline": Generate a punchy, bold 3-5 word marketing headline tailored directly to "${params.prompt}" and "${params.brandName}". DO NOT use generic slogans like "Turn Ideas into Intelligent Solutions" or "Transform Your Workspace".
  - "subheadline": Generate a 1-2 sentence compelling value proposition summarizing the actual services or products requested.
  - "motto": "Innovate • Deliver • Scale"
  - "cta": "Explore ${params.brandName} →"
  - "services": Provide 4 distinct service/offering items extracted directly from what the company does or what the prompt requests. Each must have "title" (2-3 words) and "desc" (5-8 words).
  - "featureNodes": ["Scale Smarter", "Automate Better", "Grow Faster"]
  - "trustBadges": ["Cutting-Edge Quality", "Expert Team", "Client-Centric", "Proven Impact"]
  - "visualPrompt": ${isLightTheme ? '"Bright sunlit minimalist modern executive office workspace bathed in natural morning sunlight, clean wooden desk with a modern slim tablet displaying glowing software dashboard analytics and dynamic charts, delicate indoor plant in soft focus, bright airy Scandinavian architectural interior, floor-to-ceiling windows with soft daylight, Hasselblad 85mm f/1.4, razor-sharp focus, 8k resolution, cinematic lighting, photorealistic, no text, no watermarks, no stairs, no staircase, no empty lobbies"' : '"A sleek, modern commercial tech command center desk with illuminated monitors showing glowing workspace analytics and data, ambient cinematic studio lighting, Hasselblad 85mm f/1.4, razor-sharp focus, 8k resolution, no text, no watermarks, no stairs, no staircase, no split screen"'}.` : `- This is a COMMERCIAL BRAND CREATIVE / HERO VISUAL.
  Set "postStyle": "poster_studio".
  Provide:
  - "headline": A punchy, bold 3-5 word marketing headline tailored directly to "${params.prompt}"
  - "subheadline": A clear, compelling 1-2 sentence message tailored to "${params.prompt}"
  - "badge": "VERIFIED EXCELLENCE"
  - "motto": "Innovate • Deliver • Scale"
  - "cta": "Explore ${params.brandName} →"
  - "services": []
  - "featureNodes": ["Verified Quality", "High Velocity", "Premium Standard"]
  - "trustBadges": ["Industry Proven", "Expert Team", "Client-First", "Measurable ROI"]
  - "visualPrompt": A stunning, single photographic or 3D visual subject directly capturing "${params.prompt}", razor-sharp focus, 8k resolution, cinematic lighting, no text.`)}

CREATIVE & VISUAL DIRECTION FOR "visualPrompt":
- Describe a stunning, single photographic or 3D visual subject matching the client's topic.
- CRITICAL: NEVER generate empty staircases, stairwells, steps, escalators, or empty building lobbies! When requested for business or software services, always feature an executive workspace with modern technology, a tablet/laptop with business analytics, or a collaborative modern office environment.
- If the user requested light theme, ensure the prompt explicitly specifies bright natural morning daylight, sunlit airy atmosphere, clean light wood or ivory palette, and NO dark gloomy shadows.
- DO NOT mention text, typography, letters, words, font names, or writing.
- DO NOT mention logos, brand names, or watermarks.
- DO NOT mention split-screen, grid, collage, multiple panels, or 4-box layout.
- Ensure the prompt requests: "single seamless composition, razor-sharp focus, 8k resolution, cinematic lighting, no text, no watermarks, no split screen, no collage".

Return a raw JSON object (strictly valid JSON, no markdown, no backticks):
{
  "headline": "A punchy, bold 3-6 word marketing headline",
  "subheadline": "A clear, compelling 1-2 sentence value proposition",
  "badge": "A 2-4 word promotional pill badge",
  "motto": "Innovate • Build • Grow",
  "cta": "Actionable call to action with arrow",
  "visualPrompt": "A single coherent visual hero scene strictly adhering to the CRITICAL RULE above",
  "featureNodes": ["3 short benefit nodes"],
  "services": [],
  "trustBadges": ["Cutting-Edge Tech", "Expert Team", "Client-Centric", "Proven Impact"],
  "caption": "Full engaging Instagram marketing caption tailored to their prompt with emojis, problem-solution hook, benefits, and call to action",
  "hashtags": ["#Tag1", "#Tag2", "#Tag3", "#Tag4", "#Tag5"],
  "postStyle": "${isFestive ? 'festive_greeting' : (isExplicitMultiService ? 'agency_showcase' : 'poster_studio')}"
}`;

    const contentParts: any[] = [];

    // Multimodal reference image support
    if (params.referenceImage) {
      try {
        const match = params.referenceImage.match(/^data:image\/(png|jpeg|jpg|webp);base64,(.+)$/);
        const format = match ? (match[1] === 'jpg' ? 'jpeg' : match[1]) : 'jpeg';
        const base64Data = match ? match[2] : params.referenceImage;
        contentParts.push({
          image: {
            format: format as 'jpeg' | 'png' | 'webp',
            source: { bytes: Buffer.from(base64Data, 'base64') }
          }
        });
      } catch (imgErr) {
        console.warn('[Bedrock Image Input Error]', (imgErr as Error).message);
      }
    }

    contentParts.push({ text: systemPrompt });

    let text: string | undefined;

    // Try Claude Sonnet 4.5 first on Bedrock
    try {
      const claudeRes = await client.send(new ConverseCommand({
        modelId: 'us.anthropic.claude-sonnet-4-5-20250929-v1:0',
        messages: [{ role: 'user', content: contentParts }]
      }));
      text = claudeRes.output?.message?.content?.[0]?.text;
    } catch (e1) {
      try {
        const haikuRes = await client.send(new ConverseCommand({
          modelId: 'us.anthropic.claude-haiku-4-5-20251001-v1:0',
          messages: [{ role: 'user', content: contentParts }]
        }));
        text = haikuRes.output?.message?.content?.[0]?.text;
      } catch (e2) {
        try {
          const llamaRes = await client.send(new ConverseCommand({
            modelId: 'us.meta.llama3-3-70b-instruct-v1:0',
            messages: [{ role: 'user', content: [{ text: systemPrompt }] }]
          }));
          text = llamaRes.output?.message?.content?.[0]?.text;
        } catch (e3) {
          // Fallback to Amazon Nova Pro
          const novaRes = await client.send(new ConverseCommand({
            modelId: 'us.amazon.nova-pro-v1:0',
            messages: [{ role: 'user', content: [{ text: systemPrompt }] }]
          }));
          text = novaRes.output?.message?.content?.[0]?.text;
        }
      }
    }

    if (!text) return null;
    const cleaned = text.replace(/```(?:json)?/gi, '').replace(/```/g, '').trim();
    return JSON.parse(cleaned);
  } catch (e) {
    console.warn('[Bedrock Image Prompt Error]', (e as Error).message);
    return null;
  }
}

// Compose Publication-Ready Commercial Instagram Poster (Universal for B2B Tech & B2C Services)
async function composeMarketingPoster(params: {
  base64Image: string;
  brandName: string;
  domain: string;
  headline: string;
  subheadline: string;
  badge: string;
  featureNodes?: string[];
  services?: Array<{ title: string; desc?: string; icon?: string }>;
  postStyle?: string;
  palette?: string[];
  cta?: string;
  industry?: string;
  ratio?: string;
  motto?: string;
  trustBadges?: string[];
  isLightTheme?: boolean;
  prompt?: string;
}): Promise<string | null> {
  try {
    const sharp = (await import('sharp')).default;
    const isLightTheme = Boolean(params.isLightTheme);

    const words = params.headline.trim().split(/\s+/);
    let part1 = words[0] || 'Premium';
    let part2 = words.slice(1).join(' ') || 'Excellence';
    if (words.length > 2) {
      const mid = Math.ceil(words.length / 2);
      part1 = words.slice(0, mid).join(' ');
      part2 = words.slice(mid).join(' ');
    }

    const badgeText = escapeXml((params.badge || 'AI AGENTS • BUILT FOR BUSINESS').toUpperCase());
    const cleanBrand = escapeXml(params.brandName || 'Brand');
    const cleanDomain = escapeXml(params.domain?.replace(/^https?:\/\//i, '').replace(/\/$/, '') || 'company.com');
    const cleanSub = escapeXml(params.subheadline || `Experience verified quality and high-velocity fulfillment with ${cleanBrand}.`);
    const cleanPart1 = escapeXml(part1);
    const cleanPart2 = escapeXml(part2);
    const darkColor = '#0f172a';

    // Dynamic brand colors from dashboard project palette
    const primaryColor = (params.palette && params.palette.length > 0 && params.palette[0].startsWith('#'))
      ? params.palette[0]
      : '#2563eb';

    const categoryTag = escapeXml((params.badge || params.industry || 'SCALEZIX ENTERPRISE SOLUTIONS').toUpperCase());
    const cleanCta = escapeXml(params.cta?.replace(/[^\w\s-↗]/g, '') || 'BOOK CONSULT ↗').toUpperCase();
    const footerText = `${cleanDomain.toUpperCase()}  |  ${cleanCta}`;

    // Layout Selection: Pure AI Image vs Festive Greeting vs Agency Showcase vs Studio Poster vs Full-Bleed Editorial
    if (params.postStyle === 'pure_image') {
      return null;
    }

    const isFestive = params.postStyle === 'festive_greeting';
    const isEditorial = params.postStyle === 'poster_editorial';
    const isShowcase = !isFestive && (params.postStyle === 'agency_showcase' || params.postStyle === 'services_showcase' || (Boolean(params.services && params.services.length >= 3) && !isEditorial));
    const isStory = params.ratio === '9:16' || params.ratio === 'story';
    const isLandscape = params.ratio === '16:9' || params.ratio === 'landscape' || params.ratio === '16:9-banner';
    const isPortrait = params.ratio === '4:5' || params.ratio === 'portrait';
    let cWidth = 1080;
    let cHeight = 1080;
    if (isStory) {
      cWidth = 1080;
      cHeight = 1920;
    } else if (isPortrait) {
      cWidth = 1080;
      cHeight = 1350;
    } else if (isLandscape) {
      cWidth = 1200;
      cHeight = 675;
    }

    const nodes = (params.featureNodes && params.featureNodes.length >= 3)
      ? params.featureNodes.map(escapeXml)
      : ['Scale Smarter', 'Automate Better', 'Grow Faster'].map(escapeXml);

    const accentColor = (params.palette && params.palette.length > 1 && params.palette[1].startsWith('#'))
      ? params.palette[1]
      : '#ec4899';

    // Smart Dynamic Headline Sizing & Stacking
    const totalHeadlineLen = cleanPart1.length + cleanPart2.length;
    const isMultiLineHeadline = totalHeadlineLen > 24;
    const headlineFontSize = totalHeadlineLen > 36 ? 36 : (totalHeadlineLen > 24 ? 40 : 46);
    const heroTopOffset = isMultiLineHeadline ? 295 : 275;
    const heroH = isPortrait ? (isMultiLineHeadline ? 710 : 730) : (isMultiLineHeadline ? 510 : 530);

    let svg = '';

    if (isFestive) {
      // 100% Full-Bleed Cinematic Festive Creative (Diwali / Celebrations / Milestones)
      const subLines = wrapText(cleanSub, isStory ? 58 : 78);
      const headlineY = 0;
      const subStartY = isStory ? 68 : 56;
      const lineHeight = isStory ? 28 : 22;
      const signatureY = subStartY + (subLines.length * lineHeight) + (isStory ? 35 : 25);
      const bottomContentH = signatureY + 60;
      const bottomY = cHeight - bottomContentH - (isStory ? 90 : 50);
      const bottomScrimH = bottomContentH + (isStory ? 220 : 160);

      svg = `<svg width="${cWidth}" height="${cHeight}" viewBox="0 0 ${cWidth} ${cHeight}" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="festive_top_scrim" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#050302" stop-opacity="0.84" />
            <stop offset="100%" stop-color="#050302" stop-opacity="0" />
          </linearGradient>
          <linearGradient id="festive_bottom_scrim" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#050302" stop-opacity="0" />
            <stop offset="25%" stop-color="#050302" stop-opacity="0.72" />
            <stop offset="60%" stop-color="#050302" stop-opacity="0.92" />
            <stop offset="100%" stop-color="#050302" stop-opacity="0.98" />
          </linearGradient>
          <filter id="festive_glow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="12" flood-color="#f59e0b" flood-opacity="0.45" />
          </filter>
        </defs>

        <!-- Full-Bleed Pristine AI Generated Festive Photography -->
        <image href="data:image/jpeg;base64,${params.base64Image}" x="0" y="0" width="${cWidth}" height="${cHeight}" preserveAspectRatio="xMidYMid slice" />

        <!-- Gradient Overlays for High-Contrast Typography -->
        <rect width="${cWidth}" height="${isStory ? 260 : 220}" fill="url(#festive_top_scrim)" />
        <rect y="${cHeight - bottomScrimH}" width="${cWidth}" height="${bottomScrimH}" fill="url(#festive_bottom_scrim)" />

        <!-- Top Header: Elegant Frosted Brand Mark -->
        <g transform="translate(65, ${isStory ? 80 : 55})">
          <rect width="210" height="46" rx="23" fill="rgba(255, 255, 255, 0.18)" stroke="rgba(255, 215, 0, 0.45)" stroke-width="1.2" />
          <circle cx="26" cy="23" r="6" fill="#f59e0b" />
          <text x="42" y="29" font-family="'Inter', sans-serif" font-weight="900" font-size="16" fill="#ffffff">${cleanBrand}</text>
          <text x="145" y="28" font-family="'Inter', sans-serif" font-weight="700" font-size="10.5" fill="#fcd34d" letter-spacing="1.5">OFFICIAL</text>
        </g>

        <!-- Top Right Festive Pill -->
        <g transform="translate(${cWidth - 275}, ${isStory ? 80 : 55})">
          <rect width="210" height="46" rx="23" fill="rgba(245, 158, 11, 0.25)" stroke="rgba(245, 158, 11, 0.6)" stroke-width="1.2" />
          <text x="105" y="28" font-family="'Inter', sans-serif" font-weight="800" font-size="11" fill="#fef08a" text-anchor="middle" letter-spacing="2">✨ ${badgeText}</text>
        </g>

        <!-- Bottom Festive Greeting & Warm Wishes -->
        <g transform="translate(65, ${bottomY})">
          <!-- Warm Golden Festive Title -->
          <text y="${headlineY}" font-family="'Georgia', serif" font-weight="800" font-size="${headlineFontSize + (isStory ? 10 : 6)}" fill="#fef08a" letter-spacing="-0.5" filter="url(#festive_glow)">
            ${cleanPart1} <tspan fill="#f59e0b">${cleanPart2}</tspan>
          </text>

          <!-- Complete Word-Wrapped Warm Blessing -->
          ${subLines.map((line, idx) => `
            <text y="${subStartY + (idx * lineHeight)}" font-family="'Inter', -apple-system, sans-serif" font-weight="500" font-size="${isStory ? 20 : 17}" fill="#f8fafc" letter-spacing="0.1">
              ${escapeXml(line)}
            </text>
          `).join('')}

          <!-- Signature Divider & Company Brand Tag -->
          <g transform="translate(0, ${signatureY})">
            <line x1="0" y1="0" x2="${cWidth - 130}" y2="0" stroke="rgba(255, 215, 0, 0.35)" stroke-width="1.2" />
            <text x="0" y="34" font-family="'Inter', sans-serif" font-weight="700" font-size="${isStory ? 15 : 13}" fill="#cbd5e1" letter-spacing="2.5">WARM WISHES FROM ${cleanBrand.toUpperCase()} • ${cleanDomain.toUpperCase()}</text>
          </g>
        </g>
      </svg>`;
    } else if (isShowcase) {
      // 100% Executive Services Bento Grid Marketing Poster (Universal for any brand & industry)
      const detectIndustryServices = (ind: string, brand: string, pr: string) => {
        const text = `${ind} ${pr}`.toLowerCase();
        if (text.includes('perfume') || text.includes('fragrance') || text.includes('scent') || text.includes('beauty')) {
          return [
            { title: 'Artisan Perfumery', desc: 'Handcrafted luxury blends & extrait de parfum' },
            { title: 'Signature Notes', desc: 'Rare oud, French amber & botanical notes' },
            { title: 'Pan-India Delivery', desc: 'Insured swift fulfillment & luxury packaging' },
            { title: 'Verified Purity', desc: '100% authentic, cruelty-free, long-lasting sillage' }
          ];
        }
        if (text.includes('food') || text.includes('restaurant') || text.includes('dining') || text.includes('delivery')) {
          return [
            { title: 'Chef Specialties', desc: 'Fresh gourmet creations crafted daily' },
            { title: 'Express Delivery', desc: 'Hot & fresh directly to your doorstep' },
            { title: 'Hygienic Standards', desc: 'Kitchens verified for supreme hygiene' },
            { title: 'Curated Dining', desc: 'Exclusive rewards and authentic flavors' }
          ];
        }
        if (text.includes('real estate') || text.includes('facility') || text.includes('proptech') || text.includes('workspace')) {
          return [
            { title: 'Space Management', desc: 'Dynamic desk allocation & zone utilization' },
            { title: 'Facility Operations', desc: 'Predictive IoT maintenance & auto work orders' },
            { title: 'Lease Administration', desc: 'End-to-end contract lifecycle & tenant billing' },
            { title: 'Asset & ESG Analytics', desc: 'Equipment telemetry & carbon reporting' }
          ];
        }
        return [
          { title: 'Core Solutions', desc: `Verified premium offerings tailored for ${brand}` },
          { title: 'High-Velocity Delivery', desc: 'Seamless execution with guaranteed quality SLAs' },
          { title: 'Quality Assurance', desc: 'Rigorous testing & transparent standards' },
          { title: 'Dedicated Support', desc: 'Continuous client care and verified satisfaction' }
        ];
      };

      const rawServices = (params.services && params.services.length >= 3)
        ? params.services
        : detectIndustryServices(params.industry || '', cleanBrand, params.prompt || '');

      const bentoServices = rawServices.slice(0, 4).map((s, idx) => ({
        num: `0${idx + 1}`,
        title: escapeXml(s.title || `Service ${idx + 1}`),
        desc1: escapeXml((s.desc || 'Verified quality workflow').slice(0, 52)),
        desc2: escapeXml('Automated execution & high-velocity delivery'),
        tag: escapeXml(`${(s.title || 'SUITE').split(' ')[0].toUpperCase()} SUITE ↗`)
      }));

      const dynamicSubDefault = `Experience verified excellence and industry-leading solutions with ${cleanBrand}. Engineered for reliability, quality, and measurable impact.`;
      const subLines = wrapText(cleanSub || dynamicSubDefault, isStory ? 60 : 75);
      const subLine1 = escapeXml(subLines[0] || `Premium solutions and verified excellence with ${cleanBrand},`);
      const subLine2 = escapeXml(subLines[1] || `delivering unmatched quality and customer satisfaction.`);

      const dynamicTrustBar = (() => {
        const text = `${params.industry} ${params.prompt}`.toLowerCase();
        if (text.includes('perfume') || text.includes('fragrance') || text.includes('beauty')) {
          return '100% AUTHENTIC BLENDS  •  CRUELTY FREE  •  PAN-INDIA DELIVERY';
        }
        if (text.includes('food') || text.includes('restaurant')) {
          return 'SUPREME HYGIENE  •  FRESH INGREDIENTS  •  EXPRESS DELIVERY';
        }
        if (text.includes('real estate') || text.includes('facility')) {
          return 'ENTERPRISE SECURITY  •  99.9% UPTIME SLA  •  PAN-INDIA DEPLOYMENT';
        }
        return 'VERIFIED EXCELLENCE  •  PREMIUM QUALITY  •  GUARANTEED SATISFACTION';
      })();

      const dynamicDomainSubtext = escapeXml(params.industry ? `${params.industry.slice(0, 36)} Platform` : 'Official Verified Portal');

      // Theme Palette Definitions (Supports Dynamic Light Theme & Dark Theme)
      const bgScrimStop1 = isLightTheme ? '#faf8f5' : '#050811';
      const bgScrimStop2 = isLightTheme ? '#f5f0ea' : '#0a1222';
      const bgScrimStop3 = isLightTheme ? '#eae3d7' : '#03060c';
      const bgOpacity = isLightTheme ? 0.12 : 0.32;

      const cardGradStop1 = isLightTheme ? '#ffffff' : 'rgba(30, 41, 59, 0.88)';
      const cardGradStop2 = isLightTheme ? '#fdfbf9' : 'rgba(15, 23, 42, 0.95)';
      const cardStroke = isLightTheme ? 'rgba(216, 192, 158, 0.65)' : 'rgba(255, 255, 255, 0.12)';
      const cardShadowColor = isLightTheme ? '#2b1b12' : '#000000';
      const cardShadowOpacity = isLightTheme ? '0.08' : '0.5';

      const numBg = isLightTheme ? '#f0fdfa' : 'rgba(20, 184, 166, 0.15)';
      const numStroke = isLightTheme ? '#0d9488' : 'rgba(20, 184, 166, 0.4)';
      const numFill = isLightTheme ? '#0f766e' : '#2dd4bf';

      const titleFill = isLightTheme ? '#0f172a' : '#ffffff';
      const desc1Fill = isLightTheme ? '#1e293b' : '#f1f5f9';
      const desc2Fill = isLightTheme ? '#64748b' : '#94a3b8';

      const tagBg = isLightTheme ? '#f0fdf4' : 'rgba(20, 184, 166, 0.12)';
      const tagStroke = isLightTheme ? '#16a34a' : 'rgba(20, 184, 166, 0.25)';
      const tagFill = isLightTheme ? '#15803d' : '#5eead4';

      const headerBrandPillBg = isLightTheme ? '#ffffff' : 'rgba(255, 255, 255, 0.08)';
      const headerBrandPillStroke = isLightTheme ? 'rgba(13, 148, 136, 0.35)' : 'rgba(20, 184, 166, 0.45)';
      const headerBrandText = isLightTheme ? '#0f172a' : '#ffffff';
      const headerEnterpriseText = isLightTheme ? '#0d9488' : '#5eead4';

      const headerBadgeBg = isLightTheme ? '#ffffff' : 'rgba(20, 184, 166, 0.12)';
      const headerBadgeStroke = isLightTheme ? 'rgba(13, 148, 136, 0.3)' : 'rgba(20, 184, 166, 0.35)';
      const headerBadgeText = isLightTheme ? '#0f766e' : '#2dd4bf';

      const headlinePart1Fill = isLightTheme ? '#0f172a' : '#ffffff';
      const headlinePart2Fill = isLightTheme ? '#0d9488' : 'url(#services_teal_glow)';
      const subheadlineFill = isLightTheme ? '#475569' : '#94a3b8';

      const dividerStroke = isLightTheme ? 'rgba(15, 23, 42, 0.12)' : 'rgba(255, 255, 255, 0.15)';
      const trustTextFill = isLightTheme ? '#64748b' : '#94a3b8';

      const ctaBtnBg = isLightTheme ? '#0d9488' : 'url(#services_teal_glow)';
      const ctaBtnText = isLightTheme ? '#ffffff' : '#042f2e';
      const domainTextFill = isLightTheme ? '#0f172a' : '#ffffff';
      const domainSubtextFill = isLightTheme ? '#0d9488' : '#2dd4bf';

      if (isStory) {
        // Vertical Stacked 4-Card Bento Showcase (9:16 Stories & Reels)
        svg = `<svg width="${cWidth}" height="${cHeight}" viewBox="0 0 ${cWidth} ${cHeight}" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="services_story_bg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="${bgScrimStop1}" stop-opacity="0.96" />
              <stop offset="50%" stop-color="${bgScrimStop2}" stop-opacity="0.94" />
              <stop offset="100%" stop-color="${bgScrimStop3}" stop-opacity="0.98" />
            </linearGradient>
            <linearGradient id="services_card_grad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stop-color="${cardGradStop1}" />
              <stop offset="100%" stop-color="${cardGradStop2}" />
            </linearGradient>
            <linearGradient id="services_teal_glow" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stop-color="#14b8a6" />
              <stop offset="100%" stop-color="#06b6d4" />
            </linearGradient>
            <filter id="services_shadow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="10" stdDeviation="16" flood-color="${cardShadowColor}" flood-opacity="${cardShadowOpacity}" />
            </filter>
          </defs>

          <!-- Background AI Image -->
          <image href="data:image/jpeg;base64,${params.base64Image}" x="0" y="0" width="${cWidth}" height="${cHeight}" preserveAspectRatio="xMidYMid slice" opacity="${bgOpacity}" />

          <!-- Contrast Scrim -->
          <rect width="${cWidth}" height="${cHeight}" fill="url(#services_story_bg)" />

          <!-- Ambient Glowing Orbs -->
          <circle cx="900" cy="300" r="400" fill="#14b8a6" fill-opacity="${isLightTheme ? '0.06' : '0.14'}" />
          <circle cx="150" cy="1500" r="350" fill="#06b6d4" fill-opacity="${isLightTheme ? '0.05' : '0.12'}" />

          <!-- 1. Header Bar -->
          <g transform="translate(65, 90)">
            <rect width="220" height="52" rx="26" fill="${headerBrandPillBg}" stroke="${headerBrandPillStroke}" stroke-width="1.2" />
            <circle cx="28" cy="26" r="7" fill="#14b8a6" />
            <text x="48" y="33" font-family="'Inter', -apple-system, sans-serif" font-weight="900" font-size="18" fill="${headerBrandText}">${cleanBrand}</text>
            <text x="145" y="32" font-family="'Inter', sans-serif" font-weight="700" font-size="11" fill="${headerEnterpriseText}" letter-spacing="1.5">ENTERPRISE</text>
          </g>

          <g transform="translate(${cWidth - 375}, 90)">
            <rect width="310" height="52" rx="26" fill="${headerBadgeBg}" stroke="${headerBadgeStroke}" stroke-width="1.2" />
            <text x="155" y="32" font-family="'Inter', sans-serif" font-weight="800" font-size="11.5" fill="${headerBadgeText}" text-anchor="middle" letter-spacing="2">✦ ${badgeText}</text>
          </g>

          <!-- 2. Hero Headline -->
          <g transform="translate(65, 205)">
            <text font-family="'Inter', -apple-system, sans-serif" font-weight="900" font-size="52" fill="${headlinePart1Fill}" letter-spacing="-1">
              ${cleanPart1}
            </text>
            <text y="62" font-family="'Inter', -apple-system, sans-serif" font-weight="900" font-size="52" fill="${headlinePart2Fill}" letter-spacing="-1">
              ${cleanPart2}
            </text>
            <text y="125" font-family="'Inter', sans-serif" font-weight="500" font-size="19" fill="${subheadlineFill}" letter-spacing="0.1">
              ${subLine1}
            </text>
            <text y="155" font-family="'Inter', sans-serif" font-weight="500" font-size="19" fill="${subheadlineFill}" letter-spacing="0.1">
              ${subLine2}
            </text>
          </g>

          <!-- 3. Vertical Stack of 4 Bento Cards (Story 9:16 layout) -->
          ${bentoServices.map((card, idx) => {
            const cardY = 430 + (idx * 270);
            return `
            <g transform="translate(65, ${cardY})" filter="url(#services_shadow)">
              <rect width="950" height="240" rx="24" fill="url(#services_card_grad)" stroke="${cardStroke}" stroke-width="1.2" />
              
              <rect x="35" y="35" width="56" height="56" rx="16" fill="${numBg}" stroke="${numStroke}" stroke-width="1.2" />
              <text x="63" y="70" font-family="'Inter', monospace" font-weight="900" font-size="20" fill="${numFill}" text-anchor="middle">${card.num}</text>
              
              <text x="115" y="72" font-family="'Inter', sans-serif" font-weight="800" font-size="26" fill="${titleFill}">${card.title}</text>
              
              <text x="38" y="135" font-family="'Inter', sans-serif" font-weight="600" font-size="17" fill="${desc1Fill}">✓ ${card.desc1}</text>
              <text x="38" y="172" font-family="'Inter', sans-serif" font-weight="400" font-size="16" fill="${desc2Fill}">• ${card.desc2}</text>
              
              <g transform="translate(760, 42)">
                <rect width="150" height="36" rx="18" fill="${tagBg}" stroke="${tagStroke}" stroke-width="1" />
                <text x="75" y="23" font-family="'Inter', sans-serif" font-weight="700" font-size="12" fill="${tagFill}" text-anchor="middle" letter-spacing="1">${card.tag}</text>
              </g>
            </g>`;
          }).join('')}

          <!-- 4. Trust Bar -->
          <g transform="translate(65, 1580)">
            <line x1="0" y1="0" x2="950" y2="0" stroke="${dividerStroke}" stroke-width="1.2" />
            <text x="475" y="40" font-family="'Inter', sans-serif" font-weight="700" font-size="15" fill="${trustTextFill}" letter-spacing="2.5" text-anchor="middle">
              ${dynamicTrustBar}
            </text>
          </g>

          <!-- 5. Bottom Call to Action -->
          <g transform="translate(65, 1680)">
            <rect width="950" height="82" rx="41" fill="${ctaBtnBg}" filter="url(#services_shadow)" />
            <text x="475" y="50" font-family="'Inter', -apple-system, sans-serif" font-weight="900" font-size="20" fill="${ctaBtnText}" text-anchor="middle" letter-spacing="1">
              ${cleanCta}
            </text>
          </g>

          <text x="540" y="1815" font-family="'Inter', sans-serif" font-weight="800" font-size="16" fill="${trustTextFill}" text-anchor="middle" letter-spacing="3">
            WWW.${cleanDomain.toUpperCase()} • ${dynamicDomainSubtext.toUpperCase()}
          </text>
        </svg>`;
      } else {
        // Standard 2x2 Bento Grid (Square 1:1 and Portrait 4:5)
        svg = `<svg width="${cWidth}" height="${cHeight}" viewBox="0 0 ${cWidth} ${cHeight}" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="services_bg_grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="${bgScrimStop1}" stop-opacity="0.97" />
              <stop offset="50%" stop-color="${bgScrimStop2}" stop-opacity="0.95" />
              <stop offset="100%" stop-color="${bgScrimStop3}" stop-opacity="0.98" />
            </linearGradient>
            <linearGradient id="services_card_grad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stop-color="${cardGradStop1}" />
              <stop offset="100%" stop-color="${cardGradStop2}" />
            </linearGradient>
            <linearGradient id="services_teal_glow" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stop-color="#14b8a6" />
              <stop offset="100%" stop-color="#06b6d4" />
            </linearGradient>
            <filter id="services_shadow_card" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="${cardShadowColor}" flood-opacity="${cardShadowOpacity}" />
            </filter>
          </defs>

          <!-- Full-Bleed AI Visual in Background -->
          <image href="data:image/jpeg;base64,${params.base64Image}" x="0" y="0" width="${cWidth}" height="${cHeight}" preserveAspectRatio="xMidYMid slice" opacity="${bgOpacity}" />

          <!-- Contrast Scrim -->
          <rect width="${cWidth}" height="${cHeight}" fill="url(#services_bg_grad)" />

          <!-- Ambient Glowing Orbs -->
          <circle cx="${cWidth - 200}" cy="160" r="300" fill="#14b8a6" fill-opacity="${isLightTheme ? '0.06' : '0.14'}" />
          <circle cx="180" cy="${cHeight - 200}" r="260" fill="#06b6d4" fill-opacity="${isLightTheme ? '0.05' : '0.1'}" />

          <!-- 1. Top Header Bar -->
          <g transform="translate(65, 52)">
            <!-- Brand Pill -->
            <rect width="210" height="46" rx="23" fill="${headerBrandPillBg}" stroke="${headerBrandPillStroke}" stroke-width="1.2" />
            <circle cx="26" cy="23" r="6" fill="#14b8a6" />
            <text x="44" y="29" font-family="'Inter', -apple-system, sans-serif" font-weight="900" font-size="16" fill="${headerBrandText}">${cleanBrand}</text>
            <text x="140" y="28" font-family="'Inter', sans-serif" font-weight="700" font-size="10.5" fill="${headerEnterpriseText}" letter-spacing="1.5">ENTERPRISE</text>
          </g>

          <!-- Top Right Category Badge -->
          <g transform="translate(${cWidth - 365}, 52)">
            <rect width="300" height="46" rx="23" fill="${headerBadgeBg}" stroke="${headerBadgeStroke}" stroke-width="1.2" />
            <text x="150" y="28" font-family="'Inter', sans-serif" font-weight="800" font-size="11" fill="${headerBadgeText}" text-anchor="middle" letter-spacing="2">✦ ${badgeText}</text>
          </g>

          <!-- 2. Hero Headline & Subheadline -->
          <g transform="translate(65, 136)">
            <text font-family="'Inter', -apple-system, sans-serif" font-weight="900" font-size="${headlineFontSize}" fill="${headlinePart1Fill}" letter-spacing="-0.8">
              ${cleanPart1} <tspan fill="${headlinePart2Fill}">${cleanPart2}</tspan>
            </text>
            <text y="38" font-family="'Inter', sans-serif" font-weight="500" font-size="15" fill="${subheadlineFill}" letter-spacing="0.1">
              ${subLine1}
            </text>
            <text y="58" font-family="'Inter', sans-serif" font-weight="500" font-size="15" fill="${subheadlineFill}" letter-spacing="0.1">
              ${subLine2}
            </text>
          </g>

          <!-- 3. The 4 Services Bento Cards (2x2 Grid) -->
          <!-- Card 1: Top Left -->
          <g transform="translate(65, 235)" filter="url(#services_shadow_card)">
            <rect width="460" height="220" rx="20" fill="url(#services_card_grad)" stroke="${cardStroke}" stroke-width="1.2" />
            <rect x="25" y="25" width="46" height="46" rx="14" fill="${numBg}" stroke="${numStroke}" stroke-width="1" />
            <text x="48" y="54" font-family="'Inter', monospace" font-weight="900" font-size="16" fill="${numFill}" text-anchor="middle">${bentoServices[0].num}</text>
            <text x="85" y="55" font-family="'Inter', sans-serif" font-weight="800" font-size="19" fill="${titleFill}">${bentoServices[0].title}</text>
            <text x="28" y="106" font-family="'Inter', sans-serif" font-weight="600" font-size="13.5" fill="${desc1Fill}">✓ ${bentoServices[0].desc1}</text>
            <text x="28" y="134" font-family="'Inter', sans-serif" font-weight="400" font-size="13" fill="${desc2Fill}">• ${bentoServices[0].desc2}</text>
            <rect x="28" y="162" width="130" height="28" rx="14" fill="${tagBg}" stroke="${tagStroke}" stroke-width="1" />
            <text x="93" y="180" font-family="'Inter', sans-serif" font-weight="700" font-size="10.5" fill="${tagFill}" text-anchor="middle" letter-spacing="1">${bentoServices[0].tag}</text>
          </g>

          <!-- Card 2: Top Right -->
          <g transform="translate(555, 235)" filter="url(#services_shadow_card)">
            <rect width="460" height="220" rx="20" fill="url(#services_card_grad)" stroke="${cardStroke}" stroke-width="1.2" />
            <rect x="25" y="25" width="46" height="46" rx="14" fill="${numBg}" stroke="${numStroke}" stroke-width="1" />
            <text x="48" y="54" font-family="'Inter', monospace" font-weight="900" font-size="16" fill="${numFill}" text-anchor="middle">${bentoServices[1].num}</text>
            <text x="85" y="55" font-family="'Inter', sans-serif" font-weight="800" font-size="19" fill="${titleFill}">${bentoServices[1].title}</text>
            <text x="28" y="106" font-family="'Inter', sans-serif" font-weight="600" font-size="13.5" fill="${desc1Fill}">✓ ${bentoServices[1].desc1}</text>
            <text x="28" y="134" font-family="'Inter', sans-serif" font-weight="400" font-size="13" fill="${desc2Fill}">• ${bentoServices[1].desc2}</text>
            <rect x="28" y="162" width="130" height="28" rx="14" fill="${tagBg}" stroke="${tagStroke}" stroke-width="1" />
            <text x="93" y="180" font-family="'Inter', sans-serif" font-weight="700" font-size="10.5" fill="${tagFill}" text-anchor="middle" letter-spacing="1">${bentoServices[1].tag}</text>
          </g>

          <!-- Card 3: Bottom Left -->
          <g transform="translate(65, 485)" filter="url(#services_shadow_card)">
            <rect width="460" height="220" rx="20" fill="url(#services_card_grad)" stroke="${cardStroke}" stroke-width="1.2" />
            <rect x="25" y="25" width="46" height="46" rx="14" fill="${numBg}" stroke="${numStroke}" stroke-width="1" />
            <text x="48" y="54" font-family="'Inter', monospace" font-weight="900" font-size="16" fill="${numFill}" text-anchor="middle">${bentoServices[2].num}</text>
            <text x="85" y="55" font-family="'Inter', sans-serif" font-weight="800" font-size="19" fill="${titleFill}">${bentoServices[2].title}</text>
            <text x="28" y="106" font-family="'Inter', sans-serif" font-weight="600" font-size="13.5" fill="${desc1Fill}">✓ ${bentoServices[2].desc1}</text>
            <text x="28" y="134" font-family="'Inter', sans-serif" font-weight="400" font-size="13" fill="${desc2Fill}">• ${bentoServices[2].desc2}</text>
            <rect x="28" y="162" width="130" height="28" rx="14" fill="${tagBg}" stroke="${tagStroke}" stroke-width="1" />
            <text x="93" y="180" font-family="'Inter', sans-serif" font-weight="700" font-size="10.5" fill="${tagFill}" text-anchor="middle" letter-spacing="1">${bentoServices[2].tag}</text>
          </g>

          <!-- Card 4: Bottom Right -->
          <g transform="translate(555, 485)" filter="url(#services_shadow_card)">
            <rect width="460" height="220" rx="20" fill="url(#services_card_grad)" stroke="${cardStroke}" stroke-width="1.2" />
            <rect x="25" y="25" width="46" height="46" rx="14" fill="${numBg}" stroke="${numStroke}" stroke-width="1" />
            <text x="48" y="54" font-family="'Inter', monospace" font-weight="900" font-size="16" fill="${numFill}" text-anchor="middle">${bentoServices[3].num}</text>
            <text x="85" y="55" font-family="'Inter', sans-serif" font-weight="800" font-size="19" fill="${titleFill}">${bentoServices[3].title}</text>
            <text x="28" y="106" font-family="'Inter', sans-serif" font-weight="600" font-size="13.5" fill="${desc1Fill}">✓ ${bentoServices[3].desc1}</text>
            <text x="28" y="134" font-family="'Inter', sans-serif" font-weight="400" font-size="13" fill="${desc2Fill}">• ${bentoServices[3].desc2}</text>
            <rect x="28" y="162" width="130" height="28" rx="14" fill="${tagBg}" stroke="${tagStroke}" stroke-width="1" />
            <text x="93" y="180" font-family="'Inter', sans-serif" font-weight="700" font-size="10.5" fill="${tagFill}" text-anchor="middle" letter-spacing="1">${bentoServices[3].tag}</text>
          </g>

          <!-- 4. Trust Badges Divider -->
          <g transform="translate(65, 735)">
            <line x1="0" y1="0" x2="950" y2="0" stroke="${dividerStroke}" stroke-width="1.2" />
            <g transform="translate(30, 26)">
              <text font-family="'Inter', sans-serif" font-weight="700" font-size="12" fill="${trustTextFill}" letter-spacing="1.5">
                ${dynamicTrustBar}
              </text>
            </g>
          </g>

          <!-- 5. Bottom Call to Action Section -->
          <g transform="translate(65, 820)">
            <!-- CTA Pill Button -->
            <rect width="420" height="64" rx="32" fill="${ctaBtnBg}" filter="url(#services_shadow_card)" />
            <text x="210" y="39" font-family="'Inter', -apple-system, sans-serif" font-weight="900" font-size="15.5" fill="${ctaBtnText}" text-anchor="middle" letter-spacing="0.5">
              ${cleanCta}
            </text>

            <!-- Right Domain Tag -->
            <g transform="translate(950, 22)">
              <text x="0" y="0" font-family="'Inter', sans-serif" font-weight="900" font-size="18" fill="${domainTextFill}" text-anchor="end" letter-spacing="0.5">WWW.${cleanDomain.toUpperCase()}</text>
              <text x="0" y="24" font-family="'Inter', sans-serif" font-weight="600" font-size="12.5" fill="${domainSubtextFill}" text-anchor="end">${dynamicDomainSubtext}</text>
            </g>
          </g>
        </svg>`;
      }
    } else {
      // 100% Full-Bleed Luxury Commercial Editorial Creative (Universal for all ratios)
      const scrimY = isStory ? (cHeight - 680) : (isPortrait ? (cHeight - 520) : (isLandscape ? (cHeight - 280) : (cHeight - 380)));
      const scrimH = isStory ? 680 : (isPortrait ? 520 : (isLandscape ? 280 : 380));
      const contentY = isStory ? (cHeight - 480) : (isPortrait ? (cHeight - 360) : (isLandscape ? (cHeight - 210) : (cHeight - 280)));
      const footerY = isStory ? (cHeight - 80) : (isPortrait ? (cHeight - 60) : (isLandscape ? (cHeight - 40) : (cHeight - 50)));

      svg = `<svg width="${cWidth}" height="${cHeight}" viewBox="0 0 ${cWidth} ${cHeight}" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="editorial_scrim_bottom" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#050302" stop-opacity="0" />
            <stop offset="40%" stop-color="#050302" stop-opacity="0.65" />
            <stop offset="100%" stop-color="#050302" stop-opacity="0.96" />
          </linearGradient>
          <linearGradient id="editorial_scrim_top" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#000000" stop-opacity="0.65" />
            <stop offset="100%" stop-color="#000000" stop-opacity="0" />
          </linearGradient>
        </defs>

        <!-- Full-Bleed Pristine AI Visual -->
        <image href="data:image/jpeg;base64,${params.base64Image}" x="0" y="0" width="${cWidth}" height="${cHeight}" preserveAspectRatio="xMidYMid slice" />

        <!-- Scrim Overlays for Contrast -->
        <rect width="${cWidth}" height="180" fill="url(#editorial_scrim_top)" />
        <rect y="${scrimY}" width="${cWidth}" height="${scrimH}" fill="url(#editorial_scrim_bottom)" />

        <!-- Top Header: Elegant Monogram & Brand Tag -->
        <g transform="translate(65, 50)">
          <rect width="180" height="44" rx="22" fill="rgba(255, 255, 255, 0.2)" stroke="rgba(255, 255, 255, 0.4)" stroke-width="1.2" />
          <circle cx="25" cy="22" r="5" fill="#f59e0b" />
          <text x="40" y="28" font-family="'Inter', sans-serif" font-weight="900" font-size="16" fill="#ffffff">${cleanBrand}</text>
        </g>

        <g transform="translate(${cWidth - 285}, 50)">
          <rect width="220" height="44" rx="22" fill="rgba(0, 0, 0, 0.4)" stroke="rgba(255, 255, 255, 0.25)" stroke-width="1.2" />
          <text x="110" y="27" font-family="'Inter', sans-serif" font-weight="800" font-size="10.5" fill="#fef08a" text-anchor="middle" letter-spacing="1.8">${badgeText}</text>
        </g>

        <!-- Bottom Content Area -->
        <g transform="translate(65, ${contentY})">
          <!-- Main Headline -->
          <text font-family="'Inter', -apple-system, sans-serif" font-weight="900" font-size="${headlineFontSize + (isStory ? 6 : 0)}" fill="#ffffff" letter-spacing="-0.8">
            ${cleanPart1} <tspan fill="#f59e0b">${cleanPart2}</tspan>
          </text>
          
          <!-- Subheadline Message -->
          <text y="${isStory ? 60 : 50}" font-family="'Inter', -apple-system, sans-serif" font-weight="500" font-size="${isStory ? 19 : 16}" fill="#f8fafc" letter-spacing="0.1">
            ${cleanSub.slice(0, 95)}
          </text>
          ${cleanSub.length > 95 ? `<text y="${isStory ? 90 : 76}" font-family="'Inter', sans-serif" font-weight="500" font-size="${isStory ? 19 : 16}" fill="#f8fafc">${cleanSub.slice(95, 185)}</text>` : ''}
        </g>

        <!-- Bottom Line & Tag -->
        <g transform="translate(65, ${footerY})">
          <line x1="0" y1="0" x2="${cWidth - 130}" y2="0" stroke="rgba(255, 255, 255, 0.2)" stroke-width="1" />
          <text x="0" y="28" font-family="'Inter', sans-serif" font-weight="800" font-size="12" fill="#cbd5e1" letter-spacing="2.5">${cleanDomain.toUpperCase()} • ${cleanCta}</text>
        </g>
      </svg>`;
    }

    const pngBuf = await sharp(Buffer.from(svg)).png().toBuffer();
    const timestamp = Date.now();
    const fileName = `poster_${timestamp}_${Math.random().toString(36).substring(2, 7)}.png`;
    const dir = path.join(process.cwd(), 'public', 'generated-media');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const filePath = path.join(dir, fileName);
    fs.writeFileSync(filePath, pngBuf);
    return `/generated-media/${fileName}`;
  } catch (e) {
    console.warn('[composeMarketingPoster Error]', (e as Error).message);
    return null;
  }
}

// Generate Photorealistic Commercial Images with AWS Bedrock (Stability Ultra / Core) using AWS Credits
async function generateImageWithBedrock(visualPrompt: string, ratio: string): Promise<{ url: string; base64: string; engine: string } | null> {
  const token = process.env.AWS_BEARER_TOKEN_BEDROCK || process.env.VITE_BEDROCK_API_KEY;
  if (!token) return null;

  try {
    process.env.AWS_BEARER_TOKEN_BEDROCK = token;
    const client = new BedrockRuntimeClient({ region: 'us-west-2' });

    let aspectRatio = '1:1';
    if (ratio === '16:9' || ratio === '16:9-banner') aspectRatio = '16:9';
    else if (ratio === '9:16') aspectRatio = '9:16';
    else if (ratio === '4:5') aspectRatio = '4:5';

    const modelsToTry = [
      { id: 'stability.stable-image-ultra-v1:1', name: 'AWS Bedrock Stability Ultra (AWS Credits)' },
      { id: 'stability.stable-image-core-v1:1', name: 'AWS Bedrock Stability Core (AWS Credits)' },
      { id: 'stability.sd3-5-large-v1:0', name: 'AWS Bedrock SD 3.5 Large (AWS Credits)' }
    ];

    for (const model of modelsToTry) {
      try {
        const payload = {
          prompt: visualPrompt,
          negative_prompt: 'stairs, staircase, steps, escalator, empty lobby, architectural atrium, hallway, dark, gloomy, night, dim, blurry, low quality, distorted, out of focus, duplicate, 4-panel, multi-panel, split screen, grid, collage, text, letters, words, watermarks, signature, border, frame',
          aspect_ratio: aspectRatio,
          mode: 'text-to-image',
          output_format: 'jpeg'
        };

        const res = await client.send(new InvokeModelCommand({
          modelId: model.id,
          contentType: 'application/json',
          accept: 'application/json',
          body: JSON.stringify(payload)
        }));

        const body = JSON.parse(new TextDecoder().decode(res.body));
        const base64 = body.images?.[0];
        if (base64) {
          const timestamp = Date.now();
          const fileName = `asset_${timestamp}_${Math.random().toString(36).substring(2, 7)}.jpg`;
          const dir = path.join(process.cwd(), 'public', 'generated-media');
          if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
          const filePath = path.join(dir, fileName);
          fs.writeFileSync(filePath, Buffer.from(base64, 'base64'));

          return {
            url: `/generated-media/${fileName}`,
            base64,
            engine: model.name
          };
        }
      } catch (err) {
        console.warn(`[Bedrock Image Engine] ${model.id} failed:`, (err as Error).message);
      }
    }
    return null;
  } catch (err) {
    console.warn('[Bedrock Image Engine Master Error]', (err as Error).message);
    return null;
  }
}

// Generate Universal Industry-Calibrated Marketing Post Copy (Dynamic from User Prompt)
function synthesizeMarketingPost(prompt: string, brandName: string, industry: string, domain: string) {
  const cleanPrompt = prompt.trim();
  const cleanBrand = brandName.replace(/[^\w\s]/g, '').trim() || 'Brand';
  const lower = `${cleanPrompt} ${industry} ${cleanBrand}`.toLowerCase();

  const isFestive = /diwali|deepavali|christmas|xmas|new year|newyear|holiday|festival|celebrat|eid|thanksgiving|holi|greeting|wishing|wishes/i.test(lower);
  const isServicesMarketing = !isFestive && /service|solution|capabilit|feature|offering|product|what we do|agency showcase|our platform|marketing of my services|marketing of services|my services|commercial real estate|facility management/i.test(lower);
  const isJewelry = /jewel|gold|diamond|silver|ring|necklace|earring|gem|luxury/i.test(lower);
  const isCleaning = /clean|home service|maid|wash|sanitiz|housekeeping/i.test(lower);
  const isTech = /ai|software|automation|cloud|cyber|tech|saas|developer|code|api/i.test(lower);

  let headline = `Spotless Living Made Effortless`;
  let subheadline = `Experience verified quality and high-velocity fulfillment with ${cleanBrand}.`;
  let badge = 'VERIFIED ENTERPRISE QUALITY';
  let cta = `Visit ${domain.replace(/^https?:\/\//i, '').replace(/\/$/, '')} ↗`;
  let visualPrompt = `Award-winning commercial advertising photography representing ${cleanPrompt}, sharp focus, natural contrast, 8k resolution, cinematic lighting, no text`;
  let featureNodes = ['Verified Quality', 'Fast Execution', '24/7 Support'];

  if (isFestive) {
    const isDiwali = /diwali|deepavali/i.test(lower);
    if (isDiwali) {
      headline = 'Happy Diwali Warmest Wishes';
      subheadline = `May the divine light of Diwali illuminate your journey with boundless prosperity, peace, and enduring success. Warm festive greetings from ${cleanBrand}.`;
      badge = 'SHUBH DEEPAVALI';
      cta = `Happy Diwali from ${cleanBrand} ✦`;
      visualPrompt = `Ultra-luxury modern commercial real estate glass skyscraper lobby and corporate atrium at twilight, decorated for Diwali festival of lights. Magnificent glowing traditional brass diyas and suspended warm hanging lanterns casting radiant golden reflections across mirror-polished dark Italian marble floors. Intricate opulent royal floral rangoli with fresh marigold and lotus petals. Dramatic floor-to-ceiling panoramic glass facade overlooking a sparkling twilight metropolis skyline with soft celebratory golden bokeh. Volumetric warm ambient lighting contrasting with deep blue twilight, architectural digest editorial commercial photography, Hasselblad 85mm f/1.4, razor-sharp focus, 8k resolution, cinematic atmosphere, award-winning advertising visual masterpiece, no text, no watermarks, no split screen`;
      featureNodes = ['Joy & Light', 'Prosperity', 'Enduring Success'];
    } else {
      headline = 'Season of Joy & Light';
      subheadline = `Wishing you and your family abundance, happiness, and continued success during this joyous season. Warm regards from ${cleanBrand}.`;
      badge = 'SEASON OF CELEBRATION';
      cta = `Warm Wishes from ${cleanBrand} ✦`;
      visualPrompt = `Ultra-luxury commercial advertising photography celebrating ${cleanPrompt} for ${cleanBrand}, modern executive architectural ambiance, warm ambient lighting, festive golden celebration bokeh, Hasselblad 85mm f/1.4, razor-sharp 8k resolution, cinematic lighting, no text, no watermarks, no split screen`;
      featureNodes = ['Celebration', 'Prosperity', 'Success'];
    }

    return {
      headline,
      subheadline,
      badge,
      cta,
      visualPrompt,
      caption: `🪔 Wishing you and your loved ones a joyous and prosperous Diwali! May this festival of lights illuminate new opportunities and endless growth. ✨\n\nWarm wishes from the ${cleanBrand} team.`,
      hashtags: ['#HappyDiwali', '#FestivalOfLights', '#DiwaliCelebration', `#${cleanBrand.replace(/\s+/g, '')}`, '#FestiveSeason'],
      postStyle: 'festive_greeting',
      featureNodes,
      services: []
    };
  } else if (isServicesMarketing) {
    headline = 'Transform Your Workspace Operations';
    subheadline = 'End-to-end commercial real estate and facility management solutions that streamline operations, reduce costs, and elevate tenant experiences.';
    badge = 'ENTERPRISE CRE & FM PLATFORM';
    cta = `Explore ${cleanBrand} Solutions ↗`;

    const isLight = /light\s*(theme|mode|bg|background)?|white|clean\s*light|bright|cream|ivory/i.test(lower);
    if (isLight) {
      visualPrompt = 'Bright sunlit minimalist executive office workspace bathed in natural morning sunlight, clean wooden desk with a modern slim tablet displaying glowing business software dashboard analytics and dynamic charts, delicate indoor plant in soft focus, bright airy Scandinavian architectural interior, floor-to-ceiling windows with soft daylight, Hasselblad 85mm f/1.4, razor-sharp focus, 8k resolution, cinematic lighting, photorealistic, no text, no watermarks, no stairs, no staircase, no empty lobbies';
    } else {
      visualPrompt = 'A sleek modern commercial executive command center desk with illuminated monitors showing glowing workspace analytics and floorplan data, ambient cinematic studio lighting, Hasselblad 85mm f/1.4, razor-sharp focus, 8k resolution, no text, no watermarks, no stairs, no staircase, no split screen';
    }
    featureNodes = ['Space Intelligence', 'Facility Operations', 'Lease Lifecycle'];
    const services = [
      { title: 'Lease Management', desc: 'Enterprise validated workflow & tenant contracts' },
      { title: 'Space Planning', desc: 'Dynamic desk allocation & zone utilization' },
      { title: 'Maintenance Tracking', desc: 'Predictive IoT maintenance & auto work orders' },
      { title: 'Tenant Portal', desc: 'Automated real-time operations & SLA tracking' }
    ];

    return {
      headline,
      subheadline,
      badge,
      cta,
      visualPrompt,
      caption: `🏢 Transforming modern commercial spaces and facility operations with ${cleanBrand}.\n\nExplore how our unified platform empowers enterprise operators:\n✓ Space Management: Dynamic desk allocation & heatmaps\n✓ Facility Operations: Predictive IoT maintenance & dispatch\n✓ Lease Administration: End-to-end tenant contracts & billing\n✓ Asset & ESG Analytics: Carbon reporting & telemetry\n\nVisit https://${domain} to schedule an enterprise demo today!`,
      hashtags: [`#${cleanBrand.replace(/\s+/g, '')}`, '#CommercialRealEstate', '#FacilityManagement', '#PropTech', '#EnterpriseSaaS'],
      postStyle: 'services_showcase',
      featureNodes,
      services
    };
  } else if (isJewelry) {
    headline = 'Pure Brilliance Handcrafted Excellence';
    subheadline = `Explore certified fine gold and lab-grown diamonds crafted with timeless distinction.`;
    badge = 'FINE JEWELLERY & LAB DIAMONDS';
    cta = 'Shop Collection ↗';
    visualPrompt = 'Exquisite macro commercial product photography of handcrafted gold jewelry and diamond rings resting on polished dark marble, shimmering reflections, soft dramatic spotlighting, razor-sharp focus, 8k resolution, no text, no watermarks';
    featureNodes = ['Certified Gold', 'Lab Diamonds', 'Lifetime Exchange'];
  } else if (isCleaning) {
    headline = 'Spotless Living Made Effortless';
    subheadline = 'Professional on-demand cleaning services delivered to your doorstep in minutes.';
    badge = 'ON-DEMAND HOME CLEANING';
    cta = 'Book on App ↗';
    visualPrompt = 'A sunlit, spotless modern luxury living room and kitchen, gleaming marble countertops, sparkling clean surfaces, architectural digest photography, 8k resolution, razor-sharp focus, no text';
    featureNodes = ['Deep Sanitization', 'Kitchen & Bath', 'Same-Day Arrival'];
  } else if (isTech) {
    headline = 'Autonomous Growth at Scale';
    subheadline = `Connecting the intelligence behind your business — from first inquiry to autonomous scale.`;
    badge = 'AI AGENTS • BUILT FOR BUSINESS';
    cta = 'Book Consult ↗';
    visualPrompt = 'An ultra-modern minimalist high-tech visual depicting luminous holographic workflows and interconnected glowing crystal nodes on a sleek reflective studio surface, ambient studio lighting, razor-sharp focus, 8k resolution, no text';
    featureNodes = ['Verified SLAs', 'Autonomous Workflows', 'Zero-Trust Defense'];
  } else {
    headline = `${cleanBrand} Precision Delivered`;
    subheadline = `Delivering exceptional standards, verified quality, and seamless experiences.`;
    badge = `${(industry || 'PREMIUM EXCELLENCE').toUpperCase().slice(0, 32)}`;
    cta = `Explore ${cleanBrand} ↗`;
    visualPrompt = `Award-winning commercial advertising photography representing ${cleanPrompt}, cinematic lighting, sharp focus, natural contrast, 8k resolution, no text, no watermarks`;
    featureNodes = ['Verified Quality', 'Fast Delivery', 'Guaranteed Care'];
  }

  return {
    headline,
    subheadline,
    badge,
    cta,
    visualPrompt,
    caption: `✨ ${cleanPrompt}\n\nWhy clients choose ${cleanBrand}:\n✓ ${featureNodes[0]}\n✓ ${featureNodes[1]}\n✓ ${featureNodes[2]}\n\n📲 Tap the link in bio or visit ${domain} to get started today! 👇`,
    hashtags: [`#${cleanBrand.replace(/\s+/g, '')}`, '#QualityFirst', '#ModernExcellence', '#Innovation', '#Verified'],
    postStyle: 'poster_studio',
    featureNodes
  };
}

// Call Google Gemini API for Custom Dynamic Copy
async function callGeminiApi(apiKey: string, prompt: string, brandName: string, industry: string, domain: string) {
  const systemPrompt = `You are a world-class creative director and Instagram marketing copywriter.
Create a high-converting, realistic Instagram Marketing Post for "${brandName}" (Domain: ${domain}, Industry: ${industry || 'Consumer Services'}).
Do not make generic SEO assumptions unless the brand is specifically an SEO software. Write authentic, engaging B2C/B2B copy tailored to their actual industry.

Respond ONLY with a valid JSON object matching this exact structure:
{
  "headline": "Punchy bold graphic headline (4-7 words)",
  "subheadline": "Compelling value proposition (8-14 words)",
  "badge": "Short badge tag (e.g. 10-MIN ARRIVAL, VERIFIED QUALITY, EXCLUSIVE DEAL)",
  "cta": "Actionable call to action (e.g. Book in App 📲, Link in Bio ↗, Claim Offer)",
  "caption": "Full Instagram post caption with emojis, problem-solution hook, bullet points, and CTA",
  "hashtags": ["#Tag1", "#Tag2", "#Tag3", "#Tag4", "#Tag5", "#Tag6", "#Tag7", "#Tag8"]
}`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        parts: [{ text: `${systemPrompt}\n\nUser Request: ${prompt}` }]
      }],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.7
      }
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gemini API error (${response.status}): ${errText}`);
  }

  const json = await response.json();
  const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Empty response from Gemini');
  
  return JSON.parse(text);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      prompt,
      ratio = '1:1',
      brandName = '',
      domain = '',
      industry = 'Autonomous Growth & Technology',
      geminiApiKey = '',
      style = 'auto',
      referenceImage,
      palette = [],
      logoUrl = '',
      voiceTags = [],
      targetMarket = 'India'
    } = body;

    if (!prompt || !prompt.trim()) {
      return NextResponse.json(
        { success: false, error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // 1. Detect if the user entered a live website URL directly inside the prompt
    let resolvedDomain = domain;
    let resolvedBrand = brandName;
    let websiteContext = '';

    const urlMatch = prompt.match(/https?:\/\/[^\s"',)]+/i);
    if (urlMatch) {
      const extractedUrl = urlMatch[0];
      try {
        const parsed = new URL(extractedUrl);
        resolvedDomain = parsed.hostname.replace(/^www\./, '');
        const rawName = resolvedDomain.split('.')[0];
        resolvedBrand = brandName.trim() || (rawName.charAt(0).toUpperCase() + rawName.slice(1));

        const siteRes = await fetch(extractedUrl, {
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
          signal: AbortSignal.timeout(4000)
        });
        if (siteRes.ok) {
          const html = await siteRes.text();
          const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
          const metaDescMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i);
          const pageTitle = titleMatch ? titleMatch[1].trim() : '';
          const metaDesc = metaDescMatch ? metaDescMatch[1].trim() : '';
          websiteContext = `Live Website Scraped for ${extractedUrl}: Title: "${pageTitle}", Meta Description: "${metaDesc}"`;
        }
      } catch (err) {
        console.warn('[Website Prompt Crawl Warning]', (err as Error).message);
      }
    }

    const apiKey = (geminiApiKey || process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || '').trim();

    // 2. Synthesize Realistic Marketing Copy & Visual Prompt
    let postData: {
      headline: string;
      subheadline: string;
      badge: string;
      cta: string;
      caption: string;
      hashtags: string[];
      visualPrompt?: string;
      featureNodes?: string[];
      services?: Array<{ title: string; desc?: string; icon?: string }>;
      trustBadges?: string[];
      motto?: string;
      postStyle?: string;
    };

    let engineUsed = 'FLUX.1 Ultra-HD Neural Engine';

    // Priority 1: AWS Bedrock Claude Sonnet 4.5 / Nova Pro (Active long-term key in .env)
    const bedrockResult = await generateMarketingWithBedrock({
      prompt,
      brandName: resolvedBrand,
      industry,
      domain: resolvedDomain,
      palette,
      referenceImage,
      websiteContext,
      voiceTags
    });
    if (bedrockResult && bedrockResult.headline && bedrockResult.visualPrompt) {
      postData = bedrockResult;
      engineUsed = 'AWS Bedrock Claude Sonnet 4.5 + Stability Ultra';
    } else if (apiKey) {
      try {
        postData = await callGeminiApi(apiKey, prompt, resolvedBrand, industry, resolvedDomain);
        engineUsed = 'Google Gemini + Stability Ultra';
      } catch (geminiErr) {
        postData = synthesizeMarketingPost(prompt, resolvedBrand, industry, resolvedDomain);
      }
    } else {
      postData = synthesizeMarketingPost(prompt, resolvedBrand, industry, resolvedDomain);
    }

    const isFestive = /diwali|deepavali|christmas|xmas|new year|newyear|holiday|festival|celebrat|eid|thanksgiving|holi|greeting|wishing|wishes/i.test(prompt);
    const isServicesMarketing = !isFestive && /service|solution|capabilit|feature|offering|product|what we do|agency showcase|our platform|marketing of my services|marketing of services|my services|commercial real estate|facility management/i.test(prompt);

    if (style === 'pure_image' || style === 'raw') {
      postData.postStyle = 'pure_image';
    } else if (style === 'festive_greeting' || isFestive) {
      postData.postStyle = 'festive_greeting';
    } else if (style === 'services_grid' || style === 'services_showcase' || isServicesMarketing) {
      postData.postStyle = 'services_showcase';
      if (!postData.services || postData.services.length === 0) {
        postData.services = [
          { title: 'Space Management', desc: 'Dynamic desk allocation & zone utilization' },
          { title: 'Facility Operations', desc: 'Predictive IoT maintenance & auto work orders' },
          { title: 'Lease Administration', desc: 'End-to-end contract lifecycle & tenant billing' },
          { title: 'Asset & ESG Analytics', desc: 'Equipment telemetry & carbon reporting' }
        ];
      }
    } else if (style === 'editorial' || style === 'full_bleed' || style === 'poster_editorial') {
      postData.postStyle = 'poster_editorial';
    } else {
      postData.postStyle = postData.postStyle || 'poster_studio';
    }

    // 3. Determine Dimensions Based on Ratio
    let width = 1080;
    let height = 1080;
    if (ratio === '9:16') {
      width = 1080;
      height = 1920;
    } else if (ratio === '16:9') {
      width = 1200;
      height = 675;
    } else if (ratio === '4:5') {
      width = 1080;
      height = 1350;
    }

    // 4. Dynamic Visual Scene Synthesizer (Honors User's Prompt Directly — ZERO Hardcoded Replacements)
    const cleanPrompt = prompt.trim();
    const visualScene = (postData.visualPrompt && postData.visualPrompt.trim().length > 10)
      ? postData.visualPrompt.trim()
      : `Award-winning commercial photography depicting ${cleanPrompt}, sharp focus, natural contrast, 8k resolution, professional advertising photography, no text, no watermarks`;

    const seed = Math.floor(Math.random() * 10000000);
    let rawImageSrc = '';
    let finalImageUrl = '';

    const isLightTheme = Boolean(body.theme === 'light' || /light\s*(theme|mode|bg|background)?|white|clean\s*light|bright|cream|ivory/i.test(prompt));

    // 5. Priority 1: AWS Bedrock Stability AI (Ultra / Core) using AWS Key & Credits
    const bedrockImg = await generateImageWithBedrock(visualScene, ratio);
    if (bedrockImg && bedrockImg.url) {
      rawImageSrc = bedrockImg.url;
      finalImageUrl = bedrockImg.url;
      engineUsed = bedrockImg.engine;

      if (postData.postStyle !== 'pure_image') {
        if (bedrockImg.base64) {
          try {
            const posterUrl = await composeMarketingPoster({
              base64Image: bedrockImg.base64,
              brandName: resolvedBrand,
              domain: resolvedDomain,
              headline: postData.headline,
              subheadline: postData.subheadline,
              badge: postData.badge,
              featureNodes: postData.featureNodes,
              services: postData.services,
              postStyle: postData.postStyle,
              palette,
              cta: postData.cta,
              industry,
              ratio,
              motto: postData.motto,
              trustBadges: postData.trustBadges,
              isLightTheme
            });
            if (posterUrl) {
              finalImageUrl = posterUrl;
              engineUsed = `${bedrockImg.engine} + Universal Studio Poster Engine`;
            }
          } catch (composeErr) {
            console.warn('[Poster Compositing Fallback]', (composeErr as Error).message);
          }
        }
      }
    }

    // 5. Priority 2: OpenAI DALL-E 3 (if OpenAI Key configured)
    if (!finalImageUrl) {
      const openAiKey = (body.openaiApiKey || process.env.OPENAI_API_KEY || '').trim();
      if (openAiKey) {
        try {
          const dalleRes = await fetch('https://api.openai.com/v1/images/generations', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${openAiKey}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              model: 'dall-e-3',
              prompt: visualScene,
              n: 1,
              size: ratio === '9:16' ? '1024x1792' : (ratio === '16:9' ? '1792x1024' : '1024x1024'),
              quality: 'hd'
            })
          });
          if (dalleRes.ok) {
            const dalleData = await dalleRes.json();
            if (dalleData.data?.[0]?.url) {
              rawImageSrc = dalleData.data[0].url;
              finalImageUrl = dalleData.data[0].url;
              engineUsed = 'OpenAI DALL-E 3 HD';
            }
          }
        } catch (dalleErr) {
          console.warn('[DALL-E 3 Fallback]', (dalleErr as Error).message);
        }
      }
    }

    // 6. Priority 3: Neural FLUX.1 Engine Fallback (Universal Poster Engine)
    if (!finalImageUrl) {
      const encodedPrompt = encodeURIComponent(visualScene);
      const fluxUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&seed=${seed}&nologo=true&model=flux`;
      try {
        const fluxRes = await fetch(fluxUrl, { signal: AbortSignal.timeout(12000) });
        if (fluxRes.ok) {
          const fluxBuf = Buffer.from(await fluxRes.arrayBuffer());
          const timestamp = Date.now();
          const fileName = `flux_${timestamp}_${Math.random().toString(36).substring(2, 7)}.jpg`;
          const dir = path.join(process.cwd(), 'public', 'generated-media');
          if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
          const filePath = path.join(dir, fileName);
          fs.writeFileSync(filePath, fluxBuf);

          rawImageSrc = `/generated-media/${fileName}`;
          finalImageUrl = rawImageSrc;
          engineUsed = 'FLUX.1 Neural High-Definition Engine';

          if (postData.postStyle !== 'pure_image') {
            const posterUrl = await composeMarketingPoster({
              base64Image: fluxBuf.toString('base64'),
              brandName: resolvedBrand,
              domain: resolvedDomain,
              headline: postData.headline,
              subheadline: postData.subheadline,
              badge: postData.badge,
              featureNodes: postData.featureNodes,
              services: postData.services,
              postStyle: postData.postStyle,
              palette,
              cta: postData.cta,
              industry,
              ratio,
              motto: postData.motto,
              trustBadges: postData.trustBadges,
              isLightTheme
            });
            if (posterUrl) {
              finalImageUrl = posterUrl;
              engineUsed = 'FLUX.1 Neural Engine + Universal Studio Creative';
            }
          }
        }
      } catch (fluxErr) {
        console.warn('[FLUX Composite Warning]', (fluxErr as Error).message);
      }
      if (!finalImageUrl) {
        finalImageUrl = fluxUrl;
        rawImageSrc = fluxUrl;
        engineUsed = 'FLUX.1 Neural Engine';
      }
    }

    const timestamp = Date.now();

    return NextResponse.json({
      success: true,
      data: {
        id: `post_${timestamp}`,
        prompt: cleanPrompt,
        url: finalImageUrl,
        rawImageUrl: rawImageSrc || finalImageUrl,
        posterUrl: finalImageUrl,
        ratio,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        postType: 'instagram_post',
        headline: postData.headline,
        subheadline: postData.subheadline,
        badge: postData.badge,
        cta: postData.cta,
        caption: postData.caption,
        hashtags: postData.hashtags,
        services: postData.services,
        postStyle: postData.postStyle,
        engine: engineUsed
      }
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: (err as Error).message },
      { status: 500 }
    );
  }
}
