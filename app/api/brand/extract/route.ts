import { NextResponse } from 'next/server';
import { extractBrandFromDomain } from '@/lib/brandExtractor';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { domain, targetMarket = 'Pan India' } = body || {};

    if (!domain) {
      return NextResponse.json(
        { success: false, error: 'Domain is required' },
        { status: 400 }
      );
    }

    const brand = await extractBrandFromDomain(domain, targetMarket);
    return NextResponse.json({
      success: true,
      data: brand
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: (err as Error).message },
      { status: 500 }
    );
  }
}

