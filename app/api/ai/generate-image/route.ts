import { NextResponse } from 'next/server';
import { BedrockRuntimeClient, ConverseCommand } from '@aws-sdk/client-bedrock-runtime';
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

// Generate Dynamic Marketing Copy & Visual Prompt via AWS Bedrock Nova Pro
async function generateMarketingWithBedrock(prompt: string, brandName: string, industry: string, domain: string) {
  const token = process.env.AWS_BEARER_TOKEN_BEDROCK || process.env.VITE_BEDROCK_API_KEY;
  if (!token) return null;

  try {
    process.env.AWS_BEARER_TOKEN_BEDROCK = token;
    const client = new BedrockRuntimeClient({ region: 'us-east-1' });

    const systemPrompt = `You are a world-class advertising creative director at an elite digital agency.
A client needs an Instagram commercial marketing post for:
- Brand Name: "${brandName}"
- Domain: "${domain}"
- Industry: "${industry}"
- Client's Prompt & Requirements: "${prompt}"

Read the user's prompt carefully.
If they asked to show cleaners, services, staff, domestic help, cleaning equipment, availability across India, products, food, or specific features, the visual scene MUST prominently depict that in action! (NEVER generate an empty room with an empty couch when the client asked for cleaners/services/staff).

Return a raw JSON object (strictly valid JSON, no markdown, no backticks):
{
  "headline": "A punchy, catchy 4-8 word marketing headline tailored to their prompt (e.g. 'Transform Your Space with ${brandName}')",
  "subheadline": "A clear 1-sentence value proposition",
  "badge": "A 2-3 word promotional badge (e.g. 'ALL INDIA SERVICE' or '100% VERIFIED')",
  "cta": "Engaging call to action with emoji (e.g. 'Book with ${brandName} 📲')",
  "visualPrompt": "A highly detailed, photorealistic commercial photography scene prompt for FLUX.1/DALL-E 3 depicting the exact service/subject in action (e.g. 'Award-winning commercial photography of professional, smiling domestic cleaners in neat branded polo uniforms holding cleaning supplies and spray bottles in an impeccably clean, sunlit modern home with gleaming floors and sparkling kitchen, shot on 50mm f/1.4 lens, 8k resolution, commercial advertising photography, sharp focus, natural warm contrast, magazine quality, no text, no watermarks')",
  "caption": "Full engaging Instagram marketing caption with emojis, bullet points of services, and call to action",
  "hashtags": ["#${brandName.replace(/[^\\w]/g, '')}", "#HomeCleaning", "#DeepCleaning", "#DoorstepServices", "#SpotlessHome"]
}`;

    const res = await client.send(new ConverseCommand({
      modelId: 'amazon.nova-pro-v1:0',
      messages: [{ role: 'user', content: [{ text: systemPrompt }] }]
    }));

    const text = res.output?.message?.content?.[0]?.text;
    if (!text) return null;
    const cleaned = text.replace(/```(?:json)?/gi, '').replace(/```/g, '').trim();
    return JSON.parse(cleaned);
  } catch (e) {
    console.warn('[Bedrock Nova Pro Image Prompt Error]', (e as Error).message);
    return null;
  }
}

