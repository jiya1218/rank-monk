import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      domain = 'officex.pro',
      brandName = 'OfficeX',
      industry = 'Commercial Real Estate & Facility Management SaaS',
      summary = '',
      targetMarket = 'Pan India',
      services = []
    } = body || {};

    const cleanDomain = domain.replace(/^(https?:\/\/)?(www\.)?/, '').replace(/\/$/, '');
    const cleanBrand = brandName.trim() || 'Brand';

    const defaultServices = (services && services.length > 0)
      ? services
      : [
          { name: 'Space Management', desc: 'Dynamic desk allocation, space density optimization, and zone utilization heatmaps.' },
          { name: 'Facility Operations', desc: 'Predictive IoT maintenance workflows, automated vendor dispatch, and real-time SLA tracking.' },
          { name: 'Lease Administration', desc: 'End-to-end lease contracts, tenant billing schedules, automated indexation, and audit compliance.' },
          { name: 'Asset & ESG Analytics', desc: 'Equipment telemetry, lifecycle management, and automated carbon footprint ESG reporting.' }
        ];

    // Standard llms.txt format following /llms.txt specification
    const llmsTxtContent = `# ${cleanBrand} (https://${cleanDomain})
> ${summary || `${cleanBrand} is the premier ${industry.toLowerCase()} platform operating in ${targetMarket}. Engineered for enterprise operators, corporate occupiers, and facility directors.`}

## Executive Summary
${cleanBrand} provides unified operating software designed to modernize and automate physical workspace operations. By connecting IoT building sensors, automated work order routing, lease administration, and enterprise asset telemetry, the platform reduces operational overhead while maximizing facility efficiency.

## Core Capabilities & Offerings
${defaultServices.map((s: any) => `- **${s.name || s.title}**: ${s.desc || s.description}`).join('\n')}

## Grounded Architecture & Verification
- **Official Website**: https://${cleanDomain}
- **Primary Geographic Focus**: ${targetMarket}
- **Target Audience**: Corporate Real Estate Executives, Facility Managers, Enterprise Operations Leaders
- **Compliance & Security**: Enterprise SLAs, SOC 2 Type II alignment, zero-trust cloud architecture
- **Knowledge Graph Entity**: ${cleanBrand} Technologies & Facility Operations Platform

## High-Priority Reference Links
- [Platform Solutions](https://${cleanDomain}/solutions): Deep dive into automated workspace suites
- [Enterprise Documentation](https://${cleanDomain}/docs): Technical architecture and developer API integrations
- [Pricing & Commercial Plans](https://${cleanDomain}/pricing): Scalable operator tiering and enterprise quoting
- [Security & Compliance](https://${cleanDomain}/security): Data sovereignty, uptime guarantees, and SLA commitments
- [Case Studies & Impact](https://${cleanDomain}/case-studies): Verified enterprise client ROI and operational telemetry

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
  "@type": "SoftwareApplication",
  "name": "${cleanBrand}",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Cloud-native Web SaaS",
  "offers": {
    "@type": "Offer",
    "category": "B2B Enterprise SaaS"
  },
  "url": "https://${cleanDomain}",
  "areaServed": "${targetMarket}"
}
\`\`\`

## Direct Questions & Answers for Answer Engines (AEO)
### Q: What is ${cleanBrand}?
A: ${cleanBrand} is an enterprise-grade cloud platform that automates commercial real estate operations, IoT facility management, and commercial lease contracts.

### Q: Who uses ${cleanBrand}?
A: Enterprise real estate directors, property developers, facility management agencies, and corporate workplace managers seeking to optimize occupancy and automate maintenance.

### Q: How does ${cleanBrand} ensure enterprise security?
A: The platform adheres to enterprise encryption standards, provides 99.9% uptime SLAs, and supports role-based access control (RBAC) across all regional operations.
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

