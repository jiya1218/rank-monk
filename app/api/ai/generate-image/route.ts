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

    const isB2BTech = /software|ai|automation|cyber|tech|saas|agency|cloud|digital marketing|development|b2b/i.test(`${params.brandName} ${params.industry} ${params.prompt}`);

    const visualGuidance = isB2BTech
      ? `VISUAL STYLE REQUIREMENT (MANDATORY FOR B2B TECH / SOFTWARE / AGENCY):
This is an elite B2B Software / AI / Tech company (like Scalezix or TangentCore).
Modern B2B tech companies DO NOT post stock photos of office workers.
You MUST specify a stunning 3D conceptual visual metaphor tailored to their exact prompt on an ultra-clean, minimalist white or light cream reflective studio surface with soft studio lighting and clean negative space:
- If prompt is about AI Automation / Workflows: 3D glowing blue acrylic domino chain reaction, or floating 3D workflow nodes with glowing connectors.
- If prompt is about Cybersecurity / Defense: 3D glowing sapphire cryptographic data shield with hexagonal lock plates protecting data crystals.
- If prompt is about Website Building / Dev: 3D floating glass wireframe cards and modular UI components assembling into an ultra-modern site.
- If prompt is about Digital Marketing / Growth: 3D ascending neon analytics podium or golden ROI compass.
- If prompt is about Strategy / Outsmarting Competition: 3D translucent glowing sapphire blue glass chess king standing tall over defeated metallic silver pawns.
- If prompt is about other tech topics: Craft a custom, sleek 3D conceptual metaphor matching their exact topic with soft ambient studio lighting.
DO NOT describe stock photos of humans sitting in conference rooms or offices.`
      : `VISUAL STYLE REQUIREMENT (SERVICES / HOME / CONSUMER / COMMERCE):
Specify a breathtaking, ultra-premium commercial advertising hero scene representing their service or product in a pristine, sunlit, modern luxury environment with natural contrast, 8k resolution, razor-sharp focus.
- If prompt is about Cleaning / Home Services: A sunlit, spotless modern luxury living room and kitchen, gleaming marble countertops, sparkling clean surfaces, architectural digest photography, 8k resolution, razor-sharp focus.
- If prompt is about other businesses: Tailor a high-end commercial advertising hero photograph representing the service or product with sharp focus and cinematic lighting.`;

    const systemPrompt = `You are a world-class advertising creative director at an elite digital agency.
A client needs an Instagram commercial marketing post for:
- Brand Name: "${params.brandName}"
- Domain: "${params.domain}"
- Industry: "${params.industry}"
- Client's Prompt & Requirements: "${params.prompt}"
${params.websiteContext ? `- Real Scraped Site Context: "${params.websiteContext}"` : ''}
${params.palette && params.palette.length > 0 ? `- Brand Palette: ${params.palette.join(', ')}` : ''}
${params.voiceTags && params.voiceTags.length > 0 ? `- Brand Voice Tags: ${params.voiceTags.join(', ')}` : ''}
${params.referenceImage ? `- NOTE: The user has attached a brand styling reference image. Study its visual mood, color tones, layout, and composition style, and adopt this visual aesthetic.` : ''}

${visualGuidance}

CRITICAL RULE FOR "visualPrompt":
The visual prompt will be sent directly to an AI image diffusion model to generate the central hero visual ONLY.
Our graphic design layout engine will automatically overlay all typography, headlines, logo, pill badges, and footer.
THEREFORE:
- "visualPrompt" MUST describe ONLY the central visual or photographic subject.
- DO NOT mention text, typography, letters, words, font names, or writing.
- DO NOT mention logos, brand names, or watermarks.
- DO NOT mention split-screen, grid, collage, multiple panels, or 4-box layout.
- DO NOT mention rating stars, banners, buttons, or UI wireframes.
- Ensure the prompt requests: "single seamless composition, razor-sharp focus, 8k resolution, cinematic lighting, no text, no watermarks, no split screen, no collage".

Read the user's prompt carefully and honor their exact request.
Transform their idea into a high-converting marketing post and generate a detailed visual scene prompt for the image generator reflecting their request.

Return a raw JSON object (strictly valid JSON, no markdown, no backticks):
{
  "headline": "A punchy, catchy 3-6 word marketing headline tailored directly to their prompt",
  "subheadline": "A clear 1-2 sentence value proposition tailored to their prompt",
  "badge": "A 2-4 word promotional pill badge (e.g. ON-DEMAND SERVICE, AI AGENTS • BUILT FOR BUSINESS, ZERO-TRUST DEFENSE)",
  "cta": "Engaging call to action with emoji",
  "visualPrompt": "A single coherent visual hero scene strictly adhering to the CRITICAL RULE above, 8k resolution, razor-sharp focus, no text, no split screens",
  "featureNodes": ["3 short 2-3 word benefit nodes tailored to the prompt (e.g. Deep Sanitization, Kitchen & Bath, Same-Day Booking)"],
  "caption": "Full engaging Instagram marketing caption tailored to their prompt with emojis and call to action",
  "hashtags": ["#Tag1", "#Tag2", "#Tag3", "#Tag4", "#Tag5"],
  "postStyle": "marketing_poster"
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
  palette?: string[];
  cta?: string;
  industry?: string;
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

    const badgeText = escapeXml((params.badge || 'VERIFIED STANDARDS').toUpperCase());
    const cleanBrand = escapeXml(params.brandName || 'Brand');
    const cleanDomain = escapeXml(params.domain?.replace(/^https?:\/\//i, '').replace(/\/$/, '') || 'company.com');
    const cleanSub = escapeXml(params.subheadline || `Experience verified quality and high-velocity fulfillment with ${cleanBrand}.`);
    const cleanPart1 = escapeXml(part1);
    const cleanPart2 = escapeXml(part2);

    // Dynamic brand colors from dashboard project palette
    const primaryColor = (params.palette && params.palette.length > 0 && params.palette[0].startsWith('#'))
      ? params.palette[0]
      : '#FF2E74';

    const categoryTag = escapeXml((params.badge || params.industry || 'OFFICIAL SERVICE SPOTLIGHT').toUpperCase());
    const footerText = `${cleanDomain.toUpperCase()}  |  ${escapeXml(params.cta?.replace(/[^\w\s-]/g, '') || 'BOOK INSTANTLY').toUpperCase()}`;

    // Dynamic 3 feature benefit nodes from AI tailored to user's prompt
    const nodes = (params.featureNodes && params.featureNodes.length >= 3)
      ? params.featureNodes
      : ['Verified Quality', 'On-Demand Delivery', 'Guaranteed Satisfaction'];

    const node1 = escapeXml(nodes[0] || 'Verified Quality');
    const node2 = escapeXml(nodes[1] || 'On-Demand Delivery');
    const node3 = escapeXml(nodes[2] || 'Guaranteed Satisfaction');

    const svg = `<svg width="1080" height="1080" viewBox="0 0 1080 1080" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="1080" height="1080" fill="#fcfcfc" />
      <circle cx="540" cy="680" r="480" fill="url(#brand_glow)" opacity="0.14" />

      <!-- Center Hero Visual Render with clean rounded card mask and subtle shadow -->
      <g transform="translate(90, 320)">
        <rect width="900" height="510" rx="28" fill="#e2e8f0" filter="url(#hero_shadow)" />
        <clipPath id="hero_clip">
          <rect width="900" height="510" rx="28" />
        </clipPath>
        <image href="data:image/jpeg;base64,${params.base64Image}" x="-10" y="-140" width="920" height="920" clip-path="url(#hero_clip)" preserveAspectRatio="xMidYMid slice" />
      </g>

      <!-- Brand Logo / Badge Top Left -->
      <g transform="translate(90, 75)">
        <rect width="170" height="48" rx="14" fill="${primaryColor}" />
        <text x="85" y="32" font-family="'Inter', -apple-system, sans-serif" font-weight="900" font-size="22" fill="#ffffff" text-anchor="middle" letter-spacing="0.5">${cleanBrand.toLowerCase()}</text>
        <circle cx="190" cy="24" r="5" fill="#10b981" />
      </g>

      <!-- Pill Badge Top Right -->
      <g transform="translate(680, 75)">
        <rect width="310" height="44" rx="12" fill="#f8fafc" stroke="#e2e8f0" stroke-width="1.5" />
        <text x="155" y="28" font-family="'Inter', sans-serif" font-weight="800" font-size="11.5" fill="${primaryColor}" text-anchor="middle" letter-spacing="1.2">${badgeText}</text>
      </g>

      <!-- Editorial Typography Headline -->
      <g transform="translate(90, 180)">
        <text font-family="'Inter', sans-serif" font-weight="800" font-size="13.5" fill="#64748b" letter-spacing="2.5">${categoryTag}</text>
        <text y="54" font-family="'Inter', sans-serif" font-weight="900" font-size="52" fill="#0f172a" letter-spacing="-1.5">${cleanPart1} <tspan fill="${primaryColor}">${cleanPart2}</tspan></text>
      </g>

      <!-- Subheadline -->
      <g transform="translate(90, 275)">
        <text font-family="'Inter', sans-serif" font-weight="500" font-size="18" fill="#475569">${cleanSub.slice(0, 80)}</text>
        ${cleanSub.length > 80 ? `<text y="26" font-family="'Inter', sans-serif" font-weight="500" font-size="18" fill="#475569">${cleanSub.slice(80, 160)}</text>` : ''}
      </g>

      <!-- 3 Feature Benefit Node Pills -->
      <g transform="translate(90, 855)">
        <rect width="280" height="52" rx="16" fill="#ffffff" stroke="#f1f5f9" stroke-width="1.5" filter="url(#pill_shadow)" />
        <circle cx="28" cy="26" r="8" fill="${primaryColor}" />
        <text x="48" y="32" font-family="'Inter', sans-serif" font-weight="700" font-size="13" fill="#0f172a">${node1}</text>
      </g>

      <g transform="translate(400, 855)">
        <rect width="280" height="52" rx="16" fill="#ffffff" stroke="#f1f5f9" stroke-width="1.5" filter="url(#pill_shadow)" />
        <circle cx="28" cy="26" r="8" fill="${primaryColor}" />
        <text x="48" y="32" font-family="'Inter', sans-serif" font-weight="700" font-size="13" fill="#0f172a">${node2}</text>
      </g>

      <g transform="translate(710, 855)">
        <rect width="280" height="52" rx="16" fill="#ffffff" stroke="#f1f5f9" stroke-width="1.5" filter="url(#pill_shadow)" />
        <circle cx="28" cy="26" r="8" fill="#10b981" />
        <text x="48" y="32" font-family="'Inter', sans-serif" font-weight="700" font-size="13" fill="#0f172a">${node3}</text>
      </g>

      <!-- Footer Bar -->
      <g transform="translate(0, 990)">
        <rect width="1080" height="90" fill="#ffffff" stroke="#e2e8f0" stroke-width="1" />
        <text x="540" y="52" font-family="'Inter', sans-serif" font-weight="800" font-size="14.5" fill="#64748b" text-anchor="middle" letter-spacing="3">${footerText}</text>
      </g>

      <defs>
        <radialGradient id="brand_glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="${primaryColor}" stop-opacity="0.8" />
          <stop offset="100%" stop-color="${primaryColor}" stop-opacity="0" />
        </radialGradient>
        <filter id="hero_shadow" x="-8" y="-4" width="940" height="550" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="#0f172a" flood-opacity="0.10" />
        </filter>
        <filter id="pill_shadow" x="-4" y="-2" width="300" height="70" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="6" stdDeviation="8" flood-color="#0f172a" flood-opacity="0.07" />
        </filter>
      </defs>
    </svg>`;

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
  const cleanBrand = brandName.replace(/[^\w]/g, '');

  const words = cleanPrompt.replace(/[^\w\s]/gi, '').split(/\s+/).filter(Boolean);
  const headline = words.slice(0, 6).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') || `Discover ${brandName}`;
  const subheadline = `Experience premium, verified ${industry || 'solutions'} with ${brandName}.`;
  const badge = `OFFICIAL SPOTLIGHT`;
  const cta = `Explore with ${brandName} ↗`;

  const caption = `✨ ${cleanPrompt}

