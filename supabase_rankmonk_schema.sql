-- =========================================================================
-- RANK MONK OS - COMPLETE DATABASE SCHEMA (SUPABASE POSTGRESQL)
-- Project: https://leixbizqjzahwhaqnflw.supabase.co
-- Paste this entire script into your Supabase Dashboard > SQL Editor > New query,
-- and click "Run" (Ctrl+Enter) to provision all tables, indexes, and RLS policies.
-- =========================================================================

-- Enable required extensions
create extension if not exists pgcrypto;

-- 1. Projects Table
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid default auth.uid() references auth.users(id) on delete cascade,
  name text not null,
  domain text not null,
  brand_name text,
  brand_tagline text,
  brand_description text,
  brand_logo_url text,
  og_image_url text,
  favicon_url text,
  industry text,
  business_category text,
  target_audience text,
  voice_sliders jsonb default '{"formal":55, "humor":25, "boldness":60, "technical":50, "brevity":65}'::jsonb,
  competitors text[] default '{}'::text[],
  gsc_connected boolean not null default false,
  gsc_site_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. User Subscriptions Table
create table if not exists public.user_subscriptions (
  user_id uuid primary key references auth.users(id) on delete cascade,
  plan text not null default 'grow', -- seed, grow, scale, enterprise
  status text not null default 'active',
  created_at timestamptz not null default now()
);

-- 3. Workspace Credits Table
create table if not exists public.workspace_credits (
  user_id uuid primary key references auth.users(id) on delete cascade,
  total_credits integer not null default 500,
  used_credits integer not null default 0,
  locked_credits integer not null default 0,
  created_at timestamptz not null default now()
);

-- 4. Credit Transactions Table
create table if not exists public.credit_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null, -- usage, refund, manual_adjustment, reset
  amount integer not null,
  status text not null default 'completed', -- completed, locked, refunded
  content_id uuid,
  created_at timestamptz not null default now()
);

-- 5. Content Items Table (Blog Articles & AI Content)
create table if not exists public.content_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  main_keyword text not null,
  secondary_keywords text[] not null default '{}'::text[],
  word_count_target integer not null default 1400,
  tone text not null default 'Professional',
  target_country text not null default 'United States',
  h1 text not null,
  h2_list text[] not null default '{}'::text[],
  h3_list text[] not null default '{}'::text[],
  internal_links text[] not null default '{}'::text[],
  generate_image boolean not null default false,
  featured_image_url text,
  status text not null default 'draft', -- draft, generating, completed, published, failed
  sections_completed integer not null default 0,
  total_sections integer default 5,
  current_section text,
  generated_title text,
  meta_description text,
  generated_content text,
  details text,
  detail text,
  scheduled_date timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 6. Crawl Runs Table
create table if not exists public.crawl_runs (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  status text not null default 'pending', -- pending, running, done, failed
  pages_found integer not null default 0,
  pages_crawled integer not null default 0,
  error text,
  created_at timestamptz not null default now(),
  finished_at timestamptz
);

-- 7. Crawled Pages Table (Real Headless Crawl Store)
create table if not exists public.crawled_pages (
  project_id uuid not null references public.projects(id) on delete cascade,
  url text not null,
  title text,
  meta_desc text,
  h1 text,
  word_count integer default 0,
  status_code integer default 200,
  source text default 'crawler',
  has_faq_schema boolean not null default false,
  has_howto boolean not null default false,
  schema_types text[] not null default '{}'::text[],
  crawled_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  primary key (project_id, url)
);

-- 8. Prompt Scan Runs Table (AEO / LLM Radar Runs)
create table if not exists public.prompt_scan_runs (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  brand_name text not null,
  models text[] not null default '{"chatgpt", "gemini", "perplexity", "claude"}'::text[],
  status text not null default 'pending', -- pending, running, done, failed
  total_prompts integer not null default 0,
  completed integer not null default 0,
  brand_mentioned_count integer not null default 0,
  error text,
  created_at timestamptz not null default now(),
  finished_at timestamptz
);

