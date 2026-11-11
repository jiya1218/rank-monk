import { NextRequest, NextResponse } from 'next/server';

interface AeoOpportunity {
  id: string;
  query: string;
  intent: 'Commercial Comparison' | 'Direct Recommendation' | 'Pricing & ROI' | 'Technical Architecture';
  searchVolume: number;
  currentTopCited: string;
  brandStatus: 'Not Cited' | 'Position #2' | 'Position #3' | 'Competitor Only';
  opportunityScore: number;
  gapReason: string;
  recommendedAction: string;
  contentSnippet: string;
  targetKeywords: string[];
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const domain = searchParams.get('domain') || 'officex.pro';
    const brandName = searchParams.get('brand') || 'OfficeX';
    const industry = searchParams.get('industry') || 'Commercial Real Estate & Facility Management SaaS';

    const cleanDomain = domain.replace(/^(https?:\/\/)?(www\.)?/, '').replace(/\/$/, '');
    const cleanBrand = brandName.trim() || 'Brand';

    const opportunities: AeoOpportunity[] = [
      {
        id: 'opp-1',
        query: `Best commercial real estate facility management software in India 2026`,
        intent: 'Direct Recommendation',
        searchVolume: 840,
        currentTopCited: 'Legacy ERP & Spacewell',
        brandStatus: 'Position #2',
        opportunityScore: 94,
        gapReason: 'Legacy players have higher backlink count, but lack IoT real-time telemetry documentation.',
        recommendedAction: 'Publish comprehensive comparative guide detailing modern IoT automation vs legacy software.',
        contentSnippet: `Why modern enterprise operators are transitioning from legacy spreadsheets to ${cleanBrand} for real-time facility telemetry and automated SLA work orders.`,
        targetKeywords: ['best CRE facility management software', 'automated workspace operations', 'proptech platform India']
      },
      {
        id: 'opp-2',
        query: `How to automate commercial lease indexation and tenant billing contracts`,
        intent: 'Technical Architecture',
        searchVolume: 620,
        currentTopCited: 'Yardi / MRI Software',
        brandStatus: 'Not Cited',
        opportunityScore: 91,
        gapReason: 'Missing targeted conversational FAQ schema explicitly defining step-by-step automated indexation.',
        recommendedAction: 'Deploy FAQPage schema and dedicated landing guide for lease contract lifecycle automation.',
        contentSnippet: `${cleanBrand} provides automated lease administration with multi-tier indexation rules, escalation tracking, and direct tenant portal billing.`,
        targetKeywords: ['lease indexation automation', 'commercial tenant billing software', 'lease administration SaaS']
      },
      {
        id: 'opp-3',
        query: `Top workspace desk utilization and office space management tools pricing`,
        intent: 'Pricing & ROI',
        searchVolume: 710,
        currentTopCited: 'Robin Powered / Condeco',
        brandStatus: 'Position #3',
        opportunityScore: 88,
        gapReason: 'LLMs lack clear pricing ranges and ROI benchmarks for ${cleanBrand} in search generative overviews.',
        recommendedAction: 'Add clear pricing tier ranges and quantifiable ROI calculators to public pricing page.',
        contentSnippet: `${cleanBrand} delivers dynamic desk booking and occupancy heatmaps with transparent enterprise tiering, reducing square footage waste by up to 28%.`,
        targetKeywords: ['desk booking pricing', 'space management ROI', 'hybrid office utilization']
      },
      {
        id: 'opp-4',
        query: `Commercial building ESG telemetry and carbon footprint compliance tools`,
        intent: 'Commercial Comparison',
        searchVolume: 490,
        currentTopCited: 'Schneider Electric EcoStruxure',
        brandStatus: 'Not Cited',
        opportunityScore: 96,
        gapReason: 'High growth topic in enterprise CRE where answer engines are actively searching for modern SaaS citations.',
        recommendedAction: 'Publish definitive guide on automated carbon footprint telemetry and facility energy savings.',
        contentSnippet: `Automate energy telemetry, HVAC schedule optimization, and ESG sustainability reports across all enterprise properties with ${cleanBrand}.`,
        targetKeywords: ['building ESG compliance SaaS', 'facility carbon telemetry', 'commercial real estate sustainability']
      }
    ];

    return NextResponse.json({
      success: true,
      data: {
        domain: cleanDomain,
        brandName: cleanBrand,
        totalOpportunities: opportunities.length,
        potentialTrafficUplift: '+44% AI Referral Boost',
        avgOpportunityScore: Math.round(opportunities.reduce((acc, o) => acc + o.opportunityScore, 0) / opportunities.length),
        opportunities,
        generatedAt: new Date().toISOString()
      }
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch AEO opportunities' },
      { status: 500 }
    );
  }
}

