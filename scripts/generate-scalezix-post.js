import { generateText, generateBedrockImage } from '../server/services/bedrock.js';
import { generateImageWithGemini } from '../server/services/gemini.js';
import { env } from '../server/config/env.js';
import fs from 'fs';
import path from 'path';

async function generateScalezixCampaign() {
  console.log('[Scalezix Generator] Connecting to AI Engine via AWS Bedrock & Gemini...');

  const prompt = `You are an elite B2B Growth Marketer and Chief Marketing Officer.
Create an exceptional, viral, high-converting social media marketing campaign for:
Company: Scalezix
Location: Ahmedabad, Gujarat, India
Core Services:
1. End-to-end AI Automations (n8n, Make, custom LLM agents, CRM auto-sync, WhatsApp AI bots, autonomous lead qualification)
2. Performance Digital Marketing (Meta & Google Ads, hyper-targeted ROAS scaling, creative testing)
3. Full-Stack Growth Engines (SEO, GEO/AEO optimization for ChatGPT & Perplexity, funnel architecture)

Generate 3 complete marketing assets ready to publish immediately:

---
### 1. LINKEDIN THOUGHT LEADERSHIP POST (High-Value Founder Hook)
- Unconventional, scroll-stopping hook tailored for Indian founders, MSMEs, D2C brands, and tech leaders in Ahmedabad & across India.
- The brutal comparison: Paying ₹1.5L/month to traditional agencies who take 2 weeks to deliver spreadsheets vs. deploying autonomous AI workflows that run 24/7.
- Quantified breakdown of real business impact:
  * 70% reduction in manual follow-up time.
  * 3.2x increase in qualified lead capture via WhatsApp & CRM AI.
  * Instant ROAS lift on ad spend through automated audience segmentation.
- Proud Ahmedabad anchor: Built in Ahmedabad for fast-growing global & Indian enterprises.
- Clear, confident Call to Action: DM or book a free 30-minute AI Automation Audit.
- 5 targeted hashtags.

---
### 2. INSTAGRAM / FACEBOOK CAROUSEL (Slide-by-Slide Copy + Visual Layout)
- Slide 1: High-contrast Hook Cover
- Slide 2: The Bottleneck (Manual follow-ups, leaking leads, wasted ad budget)
- Slide 3: The Scalezix Automation Engine (How leads get qualified, nurtured, and closed automatically)
- Slide 4: The 3 Core Pillars (AI Automations, Digital Marketing, Revenue Architecture)
- Slide 5: The Ahmedabad Advantage & Proof
- Slide 6: Strong Call to Action
- Complete Instagram Caption with emojis, structure, and 15 targeted hashtags.

---
### 3. X / TWITTER PUNCHY THREAD (5 Tweets)
- Tweet 1: Contrarian hook about how most businesses burn cash on digital marketing because their backend has zero automation.
- Tweet 2: The 3 automated workflows every Ahmedabad business needs in 2026.
- Tweet 3: Lead nurturing without human delay.
- Tweet 4: Why marketing + AI automation must be unified under one roof.
- Tweet 5: Scalezix intro & link/DM CTA.
`;

  try {
    const textRes = await generateText({ prompt, maxTokens: 2500, temperature: 0.7 });
    console.log('\n================================================================');
    console.log('         SCALEZIX AI MARKETING CAMPAIGN GENERATED              ');
    console.log('================================================================\n');
    console.log(textRes.text);

    // Save to an output file for permanent reference
    fs.writeFileSync('scalezix-marketing-post.md', textRes.text, 'utf8');
    console.log('\n[Saved Campaign Document]: scalezix-marketing-post.md');

  } catch(err) {
    console.error('[Error generating campaign text]:', err);
  }

  // Visual Asset Generation via Media Studio
  try {
    console.log('\n[Media Studio] Generating Visual Asset for Scalezix...');
    const imagePrompt = 'Futuristic high-tech AI automation and digital marketing dashboard for Scalezix in Ahmedabad, holographic network nodes, glowing golden revenue graphs, obsidian and amber luxury palette, 8k resolution, minimalist architectural render';
    
    let imgResult = null;
    if (env.GEMINI_API_KEY) {
      try {
        imgResult = await generateImageWithGemini({
          prompt: imagePrompt,
          style: 'zen minimalist tech aesthetic, luxury gold and deep slate navy, architectural lighting',
          aspectRatio: '1:1',
          apiKey: env.GEMINI_API_KEY
        });
      } catch(e) {
        console.log('[Media Studio] Gemini note:', e.message);
      }
    }

    if (!imgResult) {
      try {
        imgResult = await generateBedrockImage({
          prompt: imagePrompt,
          style: 'zen minimalist tech aesthetic, luxury gold and deep slate navy, architectural lighting',
          aspectRatio: '1:1'
        });
      } catch(e) {
        console.log('[Media Studio] Bedrock note:', e.message);
      }
    }

    if (imgResult && imgResult.imageUrl) {
      console.log('\n[Media Studio Visual Asset Generated]:', imgResult.imageUrl.slice(0, 100) + '...');
      if (imgResult.imageUrl.startsWith('data:image')) {
        const base64Data = imgResult.imageUrl.replace(/^data:image\/\w+;base64,/, '');
        fs.writeFileSync('assets/scalezix-generated-banner.png', Buffer.from(base64Data, 'base64'));
        console.log('Saved visual asset to assets/scalezix-generated-banner.png');
      }
    }
  } catch(err) {
    console.log('[Media Studio Note]:', err.message);
  }
}

generateScalezixCampaign();
