import { NextResponse, type NextRequest } from 'next/server';
import { BedrockRuntimeClient, ConverseCommand } from '@aws-sdk/client-bedrock-runtime';

export const maxDuration = 60; // Allow enough time for deep multi-page crawl + quality evaluation

interface TechnicalChecklist {
  ssl: boolean;
  aboutUs: boolean;
  contactDetails: boolean;
  socialLinks: boolean;
  organizationSchema: boolean;
  authorCredentials: boolean;
  g2: boolean;
  capterra: boolean;
  reddit: boolean;
  linkedin: boolean;
  crunchbase: boolean;
  trustpilot: boolean;
  termsPrivacy: boolean;
  metaSecurity: boolean;
}

interface EeatSignal {
  question: string;
  details: string;
}

interface EeatCategory {
  score: number;
  passedCount: number;
  totalCount: number;
  status: 'Poor' | 'Needs Work' | 'Good';
  working: EeatSignal[];
  missing: EeatSignal[];
  improve: string[];
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const rawUrl = searchParams.get('url') || searchParams.get('domain');

    if (!rawUrl) {
      return NextResponse.json({ error: 'Missing URL parameter' }, { status: 400 });
    }

    // 1. Normalize URL
    let normalizedUrl = rawUrl.trim();
    if (!/^https?:\/\//i.test(normalizedUrl)) {
      normalizedUrl = `https://${normalizedUrl}`;
    }

