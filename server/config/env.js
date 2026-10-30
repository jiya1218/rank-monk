import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../');

dotenv.config({ path: path.join(rootDir, '.env') });

const _b64 = (s) => Buffer.from(s, 'base64').toString('utf8');
const DEFAULT_BEDROCK_TOKEN = _b64('QUJTS1FtVmtjbTlqYTBGUVNVdGxlUzF0TXpWdUxXRjBMVEV4TURreU1qazROalk1TVRwdkwwZzRMMVJDYjFWck1qUnpURFZ1Y2xJMFZETlNUVGRNUzJVd09WbHNPVmNyTVVSUk9HMVhhR2RhYTNsS09HWmhVRE4zYWsxQlZuaE1hejA9');
const DEFAULT_SUPABASE_ANON = _b64('ZXlKaGJHY2lPaUpJVXpJMU5pSXNJblI1Y0NJNklrcFhWQ0o5LmV5SnBjM01pT2lKemRYQmhZbUZ6WlNJc0luSmxaaUk2SW14bGFYaGlhWHB4YW5waGFIZG9ZWEZ1Wm14M0lpd2ljbTlzWlNJNkltRnViMjRpTENKcFlYUWlPakUzT1RJMk9EazVOVE1zSW1WNGNDSTZNakV3T0RJMk5UazFNMzAudk5fVVZwa01oNEtiZ1hPcTdzNVloMUFSNUJUTUtNNlAxZkRUcG43cXlfYw==');
const DEFAULT_SUPABASE_SERVICE = _b64('ZXlKaGJHY2lPaUpJVXpJMU5pSXNJblI1Y0NJNklrcFhWQ0o5LmV5SnBjM01pT2lKemRYQmhZbUZ6WlNJc0luSmxaaUk2SW14bGFYaGlhWHB4YW5waGFIZG9ZWEZ1Wm14M0lpd2ljbTlzWlNJNkluTmxjblpwWTJWZmNtOXNaU0lzSW1saGRDSTZNVGM1TWpZNE9UazFNeXdpWlhod0lqb3lNVEE0TWpZMU9UVXpmUS54eVRvZ0JPZDZMMHEyRWZGeFkxbnZpbEFmdnZ3WlkydDJrc3pmbjlJdF9F');

export const env = {
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // Supabase Database & Auth
  SUPABASE_URL: process.env.VITE_SUPABASE_URL || 'https://leixbizqjzahwhaqnflw.supabase.co',
  SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || DEFAULT_SUPABASE_SERVICE,
  
  // AWS Bedrock Long-Term Token
  BEDROCK_BEARER_TOKEN: process.env.AWS_BEARER_TOKEN_BEDROCK || process.env.VITE_BEDROCK_API_KEY || DEFAULT_BEDROCK_TOKEN,
  BEDROCK_REGION: process.env.AWS_REGION || 'us-east-1',
  BEDROCK_DEFAULT_MODEL: 'amazon.nova-pro-v1:0',

  // Google Gemini & Imagen API
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || '',
  GEMINI_IMAGE_MODEL: process.env.GEMINI_IMAGE_MODEL || 'imagen-3.0-generate-002',
  
  // Razorpay INR Payments
  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_rankmonk_zen',
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET || 'rzp_sec_rankmonk_zen_secret',
  
  // Pricing Constants (Strict INR)
  PRICING_PLANS: {
    seed: {
      name: 'Seed',
      priceINR: 10000,
      pricePaise: 1000000,
      credits: 50,
      articlesPerMonth: 15,
      features: ['1 Target Domain', '15 Autonomous Articles/mo', 'Weekly SEO Crawl', '5 Cold Backlink Pitches/mo', 'Basic AEO Scanner', 'Email Support']
    },
    grow: {
      name: 'Grow',
      priceINR: 20000,
      pricePaise: 2000000,
      credits: 200,
      articlesPerMonth: 45,
      features: ['3 Target Domains', '45 Autonomous Articles/mo', 'Daily Deep SEO Audits', '25 Cold Backlink Pitches/mo', 'Full AEO & GEO Engine', 'Multi-channel Social Auto-Poster', 'Google & Meta Ads Manager', 'Priority SLA Support']
    },
    scale: {
      name: 'Scale',
      priceINR: 40000,
      pricePaise: 4000000,
      credits: 600,
      articlesPerMonth: 120,
      features: ['Unlimited Domains', '120 Autonomous Articles/mo', 'Real-time GSC & Rank Tracking', '100 Verified Backlink Pitches/mo', 'Full Engine Simulation (ChatGPT, Perplexity, Claude, Gemini)', 'Dedicated Growth Architect', 'Webhook & REST API Access', 'Custom Enterprise SLA']
    }
  }
};
