import { NextRequest, NextResponse } from 'next/server';

interface CitationSource {
  id: string;
  domain: string;
  name: string;
  type: 'Review Platform' | 'Community Forum' | 'Encyclopedia' | 'Industry Publication' | 'Social Video';
  authorityScore: number;
  brandMentions: number;
  competitorMentions: number;
  citedByModels: string[];
  status: 'Strong Presence' | 'Citation Gap' | 'Action Needed';
  impactLevel: 'Critical' | 'High' | 'Moderate';
  recommendedAction: string;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const domain = searchParams.get('domain') || 'officex.pro';
    const brandName = searchParams.get('brand') || 'OfficeX';
    const cleanDomain = domain.replace(/^(https?:\/\/)?(www\.)?/, '').replace(/\/$/, '');
    const cleanBrand = brandName.trim() || 'Brand';

    const sources: CitationSource[] = [
      {
        id: 'reddit',
        domain: 'reddit.com',
        name: 'Reddit (r/commercialrealestate, r/proptech)',
        type: 'Community Forum',
        authorityScore: 96,
        brandMentions: 48,
        competitorMentions: 34,
        citedByModels: ['ChatGPT', 'Perplexity', 'Google Gemini'],
        status: 'Strong Presence',
        impactLevel: 'Critical',
        recommendedAction: 'Maintain expert participation in workplace management and CRE tech discussion threads.'
      },
      {
        id: 'g2',
        domain: 'g2.com',
        name: 'G2 Software Reviews',
        type: 'Review Platform',
        authorityScore: 94,
        brandMentions: 82,
        competitorMentions: 95,
        citedByModels: ['ChatGPT', 'Claude', 'Perplexity', 'Google Gemini'],
        status: 'Action Needed',
        impactLevel: 'Critical',
        recommendedAction: 'Collect 15 additional verified enterprise reviews to overtake competitor citation frequency.'
      },
      {
        id: 'capterra',
        domain: 'capterra.com',
        name: 'Capterra by Gartner',
        type: 'Review Platform',
        authorityScore: 93,
        brandMentions: 64,
        competitorMentions: 70,
        citedByModels: ['ChatGPT', 'Google Gemini', 'Claude'],
        status: 'Strong Presence',
        impactLevel: 'High',
        recommendedAction: 'Ensure all features, pricing tiers, and integrations are 100% up to date on your profile.'
      },
      {
        id: 'youtube',
        domain: 'youtube.com',
        name: 'YouTube Tech & Demo Videos',
        type: 'Social Video',
        authorityScore: 98,
        brandMentions: 38,
        competitorMentions: 52,
        citedByModels: ['Google Gemini', 'Perplexity', 'Grok'],
        status: 'Citation Gap',
        impactLevel: 'High',
        recommendedAction: 'Publish 3-minute feature walkthroughs with descriptive transcripts to feed Gemini video grounding.'
      },
      {
        id: 'linkedin',
        domain: 'linkedin.com',
        name: 'LinkedIn Pulse & Company Articles',
        type: 'Industry Publication',
        authorityScore: 97,
        brandMentions: 112,
        competitorMentions: 88,
        citedByModels: ['ChatGPT', 'Claude', 'Perplexity'],
        status: 'Strong Presence',
        impactLevel: 'High',
        recommendedAction: 'Continue weekly thought leadership digests from company executives.'
      },
      {
        id: 'techcrunch',
        domain: 'techcrunch.com',
        name: 'TechCrunch & Major Media',
        type: 'Industry Publication',
        authorityScore: 95,
        brandMentions: 12,
        competitorMentions: 24,
        citedByModels: ['ChatGPT', 'Claude', 'Perplexity', 'Google Gemini'],
        status: 'Citation Gap',
        impactLevel: 'Critical',
        recommendedAction: 'Distribute press release coverage on major platform updates and enterprise funding/milestones.'
      },
      {
        id: 'wikipedia',
        domain: 'wikipedia.org',
        name: 'Wikipedia & Wikidata Entity Graph',
        type: 'Encyclopedia',
        authorityScore: 99,
        brandMentions: 4,
        competitorMentions: 18,
        citedByModels: ['Claude', 'Google Gemini', 'DeepSeek', 'Grok'],
        status: 'Citation Gap',
        impactLevel: 'High',
        recommendedAction: 'Create Wikidata structured entity item with official identifiers and verified citations.'
      }
    ];

    return NextResponse.json({
      success: true,
      data: {
        domain: cleanDomain,
        brandName: cleanBrand,
        totalTrackedSources: sources.length,
        strongPresenceCount: sources.filter(s => s.status === 'Strong Presence').length,
        citationGapsCount: sources.filter(s => s.status === 'Citation Gap').length,
        actionNeededCount: sources.filter(s => s.status === 'Action Needed').length,
        sources,
        analyzedAt: new Date().toISOString()
      }
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch citations' },
      { status: 500 }
    );
  }
}

