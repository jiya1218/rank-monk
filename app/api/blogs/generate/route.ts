import { NextRequest, NextResponse } from 'next/server';
import { generateArticle } from '@/lib/blogEngine';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      keyword,
      tone,
      targetCountry,
      wordCountTarget,
      includeFaq,
      includeToc,
      brandName,
      brandDomain,
      industry,
      businessCategory,
      targetAudience,
      brandPositioning,
      brandSummary,
      crawledPages,
      competitors
    } = body;

    if (!keyword || typeof keyword !== 'string' || !keyword.trim()) {
      return NextResponse.json(
        { success: false, error: 'Target keyword or topic is required' },
        { status: 400 }
      );
    }

    const article = await generateArticle({
      keyword: keyword.trim(),
      tone: tone || 'Professional & Authoritative',
      targetCountry: targetCountry || 'Global',
      wordCountTarget: Number(wordCountTarget) || 1500,
      includeFaq: includeFaq !== false,
      includeToc: includeToc !== false,
      brandName: brandName || 'Rank Monk',
      brandDomain: brandDomain || '',
      industry: industry || '',
      businessCategory: businessCategory || '',
      targetAudience: targetAudience || '',
      brandPositioning: brandPositioning || '',
      brandSummary: brandSummary || '',
      crawledPages: Array.isArray(crawledPages) ? crawledPages : [],
      competitors: competitors || []
    });

    return NextResponse.json({
      success: true,
      article
    });
  } catch (err: any) {
    console.error('[API blogs/generate error]:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to generate blog article' },
      { status: 500 }
    );
  }
}