-- 9. AEO Prompts Table
create table if not exists public.aeo_prompts (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  prompt text not null,
  topic text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- 10. Prompt Scan Results Table
create table if not exists public.prompt_scan_results (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  prompt_id uuid references public.aeo_prompts(id) on delete cascade,
  prompt_text text not null,
  model text not null,
  response_text text,
  brand_mentioned boolean not null default false,
  mention_position integer,
  mention_context text,
  mention_sentiment text default 'neutral',
  mention_count integer not null default 0,
  competitors_mentioned text[] not null default '{}'::text[],
  status text not null default 'success',
  error_message text,
  latency_ms integer not null default 0,
  scanned_at timestamptz not null default now()
);

-- 11. AEO Citations Table
create table if not exists public.aeo_citations (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  provider text not null,
  query text not null,
  cited_title text not null,
  position integer,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- 12. AEO Scan Schedules Table
create table if not exists public.aeo_scan_schedules (
  project_id uuid primary key references public.projects(id) on delete cascade,
  week_day_utc integer not null default 1,
  hour_utc integer not null default 0,
  is_enabled boolean not null default true,
  last_run_at timestamptz,
  models text[] not null default '{"chatgpt", "gemini", "perplexity", "claude"}'::text[]
);

-- 13. AEO Analyses Table (Aggregate Brand Visibility)
create table if not exists public.aeo_analyses (
  project_id uuid primary key references public.projects(id) on delete cascade,
  overall_score integer not null default 0,
  website text,
  brand_name text,
  providers jsonb not null default '[]'::jsonb,
  category_scores jsonb not null default '[]'::jsonb,
  recommendations jsonb not null default '[]'::jsonb,
  prompt_suggestions jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

-- 14. AI Referrals Table
create table if not exists public.ai_referrals (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  source text not null,
  landing_path text not null,
  sessions integer not null default 0,
  conversions integer not null default 0,
  event_date date not null default current_date
);

-- 15. Media Assets Table
create table if not exists public.media_assets (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  caption text,
  hashtags text,
  image_url text not null,
  created_at timestamptz not null default now()
);

-- 16. Workspace Integrations Table
create table if not exists public.workspace_integrations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  platform text not null,
  credentials jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- 17. Social Accounts Table
create table if not exists public.social_accounts (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  platform text not null,
  handle text not null,
  access_token text,
  meta_ig_user_id text,
  meta_page_id text,
  connection_status text not null default 'connected',
  token_expires_at timestamptz,
  platform_account_id text,
  last_publish_at timestamptz,
  last_publish_status text,
  last_publish_error text,
  created_at timestamptz not null default now()
);

-- 18. Social Posts Table
create table if not exists public.social_posts (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  platform text not null,
  caption text,
  hashtags text[] not null default '{}'::text[],
  image_url text,
  status text not null default 'draft', -- draft, scheduled, published, failed
  scheduled_at timestamptz,
  published_at timestamptz,
  publish_error text,
  last_publish_attempt_at timestamptz,
  publish_attempts integer not null default 0,
  external_post_id text,
  publish_response jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- 19. Query Fanouts Table
create table if not exists public.query_fanouts (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  root_query text not null,
  branch_query text not null,
  engine text not null,
  intent text not null,
  score numeric not null default 0.5,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create unique index if not exists query_fanouts_unique_idx on public.query_fanouts (project_id, root_query, branch_query);

-- 20. AEO Content Gaps Table
create table if not exists public.aeo_content_gaps (
  project_id uuid not null references public.projects(id) on delete cascade,
  prompt_text text not null,
  topic text not null,
  competitors text[] not null default '{}'::text[],
  models text[] not null default '{}'::text[],
  score numeric not null default 0,
  priority text not null default 'low',
  content_exists boolean not null default false,
  brief_title text not null,
  brief_outline jsonb not null default '[]'::jsonb,
  scan_run_id uuid,
  miss_count integer not null default 1,
  last_detected_at timestamptz not null default now(),
  primary key (project_id, prompt_text)
);

-- 21. Backlink Projects Table
create table if not exists public.backlink_projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  website text not null,
  name text not null,
  industry text,
  target_keywords text[] default '{}'::text[],
  promotable_pages jsonb default '[]'::jsonb,
  gsc_connected boolean default false,
  gsc_site_url text,
  settings jsonb default '{"auto_pilot": false, "default_sending_delay_minutes": 15}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 22. Discovered Prospects Table
create table if not exists public.prospects (
  id uuid primary key default gen_random_uuid(),
  backlink_project_id uuid not null references public.backlink_projects(id) on delete cascade,
  website text not null,
  domain text not null,
  category text default 'Blog',
  relevance_score integer default 50,
  score_explanation text,
  estimated_authority integer default 30,
  estimated_traffic integer default 1000,
  spam_risk text default 'Low',
  country text default 'United States',
  language text default 'English',
  contact_page_url text,
  social_links jsonb default '{}'::jsonb,
  status text not null default 'discovered',
  created_at timestamptz not null default now()
);

-- 23. Contacts Table
create table if not exists public.contacts (
  id uuid primary key default gen_random_uuid(),
  prospect_id uuid not null references public.prospects(id) on delete cascade,
  name text,
  role text,
  email text,
  linkedin text,
  twitter text,
  source text default 'Crawl',
  is_verified boolean default false,
  verification_status text default 'unverified',
  created_at timestamptz not null default now()
);

-- 24. Outreach Campaigns Table
create table if not exists public.campaigns (
  id uuid primary key default gen_random_uuid(),
  backlink_project_id uuid not null references public.backlink_projects(id) on delete cascade,
  name text not null,
  target_page_url text not null,
  status text not null default 'draft',
  total_prospects integer default 0,
  emails_sent integer default 0,
  emails_opened integer default 0,
  replies_count integer default 0,
  positive_replies integer default 0,
  backlinks_earned integer default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 25. Campaign Messages Table
create table if not exists public.campaign_messages (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  prospect_id uuid not null references public.prospects(id) on delete cascade,
  contact_id uuid references public.contacts(id) on delete set null,
  step_number integer not null default 1,
  subject text not null,
  body text not null,
  status text not null default 'draft',
  sent_at timestamptz,
  created_at timestamptz not null default now()
);

-- =========================================================================
-- Enable Row Level Security (RLS) on all tables
-- =========================================================================
alter table public.projects enable row level security;
alter table public.user_subscriptions enable row level security;
alter table public.workspace_credits enable row level security;
alter table public.credit_transactions enable row level security;
alter table public.content_items enable row level security;
alter table public.crawl_runs enable row level security;
alter table public.crawled_pages enable row level security;
alter table public.prompt_scan_runs enable row level security;
alter table public.prompt_scan_results enable row level security;
alter table public.aeo_prompts enable row level security;
alter table public.aeo_citations enable row level security;
alter table public.aeo_scan_schedules enable row level security;
alter table public.aeo_analyses enable row level security;
alter table public.ai_referrals enable row level security;
alter table public.media_assets enable row level security;
alter table public.workspace_integrations enable row level security;
alter table public.social_accounts enable row level security;
alter table public.social_posts enable row level security;
alter table public.query_fanouts enable row level security;
alter table public.aeo_content_gaps enable row level security;
alter table public.backlink_projects enable row level security;
alter table public.prospects enable row level security;
alter table public.contacts enable row level security;
alter table public.campaigns enable row level security;
alter table public.campaign_messages enable row level security;

-- =========================================================================
-- Row Level Security (RLS) Policies
-- Users can read/write their own workspace and project data
-- =========================================================================

create policy "users_own_projects" on public.projects
  for all using (user_id = auth.uid() or user_id is null) with check (user_id = auth.uid() or user_id is null);

create policy "users_own_subscriptions" on public.user_subscriptions
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "users_own_credits" on public.workspace_credits
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "users_own_transactions" on public.credit_transactions
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "users_own_content_items" on public.content_items
  for all using (user_id = auth.uid() or user_id is null) with check (user_id = auth.uid() or user_id is null);

create policy "users_own_crawl_runs" on public.crawl_runs
  for all using (true) with check (true);

create policy "users_own_crawled_pages" on public.crawled_pages
  for all using (true) with check (true);

create policy "users_own_scan_runs" on public.prompt_scan_runs
  for all using (true) with check (true);

create policy "users_own_scan_results" on public.prompt_scan_results
  for all using (true) with check (true);

create policy "users_own_aeo_prompts" on public.aeo_prompts
  for all using (true) with check (true);

create policy "users_own_aeo_citations" on public.aeo_citations
  for all using (true) with check (true);

create policy "users_own_scan_schedules" on public.aeo_scan_schedules
  for all using (true) with check (true);

create policy "users_own_aeo_analyses" on public.aeo_analyses
  for all using (true) with check (true);

create policy "users_own_ai_referrals" on public.ai_referrals
  for all using (true) with check (true);

create policy "users_own_media_assets" on public.media_assets
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "users_own_integrations" on public.workspace_integrations
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "users_own_social_accounts" on public.social_accounts
  for all using (true) with check (true);

create policy "users_own_social_posts" on public.social_posts
  for all using (true) with check (true);

create policy "users_own_query_fanouts" on public.query_fanouts
  for all using (true) with check (true);

create policy "users_own_content_gaps" on public.aeo_content_gaps
  for all using (true) with check (true);

create policy "users_own_backlink_projects" on public.backlink_projects
  for all using (user_id = auth.uid() or user_id is null) with check (user_id = auth.uid() or user_id is null);

create policy "users_own_prospects" on public.prospects
  for all using (true) with check (true);

create policy "users_own_contacts" on public.contacts
  for all using (true) with check (true);

create policy "users_own_campaigns" on public.campaigns
  for all using (true) with check (true);

create policy "users_own_campaign_messages" on public.campaign_messages
  for all using (true) with check (true);

-- Insert Default Demo Project for Rank Monk if table is empty
insert into public.projects (id, name, domain, brand_name, brand_tagline, industry, business_category, target_audience)
values (
  '00000000-0000-0000-0000-000000000001',
  'Scalezix',
  'scalezix.com',
  'Scalezix',
  'Enterprise Growth & AI Platform',
  'Software / AI',
  'B2B SaaS',
  'Founders, CMOs, and Marketing Leaders'
) on conflict (id) do nothing;
