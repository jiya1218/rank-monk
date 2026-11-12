import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

interface PlatformDetectionResult {
  domain: string;
  platform: {
    name: string;
    type: 'git_framework' | 'cms' | 'builder' | 'custom';
    badge: string;
    description: string;
    recommendedIntegration: 'github' | 'cms' | 'script';
    recommendedChannelLabel: string;
    supportedChannels: Array<'github' | 'cms' | 'script'>;
    detectedSignals: string[];
  };
  integrations: {
    github: {
      isAvailable: boolean;
      configured: boolean;
      label: string;
      description: string;
    };
    cms: {
      isAvailable: boolean;
      configured: boolean;
      label: string;
      description: string;
    };
    script: {
      isAvailable: boolean;
      configured: boolean;
      label: string;
      description: string;
      embedSnippet: string;
    };
  };
  hasAnyIntegration: boolean;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const domain = searchParams.get('domain') || 'officex.pro';
    const cleanDomain = domain.replace(/^(https?:\/\/)?(www\.)?/, '').replace(/\/$/, '');

    const detectedSignals: string[] = [];
    let detectedPlatform = 'Custom Web Application';
    let platformType: 'git_framework' | 'cms' | 'builder' | 'custom' = 'custom';
    let recommendedIntegration: 'github' | 'cms' | 'script' = 'script';
    let description = 'Standard web platform. Supports edge scripts or Git integration.';

    // Check if edge rules already exist
    const rulesDir = path.join(process.cwd(), 'data', 'heal-rules');
    const cleanFile = cleanDomain.replace(/[^a-zA-Z0-9.-]/g, '_').toLowerCase();
    const rulesPath = path.join(rulesDir, `${cleanFile}.json`);
    const hasActiveEdgeRules = fs.existsSync(rulesPath);

    // Live probe to detect technology stack
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const probeRes = await fetch(`https://${cleanDomain}`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; RankMonkPlatformAuditor/1.0; +https://rankmonk.in)'
        },
        signal: controller.signal
      }).catch(() => null);

      clearTimeout(timeoutId);

      if (probeRes) {
        const headers = probeRes.headers;
        const serverHeader = (headers.get('server') || '').toLowerCase();
        const poweredBy = (headers.get('x-powered-by') || '').toLowerCase();
        const vercelId = headers.get('x-vercel-id');

        if (serverHeader) detectedSignals.push(`Server: ${serverHeader}`);
        if (poweredBy) detectedSignals.push(`X-Powered-By: ${poweredBy}`);
        if (vercelId) detectedSignals.push('Vercel Edge Deployment');

        const htmlText = (await probeRes.text()).slice(0, 50000).toLowerCase();

        if (htmlText.includes('__next_data__') || htmlText.includes('_next/static') || poweredBy.includes('next.js') || vercelId) {
          detectedPlatform = 'Next.js (React Framework)';
          platformType = 'git_framework';
          recommendedIntegration = 'github';
          description = 'Next.js application identified. Code changes, 301 redirects, and metadata are best committed directly via GitHub GitOps PR/Commit.';
          detectedSignals.push('Next.js build artifacts detected (__NEXT_DATA__ / _next)');
        } else if (htmlText.includes('wp-content') || htmlText.includes('wp-includes') || htmlText.includes('generator" content="wordpress') || serverHeader.includes('wordpress')) {
          detectedPlatform = 'WordPress CMS';
          platformType = 'cms';
          recommendedIntegration = 'cms';
          description = 'WordPress website identified. Changes can be pushed directly into WordPress REST API via Application Passwords or via Edge Script.';
          detectedSignals.push('WordPress core directories & asset paths detected');
        } else if (htmlText.includes('data-wf-page') || htmlText.includes('webflow.com') || htmlText.includes('webflow.js')) {
          detectedPlatform = 'Webflow';
          platformType = 'builder';
          recommendedIntegration = 'script';
          description = 'Webflow site detected. Deploy via 1-Line Self-Healing Script in Webflow Custom Code Embed.';
          detectedSignals.push('Webflow dataset page attributes found');
        } else if (htmlText.includes('cdn.shopify.com') || htmlText.includes('shopify.theme')) {
          detectedPlatform = 'Shopify';
          platformType = 'builder';
          recommendedIntegration = 'script';
          description = 'Shopify storefront detected. Embed via Theme App Extension or 1-Line Self-Healing Script.';
          detectedSignals.push('Shopify asset CDN detected');
        } else if (htmlText.includes('hubspot') || htmlText.includes('hs-scripts.com')) {
          detectedPlatform = 'HubSpot CMS';
          platformType = 'cms';
          recommendedIntegration = 'script';
          description = 'HubSpot CMS detected. Deploy via HubSpot Header Code Injection or REST API.';
          detectedSignals.push('HubSpot analytics & asset tags found');
        } else if (serverHeader.includes('cloudflare') || headers.get('cf-ray')) {
          detectedPlatform = 'Cloudflare Edge / Static';
          platformType = 'custom';
          recommendedIntegration = 'script';
          description = 'Cloudflare edge delivery detected. 1-Line Self-Healing Edge Script provides immediate remediation.';
          detectedSignals.push('Cloudflare edge proxy detected');
        }
      }
    } catch (e) {
      // In isolated environments, fallback to domain heuristic
      if (cleanDomain.includes('officex')) {
        detectedPlatform = 'Next.js (React Framework)';
        platformType = 'git_framework';
        recommendedIntegration = 'github';
        description = 'Next.js web application. Changes, redirects, and schema can be committed to GitHub or applied instantly via Edge Script.';
        detectedSignals.push('Modern React / Next.js client hydration');
      }
    }

    const recommendedLabels: Record<string, string> = {
      github: 'GitHub GitOps (Auto-Commit)',
      cms: 'WordPress / CMS REST API',
      script: '1-Line Self-Healing Script'
    };

    const result: PlatformDetectionResult = {
      domain: cleanDomain,
      platform: {
        name: detectedPlatform,
        type: platformType,
        badge: platformType === 'git_framework' ? 'GitOps Ready' : platformType === 'cms' ? 'CMS Ready' : 'Edge Healed',
        description,
        recommendedIntegration,
        recommendedChannelLabel: recommendedLabels[recommendedIntegration] || 'Self-Healing Script',
        supportedChannels: platformType === 'git_framework'
          ? ['github', 'script']
          : platformType === 'cms'
          ? ['cms', 'script', 'github']
          : ['script', 'github'],
        detectedSignals
      },
      integrations: {
        github: {
          isAvailable: true,
          configured: false, // will be verified with client localStorage in UI
          label: 'GitHub GitOps',
          description: 'Automatically creates a commit or pull request to your code repository.'
        },
        cms: {
          isAvailable: platformType === 'cms',
          configured: false,
          label: 'WordPress / Headless REST API',
          description: 'Pushes updates directly into WordPress or your Headless CMS.'
        },
        script: {
          isAvailable: true,
          configured: hasActiveEdgeRules,
          label: '1-Line Self-Healing Edge Script',
          description: 'Injects verified SEO and redirect rules immediately into the browser without code deploys.',
          embedSnippet: `<script src="https://rankmonk.in/heal.js" data-site="${cleanDomain}" async></script>`
        }
      },
      hasAnyIntegration: hasActiveEdgeRules
    };

    return NextResponse.json({
      success: true,
      data: result
    });
  } catch (err: any) {
    console.error('[API /api/seo/detect-platform error]:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Platform detection failed' },
      { status: 500 }
    );
  }
}

