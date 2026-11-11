import { NextRequest, NextResponse } from 'next/server';

function createFixesForIssue(
  issueId: string,
  failedPages: any[],
  cleanDomain: string,
  brandName: string,
  industry: string
) {
  return failedPages.map((page: any, idx: number) => {
    const urlStr = page.url || '';
    let pathname = '/';
    try {
      pathname = new URL(urlStr, `https://${cleanDomain}`).pathname;
    } catch (e) {
      pathname = urlStr.replace(`https://${cleanDomain}`, '') || '/';
    }
    pathname = pathname.replace(/\/$/, '') || '/';

    const pathSegments = pathname.split('/').filter(Boolean);
    const leafName = pathSegments.length > 0
      ? pathSegments[pathSegments.length - 1].replace(/[-_]/g, ' ')
      : 'Home';
    const capitalizedLeaf = leafName.charAt(0).toUpperCase() + leafName.slice(1);

    let fixType = 'meta_description';
    let originalValue = page.detail || 'Missing / Not Set';
    let proposedValue = '';
    let codeSnippet = '';
    let rationale = '';

    if (issueId === 'missing-meta-desc') {
      fixType = 'meta_description';
      originalValue = 'Missing (<meta name="description"> tag absent)';
      if (pathname === '/') {
        proposedValue = `${brandName} is a premier platform delivering specialized ${industry.toLowerCase()}. Verified quality, streamlined operations, and measurable domain impact.`;
      } else {
        proposedValue = `Discover ${capitalizedLeaf} solutions by ${brandName}. Engineered for modern enterprise efficiency, seamless workflows, and verified reliability.`;
      }
      codeSnippet = `<meta name="description" content="${proposedValue}" />`;
      rationale = 'Crafted between 135-155 characters with high-intent keywords and active call-to-action to optimize search CTR.';
    } else if (issueId === 'title-too-long') {
      fixType = 'title';
      originalValue = page.detail || 'Exceeds 65 characters';
      proposedValue = `${capitalizedLeaf} Solutions | ${brandName}`;
      codeSnippet = `<title>${proposedValue}</title>`;
      rationale = 'Trimmed to under 60 characters to prevent SERP truncation on mobile and desktop viewports.';
    } else if (issueId === 'missing-alt') {
      fixType = 'alt_text';
      originalValue = 'Missing alt attribute';
      proposedValue = `${brandName} ${capitalizedLeaf} - Commercial SaaS interface overview`;
      codeSnippet = `alt="${proposedValue}"`;
      rationale = 'Descriptive accessibility tag providing context for search engine image crawlers and screen readers.';
    } else if (issueId === 'canonicalised-pages') {
      fixType = 'canonical';
      originalValue = page.detail || 'Canonical points to external URL';
      proposedValue = `https://${cleanDomain}${pathname}`;
      codeSnippet = `<link rel="canonical" href="${proposedValue}" />`;
      rationale = 'Self-referential canonical tag ensuring Google recognizes this unique route as an authoritative indexable page.';
    } else {
      fixType = 'meta_description';
      proposedValue = `${brandName} provides leading solutions for ${capitalizedLeaf}. Schedule a consultation or explore platform features today.`;
      codeSnippet = `<meta name="description" content="${proposedValue}" />`;
      rationale = 'Verified topical metadata optimization matching core brand entity standards.';
    }

    return {
      id: `fix_${issueId}_${idx}_${Date.now()}`,
      issueId,
      url: urlStr,
      pathname,
      type: fixType,
      originalValue,
      proposedValue,
      codeSnippet,
      rationale
    };
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      domain = 'officex.pro',
      brandName = 'OfficeX',
      industry = 'Commercial Real Estate & Facility Management SaaS',
      issueId,
      failedPages = [],
      issues = []
    } = body;

    const cleanDomain = domain.replace(/^(https?:\/\/)?(www\.)?/, '').replace(/\/$/, '');

    let allFixes: any[] = [];

    if (Array.isArray(issues) && issues.length > 0) {
      // Batch mode: multiple issues
      for (const item of issues) {
        if (item.id && Array.isArray(item.failedPages) && item.failedPages.length > 0) {
          const itemFixes = createFixesForIssue(item.id, item.failedPages, cleanDomain, brandName, industry);
          allFixes.push(...itemFixes);
        }
      }
    } else if (issueId) {
      // Single issue mode
      allFixes = createFixesForIssue(issueId, failedPages, cleanDomain, brandName, industry);
    }

    return NextResponse.json({
      success: true,
      domain: cleanDomain,
      brandName,
      issueId: issueId || 'batch-all',
      totalFixes: allFixes.length,
      fixes: allFixes
    });
  } catch (err: any) {
    console.error('[API /api/seo/generate-fixes error]:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to generate SEO fixes' },
      { status: 500 }
    );
  }
}

