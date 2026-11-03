import { NextResponse } from 'next/server';
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
    const headline = prompt.length > 5 && !prompt.includes('Launch')
      ? prompt.slice(0, 50)
      : `Spotless Spaces with Verified Ease`;

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

    // 1. Synthesize Realistic Marketing Copy
    let postData: {
      headline: string;
      subheadline: string;
      badge: string;
      cta: string;
      caption: string;
      hashtags: string[];
    };

    let engineUsed = 'Neural Image Synthesizer';

    if (apiKey) {
      try {
        postData = await callGeminiApi(apiKey, prompt, brandName, industry, domain);
        engineUsed = 'Google Gemini 1.5 + Neural Engine';
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

    // 3. Construct Industry-Calibrated Visual Prompt for Neural Generation
    const cleanPrompt = prompt.trim();
    const indLower = (industry || '').toLowerCase();
    const brandLower = (brandName || '').toLowerCase();

    let visualAesthetic = 'high-end commercial photography, 8k resolution, cinematic lighting, photorealistic, sharp focus, professional color grading, magazine editorial';

    if (indLower.includes('clean') || indLower.includes('maid') || indLower.includes('chore')) {
      visualAesthetic = 'sparkling clean luxury modern apartment interior, gleaming marble and polished floors, bright warm natural morning sunlight, tidy minimalist aesthetic, 8k resolution, commercial photography';
    } else if (indLower.includes('food') || indLower.includes('restaurant') || indLower.includes('dining')) {
      visualAesthetic = 'gourmet culinary presentation, delicious fresh food dish, rustic table setup, shallow depth of field, warm cinematic lighting, commercial food advertising';
    } else if (indLower.includes('fashion') || indLower.includes('apparel') || indLower.includes('shoes') || indLower.includes('cloth')) {
      visualAesthetic = 'editorial high-fashion studio photography, contemporary lifestyle, sharp aesthetic styling, soft ambient lighting, Vogue quality, 8k';
    } else if (indLower.includes('fitness') || indLower.includes('gym') || indLower.includes('sport')) {
      visualAesthetic = 'dynamic athletic training in modern boutique gym, dramatic lighting, peak physical performance, high intensity, 8k';
    } else if (indLower.includes('real estate') || indLower.includes('property') || indLower.includes('housing')) {
      visualAesthetic = 'architectural digest luxury residential property, sun-drenched modern living room, landscaped balcony view, high ceilings, 8k';
    } else if (indLower.includes('health') || indLower.includes('medical') || indLower.includes('dental')) {
      visualAesthetic = 'bright modern wellness and clinical environment, pristine clean aesthetic, compassionate professional care, natural daylight, 8k';
    } else if (indLower.includes('tech') || indLower.includes('saas') || indLower.includes('software')) {
      visualAesthetic = 'sleek futuristic minimalist creative workspace, dual monitors, soft warm ambient studio lighting, executive tech office aesthetic, 8k';
    }

    const fullVisualPrompt = `${cleanPrompt}, ${visualAesthetic}`;
    const seed = Math.floor(Math.random() * 10000000);
    const encodedPrompt = encodeURIComponent(fullVisualPrompt);

    // 4. Ultra-HD Neural Image Stream (Valid JPEG/PNG URL accessible to Instagram & Web)
    const neuralImageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&seed=${seed}&nologo=true`;

    const timestamp = Date.now();

    return NextResponse.json({
      success: true,
      data: {
        id: `post_${timestamp}`,
        prompt: cleanPrompt,
        url: neuralImageUrl,
        rawImageUrl: neuralImageUrl,
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
