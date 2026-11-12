import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

// Helper: Get user integration storage path
function getStoragePath(email: string, domain?: string): string {
  const cleanEmail = (email || 'anonymous').toLowerCase().trim().replace(/[^a-z0-9._-]/g, '_');
  const baseDir = path.join(process.cwd(), 'data', 'user-integrations', cleanEmail);
  if (!fs.existsSync(baseDir)) {
    fs.mkdirSync(baseDir, { recursive: true });
  }

  if (domain) {
    const cleanDomain = domain.replace(/^(https?:\/\/)?(www\.)?/, '').replace(/\/$/, '').toLowerCase().replace(/[^a-z0-9.-]/g, '_');
    return path.join(baseDir, `${cleanDomain}.json`);
  }
  return path.join(baseDir, 'global.json');
}

// Helper: Generate OAuth access token from Service Account Key
async function getAccessTokenFromServiceAccount(serviceAccount: any): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'RS256', typ: 'JWT' };
  const payload = {
    iss: serviceAccount.client_email,
    scope: 'https://www.googleapis.com/auth/webmasters.readonly',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now
  };

  const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signInput = `${encodedHeader}.${encodedPayload}`;

  const signer = crypto.createSign('RSA-SHA256');
  signer.update(signInput);
  signer.end();
  const signature = signer.sign(serviceAccount.private_key, 'base64url');
  const jwt = `${signInput}.${signature}`;

  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`
  });

  const tokenData = await tokenRes.json();
  if (!tokenRes.ok || !tokenData.access_token) {
    throw new Error(tokenData.error_description || tokenData.error || 'Failed to authenticate Google Service Account');
  }

  return tokenData.access_token;
}

// -------------------------------------------------------------
// GET & POST: Fetch Google Search Console Analytics
// -------------------------------------------------------------
export async function GET(req: NextRequest) {
  return handleGscQuery(req);
}

export async function POST(req: NextRequest) {
  return handleGscQuery(req);
}

async function handleGscQuery(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    let email = searchParams.get('email') || '';
    let domain = searchParams.get('domain') || '';

    if (req.method === 'POST') {
      try {
        const body = await req.json();
        if (body.email) email = body.email;
        if (body.domain) domain = body.domain;
      } catch {}
    }

    if (!domain) {
      return NextResponse.json({
        success: false,
        connected: false,
        error: 'Domain is required to query Search Console',
        data: getZeroData()
      });
    }

    const cleanDomain = domain.replace(/^(https?:\/\/)?(www\.)?/, '').replace(/\/$/, '').toLowerCase();

    // 1. Check stored GSC configuration
    let gscConfig: any = null;
    const domainFile = getStoragePath(email, cleanDomain);
    const globalFile = getStoragePath(email);

    if (fs.existsSync(domainFile)) {
      try {
        const data = JSON.parse(fs.readFileSync(domainFile, 'utf8'));
        if (data.gsc) gscConfig = data.gsc;
      } catch {}
    }

    if (!gscConfig && fs.existsSync(globalFile)) {
      try {
        const data = JSON.parse(fs.readFileSync(globalFile, 'utf8'));
        if (data.gsc) gscConfig = data.gsc;
      } catch {}
    }

    if (!gscConfig) {
      return NextResponse.json({
        success: true,
        connected: false,
        message: 'Google Search Console is not connected for this domain.',
        data: getZeroData()
      });
    }

    // 2. Resolve access token
    let accessToken = gscConfig.accessToken;

    if (gscConfig.serviceAccountKey) {
      try {
        const sa = typeof gscConfig.serviceAccountKey === 'string'
          ? JSON.parse(gscConfig.serviceAccountKey)
          : gscConfig.serviceAccountKey;
        accessToken = await getAccessTokenFromServiceAccount(sa);
      } catch (authErr: any) {
        return NextResponse.json({
          success: false,
          connected: false,
          error: `Google Service Account authentication error: ${authErr.message}`,
          data: getZeroData()
        });
      }
    }

    if (!accessToken) {
      return NextResponse.json({
        success: false,
        connected: false,
        error: 'No valid Google OAuth token or Service Account key found.',
        data: getZeroData()
      });
    }

    // 3. Determine Search Console Property (sc-domain:example.com or https://example.com/)
    const siteUrl = gscConfig.siteUrl || `sc-domain:${cleanDomain}`;

    // Date range: Last 28 days up to yesterday (GSC typically has a 2-3 day latency)
    const endDate = new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0];
    const startDate = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];

    // 4. Query Daily Trends from Google Search Console API
    const queryUrl = `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`;

    const gscResponse = await fetch(queryUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        startDate,
        endDate,
        dimensions: ['date'],
        rowLimit: 30
      })
    });

    if (!gscResponse.ok) {
      const errJson = await gscResponse.json().catch(() => ({}));
      const errMsg = errJson?.error?.message || `Search Console API error HTTP ${gscResponse.status}`;

      // If permission or site not found, report clearly without inventing numbers
      return NextResponse.json({
        success: false,
        connected: true,
        property: siteUrl,
        error: errMsg,
        data: getZeroData()
      });
    }

    const gscData = await gscResponse.json();
    const rows: any[] = Array.isArray(gscData.rows) ? gscData.rows : [];

    // Strictly real sums: If 0 clicks, sum is 0. If 0 impressions, sum is 0.
    let totalClicks = 0;
    let totalImpressions = 0;
    let positionSum = 0;
    let ctrSum = 0;

    const dailyTrends = rows.map((r: any) => {
      const clicks = Number(r.clicks) || 0;
      const impressions = Number(r.impressions) || 0;
      const ctr = Number(r.ctr) || 0;
      const position = Number(r.position) || 0;

      totalClicks += clicks;
      totalImpressions += impressions;
      positionSum += position;
      ctrSum += ctr;

      return {
        date: r.keys?.[0] || '',
        clicks,
        impressions,
        ctr: Math.round(ctr * 1000) / 10,
        position: Math.round(position * 10) / 10
      };
    });

    const averagePosition = rows.length > 0 ? Math.round((positionSum / rows.length) * 10) / 10 : 0;
    const averageCtr = rows.length > 0 ? Math.round((ctrSum / rows.length) * 1000) / 10 : 0;

    // 5. Query Top Keywords / Search Queries
    let topQueries: any[] = [];
    try {
      const queryKeywordsRes = await fetch(queryUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          startDate,
          endDate,
          dimensions: ['query'],
          rowLimit: 10
        })
      });

      if (queryKeywordsRes.ok) {
        const kwJson = await queryKeywordsRes.json();
        if (Array.isArray(kwJson.rows)) {
          topQueries = kwJson.rows.map((kw: any) => ({
            query: kw.keys?.[0] || '',
            clicks: Number(kw.clicks) || 0,
            impressions: Number(kw.impressions) || 0,
            ctr: Math.round((Number(kw.ctr) || 0) * 1000) / 10,
            position: Math.round((Number(kw.position) || 0) * 10) / 10
          }));
        }
      }
    } catch {}

    return NextResponse.json({
      success: true,
      connected: true,
      property: siteUrl,
      lastSynced: new Date().toISOString(),
      data: {
        totalClicks,
        totalImpressions,
        averageCtr,
        averagePosition,
        dailyTrends,
        topQueries
      }
    });

  } catch (err: any) {
    console.error('[API /api/gsc/analytics error]:', err);
    return NextResponse.json({
      success: false,
      connected: false,
      error: err.message,
      data: getZeroData()
    }, { status: 500 });
  }
}

// Strict zero-data structure: No fake data anywhere
function getZeroData() {
  const dates: any[] = [];
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 86400000);
    dates.push({
      date: d.toISOString().split('T')[0],
      clicks: 0,
      impressions: 0,
      ctr: 0,
      position: 0
    });
  }

  return {
    totalClicks: 0,
    totalImpressions: 0,
    averageCtr: 0,
    averagePosition: 0,
    dailyTrends: dates,
    topQueries: []
  };
}

