import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const RULES_DIR = path.join(process.cwd(), 'data', 'heal-rules');

function getRulesFilePath(domain: string): string {
  const clean = domain.replace(/^(https?:\/\/)?(www\.)?/, '').replace(/[^a-zA-Z0-9.-]/g, '_').toLowerCase();
  return path.join(RULES_DIR, `${clean}.json`);
}

function loadDomainRules(domain: string) {
  try {
    const filePath = getRulesFilePath(domain);
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.warn('[heal-rules load error]:', err);
  }

  // Default initial rules for domain if none saved yet
  const cleanDomain = domain.replace(/^(https?:\/\/)?(www\.)?/, '').replace(/\/$/, '');
  const brandName = cleanDomain.split('.')[0];
  const capitalized = brandName.charAt(0).toUpperCase() + brandName.slice(1);

  return {
    domain: cleanDomain,
    brandName: capitalized,
    updatedAt: new Date().toISOString(),
    pages: {
      '/': {
        metaDesc: `${capitalized} delivers enterprise-grade solutions, seamless operational workflows, and verified industry excellence.`,
        title: `${capitalized} — Official Enterprise Platform`,
        defaultAlt: `${capitalized} platform visual`,
        schema: {
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: capitalized,
          url: `https://${cleanDomain}`
        }
      }
    }
  };
}

function saveDomainRules(domain: string, rules: any) {
  try {
    if (!fs.existsSync(RULES_DIR)) {
      fs.mkdirSync(RULES_DIR, { recursive: true });
    }
    const filePath = getRulesFilePath(domain);
    fs.writeFileSync(filePath, JSON.stringify(rules, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('[heal-rules save error]:', err);
    return false;
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const domain = searchParams.get('domain') || 'officex.pro';

    const rules = loadDomainRules(domain);

    const res = NextResponse.json({
      success: true,
      rules
    });

    // Allow CORS so the script can be loaded from client domains
    res.headers.set('Access-Control-Allow-Origin', '*');
    res.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.headers.set('Access-Control-Allow-Headers', 'Content-Type');
    res.headers.set('Cache-Control', 'public, max-age=60, s-maxage=300');

    return res;
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to retrieve rules' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { domain, pages, brandName, newFixes } = body;

    if (!domain) {
      return NextResponse.json({ success: false, error: 'Domain is required' }, { status: 400 });
    }

    const currentRules = loadDomainRules(domain);
    const updatedPages = { ...currentRules.pages };

    if (pages) {
      Object.assign(updatedPages, pages);
    }

    // Merge newFixes array if passed
    if (Array.isArray(newFixes)) {
      for (const fix of newFixes) {
        let route = fix.url ? new URL(fix.url, `https://${domain}`).pathname : '/';
        route = route.replace(/\/$/, '') || '/';
        if (!updatedPages[route]) updatedPages[route] = {};

        if (fix.type === 'meta_description') {
          updatedPages[route].metaDesc = fix.value;
        } else if (fix.type === 'title') {
          updatedPages[route].title = fix.value;
        } else if (fix.type === 'alt_text') {
          updatedPages[route].defaultAlt = fix.value;
        } else if (fix.type === 'schema') {
          updatedPages[route].schema = typeof fix.value === 'string' ? JSON.parse(fix.value) : fix.value;
        }
      }
    }

    const updatedRules = {
      domain,
      brandName: brandName || currentRules.brandName,
      updatedAt: new Date().toISOString(),
      pages: updatedPages
    };

    saveDomainRules(domain, updatedRules);

    return NextResponse.json({
      success: true,
      rules: updatedRules,
      activeRulesCount: Object.keys(updatedPages).length
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to save rules' },
      { status: 500 }
    );
  }
}

