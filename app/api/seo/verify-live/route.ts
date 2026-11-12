import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { url, issueId } = body;

    if (!url) {
      return NextResponse.json({ success: false, error: 'URL is required' }, { status: 400 });
    }

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url);
    } catch {
      return NextResponse.json({ success: false, error: 'Invalid URL' }, { status: 400 });
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    let html = '';
    let httpStatus = 0;
    let fetchError: string | null = null;
    try {
      const res = await fetch(parsedUrl.href, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; RankMonkLiveAuditor/1.0; +https://rankmonk.in)',
          'Cache-Control': 'no-cache, no-store'
        },
        signal: controller.signal
      });
      httpStatus = res.status;
      html = await res.text();
    } catch (err: any) {
      httpStatus = 0;
      fetchError = err?.message || 'Connection failed';
    } finally {
      clearTimeout(timeoutId);
    }

    if (httpStatus === 0) {
      return NextResponse.json({
        success: true,
        url: parsedUrl.href,
        httpStatus: 0,
        isFixedOnLiveSite: false,
        hasHealScript: false,
        metrics: {
          h1Count: 0,
          hasMetaDesc: false,
          titleLength: 0
        },
        detailMessage: `Could not reach ${parsedUrl.hostname} (${fetchError || 'Network unreachable'}). Verify website is accessible.`
      });
    }

    const hasHealScript = html.includes('heal.js');
    const h1Matches = html.match(/<h1\b[^>]*>[\s\S]*?<\/h1>/gi) || [];
    const h1Count = h1Matches.length;
    const metaDescMatch = html.match(/<meta\b[^>]*name=["']description["'][^>]*content=["']([^"']*)["'][^>]*>/i);
    const hasMetaDesc = Boolean(metaDescMatch && metaDescMatch[1] && metaDescMatch[1].trim().length > 0);
    const titleMatch = html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i);
    const titleLength = titleMatch && titleMatch[1] ? titleMatch[1].trim().length : 0;
    const canonicalMatch = html.match(/<link\b[^>]*rel=["']canonical["'][^>]*href=["']([^"']*)["'][^>]*>/i);
    const hasCanonical = Boolean(canonicalMatch && canonicalMatch[1]);
    const hasJsonLd = html.includes('application/ld+json');
    const robotsMatch = html.match(/<meta\b[^>]*name=["']robots["'][^>]*content=["']([^"']*)["'][^>]*>/i);
    const hasNoindex = Boolean(robotsMatch && robotsMatch[1] && robotsMatch[1].toLowerCase().includes('noindex'));

    let isFixedOnLiveSite = false;
    let detailMessage = '';

    const normIssue = (issueId || '').toLowerCase();

    if (normIssue.includes('h1')) {
      isFixedOnLiveSite = h1Count === 1;
      detailMessage = h1Count === 0
        ? 'Live website currently contains 0 <h1> tags.'
        : h1Count === 1
        ? 'Verified! Exactly 1 <h1> tag detected on live site.'
        : `Live website still contains multiple (${h1Count}) <h1> tags.`;
    } else if (normIssue.includes('meta')) {
      isFixedOnLiveSite = hasMetaDesc;
      detailMessage = hasMetaDesc
        ? 'Verified! Meta description is active on live site.'
        : 'Meta description tag is missing or empty in live HTML source.';
    } else if (normIssue.includes('title')) {
      isFixedOnLiveSite = titleLength >= 30 && titleLength <= 65;
      detailMessage = isFixedOnLiveSite
        ? `Verified! Title tag length on live site is optimal (${titleLength} chars).`
        : `Title tag length on live site is ${titleLength} chars (recommended: 30-65 chars).`;
    } else if (normIssue.includes('404') || normIssue.includes('broken') || normIssue.includes('http') || normIssue.includes('status')) {
      isFixedOnLiveSite = httpStatus === 200 || httpStatus === 301 || httpStatus === 302;
      detailMessage = isFixedOnLiveSite
        ? `Verified! URL returned active response status (HTTP ${httpStatus}).`
        : `URL is still returning error status (HTTP ${httpStatus}).`;
    } else if (normIssue.includes('canonical')) {
      isFixedOnLiveSite = hasCanonical;
      detailMessage = hasCanonical
        ? `Verified! Canonical tag detected: ${canonicalMatch ? canonicalMatch[1] : ''}`
        : 'Canonical link tag is missing from live HTML.';
    } else if (normIssue.includes('schema') || normIssue.includes('jsonld')) {
      isFixedOnLiveSite = hasJsonLd;
      detailMessage = hasJsonLd
        ? 'Verified! Schema.org JSON-LD structured data detected on live site.'
        : 'Schema.org JSON-LD structured data not found in live HTML.';
    } else if (normIssue.includes('noindex') || normIssue.includes('robot')) {
      isFixedOnLiveSite = !hasNoindex;
      detailMessage = !hasNoindex
        ? 'Verified! Page is indexable (no restrictive noindex tag detected).'
        : 'Robots meta tag still contains "noindex" directive.';
    } else {
      isFixedOnLiveSite = hasHealScript;
      detailMessage = hasHealScript
        ? 'Self-healing script detected and active on live site.'
        : 'Self-healing script not found in live HTML source.';
    }

    return NextResponse.json({
      success: true,
      url: parsedUrl.href,
      httpStatus,
      isFixedOnLiveSite,
      hasHealScript,
      metrics: {
        h1Count,
        hasMetaDesc,
        titleLength
      },
      detailMessage
    });
  } catch (err: any) {
    console.error('[API /api/seo/verify-live error]:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Live verification failed' },
      { status: 500 }
    );
  }
}
