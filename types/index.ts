export type PlanTier = 'seed' | 'grow' | 'scale';

export interface PlanLimits {
  name: string;
  priceMonthly: number;
  priceAnnual: number;
  blogs: number;
  images: number;
  social: number;
  autoFixes: number;
  pages: number;
}

export const PLAN_CONFIG: Record<PlanTier, PlanLimits> = {
  seed: {
    name: 'Seed',
    priceMonthly: 10000,
    priceAnnual: 96000,
    blogs: 8,
    images: 15,
    social: 30,
    autoFixes: 5,
    pages: 200
  },
  grow: {
    name: 'Grow',
    priceMonthly: 20000,
    priceAnnual: 192000,
    blogs: 30,
    images: 50,
    social: 999999,
    autoFixes: 7,
    pages: 300
  },
  scale: {
    name: 'Scale',
    priceMonthly: 40000,
    priceAnnual: 384000,
    blogs: 100,
    images: 999999,
    social: 999999,
    autoFixes: 10,
    pages: 500
  }
};

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: 'owner' | 'member' | 'admin';
  plan: PlanTier;
  paid: boolean;
  domain?: string;
  createdAt: string;
}

export interface CrawledPage {
  url: string;
  title: string;
  metaDesc: string;
  h1: string;
  wordCount: number;
  statusCode: number;
  schemaTypes?: string[];
  crawledAt: string;
}

export interface Article {
  id: string;
  title: string;
  keyword: string;
  country: string;
  wordCount: number;
  status: 'Published' | 'Draft' | 'Queued';
  date: string;
  engines: string[];
  content: string;
}

export interface MediaAsset {
  id: string;
  prompt: string;
  url: string;
  ratio: '1:1' | '16:9' | '9:16';
  date: string;
  headline?: string;
  subheadline?: string;
  caption?: string;
  hashtags?: string[];
  cta?: string;
  badge?: string;
  postType?: 'instagram_post' | 'banner' | 'visual';
}

export interface ProjectWorkspace {
  id: string;
  name: string;
  domain: string;
  website: string;
  industry: string;
  businessCategory: string;
  targetAudience: string;
  summary: string;
  logoUrl?: string;
  faviconUrl?: string;
  palette: string[];
  competitors: string[];
  gscConnected: boolean;
  aeoScore: number;
  seoScore: number;
  crawledPages: CrawledPage[];
  articles: Article[];
  mediaAssets: MediaAsset[];
  voiceSliders: {
    professionalCasual: number;
    friendlyFormal: number;
    boldSubtle: number;
    premiumAccessible: number;
    simpleComplex: number;
  };
  voiceTags: string[];
}