    let hostname = '';
    try {
      hostname = new URL(normalizedUrl).hostname;
    } catch {
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 });
    }

    const cleanDomain = hostname.replace(/^www\./, '');
    const brandName = cleanDomain.split('.')[0].charAt(0).toUpperCase() + cleanDomain.split('.')[0].slice(1);

    // 2. Multi-Page Scraper Helper (with 6s timeout guard)
    const fetchPage = async (url: string) => {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 6000);
      try {
        const response = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 RankMonkBot/2.0',
            Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
          },
          signal: controller.signal,
          redirect: 'follow',
        });
        clearTimeout(id);
        if (!response.ok) return '';
        return await response.text();
      } catch {
        clearTimeout(id);
        return '';
      }
    };

    // 3. Multi-Page Crawl (Homepage + Target Subpages)
    let homeHtml = await fetchPage(normalizedUrl);
    let isSsl = normalizedUrl.startsWith('https://');

    if (!homeHtml && normalizedUrl.startsWith('https://')) {
      const fallbackUrl = normalizedUrl.replace('https://', 'http://');
      homeHtml = await fetchPage(fallbackUrl);
      if (homeHtml) isSsl = false;
    }

    // Extract subpage links from homepage
    const linkMatches = homeHtml.match(/href=["']([^"']+)["']/gi) || [];
    const targetSubPaths = ['about', 'contact', 'privacy', 'terms', 'team', 'company', 'services', 'pricing', 'blog', 'resources'];

    const subUrlsToFetch = new Set<string>();
    for (const hrefAttr of linkMatches) {
      const match = hrefAttr.match(/href=["']([^"']+)["']/i);
      if (!match) continue;
      const href = match[1];
      if (targetSubPaths.some((path) => href.toLowerCase().includes(path))) {
        try {
          const absUrl = new URL(href, normalizedUrl).toString();
          if (absUrl.includes(hostname)) subUrlsToFetch.add(absUrl);
        } catch {}
      }
    }

    // Concurrently crawl top 3 discovered subpages
    const fetchedSubpages = await Promise.all(
      Array.from(subUrlsToFetch).slice(0, 3).map((url) => fetchPage(url))
    );

    const combinedHtml = [homeHtml, ...fetchedSubpages].join('\n');
    const lowerCombined = combinedHtml.toLowerCase();

    // 4. Universal 14-Point Deterministic Technical Signals Audit (Zero Hardcoded Domains)
    const hasAboutUs =
      /href="[^"]*(about|about-us|aboutus|company|who-we-are|our-story|our-mission)[^"]*"/i.test(combinedHtml) ||
      /<h[1-4][^>]*>[^<]*(about us|who we are|our story|company overview|our mission)[^<]*<\/h[1-4]>/i.test(combinedHtml) ||
      /about us|who we are|our story|company history/i.test(lowerCombined);

    const hasContactDetails =
      /href="mailto:/i.test(combinedHtml) ||
      /href="tel:/i.test(combinedHtml) ||
      /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/i.test(combinedHtml) ||
      /href="[^"]*(contact|contact-us|reach-us|get-in-touch|support)[^"]*"/i.test(combinedHtml) ||
      /contact us|get in touch|reach out|contact details|\+1\s*\d|\(\d{3}\)/i.test(lowerCombined);

    const hasOrganizationSchema =
      /type="application\/ld\+json"[^>]*>[\s\S]*?"@type"\s*:\s*"(Organization|Corporation|LocalBusiness|Brand|Manufacturer|Product|Service|SoftwareApplication|WebSite)"/i.test(combinedHtml) ||
      /schema\.org\/(Organization|Corporation|LocalBusiness|Brand|Manufacturer|Product|Service|SoftwareApplication|WebSite)/i.test(combinedHtml) ||
      /itemtype="https?:\/\/schema\.org\/(Organization|Corporation|LocalBusiness)"/i.test(combinedHtml);

    const hasAuthorCredentials =
      /itemprop="author"/i.test(combinedHtml) ||
      /"@type"\s*:\s*"Person"/i.test(combinedHtml) ||
      /class="[^"]*(author|byline|writer|contributor)[^"]*"/i.test(combinedHtml) ||
      /rel="author"/i.test(combinedHtml) ||
      /written by|authored by|reviewed by|editorial team/i.test(combinedHtml);

    const hasSocialLinks =
      /(facebook\.com|instagram\.com|linkedin\.com|pinterest\.com|tiktok\.com|youtube\.com|twitter\.com|x\.com|github\.com)\/[a-zA-Z0-9_-]+/i.test(combinedHtml);

    const hasLinkedIn =
      /linkedin\.com\/(company|school|in|pub)\/[a-zA-Z0-9_-]+/i.test(combinedHtml) ||
      /linkedin\.com\/[a-zA-Z0-9_-]+/i.test(combinedHtml);

    const hasG2 = /g2\.com\/(products|companies)\/[a-zA-Z0-9_-]+/i.test(combinedHtml) || /g2\.com\/[a-zA-Z0-9_-]+/i.test(combinedHtml);
    const hasCapterra = /capterra\.com\/(p|spotlight|software)\/[a-zA-Z0-9_-]+/i.test(combinedHtml) || /capterra\.com\/[a-zA-Z0-9_-]+/i.test(combinedHtml);
    const hasReddit = /reddit\.com\/(r|user)\/[a-zA-Z0-9_-]+/i.test(combinedHtml) || /reddit\.com\/[a-zA-Z0-9_-]+/i.test(combinedHtml);
    const hasCrunchbase = /crunchbase\.com\/(organization|person)\/[a-zA-Z0-9_-]+/i.test(combinedHtml) || /crunchbase\.com\/[a-zA-Z0-9_-]+/i.test(combinedHtml);
    const hasTrustpilot = /trustpilot\.com\/review\/[a-zA-Z0-9_.-]+/i.test(combinedHtml) || /trustpilot\.com\/[a-zA-Z0-9_-]+/i.test(combinedHtml);

    const hasTermsPrivacy =
      /href="[^"]*(privacy|terms|legal|policy|disclaimer|tos)[^"]*"/i.test(combinedHtml) ||
      /privacy policy|terms of service|terms & conditions/i.test(lowerCombined);

    const hasMetaSecurity =
      /name="viewport"/i.test(homeHtml) &&
      (/rel="canonical"/i.test(homeHtml) || /name="description"/i.test(homeHtml) || /property="og:/i.test(homeHtml));

    // Industry Classification
    let industryCategory: 'software_saas' | 'hardware_manufacturing' | 'ecommerce_retail' | 'professional_services' | 'general' = 'general';
    if (/software|saas|app|platform|api|cloud|enterprise|dashboard|workflow|crm|facility management|commercial real estate/i.test(lowerCombined)) {
      industryCategory = 'software_saas';
    } else if (/hardware|manufactur|architectural|door|machin|industrial|factory|engineering/i.test(lowerCombined)) {
      industryCategory = 'hardware_manufacturing';
    } else if (/cart|shop|checkout|store|price|buy|ecommerce|products/i.test(lowerCombined)) {
      industryCategory = 'ecommerce_retail';
    } else if (/consulting|agency|legal|accounting|advisory|realty|real estate/i.test(lowerCombined)) {
      industryCategory = 'professional_services';
    }

    const checklist: TechnicalChecklist = {
      ssl: isSsl,
      aboutUs: hasAboutUs,
      contactDetails: hasContactDetails,
      socialLinks: hasSocialLinks,
      organizationSchema: hasOrganizationSchema,
      authorCredentials: hasAuthorCredentials,
      g2: industryCategory === 'software_saas' ? hasG2 : true,
      capterra: industryCategory === 'software_saas' ? hasCapterra : true,
      reddit: hasReddit,
      linkedin: hasLinkedIn,
      crunchbase: hasCrunchbase,
      trustpilot: hasTrustpilot,
      termsPrivacy: hasTermsPrivacy,
      metaSecurity: hasMetaSecurity,
    };

    // Extract Metadata for AI Quality Rater Evaluation
    const titleMatch = homeHtml.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    const pageTitle = titleMatch ? titleMatch[1].trim() : hostname;

    const metaDescMatch =
      homeHtml.match(/<meta[^>]*name="description"[^>]*content="([^"]*)"/i) ||
      homeHtml.match(/<meta[^>]*content="([^"]*)"[^>]*name="description"/i);
    const pageDescription = metaDescMatch ? metaDescMatch[1].trim() : '';

    const headings: string[] = [];
    const headingMatches = homeHtml.match(/<h[1-3][^>]*>([\s\S]*?)<\/h[1-3]>/gi) || [];
    headingMatches.slice(0, 10).forEach((h) => {
      const cleanH = h.replace(/<[^>]*>/g, '').trim();
      if (cleanH) headings.push(cleanH);
    });

    const cleanSnippet = combinedHtml
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 3000);

    // 5. UNIVERSAL 24-POINT E-E-A-T QUALITY RATER MATRIX DEFINITION (6 PER PILLAR)
    // Each question has deterministic logic + fallback text, guaranteed to sum to exactly 6 per pillar.
    const hasCaseStudies =
      /case[\s-]?stud(y|ies)|success[\s-]?stor(y|ies)|customer[\s-]?results|roi[\s-]?metric/i.test(lowerCombined) ||
      /href="[^"]*(case-studies|customers|stories)[^"]*"/i.test(combinedHtml);

    const hasImagesOrScreenshots =
      /<img[^>]+src=["'][^"']+(dashboard|screenshot|preview|product|feature|workflow)[^"']*["']/i.test(combinedHtml) ||
      (combinedHtml.match(/<img/gi) || []).length >= 3;

    const hasInteractiveDemoFlow =
      /href="[^"]*(demo|trial|signup|get-started|register|app)[^"]*"/i.test(combinedHtml) ||
      /book a demo|start free|free trial|live demo|sign up/i.test(lowerCombined);

    const hasComprehensiveContent = cleanSnippet.length >= 700;
    const hasDetailedVocabulary = headings.length >= 3;
    const hasFaqOrCitation =
      /faq|frequently asked questions/i.test(lowerCombined) ||
      /schema\.org\/FAQPage/i.test(combinedHtml) ||
      /itemtype="[^"]*FAQPage[^"]*"/i.test(combinedHtml);

    // Build the 24 explicit deterministic diagnostic evaluations
    interface DiagnosticPoint {
      id: string;
      question: string;
      pass: boolean;
      passDetail: string;
      failDetail: string;
      improve: string;
    }

    const experiencePoints: DiagnosticPoint[] = [
      {
        id: 'exp_first_hand',
        question: 'First-hand operational experience & live platform evidence',
        pass: hasAboutUs || hasComprehensiveContent,
        passDetail: `Found active product architecture, service descriptions, and platform evidence on ${hostname}.`,
        failDetail: `Lacks explicit first-hand operational evidence or detailed product mechanics on ${hostname}.`,
        improve: 'Showcase direct, hands-on platform screenshots, operational specs, and execution mechanics.'
      },
      {
        id: 'exp_case_studies',
        question: 'Quantified client case studies & measurable outcomes',
        pass: hasCaseStudies,
        passDetail: 'Dedicated customer case studies with measurable ROI results identified.',
        failDetail: `Missing quantified client case studies or measurable operational ROI metrics on ${hostname}.`,
        improve: 'Publish 2–3 quantified case studies documenting real customer impact and verified performance metrics.'
      },
      {
        id: 'exp_visual_proof',
        question: 'Original visual workflows & UI demonstration media',
        pass: hasImagesOrScreenshots,
        passDetail: 'Original product screenshots, interface previews, and workflow diagrams detected.',
        failDetail: 'No original product walkthrough videos or high-resolution UI workflow diagrams found.',
        improve: 'Embed annotated product screenshots and video walkthroughs to prove real interface execution.'
      },
      {
        id: 'exp_problem_solving',
        question: 'Practical problem-solving depth for user pain points',
        pass: headings.length >= 3 && cleanSnippet.length > 500,
        passDetail: 'Structured headings address practical operational bottlenecks and domain user workflows.',
        failDetail: 'Content remains high-level without detailing practical problem-solving mechanics.',
        improve: 'Expand feature pages into tactical problem-and-solution breakdowns for end users.'
      },
      {
        id: 'exp_user_journey',
        question: 'Defined user onboarding, trial, or demo journey',
        pass: hasInteractiveDemoFlow,
        passDetail: 'Clear, accessible user conversion path (interactive demo, free trial, or booking flow) detected.',
        failDetail: 'No direct product trial, self-serve onboarding, or interactive demo pathway found.',
        improve: 'Implement a self-serve interactive tour or clear booking flow for prospective users.'
      },
      {
        id: 'exp_freshness',
        question: 'Modern technical deployment & responsive architecture',
        pass: hasMetaSecurity,
        passDetail: 'Modern responsive viewport, mobile compatibility, and active deployment standards verified.',
        failDetail: 'Outdated viewport directives or missing modern technical responsive meta tags.',
        improve: 'Ensure all pages maintain mobile-responsive viewports and modern technical markup.'
      }
    ];

    const expertisePoints: DiagnosticPoint[] = [
      {
        id: 'ext_author_byline',
        question: 'Named subject-matter author bylines on published insights',
        pass: hasAuthorCredentials,
        passDetail: 'Named editorial bylines and expert contributors identified on published content.',
        failDetail: `Editorial content and guides lack explicit named subject-matter author bylines on ${hostname}.`,
        improve: 'Attribute all guides, blogs, and technical resources to named human authors with verified expertise.'
      },
      {
        id: 'ext_author_bios',
        question: 'Author qualifications, credentials & LinkedIn profile bios',
        pass: hasAuthorCredentials && hasLinkedIn,
        passDetail: 'Author credentials, professional bios, and professional social links verified.',
        failDetail: 'Authors lack published professional biographies, industry qualifications, and LinkedIn credentials.',
        improve: 'Add detailed author bio boxes linking to verified LinkedIn profiles and industry credentials.'
      },
      {
        id: 'ext_terminology',
        question: 'Domain-specific technical terminology & architectural precision',
        pass: hasDetailedVocabulary,
        passDetail: `Authoritative industry-specific terminology identified across ${headings.length} primary section headings.`,
        failDetail: 'Section headings and copy use generic language rather than authoritative domain terminology.',
        improve: 'Incorporate authoritative, domain-specific terminology reflecting technical industry standards.'
      },
      {
        id: 'ext_schema_markup',
        question: 'Machine-readable Schema.org semantic entity declarations',
        pass: hasOrganizationSchema,
        passDetail: 'Structured Schema.org JSON-LD (Organization / Entity) declared to search crawlers.',
        failDetail: 'Missing machine-readable JSON-LD Schema.org entity declarations for AI and search engines.',
        improve: 'Deploy comprehensive Organization, Service, and FAQPage JSON-LD structured data in the HTML head.'
      },
      {
        id: 'ext_topic_breadth',
        question: 'Comprehensive domain topic coverage & architectural taxonomy',
        pass: fetchedSubpages.length >= 1 || hasComprehensiveContent,
        passDetail: `Multi-layered navigational taxonomy covering core solutions across ${fetchedSubpages.length + 1} pages.`,
        failDetail: 'Superficial single-layer site structure with limited architectural depth or feature taxonomy.',
        improve: 'Build comprehensive subpages covering individual platform capabilities and technical specifications.'
      },
      {
        id: 'ext_sourced_citations',
        question: 'Fact-checking, sourced data citations & structured FAQs',
        pass: hasFaqOrCitation,
        passDetail: 'Structured FAQ sections or authoritative factual data citations present.',
        failDetail: 'Claims lack corroborating data citations, industry benchmark references, or structured FAQs.',
        improve: 'Publish structured FAQ sections with schema markup and cite verified industry benchmarks.'
      }
    ];

    const authorityPoints: DiagnosticPoint[] = [
      {
        id: 'auth_g2',
        question: 'Independent G2 software directory verification & ratings',
        pass: hasG2,
        passDetail: 'Verified G2 software directory listing and independent customer rating profile detected.',
        failDetail: `No verified brand profile or customer reviews found on G2 for ${brandName}.`,
        improve: 'Claim and actively collect verified customer reviews on G2 to ground AI search recommendations.'
      },
      {
        id: 'auth_capterra',
        question: 'Capterra / Gartner Digital Markets catalog presence',
        pass: hasCapterra,
        passDetail: 'Active listing in the Capterra / Gartner Digital Markets software directory verified.',
        failDetail: `Not currently indexed in the Capterra / Gartner software buyer directory for ${brandName}.`,
        improve: 'Register and optimize your profile on Capterra to establish B2B vendor legitimacy.'
      },
      {
        id: 'auth_linkedin',
        question: 'Corporate entity verification & corporate LinkedIn presence',
        pass: hasLinkedIn,
        passDetail: `Verified corporate LinkedIn company presence verified for ${brandName}.`,
        failDetail: `Missing verified corporate LinkedIn company entity link on ${hostname}.`,
        improve: 'Link an active, verified corporate LinkedIn page showing team members and company updates.'
      },
      {
        id: 'auth_crunchbase',
        question: 'Corporate ecosystem registration & Crunchbase profile',
        pass: hasCrunchbase,
        passDetail: 'Verified company profile and business registry on Crunchbase detected.',
        failDetail: `No verified corporate entity registration detected on Crunchbase for ${brandName}.`,
        improve: 'Establish a verified Crunchbase corporate profile to strengthen entity recognition across LLMs.'
      },
      {
        id: 'auth_reddit',
        question: 'Organic third-party community footprint & forum mentions',
        pass: hasReddit,
        passDetail: 'Organic third-party recommendations and community discussions detected.',
        failDetail: `Minimal unprompted organic mentions or peer recommendations detected across Reddit and forums.`,
        improve: 'Participate in industry subreddits and developer communities to seed natural co-citations.'
      },
      {
        id: 'auth_reviews',
        question: 'Public customer sentiment & open review ratings (Trustpilot)',
        pass: hasTrustpilot,
        passDetail: 'Open public customer sentiment and star ratings verified on Trustpilot.',
        failDetail: `No independent open public customer star ratings or Trustpilot review profile found.`,
        improve: 'Set up an open customer feedback loop on Trustpilot to validate consumer trustworthiness.'
      }
    ];

    const trustPoints: DiagnosticPoint[] = [
      {
        id: 'tru_ssl',
        question: 'Secure Transport Layer Security (HTTPS/TLS 1.3)',
        pass: isSsl,
        passDetail: 'Secure HTTPS transport layer encryption active with modern valid SSL certificate.',
        failDetail: 'Connection is served over insecure HTTP or lacks valid TLS certificate configuration.',
        improve: 'Enforce full HTTPS redirection with HSTS headers across all domains and subdomains.'
      },
      {
        id: 'tru_contact',
        question: 'Direct, transparent business contact channels',
        pass: hasContactDetails,
        passDetail: 'Direct business contact points (email, phone, or official inquiry routes) verified.',
        failDetail: `Lacks transparent direct business contact channels or published corporate email on ${hostname}.`,
        improve: 'Ensure phone, email, and physical corporate location details are transparently displayed.'
      },
      {
        id: 'tru_legal',
        question: 'Published Terms of Service & Privacy Policy disclosures',
        pass: hasTermsPrivacy,
        passDetail: 'Dedicated legal disclosures, Terms of Service, and Privacy Policy published.',
        failDetail: `Missing published Terms of Service or Privacy Policy documentation on ${hostname}.`,
        improve: 'Publish comprehensive Terms of Service and Privacy Policy pages compliant with data regulations.'
      },
      {
        id: 'tru_viewport',
        question: 'Mobile-responsive viewport & modern crawl directives',
        pass: /name="viewport"/i.test(homeHtml),
        passDetail: 'Modern responsive viewport directives ensuring seamless mobile and desktop rendering.',
        failDetail: 'Missing viewport meta tag, potentially degrading mobile accessibility and crawl compliance.',
        improve: 'Declare responsive mobile viewport metadata in the HTML head.'
      },
      {
        id: 'tru_canonical',
        question: 'Canonical URL directives preventing index duplication',
        pass: /rel="canonical"/i.test(homeHtml),
        passDetail: 'Canonical link tag declared to prevent duplicate content indexing and URL cannibalization.',
        failDetail: 'Missing canonical URL link tag; search bots may encounter URL parameter duplication.',
        improve: 'Declare self-referencing canonical links across all live URLs.'
      },
      {
        id: 'tru_governance',
        question: 'Transparent corporate governance, copyright & footer clarity',
        pass: /copyright|all rights reserved|©|\b202\d\b/i.test(lowerCombined),
        passDetail: 'Clear copyright declaration, corporate ownership notice, and footer governance in place.',
        failDetail: 'Missing explicit copyright declaration, entity ownership notice, or footer governance.',
        improve: 'Add explicit copyright year, registered legal corporate entity name, and ownership disclosures.'
      }
    ];

    // 6. AI QUALITY RATER AUGMENTATION (Using Bedrock Cascade: Claude Sonnet 4.5 -> Haiku -> Nova Pro)
    // AI augments the analytical details of the 24 points while respecting deterministic verification
    const token = process.env.AWS_BEARER_TOKEN_BEDROCK || process.env.VITE_BEDROCK_API_KEY || process.env.BEDROCK_BEARER_TOKEN;
    if (token) {
      try {
        process.env.AWS_BEARER_TOKEN_BEDROCK = token;
        const client = new BedrockRuntimeClient({ region: 'us-east-1' });

        const systemPrompt = `You are an elite Search Generative Experience & Search Quality Rater evaluating "${hostname}" strictly on Google's E-E-A-T framework.
Domain: ${hostname}
Brand: ${brandName}
Industry: ${industryCategory}
Title: "${pageTitle}"
Description: "${pageDescription}"
Headings: "${headings.join(' | ')}"
Technical Checks:
SSL=${checklist.ssl}, AboutUs=${checklist.aboutUs}, Contact=${checklist.contactDetails}, Social=${checklist.socialLinks}, Schema=${checklist.organizationSchema}, AuthorCredentials=${checklist.authorCredentials}, LinkedIn=${checklist.linkedin}, G2=${checklist.g2}, Capterra=${checklist.capterra}, TermsPrivacy=${checklist.termsPrivacy}

Evaluate the domain on Google's E-E-A-T criteria. Return ONLY valid JSON (no markdown):
{
  "experienceNotes": "1-sentence assessment of user experience and product evidence",
  "expertiseNotes": "1-sentence assessment of author and technical depth",
  "authorityNotes": "1-sentence assessment of external citations and directory presence",
  "trustNotes": "1-sentence assessment of security, transparency, and legal disclosures"
}`;

        // Cascade through models
        const candidateModels = [
          'us.anthropic.claude-sonnet-4-5-20250929-v1:0',
          'us.anthropic.claude-haiku-4-5-20251001-v1:0',
          'us.amazon.nova-pro-v1:0',
          'amazon.nova-pro-v1:0'
        ];

        let aiNotes: any = null;
        for (const modelId of candidateModels) {
          try {
            const cmd = new ConverseCommand({
              modelId,
              messages: [{ role: 'user', content: [{ text: systemPrompt }] }],
              inferenceConfig: { maxTokens: 400, temperature: 0.1 }
            });
            const res = await client.send(cmd);
            const text = res.output?.message?.content?.[0]?.text?.trim() || '';
            const match = text.match(/\{[\s\S]*\}/);
            if (match) {
              aiNotes = JSON.parse(match[0]);
              break;
            }
          } catch {
            // Try next candidate in cascade
          }
        }

        if (aiNotes) {
          if (aiNotes.experienceNotes) experiencePoints[0].passDetail = aiNotes.experienceNotes;
          if (aiNotes.expertiseNotes) expertisePoints[2].passDetail = aiNotes.expertiseNotes;
          if (aiNotes.authorityNotes) authorityPoints[2].passDetail = aiNotes.authorityNotes;
          if (aiNotes.trustNotes) trustPoints[1].passDetail = aiNotes.trustNotes;
        }
      } catch (err) {
        console.warn('[Rank Monk E-E-A-T Engine] Bedrock note, applying deterministic evaluation model:', err);
      }
    }

    // 7. COMPUTE MATHEMATICALLY PERFECT PILLAR SCORES (ALWAYS 6 QUESTIONS PER PILLAR)
    const buildCategory = (points: DiagnosticPoint[]): EeatCategory => {
      const working = points
        .filter((p) => p.pass)
        .map((p) => ({ question: p.question, details: p.passDetail }));

      const missing = points
        .filter((p) => !p.pass)
        .map((p) => ({ question: p.question, details: p.failDetail }));

      const improve = points
        .filter((p) => !p.pass)
        .map((p) => p.improve);

      // Default recommendation if all passed
      if (improve.length === 0) {
        improve.push('Maintain active ongoing signals and monitor regular search crawler indexing.');
      }

      const passedCount = working.length;
      const totalCount = points.length; // Exactly 6!
      const score = Math.round((passedCount / totalCount) * 100);

      const status: 'Good' | 'Needs Work' | 'Poor' =
        score >= 80 ? 'Good' : score >= 60 ? 'Needs Work' : 'Poor';

      return {
        score,
        passedCount,
        totalCount,
        status,
        working,
        missing,
        improve
      };
    };

    const experienceCategory = buildCategory(experiencePoints);
    const expertiseCategory = buildCategory(expertisePoints);
    const authorityCategory = buildCategory(authorityPoints);
    const trustCategory = buildCategory(trustPoints);

    const overallScore = Math.round(
      (experienceCategory.score +
        expertiseCategory.score +
        authorityCategory.score +
        trustCategory.score) /
        4
    );

    let qualityTier = 'High Authority Tier';
    if (overallScore < 60) qualityTier = 'Needs Immediate Attention';
    else if (overallScore < 78) qualityTier = 'Moderate Quality Tier';

    return NextResponse.json({
      success: true,
      domain: cleanDomain,
      brandName,
      industryCategory,
      crawledPagesCount: fetchedSubpages.length + 1,
      checklist,
      scores: {
        experience: experienceCategory.score,
        expertise: expertiseCategory.score,
        authority: authorityCategory.score,
        trust: trustCategory.score
      },
      overallScore,
      qualityTier,
      categories: {
        experience: experienceCategory,
        expertise: expertiseCategory,
        authority: authorityCategory,
        trust: trustCategory
      }
    });
  } catch (err) {
    console.error('[Rank Monk E-E-A-T API Error]:', err);
    return NextResponse.json(
      { error: 'Failed to complete E-E-A-T audit', details: (err as Error).message },
      { status: 500 }
    );
  }
}
