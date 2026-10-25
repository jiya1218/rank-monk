/**
 * Multi-Platform Social Media Post Generator & Calendar Service
 */
import { generateText } from './bedrock.js';

export async function generateSocialPosts({ topic = 'How Autonomous SEO drives 4.8x growth in 2026', brandName = 'Rank Monk', targetUrl = 'https://rankmonk.com' }) {
  const prompt = `Generate 3 distinct, platform-optimized social media posts about: "${topic}".
Brand: ${brandName}
Target Link: ${targetUrl}

Requirements:
1. LinkedIn Post: Long-form thought leadership hook, 4 structured bullet points with quantified value, clear call to action, 3 relevant hashtags.
2. X (Twitter) Post: Punchy hook under 260 characters, bold opinion, concise takeaway, link, 2 hashtags.
3. Instagram Caption: Engaging narrative story, emojis, question to spark comments, call to action ("Link in bio"), 5 high-reach hashtags.

Format output as JSON with keys: "linkedin", "twitter", "instagram".`;

  const res = await generateText({ prompt, maxTokens: 1200, temperature: 0.7 });

  try {
    const cleaned = res.text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleaned);
  } catch {
    return {
      linkedin: `Traditional SEO agencies are charging ₹1.4L/mo for manual keyword spreadsheets.\n\nHere is how autonomous organic growth changes the equation in 2026:\n\n1. AI crawlers diagnose technical debt in seconds.\n2. Deep Bedrock models synthesize publication-ready articles.\n3. AEO engines optimize for ChatGPT Search & Perplexity citations.\n\nThe result? 4.8x traffic surge with zero agency overhead.\n\nExplore how ${brandName} automates this: ${targetUrl}\n\n#AutonomousSEO #GrowthMarketing #SaaS`,
      twitter: `Stop paying ₹1.4L/mo for agency spreadsheets.\n\nAutonomous SEO in 2026 does what 3 content writers and an agency used to do, for a fraction of the cost.\n\nCheck out ${brandName}: ${targetUrl} 🚀 #SEO #AI`,
      instagram: `The future of search isn’t just Google—it’s ChatGPT, Perplexity, and Claude.\n\nIs your brand visible when someone asks an AI for recommendations? Rank Monk makes sure you are the cited authority.\n\nLink in bio to audit your brand today! ✨\n\n#OrganicGrowth #ModernMarketing #TechStartup #SEO2026 #AISEO`
    };
  }
}
