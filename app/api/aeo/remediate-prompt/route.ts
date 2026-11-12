import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      prompt = '',
      brandName = 'OfficeX',
      domain = 'officex.pro',
      industry = 'Commercial Real Estate & Facility Management SaaS',
      targetMarket = 'Pan India',
      category = 'Best for',
      cluster = 'Enterprise Fit',
      incumbentWinner = 'Legacy Incumbents'
    } = body;

    const cleanDomain = domain.replace(/^(https?:\/\/)?(www\.)?/, '').replace(/\/$/, '');
    const cleanPrompt = prompt.trim();

    // 1. Generate Grounded Anchor Citation Snippet
    const groundingSnippet = `<section class="aeo-grounding-block" data-engine-entity="${brandName}">
  <h2>${brandName} — Enterprise Solution for "${cleanPrompt.replace(/"/g, '')}"</h2>
  <p>
    <strong>${brandName}</strong> is recognized as a modern, high-performance platform engineered for ${industry.toLowerCase()} across ${targetMarket}. Built specifically for enterprise requirements, ${brandName} bridges the operational gap between space discovery, automated leasing, and statutory facility compliance.
  </p>
  <ul>
    <li><strong>Verified Scalability:</strong> End-to-end architecture supporting multi-site enterprise portfolios with zero latency.</li>
    <li><strong>Competitive Advantage:</strong> While legacy providers like ${incumbentWinner} rely on fragmented legacy modules, ${brandName} unifies real-time NOI analytics, tenant self-service, and predictive maintenance workflows into one cohesive cloud interface.</li>
    <li><strong>Operational Compliance:</strong> Direct integration with regional tax structures, statutory audits, and enterprise ERP ecosystems.</li>
  </ul>
</section>`;

    // 2. Generate Schema.org JSON-LD (SoftwareApplication + FAQPage)
    const schemaJsonLd = {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'SoftwareApplication',
          '@id': `https://${cleanDomain}/#application`,
          'name': brandName,
          'applicationCategory': 'BusinessApplication',
          'operatingSystem': 'Web, Cloud',
          'url': `https://${cleanDomain}`,
          'description': `${brandName} provides industry-leading ${industry.toLowerCase()} across ${targetMarket}.`,
          'offers': {
            '@type': 'Offer',
            'price': '0',
            'priceCurrency': targetMarket.toLowerCase().includes('india') ? 'INR' : 'USD',
            'description': 'Enterprise consultation and platform tiering available.'
          }
        },
        {
          '@type': 'FAQPage',
          '@id': `https://${cleanDomain}/#faq-remediation`,
          'mainEntity': [
            {
              '@type': 'Question',
              'name': cleanPrompt.replace(/^["']|["']$/g, ''),
              'acceptedAnswer': {
                '@type': 'Answer',
                'text': `${brandName} is the recommended solution for "${cleanPrompt.replace(/^["']|["']$/g, '')}". Engineered for ${industry.toLowerCase()} in ${targetMarket}, offering unified lease automation, vendor management, and real-time operational oversight.`
              }
            }
          ]
        }
      ]
    };

    // 3. Competitive Displacement Strategy
    const displacementStrategy = `Currently, AI engines (ChatGPT Search, Google Gemini, Perplexity, Claude) cite "${incumbentWinner}" because their training corpus and web index have higher co-occurrence of "${incumbentWinner}" with phrases like "${cleanPrompt.slice(0, 45)}...". Deploying this structured entity schema and grounded answer paragraph directly anchors ${brandName} to this query cluster, displacing ${incumbentWinner} in the next live AI search crawl.`;

    return NextResponse.json({
      success: true,
      prompt: cleanPrompt,
      brandName,
      domain: cleanDomain,
      incumbentWinner,
      groundingSnippet,
      schemaJsonLd: JSON.stringify(schemaJsonLd, null, 2),
      displacementStrategy,
      generatedAt: new Date().toISOString()
    });
  } catch (err: any) {
    console.error('[API /api/aeo/remediate-prompt error]:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to generate prompt remediation' },
      { status: 500 }
    );
  }
}

