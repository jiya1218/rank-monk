import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getSupabaseAdmin } from '@/lib/supabase';

// Helper: Ensure directory exists
function ensureDir(dirPath: string) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// Helper: Get user integration storage path
function getStoragePath(email: string, domain?: string): string {
  const cleanEmail = (email || 'anonymous').toLowerCase().trim().replace(/[^a-z0-9._-]/g, '_');
  const baseDir = path.join(process.cwd(), 'data', 'user-integrations', cleanEmail);
  ensureDir(baseDir);

  if (domain) {
    const cleanDomain = domain.replace(/^(https?:\/\/)?(www\.)?/, '').replace(/\/$/, '').toLowerCase().replace(/[^a-z0-9.-]/g, '_');
    return path.join(baseDir, `${cleanDomain}.json`);
  }
  return path.join(baseDir, 'global.json');
}

// Helper: Check if token is a genuine real token (reject placeholder/test tokens)
function isRealToken(token?: string): boolean {
  if (!token || typeof token !== 'string') return false;
  const s = token.trim();
  if (s.includes('test') || s.includes('dummy') || s.includes('preserved') || s.includes('example') || s.includes('random') || s.includes('placeholder')) {
    return false;
  }
  const isClassic = /^ghp_[A-Za-z0-9_]{36}$/.test(s);
  const isFineGrained = /^github_pat_[A-Za-z0-9_]{80,}$/.test(s);
  const isApp = /^(gho|ghs|ghu)_[A-Za-z0-9_]{30,}$/.test(s);
  return isClassic || isFineGrained || isApp;
}

// Helper: Read stored integrations
function readStoredIntegrations(email: string, domain: string) {
  const result: {
    github?: any;
    wordpress?: any;
    socialAccounts?: any[];
    updatedAt?: string;
  } = {
    socialAccounts: []
  };

  const domainFile = getStoragePath(email, domain);
  const globalFile = getStoragePath(email);

  // 1. Read global defaults first
  if (fs.existsSync(globalFile)) {
    try {
      const globalData = JSON.parse(fs.readFileSync(globalFile, 'utf8'));
      if (globalData.github && isRealToken(globalData.github.token)) result.github = globalData.github;
      if (globalData.wordpress && globalData.wordpress.wpAppPassword && !globalData.wordpress.wpAppPassword.includes('preserved')) result.wordpress = globalData.wordpress;
      if (Array.isArray(globalData.socialAccounts)) result.socialAccounts = globalData.socialAccounts;
    } catch {}
  }

  // 2. Override with domain-specific settings if present
  if (fs.existsSync(domainFile)) {
    try {
      const domainData = JSON.parse(fs.readFileSync(domainFile, 'utf8'));
      if (domainData.github && isRealToken(domainData.github.token)) result.github = domainData.github;
      if (domainData.wordpress && domainData.wordpress.wpAppPassword && !domainData.wordpress.wpAppPassword.includes('preserved')) result.wordpress = domainData.wordpress;
      if (Array.isArray(domainData.socialAccounts) && domainData.socialAccounts.length > 0) {
        result.socialAccounts = domainData.socialAccounts;
      }
      if (domainData.updatedAt) result.updatedAt = domainData.updatedAt;
    } catch {}
  }

  return result;
}

// -------------------------------------------------------------
// GET: Load integrations for user email & domain
// -------------------------------------------------------------
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email') || '';
    const domain = searchParams.get('domain') || '';

    if (!email && !domain) {
      return NextResponse.json({ success: false, error: 'Email or domain required' }, { status: 400 });
    }

    const cleanDomain = (domain || '').replace(/^(https?:\/\/)?(www\.)?/, '').replace(/\/$/, '').toLowerCase();
    const stored = readStoredIntegrations(email, cleanDomain);

    return NextResponse.json({
      success: true,
      email,
      domain: cleanDomain,
      integrations: stored
    });
  } catch (err: any) {
    console.error('[API /api/integrations GET error]:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// -------------------------------------------------------------
// POST: Save/Persist integration permanently
// -------------------------------------------------------------
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, domain, platform, config } = body;

    if (!email) {
      return NextResponse.json({ success: false, error: 'User email is required to preserve integrations' }, { status: 400 });
    }

    const cleanDomain = (domain || '').replace(/^(https?:\/\/)?(www\.)?/, '').replace(/\/$/, '').toLowerCase();
    const domainFile = getStoragePath(email, cleanDomain);
    const globalFile = getStoragePath(email);

    // Read current state
    const current = readStoredIntegrations(email, cleanDomain);

    if (platform === 'github') {
      current.github = config;
    } else if (platform === 'wordpress') {
      current.wordpress = config;
    } else if (platform === 'social') {
      current.socialAccounts = Array.isArray(config) ? config : [...(current.socialAccounts || []), config];
    } else if (platform === 'all' && config) {
      if (config.github) current.github = config.github;
      if (config.wordpress) current.wordpress = config.wordpress;
      if (config.socialAccounts) current.socialAccounts = config.socialAccounts;
    }

    current.updatedAt = new Date().toISOString();

    // 1. Save to domain-specific file
    fs.writeFileSync(domainFile, JSON.stringify(current, null, 2), 'utf8');

    // 2. Also update global user profile so integrations are remembered if user switches projects
    fs.writeFileSync(globalFile, JSON.stringify(current, null, 2), 'utf8');

    // 3. Mirror to Supabase if possible
    try {
      const supabase = getSupabaseAdmin();
      if (platform === 'github' && config) {
        await supabase.from('workspace_integrations').upsert({
          platform: 'github',
          credentials: config,
          is_active: true
        });
      } else if (platform === 'wordpress' && config) {
        await supabase.from('workspace_integrations').upsert({
          platform: 'wordpress',
          credentials: config,
          is_active: true
        });
      }
    } catch {}

    return NextResponse.json({
      success: true,
      message: `✓ ${platform || 'Integration'} safely saved and preserved for ${email}!`,
      integrations: current
    });
  } catch (err: any) {
    console.error('[API /api/integrations POST error]:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// -------------------------------------------------------------
// DELETE: Disconnect an integration
// -------------------------------------------------------------
export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, domain, platform, accountId } = body;

    if (!email) {
      return NextResponse.json({ success: false, error: 'User email is required' }, { status: 400 });
    }

    const cleanDomain = (domain || '').replace(/^(https?:\/\/)?(www\.)?/, '').replace(/\/$/, '').toLowerCase();
    const domainFile = getStoragePath(email, cleanDomain);
    const globalFile = getStoragePath(email);

    const current = readStoredIntegrations(email, cleanDomain);

    if (platform === 'github') {
      delete current.github;
    } else if (platform === 'wordpress') {
      delete current.wordpress;
    } else if (platform === 'social') {
      if (accountId) {
        current.socialAccounts = (current.socialAccounts || []).filter(a => a.id !== accountId);
      } else {
        current.socialAccounts = [];
      }
    }

    current.updatedAt = new Date().toISOString();

    fs.writeFileSync(domainFile, JSON.stringify(current, null, 2), 'utf8');
    fs.writeFileSync(globalFile, JSON.stringify(current, null, 2), 'utf8');

    return NextResponse.json({
      success: true,
      message: `✓ ${platform} disconnected.`,
      integrations: current
    });
  } catch (err: any) {
    console.error('[API /api/integrations DELETE error]:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

