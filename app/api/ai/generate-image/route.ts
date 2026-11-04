import { NextResponse } from 'next/server';
import { BedrockRuntimeClient, ConverseCommand, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import fs from 'fs';
import path from 'path';

// Clean XML / text characters
function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
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

    const isMultiService = /service|services|promotion|marketing|capabilities|agency|solutions|turn ideas|intelligent solutions/i.test(`${params.prompt} ${params.industry}`);

    const systemPrompt = `You are an elite creative director and commercial advertising designer at a top-tier creative studio.
A client needs a high-converting, publication-grade commercial Instagram promotional poster for:
- Brand Name: "${params.brandName}"
- Domain: "${params.domain}"
- Industry: "${params.industry}"
- Client's Prompt / Campaign Brief: "${params.prompt}"
${params.websiteContext ? `- Real Scraped Site Context: "${params.websiteContext}"` : ''}
${params.palette && params.palette.length > 0 ? `- Brand Palette: ${params.palette.join(', ')}` : ''}
${params.voiceTags && params.voiceTags.length > 0 ? `- Brand Voice Tags: ${params.voiceTags.join(', ')}` : ''}
${params.referenceImage ? `- NOTE: The user has attached a brand styling reference image. Study its visual mood, lighting, color tones, layout, and composition style, and reflect this visual aesthetic.` : ''}

POSTER LAYOUT SELECTION:
${isMultiService ? `- This is a COMPANY SERVICES / AGENCY MARKETING PROMOTION.
  Set "postStyle": "agency_showcase".
  Provide:
  - "headline": "Turn Ideas into Intelligent Solutions" (or punchy 4-6 word equivalent tailored to the brand)
  - "subheadline": "Your Partner in AI-Powered Innovation & Digital Growth" (or 1-line client pitch)
  - "motto": "Innovate • Build • Grow" (or 3-word motto)
  - "cta": "Build with ${params.brandName} →"
  - "services": Provide 6 distinct service items tailored to the company, each with title and icon, e.g.:
    [
      { "title": "Agentic AI Development", "icon": "🧠" },
      { "title": "AI & Machine Learning", "icon": "⚙️" },
      { "title": "Data Science & AI", "icon": "📊" },
      { "title": "Cyber Security & AI", "icon": "🛡️" },
      { "title": "Full Stack Dev & AI", "icon": "💻" },
      { "title": "Digital Marketing", "icon": "📢" }
    ]
  - "featureNodes": ["Scale Smarter", "Automate Better", "Grow Faster"] (3 floating tags)
  - "trustBadges": ["Cutting-Edge Tech", "Expert Team", "Client-Centric", "Proven Impact"] (4 trust cards)
  - "visualPrompt": A sleek 3D modern silver open laptop displaying glowing interface elements on a minimalist reflective desk in a high-tech studio with soft ambient purple and blue lighting, 8k resolution, razor-sharp focus, clean negative space, no text.` : `- This is a SINGLE PRODUCT / SERVICE / CAMPAIGN.
  Set "postStyle": "poster_studio".`}

CREATIVE & VISUAL DIRECTION FOR "visualPrompt":
- Describe a stunning, single photographic or 3D visual subject matching the client's topic.
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
  "services": [
    { "title": "Service 1", "icon": "🧠" },
    { "title": "Service 2", "icon": "⚙️" },
    { "title": "Service 3", "icon": "📊" },
    { "title": "Service 4", "icon": "🛡️" },
    { "title": "Service 5", "icon": "💻" },
    { "title": "Service 6", "icon": "📢" }
  ],
  "trustBadges": ["Cutting-Edge Tech", "Expert Team", "Client-Centric", "Proven Impact"],
  "caption": "Full engaging Instagram marketing caption tailored to their prompt with emojis, problem-solution hook, benefits, and call to action",
  "hashtags": ["#Tag1", "#Tag2", "#Tag3", "#Tag4", "#Tag5"],
  "postStyle": "${isMultiService ? 'agency_showcase' : 'poster_studio'}"
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
}): Promise<string | null> {
  try {
    const sharp = (await import('sharp')).default;

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

    // Layout Selection: Agency Showcase (Image 2 style) vs Studio Poster vs Full-Bleed Editorial
    const isEditorial = params.postStyle === 'poster_editorial';
    const isShowcase = params.postStyle === 'agency_showcase' || (Boolean(params.services && params.services.length >= 4) && !isEditorial);
    const isPortrait = params.ratio === '4:5' || params.ratio === 'portrait';
    const cWidth = 1080;
    const cHeight = isPortrait ? 1350 : 1080;

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

    if (isShowcase) {
      // 100% Matching Enterprise Agency Showcase Poster (Exact layout of Image 2)
      const defaultServices = [
        { title: 'Agentic AI Development', icon: '🧠' },
        { title: 'AI & Machine Learning', icon: '⚙️' },
        { title: 'Data Science & AI', icon: '📊' },
        { title: 'Cyber Security & AI', icon: '🛡️' },
        { title: 'Full Stack Dev & AI', icon: '💻' },
        { title: 'Digital Marketing', icon: '📢' }
      ];
      const servicesList = (params.services && params.services.length >= 4)
        ? params.services.slice(0, 6)
        : defaultServices;

      const trustList = (params.trustBadges && params.trustBadges.length >= 4)
        ? params.trustBadges.slice(0, 4)
        : ['Cutting-Edge Tech', 'Expert Team', 'Client-Centric', 'Proven Impact'];
      const trustIcons = ['🚀', '👥', '🤝', '🏆'];

      const brandPurple = cleanBrand.toLowerCase().includes('scalezix') ? '#7c3aed' : primaryColor;
      const mottoText = escapeXml(params.motto || 'Innovate • Build • Grow');
      const showcaseCardH = isPortrait ? 530 : 425;
      const trustY = isPortrait ? 885 : 715;
      const footerY = isPortrait ? 985 : 810;

      svg = `<svg width="${cWidth}" height="${cHeight}" viewBox="0 0 ${cWidth} ${cHeight}" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="card_shadow" x="-5%" y="-5%" width="110%" height="115%" filterUnits="userSpaceOnUse">
            <feDropShadow dx="0" dy="16" stdDeviation="24" flood-color="#0f172a" flood-opacity="0.08" />
          </filter>
          <filter id="pill_shadow" x="-8%" y="-15%" width="116%" height="135%" filterUnits="userSpaceOnUse">
            <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#0f172a" flood-opacity="0.08" />
          </filter>
          <clipPath id="hero_clip_agency">
            <rect width="525" height="${showcaseCardH}" rx="26" />
          </clipPath>
        </defs>

        <!-- Light Theme Background Canvas with soft gradient curves -->
        <rect width="${cWidth}" height="${cHeight}" fill="#f8f9ff" />
        <path d="M0,0 C400,120 750,50 ${cWidth},260 L${cWidth},0 Z" fill="#ede9fe" opacity="0.45" />
        <circle cx="950" cy="420" r="320" fill="${brandPurple}" opacity="0.06" />
        <circle cx="150" cy="${cHeight - 150}" r="320" fill="${accentColor}" opacity="0.04" />

        <!-- 1. Header: Brand Identity & Motto -->
        <g transform="translate(70, 50)">
          <!-- Brand Logo Icon -->
          <rect width="44" height="44" rx="13" fill="${brandPurple}" />
          <text x="22" y="29" font-family="'Inter', sans-serif" font-weight="900" font-size="22" fill="#ffffff" text-anchor="middle">${cleanBrand.charAt(0)}</text>
          
          <!-- Brand Name -->
          <text x="56" y="22" font-family="'Inter', sans-serif" font-weight="900" font-size="20" fill="#0f172a">${cleanBrand}</text>
          <text x="56" y="38" font-family="'Inter', sans-serif" font-weight="700" font-size="11" fill="#64748b" letter-spacing="1">Ventures LLP</text>
        </g>

        <!-- Right Motto -->
        <g transform="translate(1010, 72)">
          <text font-family="'Inter', sans-serif" font-weight="700" font-size="13" fill="#64748b" text-anchor="end" letter-spacing="1.5">${mottoText}</text>
        </g>

        <!-- 2. Main Title & Subtitle -->
        <g transform="translate(70, 138)">
          <text font-family="'Inter', -apple-system, sans-serif" font-weight="900" font-size="44" fill="#0f172a" letter-spacing="-1">${cleanPart1}</text>
          <text y="50" font-family="'Inter', -apple-system, sans-serif" font-weight="900" font-size="44" fill="${brandPurple}" letter-spacing="-1">${cleanPart2}</text>
          <text y="88" font-family="'Inter', sans-serif" font-weight="600" font-size="15" fill="#64748b" letter-spacing="-0.2">${cleanSub.slice(0, 80)}</text>
        </g>

        <!-- 3. Left Column: 6 Services List -->
        <g transform="translate(70, 255)">
          ${servicesList.map((svc, i) => `
          <g transform="translate(0, ${i * 72})">
            <rect width="380" height="64" rx="16" fill="#ffffff" stroke="#e2e8f0" stroke-width="1.2" filter="url(#pill_shadow)" />
            <rect x="12" y="12" width="40" height="40" rx="10" fill="#f5f3ff" />
            <text x="32" y="37" font-size="18" text-anchor="middle">${svc.icon || '✦'}</text>
            <text x="64" y="37" font-family="'Inter', sans-serif" font-weight="800" font-size="13.5" fill="#0f172a">${escapeXml(svc.title)}</text>
          </g>`).join('')}
        </g>

        <!-- 4. Right Column: 3D Laptop / Tech Visual Card with 3 Floating Tags -->
        <g transform="translate(485, 255)">
          <rect width="525" height="${showcaseCardH}" rx="26" fill="#0f172a" filter="url(#card_shadow)" />
          <g clip-path="url(#hero_clip_agency)">
            <image href="data:image/jpeg;base64,${params.base64Image}" x="0" y="0" width="525" height="${showcaseCardH}" preserveAspectRatio="xMidYMid slice" />
          </g>
          <rect width="525" height="${showcaseCardH}" rx="26" fill="none" stroke="#e2e8f0" stroke-width="1.5" />

          <!-- Floating Badge 1: Top Right -->
          <g transform="translate(330, -18)" filter="url(#pill_shadow)">
            <rect width="180" height="42" rx="12" fill="#ffffff" stroke="#e2e8f0" stroke-width="1.2" />
            <text x="90" y="26" font-family="'Inter', sans-serif" font-weight="800" font-size="12" fill="${brandPurple}" text-anchor="middle">📈 ${nodes[0] || 'Scale Smarter'}</text>
          </g>

          <!-- Floating Badge 2: Mid Left -->
          <g transform="translate(-25, ${showcaseCardH * 0.45})" filter="url(#pill_shadow)">
            <rect width="175" height="42" rx="12" fill="#ffffff" stroke="#e2e8f0" stroke-width="1.2" />
            <text x="87" y="26" font-family="'Inter', sans-serif" font-weight="800" font-size="12" fill="#0f172a" text-anchor="middle">✦ ${nodes[1] || 'Automate Better'}</text>
          </g>

          <!-- Floating Badge 3: Bottom Right -->
          <g transform="translate(355, ${showcaseCardH * 0.85})" filter="url(#pill_shadow)">
            <rect width="160" height="42" rx="12" fill="#ffffff" stroke="#e2e8f0" stroke-width="1.2" />
            <text x="80" y="26" font-family="'Inter', sans-serif" font-weight="800" font-size="12" fill="#10b981" text-anchor="middle">⚡ ${nodes[2] || 'Grow Faster'}</text>
          </g>
        </g>

        <!-- 5. Bottom Trust Grid (4 Columns) -->
        <g transform="translate(70, ${trustY})">
          ${trustList.map((badge, i) => `
          <g transform="translate(${i * 242}, 0)">
            <rect width="230" height="64" rx="16" fill="#ffffff" stroke="#e2e8f0" stroke-width="1.2" filter="url(#pill_shadow)" />
            <text x="32" y="37" font-size="17" text-anchor="middle">${trustIcons[i] || '✦'}</text>
            <text x="56" y="37" font-family="'Inter', sans-serif" font-weight="800" font-size="12" fill="#0f172a">${escapeXml(badge)}</text>
          </g>`).join('')}
        </g>

        <!-- 6. Bottom Footer Bar -->
        <g transform="translate(70, ${footerY})">
          <!-- Left CTA Pill Button -->
          <rect width="260" height="52" rx="26" fill="#0f172a" filter="url(#pill_shadow)" />
          <text x="130" y="32" font-family="'Inter', sans-serif" font-weight="800" font-size="13.5" fill="#ffffff" text-anchor="middle">${cleanCta || `Build with ${cleanBrand} →`}</text>

          <!-- Right Contact Links -->
          <text x="940" y="32" font-family="'Inter', sans-serif" font-weight="700" font-size="13" fill="#64748b" text-anchor="end">www.${cleanDomain}   |   contact@${cleanDomain}</text>
        </g>
      </svg>`;
    } else if (isEditorial) {
      // Full-Bleed Editorial Commercial Poster (Square or Portrait with dark gradient scrim)
      const scrimY = isPortrait ? 580 : 420;
      const scrimH = isPortrait ? 770 : 660;
      const contentY = isPortrait ? 870 : 710;
      const chipsY = isPortrait ? 1050 : 890;
      const footerY = isPortrait ? 1220 : 990;

      svg = `<svg width="${cWidth}" height="${cHeight}" viewBox="0 0 ${cWidth} ${cHeight}" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="scrim_bottom" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#0f172a" stop-opacity="0" />
            <stop offset="45%" stop-color="#0f172a" stop-opacity="0.65" />
            <stop offset="100%" stop-color="#0f172a" stop-opacity="0.96" />
          </linearGradient>
          <linearGradient id="scrim_top" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#000000" stop-opacity="0.6" />
            <stop offset="100%" stop-color="#000000" stop-opacity="0" />
          </linearGradient>
        </defs>

        <!-- Full-Bleed Background Image -->
        <image href="data:image/jpeg;base64,${params.base64Image}" x="0" y="0" width="${cWidth}" height="${cHeight}" preserveAspectRatio="xMidYMid slice" />

        <!-- Scrim Overlays -->
        <rect width="${cWidth}" height="240" fill="url(#scrim_top)" />
        <rect y="${scrimY}" width="${cWidth}" height="${scrimH}" fill="url(#scrim_bottom)" />

        <!-- Top Header: Brand Mark & Category Tag -->
        <g transform="translate(70, 60)">
          <rect width="180" height="46" rx="14" fill="rgba(255, 255, 255, 0.92)" />
          <circle cx="28" cy="23" r="6" fill="${primaryColor}" />
          <text x="44" y="29" font-family="'Inter', sans-serif" font-weight="900" font-size="18" fill="#0f172a">${cleanBrand}</text>
        </g>

        <g transform="translate(680, 60)">
          <rect width="330" height="46" rx="14" fill="rgba(15, 23, 42, 0.65)" stroke="rgba(255, 255, 255, 0.2)" stroke-width="1.2" />
          <text x="165" y="28" font-family="'Inter', sans-serif" font-weight="800" font-size="11" fill="#ffffff" text-anchor="middle" letter-spacing="1.5">${badgeText}</text>
        </g>

        <!-- Bottom Content Area -->
        <g transform="translate(70, ${contentY})">
          <!-- Headline -->
          <text font-family="'Inter', sans-serif" font-weight="900" font-size="${headlineFontSize}" fill="#ffffff" letter-spacing="-1">
            ${isMultiLineHeadline
              ? `${cleanPart1}<tspan x="0" dy="48" fill="${accentColor}">${cleanPart2}</tspan>`
              : `${cleanPart1} <tspan fill="${accentColor}">${cleanPart2}</tspan>`}
          </text>
          
          <!-- Subheadline -->
          <text y="${isMultiLineHeadline ? 95 : 48}" font-family="'Inter', sans-serif" font-weight="500" font-size="17" fill="#cbd5e1" letter-spacing="-0.2">
            ${cleanSub.slice(0, 95)}
          </text>
          ${cleanSub.length > 95 ? `<text y="${isMultiLineHeadline ? 120 : 72}" font-family="'Inter', sans-serif" font-weight="500" font-size="17" fill="#cbd5e1">${cleanSub.slice(95, 180)}</text>` : ''}
        </g>

        <!-- 3 Feature Chips -->
        <g transform="translate(70, ${chipsY})">
          <rect width="280" height="48" rx="14" fill="rgba(255, 255, 255, 0.15)" stroke="rgba(255, 255, 255, 0.3)" stroke-width="1" />
          <circle cx="24" cy="24" r="5" fill="#10b981" />
          <text x="42" y="30" font-family="'Inter', sans-serif" font-weight="700" font-size="13" fill="#ffffff">${nodes[0]}</text>
        </g>

        <g transform="translate(370, ${chipsY})">
          <rect width="280" height="48" rx="14" fill="rgba(255, 255, 255, 0.15)" stroke="rgba(255, 255, 255, 0.3)" stroke-width="1" />
          <circle cx="24" cy="24" r="5" fill="${accentColor}" />
          <text x="42" y="30" font-family="'Inter', sans-serif" font-weight="700" font-size="13" fill="#ffffff">${nodes[1]}</text>
        </g>

        <g transform="translate(670, ${chipsY})">
          <rect width="340" height="48" rx="14" fill="rgba(255, 255, 255, 0.15)" stroke="rgba(255, 255, 255, 0.3)" stroke-width="1" />
          <circle cx="24" cy="24" r="5" fill="${primaryColor}" />
          <text x="42" y="30" font-family="'Inter', sans-serif" font-weight="700" font-size="13" fill="#ffffff">${nodes[2]}</text>
        </g>

        <!-- Bottom Footer Bar -->
        <g transform="translate(70, ${footerY})">
          <line x1="0" y1="0" x2="940" y2="0" stroke="rgba(255, 255, 255, 0.2)" stroke-width="1" />
          <text x="470" y="44" font-family="'Inter', sans-serif" font-weight="800" font-size="14" fill="#cbd5e1" text-anchor="middle" letter-spacing="3.5">${footerText}</text>
        </g>
      </svg>`;
    } else {
      // Signature Studio Poster (Exact Snabbit Award-Winning High-Converting Layout)
      const pillsY = isPortrait ? (heroTopOffset + heroH - 35) : 775;
      const footerY = isPortrait ? 1235 : 970;

      svg = `<svg width="${cWidth}" height="${cHeight}" viewBox="0 0 ${cWidth} ${cHeight}" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="card_shadow" x="-5%" y="-5%" width="110%" height="115%" filterUnits="userSpaceOnUse">
            <feDropShadow dx="0" dy="16" stdDeviation="24" flood-color="#0f172a" flood-opacity="0.08" />
          </filter>
          <filter id="pill_shadow" x="-8%" y="-15%" width="116%" height="135%" filterUnits="userSpaceOnUse">
            <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#0f172a" flood-opacity="0.07" />
          </filter>
          <clipPath id="hero_clip">
            <rect width="940" height="${heroH}" rx="30" />
          </clipPath>
        </defs>

        <!-- Clean Background Canvas with subtle ambient color glow -->
        <rect width="${cWidth}" height="${cHeight}" fill="#ffffff" />
        <circle cx="960" cy="120" r="340" fill="${primaryColor}" opacity="0.04" />
        <circle cx="120" cy="${cHeight - 100}" r="360" fill="${accentColor}" opacity="0.03" />

        <!-- 1. Top Header: Brand Badge & Category Tag -->
        <g transform="translate(70, 58)">
          <!-- Left Brand Pill (Filled with Brand Color / Dark Base) -->
          <rect width="170" height="46" rx="14" fill="${primaryColor}" />
          <text x="85" y="29" font-family="'Inter', sans-serif" font-weight="900" font-size="19" fill="#ffffff" text-anchor="middle" letter-spacing="-0.3">${cleanBrand}</text>
          <!-- Status dot -->
          <circle cx="195" cy="23" r="6" fill="#10b981" />
        </g>

        <g transform="translate(670, 58)">
          <!-- Right Category Pill -->
          <rect width="340" height="46" rx="14" fill="#fdf2f8" stroke="#fbcfe8" stroke-width="1.2" />
          <text x="170" y="28" font-family="'Inter', sans-serif" font-weight="800" font-size="11" fill="${accentColor}" text-anchor="middle" letter-spacing="1.5">${badgeText}</text>
        </g>

        <!-- 2. Typography: Headline & Subheadline -->
        <g transform="translate(70, 160)">
          <text font-family="'Inter', -apple-system, sans-serif" font-weight="900" font-size="${headlineFontSize}" fill="${darkColor}" letter-spacing="-1.2">
            ${isMultiLineHeadline
              ? `${cleanPart1}<tspan x="0" dy="48" fill="${accentColor}">${cleanPart2}</tspan>`
              : `${cleanPart1} <tspan fill="${accentColor}">${cleanPart2}</tspan>`}
          </text>
          
          <text y="${isMultiLineHeadline ? 95 : 46}" font-family="'Inter', -apple-system, sans-serif" font-weight="500" font-size="16.5" fill="#475569" letter-spacing="-0.2">
            ${cleanSub.slice(0, 105)}
          </text>
          ${cleanSub.length > 105 ? `<text y="${isMultiLineHeadline ? 119 : 70}" font-family="'Inter', sans-serif" font-weight="500" font-size="16.5" fill="#475569">${cleanSub.slice(105, 195)}</text>` : ''}
        </g>

        <!-- 3. Center Hero Visual Card (940x${heroH}, rx=30) -->
        <g transform="translate(70, ${heroTopOffset})" filter="url(#card_shadow)">
          <rect width="940" height="${heroH}" rx="30" fill="#f1f5f9" />
          <g clip-path="url(#hero_clip)">
            <image href="data:image/jpeg;base64,${params.base64Image}" x="0" y="0" width="940" height="${heroH}" preserveAspectRatio="xMidYMid slice" />
          </g>
          <rect width="940" height="${heroH}" rx="30" fill="none" stroke="#e2e8f0" stroke-width="1.5" />
        </g>

        <!-- 4. Three Floating Feature Pills (Overlapping the Bottom Edge of Hero Card) -->
        <g transform="translate(70, ${pillsY})" filter="url(#pill_shadow)">
          <!-- Feature Pill 1 -->
          <g transform="translate(0, 0)">
            <rect width="296" height="54" rx="18" fill="#ffffff" stroke="#e2e8f0" stroke-width="1.5" />
            <circle cx="30" cy="27" r="7" fill="${accentColor}" />
            <text x="50" y="33" font-family="'Inter', sans-serif" font-weight="700" font-size="14" fill="${darkColor}">${nodes[0]}</text>
          </g>

          <!-- Feature Pill 2 -->
          <g transform="translate(322, 0)">
            <rect width="296" height="54" rx="18" fill="#ffffff" stroke="#e2e8f0" stroke-width="1.5" />
            <circle cx="30" cy="27" r="7" fill="${primaryColor}" />
            <text x="50" y="33" font-family="'Inter', sans-serif" font-weight="700" font-size="14" fill="${darkColor}">${nodes[1]}</text>
          </g>

          <!-- Feature Pill 3 -->
          <g transform="translate(644, 0)">
            <rect width="296" height="54" rx="18" fill="#ffffff" stroke="#e2e8f0" stroke-width="1.5" />
            <circle cx="30" cy="27" r="7" fill="#10b981" />
            <text x="50" y="33" font-family="'Inter', sans-serif" font-weight="700" font-size="14" fill="${darkColor}">${nodes[2]}</text>
          </g>
        </g>

        <!-- 5. Footer Divider & Domain Tag -->
        <g transform="translate(70, ${footerY})">
          <line x1="0" y1="0" x2="940" y2="0" stroke="#f1f5f9" stroke-width="1.5" />
          <text x="470" y="52" font-family="'Inter', sans-serif" font-weight="800" font-size="13.5" fill="#64748b" text-anchor="middle" letter-spacing="3.5">${footerText}</text>
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
          negative_prompt: 'blurry, low quality, distorted, out of focus, duplicate, 4-panel, multi-panel, split screen, grid, collage, text, letters, words, watermarks, signature, border, frame',
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

  const isJewelry = /jewel|gold|diamond|silver|ring|necklace|earring|gem|luxury/i.test(lower);
  const isCleaning = /clean|home service|maid|wash|sanitiz|housekeeping/i.test(lower);
  const isTech = /ai|software|automation|cloud|cyber|tech|saas|developer|code|api/i.test(lower);

  let headline = `Spotless Living Made Effortless`;
  let subheadline = `Experience verified quality and high-velocity fulfillment with ${cleanBrand}.`;
  let badge = 'VERIFIED ENTERPRISE QUALITY';
  let cta = `Visit ${domain.replace(/^https?:\/\//i, '').replace(/\/$/, '')} ↗`;
  let visualPrompt = `Award-winning commercial advertising photography representing ${cleanPrompt}, sharp focus, natural contrast, 8k resolution, cinematic lighting, no text`;
  let featureNodes = ['Verified Quality', 'Fast Execution', '24/7 Support'];

  if (isJewelry) {
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
      brandName = 'Scalezix',
      domain = 'scalezix.com',
      industry = 'Autonomous Growth',
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
        resolvedBrand = rawName.charAt(0).toUpperCase() + rawName.slice(1);
        if (resolvedDomain.toLowerCase().includes('scalezix')) {
          resolvedBrand = 'Scalezix';
        }

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

    if (style === 'editorial' || style === 'full_bleed' || style === 'poster_editorial') {
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
    let finalImageUrl = '';

    // 5. Priority 1: AWS Bedrock Stability AI (Ultra / Core) using AWS Key & Credits
    const bedrockImg = await generateImageWithBedrock(visualScene, ratio);
    if (bedrockImg && bedrockImg.url) {
      finalImageUrl = bedrockImg.url;
      engineUsed = bedrockImg.engine;

      // Universal Publication-Ready Instagram Marketing Poster Composer (Supports Square 1:1 and Portrait 4:5)
      const isPosterEligible = ratio === '1:1' || ratio === '4:5' || ratio === 'portrait' || !ratio;
      if (bedrockImg.base64 && isPosterEligible) {
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
            trustBadges: postData.trustBadges
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
            trustBadges: postData.trustBadges
          });
          if (posterUrl) {
            finalImageUrl = posterUrl;
            engineUsed = 'FLUX.1 Neural Engine + Universal Studio Poster Engine';
          }
        }
      } catch (fluxErr) {
        console.warn('[FLUX Composite Warning]', (fluxErr as Error).message);
      }
      if (!finalImageUrl) {
        finalImageUrl = fluxUrl;
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
        rawImageUrl: finalImageUrl,
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