// Generate Universal Industry-Calibrated Marketing Post Copy
function synthesizeMarketingPost(prompt: string, brandName: string, industry: string, domain: string) {
  const pLower = prompt.toLowerCase();
  const indLower = (industry || '').toLowerCase();
  const cleanBrand = brandName.replace(/[^\w]/g, '');

  // 1. Home Services, Domestic Assistance & Cleaning
  if (
    indLower.includes('clean') || indLower.includes('home') || indLower.includes('maid') || indLower.includes('chore') || indLower.includes('repair') ||
    pLower.includes('clean') || pLower.includes('maid') || pLower.includes('house') || pLower.includes('chores')
  ) {
    const headline = `Spotless Spaces & Expert Cleaning with ${brandName}`;

    const subheadline = `100% background-verified domestic help and professional care at your doorstep.`;
    const badge = `VERIFIED QUALITY`;
    const cta = `Book with ${brandName} 📲`;

    const caption = `✨ Coming home tired after a long day to an endless list of chores?

Meet ${brandName}: Your on-demand trusted household partner! 🧹⚡

What we deliver with dedicated care:
🧹 Thorough sweeping, mopping & surface care
🍽️ Kitchen deep-cleaning & dishwashing
🧺 Fresh laundry folding & linen care
🚿 Sparkling bathroom & sanitization services

✅ 100% background-checked, certified professionals
⏱️ Rapid on-demand scheduling & doorstep arrival
💰 Transparent, affordable pricing with zero hidden fees
⭐ Flexible bookings with no long-term contracts

📲 Tap the link in bio to book your verified professional in under 60 seconds! 👇`;

    const hashtags = [
      `#${cleanBrand}`,
      '#HomeServices',
      '#HouseHelp',
      '#HomeCleaning',
      '#DeepCleaning',
      '#ConvenientLiving',
      '#VerifiedProfessionals',
      '#SpotlessHome',
      '#HouseholdCare'
    ];

    return { headline, subheadline, badge, cta, caption, hashtags };
  }

  // 2. Food, Dining, Cloud Kitchen & Grocery
  if (indLower.includes('food') || indLower.includes('restaurant') || indLower.includes('dining') || pLower.includes('food') || pLower.includes('eat') || pLower.includes('meal')) {
    return {
      headline: `Cravings Satisfied in Minutes`,
      subheadline: `Fresh culinary favorites delivered hyper-fast straight to your door.`,
      badge: `FRESH & FAST`,
      cta: `Order with ${brandName} 🍽️`,
      caption: `🍕 Hungry? Skip the cooking and enjoy your favorite dishes delivered fresh and piping hot!

With ${brandName}, satisfy every craving:
🔥 Top-rated local restaurant partners & signature recipes
⚡ Lightning-fast doorstep delivery to your location
🎁 Exclusive app specials and loyalty rewards

Tap the link in bio to treat yourself right now! 👇`,
      hashtags: [`#${cleanBrand}`, '#FoodDelivery', '#FoodLovers', '#DailyDeals', '#FreshFlavors', '#FoodieLife', '#DeliciousEveryday']
    };
  }

  // 3. E-Commerce, Fashion, Apparel & Retail
  if (indLower.includes('shop') || indLower.includes('store') || indLower.includes('fashion') || indLower.includes('apparel') || indLower.includes('retail') || pLower.includes('shop') || pLower.includes('collection') || pLower.includes('wear')) {
    return {
      headline: `Elevate Your Everyday Style & Living`,
      subheadline: `Curated premium collections delivered with seamless doorstep shopping.`,
      badge: `NEW ARRIVALS`,
      cta: `Shop ${brandName} 🛍️`,
      caption: `✨ Refresh your aesthetic with the latest collection from ${brandName}.

🌿 Crafted with premium quality and meticulous attention to detail
🚚 Fast, reliable shipping straight to your doorstep
🔄 Hassle-free exchanges and satisfaction guarantee

Tap the link in bio to explore the full collection today! 👇`,
      hashtags: [`#${cleanBrand}`, '#StyleInspo', '#NewDrop', '#ShopOnline', '#FashionDaily', '#PremiumQuality', '#TrendAlert']
    };
  }

  // 4. Healthcare, Medical, Dental & Wellness
  if (indLower.includes('health') || indLower.includes('care') || indLower.includes('dental') || indLower.includes('medical') || indLower.includes('clinic') || pLower.includes('health') || pLower.includes('doctor')) {
    return {
      headline: `Compassionate & Clinically Verified Care`,
      subheadline: `Your health, wellness, and peace of mind supported by trusted experts.`,
      badge: `EXPERT CARE`,
      cta: `Book Appointment 🩺`,
      caption: `🩺 Put your health and wellness first with ${brandName}.

✅ Board-certified practitioners & dedicated specialists
🏥 State-of-the-art facilities and gentle patient care
📅 Instant digital appointment scheduling with zero waiting time

Your wellness journey begins today. Tap the link in bio to schedule your consultation! 👇`,
      hashtags: [`#${cleanBrand}`, '#Healthcare', '#WellnessFirst', '#PatientCare', '#HealthyLiving', '#MedicalExcellence', '#TrustedCare']
    };
  }

  // 5. Fitness, Gym & Sports
  if (indLower.includes('fitness') || indLower.includes('gym') || indLower.includes('sport') || indLower.includes('workout') || pLower.includes('fitness') || pLower.includes('training')) {
    return {
      headline: `Unleash Your Peak Performance`,
      subheadline: `Science-backed training, high-energy coaching, and guaranteed results.`,
      badge: `TRANSFORM TODAY`,
      cta: `Join ${brandName} ⚡`,
      caption: `🔥 Stop waiting for next Monday. Transform your strength, endurance, and energy with ${brandName}!

💪 Personalized workout programs tailored to your goals
🏋️ World-class equipment and passionate expert trainers
🎯 Proven track record of measurable client transformations

Tap the link in bio to claim your first trial session today! 👇`,
      hashtags: [`#${cleanBrand}`, '#FitnessMotivation', '#TrainHard', '#HealthyLifestyle', '#PeakPerformance', '#NoExcuses', '#Transformation']
    };
  }

  // 6. Real Estate, Housing & Property
  if (indLower.includes('real estate') || indLower.includes('property') || indLower.includes('housing') || pLower.includes('property') || pLower.includes('home')) {
    return {
      headline: `Find Your Perfect Space & Home`,
      subheadline: `Prime residential and commercial properties curated for your future.`,
      badge: `PRIME LISTING`,
      cta: `Explore with ${brandName} 🏡`,
      caption: `🏡 Discover spaces designed for living, working, and growing with ${brandName}.

📍 Premium locations with world-class connectivity and amenities
📐 Thoughtfully architected floor plans and modern finishes
🔑 Transparent advisory and seamless end-to-end buying experience

Tap the link in bio to view featured listings and schedule a private tour! 👇`,
      hashtags: [`#${cleanBrand}`, '#RealEstate', '#DreamHome', '#PropertySearch', '#LuxuryLiving', '#HomeGoals', '#Architecture']
    };
  }

  // 7. FinTech, Banking & Wealth
  if (indLower.includes('fin') || indLower.includes('pay') || indLower.includes('bank') || pLower.includes('pay') || pLower.includes('finance')) {
    return {
      headline: `Frictionless Financial Freedom`,
      subheadline: `Instant, secure payments and modern financial infrastructure built for you.`,
      badge: `SECURE & FAST`,
      cta: `Get Started with ${brandName} ↗`,
      caption: `💳 Take full control of your transactions and business growth with ${brandName}.

🔒 Bank-grade 256-bit encryption & strict regulatory compliance
⚡ 99.99% gateway success rate for instant settlements
📊 Real-time financial insights and automated reconciliation

Link in bio to elevate your financial operations today! 👇`,
      hashtags: [`#${cleanBrand}`, '#FinTech', '#DigitalPayments', '#SmartFinance', '#StartupGrowth', '#SecurePayments']
    };
  }

  // 8. Universal High-Converting Marketing Post (Any Brand / Any Vertical)
  const cleanKeyword = prompt.replace(/[^\w\s]/gi, '').split(' ').slice(0, 7).join(' ');
  const derivedHeadline = cleanKeyword.length > 5
    ? cleanKeyword.charAt(0).toUpperCase() + cleanKeyword.slice(1)
    : `Experience the Standard in ${industry || 'Excellence'}`;

  return {
    headline: derivedHeadline,
    subheadline: `High-velocity performance, verified customer trust, and seamless delivery with ${brandName}.`,
    badge: `OFFICIAL SPOTLIGHT`,
    cta: `Explore with ${brandName} ↗`,
    caption: `🚀 Ready to elevate your standards with ${brandName}?

Here is why thousands of modern customers and professionals choose us:
✅ Industry-leading quality and verified customer standards
✅ Seamless onboarding with transparent, dependable service
✅ Proven results that save you time and maximize satisfaction

Double-tap if you appreciate quality and speed! 👇

🔗 Tap the link in bio to learn more and get started today.`,
    hashtags: [
      `#${cleanBrand}`,
      '#BrandExcellence',
      '#CustomerFirst',
      '#QualityMatters',
      '#IndustryLeader',
      '#ModernLiving',
      '#DailyGrowth'
    ]
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
      brandName = 'Rank Monk',
      domain = 'rankmonk.in',
      industry = 'Autonomous Growth',
      geminiApiKey = '',
      style = 'commercial photography'
    } = body;

    if (!prompt || !prompt.trim()) {
      return NextResponse.json(
        { success: false, error: 'Prompt is required' },
        { status: 400 }
      );
    }

    const apiKey = (geminiApiKey || process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || '').trim();

    // 1. Synthesize Realistic Marketing Copy & Visual Prompt
    let postData: {
      headline: string;
      subheadline: string;
      badge: string;
      cta: string;
      caption: string;
      hashtags: string[];
      visualPrompt?: string;
    };

    let engineUsed = 'FLUX.1 Ultra-HD Neural Engine';

    // Priority 1: AWS Bedrock Nova Pro (Active long-term key in .env)
    const bedrockResult = await generateMarketingWithBedrock(prompt, brandName, industry, domain);
    if (bedrockResult && bedrockResult.headline && bedrockResult.visualPrompt) {
      postData = bedrockResult;
      engineUsed = 'AWS Bedrock Nova Pro + FLUX.1 Engine';
    } else if (apiKey) {
      try {
        postData = await callGeminiApi(apiKey, prompt, brandName, industry, domain);
        engineUsed = 'Google Gemini + FLUX.1 Engine';
      } catch (geminiErr) {
        postData = synthesizeMarketingPost(prompt, brandName, industry, domain);
      }
    } else {
      postData = synthesizeMarketingPost(prompt, brandName, industry, domain);
    }

    // 2. Determine Dimensions Based on Ratio
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

    // 3. Dynamic Visual Scene Synthesizer (Active Subjects, People, Products & Action)
    const cleanPrompt = prompt.trim();
    const indLower = (industry || '').toLowerCase();
    const pLower = cleanPrompt.toLowerCase();

    let visualScene = postData.visualPrompt || '';

    // If dynamic AI visual prompt wasn't provided, use rich action scene (never an empty room)
    if (!visualScene) {
      if (indLower.includes('clean') || indLower.includes('maid') || indLower.includes('chore') || indLower.includes('home') || pLower.includes('clean') || pLower.includes('maid')) {
        visualScene = 'Award-winning commercial photography of professional, smiling domestic cleaners in neat branded polo uniforms holding cleaning supplies and spray bottles in an impeccably clean, sunlit modern home with gleaming floors and sparkling kitchen, shot on 50mm f/1.4 lens, 8k resolution, commercial advertising photography, sharp focus, natural warm contrast, magazine quality, no text, no watermarks';
      } else if (indLower.includes('food') || indLower.includes('restaurant') || indLower.includes('dining') || pLower.includes('food') || pLower.includes('meal')) {
        visualScene = 'Michelin-star gourmet culinary food photography, exquisite artisanal dish beautifully plated on rustic slate stone, vibrant fresh ingredients, delicate steam rising, soft golden hour lighting, shallow depth of field, Bon Appétit magazine style, photorealistic, 8k resolution, no text';
      } else if (indLower.includes('fitness') || indLower.includes('gym') || indLower.includes('sport') || pLower.includes('workout') || pLower.includes('fitness')) {
        visualScene = 'High-performance commercial athletic photography in a modern luxury boutique gym, dramatic cinematic rim lighting, sleek matte black weights, dynamic energy, Nike campaign aesthetic, shot on Hasselblad, 8k resolution, photorealistic, no text';
      } else if (indLower.includes('fashion') || indLower.includes('apparel') || indLower.includes('cloth') || pLower.includes('fashion')) {
        visualScene = 'High-fashion editorial studio photography, contemporary minimalist setting with soft diffused natural light, stylish model in an elegant tailored outfit, warm earth tones, Vogue editorial styling, 8k resolution, photorealistic, no text';
      } else if (indLower.includes('real estate') || indLower.includes('property') || indLower.includes('housing') || pLower.includes('villa') || pLower.includes('apartment')) {
        visualScene = 'Breathtaking luxury architectural photography of a contemporary minimalist hillside villa with glass walls, warm glowing lights at twilight, serene infinity pool reflecting sunset sky, Architectural Digest cover, 8k resolution, photorealistic, no text';
      } else if (indLower.includes('health') || indLower.includes('medical') || indLower.includes('wellness') || pLower.includes('care')) {
        visualScene = 'Bright modern luxury wellness and clinic interior with compassionate smiling doctors in professional medical attire, light natural oak wood finishes, tranquil and welcoming atmosphere, soft daylight, 8k resolution, photorealistic, crisp focus, no text';
      } else if (indLower.includes('tech') || indLower.includes('saas') || indLower.includes('software') || pLower.includes('software')) {
        visualScene = 'Sleek executive creator workspace with curved ultrawide monitor displaying subtle analytics glow, warm ambient LED studio backlighting, minimalist oak desk, cinematic commercial tech photography, 8k resolution, photorealistic, no text';
      } else {
        visualScene = `Award-winning commercial photography depicting ${cleanPrompt}, vibrant dynamic energy, professional commercial advertising photography, cinematic lighting, shallow depth of field, 8k resolution, sharp focus, magazine quality, no text, no watermark`;
      }
    }

    const seed = Math.floor(Math.random() * 10000000);
    let finalImageUrl = '';

    // 4. Check for OpenAI DALL-E 3 Key (ChatGPT Image Engine)
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
        console.warn('[DALL-E 3 Fallback to Flux]', (dalleErr as Error).message);
      }
    }

    // 5. If DALL-E not configured, use State-of-the-Art FLUX.1 Engine
    if (!finalImageUrl) {
      const encodedPrompt = encodeURIComponent(visualScene);
      finalImageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&seed=${seed}&nologo=true&model=flux&enhance=true`;
      engineUsed = 'FLUX.1 Ultra-HD Neural Engine';
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
