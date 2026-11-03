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

// Generate Dynamic Marketing Copy & Visual Prompt via AWS Bedrock (Claude 3.5 Sonnet / Nova Pro)
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

Read the user's prompt carefully and honor their exact request.
Transform their idea into a high-converting marketing post and generate a detailed, photographic scene prompt for the image generator reflecting EXACTLY what they asked for in their prompt.

Return a raw JSON object (strictly valid JSON, no markdown, no backticks):
{
  "headline": "A punchy, catchy 4-8 word marketing headline tailored directly to their prompt",
  "subheadline": "A clear 1-sentence value proposition",
  "badge": "A 2-3 word promotional badge",
  "cta": "Engaging call to action with emoji",
  "visualPrompt": "A highly detailed, photorealistic visual scene prompt depicting the exact subject matter and actions requested in the user's prompt, commercial advertising photography, sharp focus, natural contrast, 8k resolution, no text, no watermarks",
  "caption": "Full engaging Instagram marketing caption tailored to their prompt with emojis and call to action",
  "hashtags": ["#Tag1", "#Tag2", "#Tag3", "#Tag4", "#Tag5"]
}`;

    let text: string | undefined;

    // Try Claude 3.5 Sonnet first on Bedrock
    try {
      const claudeRes = await client.send(new ConverseCommand({
        modelId: 'us.anthropic.claude-3-5-sonnet-20241022-v2:0',
        messages: [{ role: 'user', content: [{ text: systemPrompt }] }]
      }));
      text = claudeRes.output?.message?.content?.[0]?.text;
    } catch (e1) {
      try {
        const claudeRes2 = await client.send(new ConverseCommand({
          modelId: 'anthropic.claude-3-5-sonnet-20241022-v2:0',
          messages: [{ role: 'user', content: [{ text: systemPrompt }] }]
        }));
        text = claudeRes2.output?.message?.content?.[0]?.text;
      } catch (e2) {
        // Fallback to Amazon Nova Pro if Claude model access is not yet approved
        const novaRes = await client.send(new ConverseCommand({
          modelId: 'amazon.nova-pro-v1:0',
          messages: [{ role: 'user', content: [{ text: systemPrompt }] }]
        }));
        text = novaRes.output?.message?.content?.[0]?.text;
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

    // 3. Dynamic Visual Scene Synthesizer (Honors User's Prompt Directly — ZERO Hardcoded Replacements)
    const cleanPrompt = prompt.trim();
    const visualScene = (postData.visualPrompt && postData.visualPrompt.trim().length > 10)
      ? postData.visualPrompt.trim()
      : `Award-winning commercial photography depicting ${cleanPrompt}, sharp focus, natural contrast, 8k resolution, professional advertising photography, no text, no watermarks`;

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