Why modern clients choose ${brandName}:
✅ High-velocity fulfillment and verified service standards
✅ Seamless customer onboarding with total transparency
✅ Backed by certified experts and dedicated quality control

📲 Tap the link in bio to learn more and get started today! 👇`;

  const hashtags = [
    `#${cleanBrand}`,
    `#${(industry || 'Services').replace(/[^\w]/g, '')}`,
    '#QualityFirst',
    '#CustomerExcellence',
    '#VerifiedSolutions'
  ];

  return {
    headline,
    subheadline,
    badge,
    cta,
    visualPrompt: cleanPrompt,
    caption,
    hashtags
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
        if (resolvedBrand === 'Rank Monk' || resolvedBrand === 'Scalezix') {
          const rawName = resolvedDomain.split('.')[0];
          resolvedBrand = rawName.charAt(0).toUpperCase() + rawName.slice(1);
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

      // Universal Publication-Ready Instagram Marketing Poster Composer
      if (bedrockImg.base64 && (ratio === '1:1' || !ratio)) {
        try {
          const posterUrl = await composeMarketingPoster({
            base64Image: bedrockImg.base64,
            brandName: resolvedBrand,
            domain: resolvedDomain,
            headline: postData.headline,
            subheadline: postData.subheadline,
            badge: postData.badge,
            featureNodes: postData.featureNodes,
            palette,
            cta: postData.cta,
            industry
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
            palette,
            cta: postData.cta,
            industry
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
