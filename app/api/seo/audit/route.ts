import { NextResponse } from 'next/server';
import { crawlDomainPages } from '@/lib/realCrawler';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      domain = '',
      brandName,
      crawlLimit = 50
    } = body || {};

    if (!domain || !domain.trim()) {
      return NextResponse.json({ success: false, error: 'Valid domain is required' }, { status: 400 });
    }

    const parsedLimit = parseInt(String(crawlLimit)) || 50;
    const auditResult = await crawlDomainPages(domain, parsedLimit, brandName);

    return NextResponse.json({
      success: true,
      data: auditResult
    });
  } catch (err) {
    console.error('[API /api/seo/audit] Error:', err);
    return NextResponse.json(
      { success: false, error: (err as Error).message },
      { status: 500 }
    );
  }
}
