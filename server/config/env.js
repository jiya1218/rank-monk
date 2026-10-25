import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../');

dotenv.config({ path: path.join(rootDir, '.env') });

export const env = {
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // Supabase Database & Auth
  SUPABASE_URL: process.env.VITE_SUPABASE_URL || 'https://leixbizqjzahwhaqnflw.supabase.co',
  SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY || '',
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '',
  
  // AWS Bedrock Long-Term Token
  BEDROCK_BEARER_TOKEN: process.env.AWS_BEARER_TOKEN_BEDROCK || process.env.VITE_BEDROCK_API_KEY || '',
  BEDROCK_REGION: process.env.AWS_REGION || 'us-east-1',
  BEDROCK_DEFAULT_MODEL: 'amazon.nova-pro-v1:0',
  
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
