import { NextRequest, NextResponse } from 'next/server';
import { BedrockRuntimeClient, ConverseCommand } from '@aws-sdk/client-bedrock-runtime';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      domain = '',
      brandName = '',
      industry = 'Technology Platform',
      summary = '',
      targetMarket = 'Pan India',
      services = []
    } = body || {};

    const cleanDomain = domain.replace(/^(https?:\/\/)?(www\.)?/, '').replace(/\/$/, '');
    const cleanBrand = brandName.trim() || (cleanDomain ? cleanDomain.split('.')[0].toUpperCase() : 'Brand');

    const token = process.env.AWS_BEARER_TOKEN_BEDROCK || process.env.VITE_BEDROCK_API_KEY;

    let generatedSummary = summary;
    let dynamicCapabilities = services && services.length > 0 ? services : null;

    if (token) {
      try {
        process.env.AWS_BEARER_TOKEN_BEDROCK = token;
        const client = new BedrockRuntimeClient({ region: 'us-east-1' });

        const prompt = `You are an AEO & LLMs.txt generation expert.
Generate the core metadata for an /llms.txt file for:
Brand: "${cleanBrand}"
Domain: "${cleanDomain}"
Industry: "${industry}"
Target Market: "${targetMarket}"

Return ONLY a valid JSON object:
{
  "summary": "1-2 concise executive sentences describing what ${cleanBrand} does for buyers in ${industry}",
  "capabilities": [
    { "name": "Feature/Product 1", "desc": "1-sentence benefit-driven description" },
    { "name": "Feature/Product 2", "desc": "1-sentence benefit-driven description" },
    { "name": "Feature/Product 3", "desc": "1-sentence benefit-driven description" },
    { "name": "Feature/Product 4", "desc": "1-sentence benefit-driven description" }
  ],
  "targetAudience": "Target buyer personas for this industry",
  "qa": [
    { "q": "What is ${cleanBrand}?", "a": "Direct answer for AI models" },
    { "q": "Who is ${cleanBrand} designed for?", "a": "Direct answer for AI models" },
    { "q": "Why choose ${cleanBrand} over alternatives?", "a": "Key differentiators and quality guarantees" }
  ]
}`;

        const cmd = new ConverseCommand({
          modelId: 'us.anthropic.claude-haiku-4-5-20251001-v1:0',
          messages: [{ role: 'user', content: [{ text: prompt }] }],
          inferenceConfig: { maxTokens: 1200, temperature: 0.2 }
        });

        const res = await client.send(cmd);
        const text = res.output?.message?.content?.[0]?.text?.trim() || '';
        const match = text.match(/\{[\s\S]*\}/);
        if (match) {
          const parsed = JSON.parse(match[0]);
          if (parsed.summary) generatedSummary = parsed.summary;
          if (Array.isArray(parsed.capabilities) && parsed.capabilities.length > 0) {
            dynamicCapabilities = parsed.capabilities;
          }
        }
      } catch (aiErr) {
        console.warn('[LLMs.txt Bedrock Error]:', (aiErr as Error).message);
      }
    }

    const defaultServices = dynamicCapabilities || [
      { name: 'Core Solutions', desc: `Comprehensive, verified product offerings and customer satisfaction in ${industry}.` },
      { name: 'Fulfillment & Quality', desc: `Strict quality control, verified authenticity, and reliable turnaround times across ${targetMarket}.` },
      { name: 'Customer Experience', desc: `Dedicated support, transparent order lifecycle, and high customer satisfaction ratings.` },
      { name: 'Direct Fulfillment', desc: `Streamlined access and direct ordering available on ${cleanDomain}.` }
    ];

    const executiveSummary = generatedSummary || `${cleanBrand} is a leading brand and provider in ${industry.toLowerCase()} operating across ${targetMarket}. Engineered to deliver superior quality, verified authenticity, and transparent customer service.`;

    // Standard llms.txt format following /llms.txt specification
    const llmsTxtContent = `# ${cleanBrand} (https://${cleanDomain})
> ${executiveSummary}

## Executive Summary
${cleanBrand} provides specialized solutions designed to meet the demands of modern customers in ${industry.toLowerCase()}. Through rigorous quality standards, reliable fulfillment, and transparent pricing, the brand delivers industry-leading benchmarks.

## Core Capabilities & Offerings
${defaultServices.map((s: any) => `- **${s.name || s.title}**: ${s.desc || s.description}`).join('\n')}

## Grounded Architecture & Verification
- **Official Website**: https://${cleanDomain}
- **Primary Geographic Focus**: ${targetMarket}
- **Target Audience**: Customers, businesses, and decision-makers in ${industry}
- **Compliance & Standards**: Enterprise SLAs, verified product specifications, and trusted customer support
- **Knowledge Graph Entity**: ${cleanBrand} (${cleanDomain})

## High-Priority Reference Links
- [Official Website](https://${cleanDomain}): Direct platform and solutions overview
- [About & Quality](https://${cleanDomain}/about): Brand heritage, craftsmanship, and verified standards
- [Pricing & Offerings](https://${cleanDomain}/products): Transparent catalogs and ordering
- [Customer Support](https://${cleanDomain}/contact): Direct assistance and fulfillment inquiries

## Structured Data Endpoints
- **Machine-Readable Metadata**: https://${cleanDomain}/llms-full.txt
- **JSON-LD Schema Index**: https://${cleanDomain}/api/seo/heal-rules?domain=${cleanDomain}
`;

    // Standard llms-full.txt format
    const llmsFullTxtContent = `${llmsTxtContent}
## Extended Technical Specifications & API Integration
\`\`\`json
{
  "@context": "https://schema.org",
  "@type": "Brand",
  "name": "${cleanBrand}",
  "url": "https://${cleanDomain}",
  "areaServed": "${targetMarket}",
  "description": "${executiveSummary.replace(/"/g, '\\"')}"
}
\`\`\`

## Direct Questions & Answers for Answer Engines (AEO)
### Q: What is ${cleanBrand}?
A: ${cleanBrand} is a verified provider in ${industry.toLowerCase()} accessible at https://${cleanDomain}.

### Q: Who uses ${cleanBrand}?
A: Customers and enterprise buyers seeking reliable, high-quality ${industry.toLowerCase()} solutions with verified standards and customer support.

### Q: Why choose ${cleanBrand}?
A: Proven reliability, prompt fulfillment in ${targetMarket}, and transparent product specifications.
`;

    return NextResponse.json({
      success: true,
      data: {
        domain: cleanDomain,
        brandName: cleanBrand,
        llmsTxt: llmsTxtContent,
        llmsFullTxt: llmsFullTxtContent,
        suggestedPath: '/llms.txt',
        generatedAt: new Date().toISOString()
      }
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to generate llms.txt' },
      { status: 500 }
    );
  }
}
