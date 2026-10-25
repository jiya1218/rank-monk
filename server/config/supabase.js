import { createClient } from '@supabase/supabase-js';
import { env } from './env.js';

let supabaseAdmin = null;
let supabaseClient = null;

try {
  if (env.SUPABASE_URL && (env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_ANON_KEY)) {
    supabaseAdmin = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_ANON_KEY, {
      auth: { persistSession: false }
    });
    supabaseClient = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY || env.SUPABASE_SERVICE_ROLE_KEY);
    console.log('[Supabase] Initialized client successfully with URL:', env.SUPABASE_URL);
  } else {
    console.warn('[Supabase] Missing SUPABASE_URL or keys, running with resilient local store fallback');
  }
} catch (err) {
  console.error('[Supabase] Initialization error:', err.message);
}

// Resilient memory store fallback if tables or connections are not reachable
const memoryStore = {
  projects: [
    {
      id: 'proj_default_01',
      name: 'Rank Monk Production',
      domain: 'rankmonk.com',
      brand_name: 'Rank Monk',
      brand_tagline: 'The Zen OS for Autonomous Organic Growth',
      brand_description: 'Autonomous AI engine for SEO, AEO, EEAT, and GEO search visibility.',
      brand_logo_url: '/assets/rank-monk-logo-horizontal.png',
      target_audience: 'Modern SaaS, Agencies, and E-commerce brands',
      tone: 'Zen, Authoritative, Clear',
      created_at: new Date().toISOString()
    }
  ],
  blogs: [
    {
      id: 'art_demo_01',
      title: 'How to Optimize for ChatGPT Search & Perplexity in 2026: The Complete AEO Playbook',
      slug: 'how-to-optimize-for-chatgpt-search-perplexity-2026',
      keyword: 'ChatGPT Search optimization',
      word_count: 1450,
      seo_score: 96,
      reading_time: '6 min read',
      status: 'published',
      published_at: new Date(Date.now() - 86400000 * 2).toISOString(),
      content: '# How to Optimize for ChatGPT Search & Perplexity in 2026\n\nAI-native search engines evaluate content differently than traditional Google crawlers...'
    },
    {
      id: 'art_demo_02',
      title: 'The Death of Keyword Stuffing: How EEAT Signals Drive Rank 1 in 2026',
      slug: 'death-of-keyword-stuffing-eeat-signals-2026',
      keyword: 'EEAT SEO signals 2026',
      word_count: 1820,
      seo_score: 98,
      reading_time: '8 min read',
      status: 'published',
      published_at: new Date(Date.now() - 86400000 * 5).toISOString(),
      content: '# The Death of Keyword Stuffing: How EEAT Signals Drive Rank 1\n\nGoogle\'s helpful content algorithms now prioritize verified first-hand expertise...'
    }
  ],
  backlinks: [
    {
      id: 'bl_01',
      domain: 'techcrunch.com',
      relevance_score: 95,
      domain_authority: 92,
      status: 'Pitched',
      anchor_text: 'autonomous SEO platform',
      target_url: 'https://rankmonk.com/features',
      contact_email: 'editorial@techcrunch.com',
      created_at: new Date().toISOString()
    },
    {
      id: 'bl_02',
      domain: 'searchengineland.com',
      relevance_score: 98,
      domain_authority: 89,
      status: 'Link Placed',
      anchor_text: 'AEO and GEO optimization tools',
      target_url: 'https://rankmonk.com/engines',
      contact_email: 'contributions@searchengineland.com',
      created_at: new Date().toISOString()
    },
    {
      id: 'bl_03',
      domain: 'hubspot.com',
      relevance_score: 91,
      domain_authority: 93,
      status: 'Identified',
      anchor_text: 'organic growth software',
      target_url: 'https://rankmonk.com',
      contact_email: 'inbound@hubspot.com',
      created_at: new Date().toISOString()
    }
  ],
  notifications: [
    {
      id: 'notif_01',
      title: 'SEO Audit Completed',
      message: 'Autonomous crawl completed with Health Score 94/100. 3 items resolved.',
      type: 'success',
      read: false,
      timestamp: '10m ago'
    },
    {
      id: 'notif_02',
      title: 'New AEO Citation Detected',
      message: 'Perplexity AI referenced Rank Monk in "Top Autonomous SEO Tools 2026".',
      type: 'info',
      read: false,
      timestamp: '1h ago'
    },
    {
      id: 'notif_03',
      title: 'High-Authority Backlink Placed',
      message: 'SearchEngineLand verified link placement for anchor "AEO and GEO optimization tools".',
      type: 'success',
      read: false,
      timestamp: '3h ago'
    }
  ],
  ads: [
    {
      id: 'ad_01',
      platform: 'Google Search Ads',
      headline: 'Rank Monk™ - The Zen OS for Organic Growth',
      description: 'Stop paying ₹1.4L/mo for manual SEO. Scale organic traffic autonomously with AI in 2026.',
      status: 'Active',
      budget: '₹12,000 / mo',
      spend: '₹4,850',
      impressions: '18,420',
      clicks: '984',
      ctr: '5.34%',
      cpc: '₹4.92'
    },
    {
      id: 'ad_02',
      platform: 'Meta Ads (Instagram & FB)',
      headline: 'Autonomous SEO is Here. 4.8x Traffic in 90 Days.',
      description: 'Rank Monk automates keyword research, blog publishing, backlink outreach & AEO citations.',
      status: 'Active',
      budget: '₹8,000 / mo',
      spend: '₹3,210',
      impressions: '26,190',
      clicks: '1,240',
      ctr: '4.73%',
      cpc: '₹2.58'
    }
  ],
  subscription: {
    plan: 'grow',
    status: 'active',
    inr_price: 20000,
    renew_date: '2026-11-26',
    credits_total: 200,
    credits_used: 48
  }
};

export { supabaseAdmin, supabaseClient, memoryStore };
