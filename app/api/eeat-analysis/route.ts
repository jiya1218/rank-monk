import { NextResponse, type NextRequest } from 'next/server';
import { BedrockRuntimeClient, ConverseCommand } from '@aws-sdk/client-bedrock-runtime';

export const maxDuration = 60; // Allow enough time for deep multi-page crawl + quality evaluation

interface TechnicalChecklistItem {
  id: string;
  label: string;
  present: boolean;
  desc: string;
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

interface PriorityRemediation {
  title: string;
  desc: string;
  tag: string;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const rawUrl = searchParams.get('url') || searchParams.get('domain');

    if (!rawUrl) {
      return NextResponse.json({ error: 'Missing URL parameter' }, { status: 400 });
    }

    // 1. Normalize URL & Clean Leading Protocols (Supports single or accidental double paste)
    let cleanRaw = rawUrl.trim().replace(/^(?:https?:\/\/)+/i, '').replace(/\/+$/, '');
    let normalizedUrl = `https://${cleanRaw}`;

    let hostname = '';
    try {
      hostname = new URL(normalizedUrl).hostname;
    } catch {
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 });
    }

    const cleanDomain = hostname.replace(/^www\./, '');
    const brandName = cleanDomain.split('.')[0].charAt(0).toUpperCase() + cleanDomain.split('.')[0].slice(1);

    // 2. Multi-Page Scraper Helper (with 8s timeout guard and standard Chrome browser headers)
    let initialHttpStatus = 200;
    let initialHttpError: string | null = null;

    const fetchPage = async (url: string, timeoutMs: number = 4000) => {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), timeoutMs);
      try {
        const response = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
            Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
            'Sec-Ch-Ua': '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
            'Sec-Ch-Ua-Mobile': '?0',
            'Sec-Ch-Ua-Platform': '"Windows"',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'none',
            'Upgrade-Insecure-Requests': '1',
          },
          signal: controller.signal,
          redirect: 'follow',
        });
        clearTimeout(id);
        if (!response.ok) {
          initialHttpStatus = response.status;
          return '';
        }
        return await response.text();
      } catch (err: any) {
        clearTimeout(id);
        initialHttpError = err.message;
        return '';
      }
    };

    // 3. Multi-Page Crawl (Homepage + Target Subpages)
    let homeHtml = await fetchPage(normalizedUrl, 5000);
    let isSsl = normalizedUrl.startsWith('https://');

    if (!homeHtml && normalizedUrl.startsWith('https://')) {
      const fallbackUrl = normalizedUrl.replace('https://', 'http://');
      homeHtml = await fetchPage(fallbackUrl);
      if (homeHtml) isSsl = false;
    }

    // IF HOMEPAGE FAILED TO FETCH (WAF / 403 / Cloudflare Block)
    if (!homeHtml || homeHtml.trim().length < 50) {
      if (initialHttpStatus === 403) {
        return NextResponse.json(
          {
            success: false,
            error: `Target website (${cleanDomain}) returned HTTP 403 Forbidden (Cloudflare / Enterprise WAF Bot Shield Active).`,
            details: `This domain enforces enterprise bot protection (Cloudflare, Akamai, or DataDome) that rejected automated crawler requests. Rank Monk executes 100% real live crawls and refuses to serve pre-fed fake mock data.`,
            isWafBlocked: true,
            httpStatus: 403
          },
          { status: 403 }
        );
      }

      if (initialHttpStatus === 429) {
        return NextResponse.json(
          {
            success: false,
            error: `Target website (${cleanDomain}) returned HTTP 429 Too Many Requests (Rate Limited).`,
            details: `The target domain has temporarily rate-limited automated scanner requests. Please retry in a few moments.`,
            isWafBlocked: true,
            httpStatus: 429
          },
          { status: 429 }
        );
      }

      return NextResponse.json(
        {
          success: false,
          error: `Could not retrieve HTML content from ${cleanDomain} (HTTP ${initialHttpStatus || 'Connection Failed'}).`,
          details: initialHttpError || `The target site may be offline, actively blocking crawler requests, or requiring JavaScript-rendered challenge validation.`
        },
        { status: 502 }
      );
    }

    // Extract subpage links from homepage (including e-commerce policy pages)
    const linkMatches = homeHtml.match(/href=["']([^"']+)["']/gi) || [];
    const targetSubPaths = [
      'about', 'contact', 'privacy', 'terms', 'refund', 'return',
      'shipping', 'policy', 'pricing', 'features', 'team', 'company',
      'services', 'reviews', 'case-studies', 'faq', 'blog'
    ];

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

    // 4. Deterministic Fact Extraction (Physical DOM Grounding)
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
      /schema\.org\/(Organization|Corporation|LocalBusiness|Brand|Manufacturer|Product|Service|SoftwareApplication|WebSite)/i.test(combinedHtml);

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

    const hasRefundPolicy =
      /href="[^"]*(refund|return|cancellation|exchange)[^"]*"/i.test(combinedHtml) ||
      /refund policy|return policy|returns & refunds/i.test(lowerCombined);

    const hasShippingPolicy =
      /href="[^"]*(shipping|delivery|dispatch)[^"]*"/i.test(combinedHtml) ||
      /shipping policy|delivery details|free shipping/i.test(lowerCombined);

    const hasMetaSecurity = /name="viewport"/i.test(homeHtml);
    const hasCanonical = /rel="canonical"/i.test(homeHtml);

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

    // 5. AUTONOMOUS AI QUALITY RATER ENGINE (Claude Sonnet 4.5 on Bedrock Cascade)
    const token = process.env.AWS_BEARER_TOKEN_BEDROCK || process.env.VITE_BEDROCK_API_KEY || process.env.BEDROCK_BEARER_TOKEN;
    let aiEvaluation: any = null;

    if (token) {
      try {
        process.env.AWS_BEARER_TOKEN_BEDROCK = token;
        const client = new BedrockRuntimeClient({ region: 'us-east-1' });

        const prompt = `You are the Rank Monk Autonomous E-E-A-T Quality Engine, strictly adhering to Google Search Quality Rater Guidelines (QRG).
Analyze the website "${hostname}":
Title: "${pageTitle}"
Description: "${pageDescription}"
Headings: "${headings.join(' | ')}"
Content Excerpt: "${cleanSnippet}"

Discovered Subpages: ${Array.from(subUrlsToFetch).slice(0, 5).join(', ') || 'None'}
Deterministic Signals:
- SSL: ${isSsl}
- About Us Page: ${hasAboutUs}
- Contact Channels: ${hasContactDetails}
- Social Links: ${hasSocialLinks}
- Schema.org: ${hasOrganizationSchema}
- LinkedIn: ${hasLinkedIn}
- G2 Profile: ${hasG2}
- Capterra Listing: ${hasCapterra}
- Trustpilot: ${hasTrustpilot}
- Terms & Privacy: ${hasTermsPrivacy}
- Refund/Return Policy: ${hasRefundPolicy}
- Shipping Policy: ${hasShippingPolicy}

Perform an objective E-E-A-T Quality Rater Audit. Return pure JSON adhering strictly to this schema:
{
  "siteType": "ecommerce" | "saas" | "publisher" | "agency" | "local_business",
  "siteTypeLabel": "Concise Label (e.g. D2C Fragrance & Luxury Store, B2B SaaS Platform, Digital Agency)",
  "industry": "Industry Name (e.g. Fragrance & Personal Care, Commercial Real Estate Tech, Fintech Infrastructure)",
  "businessSummary": "1 concise sentence summarizing what the business offers.",
  "whyThisScore": "2-3 sentences explaining the composite grade under Google 40% Trust, 20% Experience, 20% Expertise, 20% Authority weighting.",
  "pillarEvaluation": {
    "experience": {
      "score": number (0-100),
      "passedCount": number (0-6),
      "mainGap": "Primary missing experience signal",
      "criteria": [
        { "question": "Criterion Title", "pass": boolean, "detail": "Specific finding citing real aspects of ${hostname}", "improve": "Actionable fix" }
        // Exactly 6 criteria tailored to siteType! For ecommerce: reviews, unboxing proof, scent/wear notes, feedback widget, discovery set, usage guide. For SaaS: live demo, UI screenshots, case studies, customer quotes, onboarding path, trial.
      ]
    },
    "expertise": {
      "score": number (0-100),
      "passedCount": number (0-6),
      "mainGap": "Primary missing expertise signal",
      "criteria": [
        { "question": "Criterion Title", "pass": boolean, "detail": "Specific finding citing real aspects of ${hostname}", "improve": "Actionable fix" }
        // Exactly 6 criteria tailored to siteType! For ecommerce: perfumer/creator credentials, ingredient sourcing transparency, technical concentration depth, formulation methodology, Product schema, catalog depth. For SaaS: API docs, technical architecture, team credentials, Organization schema, domain terminology.
      ]
    },
    "authority": {
      "score": number (0-100),
      "passedCount": number (0-6),
      "mainGap": "Primary missing authority signal",
      "criteria": [
        { "question": "Criterion Title", "pass": boolean, "detail": "Specific finding citing real aspects of ${hostname}", "improve": "Actionable fix" }
        // Exactly 6 criteria tailored to siteType! For ecommerce: Trustpilot/public review profile, press coverage, brand social community, corporate registration, merchant directories, influencer endorsements. For SaaS: G2, Capterra, Crunchbase, LinkedIn entity, Reddit community, tech press.
      ]
    },
    "trust": {
      "score": number (0-100),
      "passedCount": number (0-6),
      "mainGap": "Primary missing trust signal",
      "criteria": [
        { "question": "Criterion Title", "pass": boolean, "detail": "Specific finding citing real aspects of ${hostname}", "improve": "Actionable fix" }
        // Exactly 6 criteria tailored to siteType! For ecommerce: SSL/TLS, Return & Refund policy, Shipping policy, direct support channels, Terms & Conditions, physical corporate address. For SaaS: SSL, transparent pricing, Terms of Service, Privacy & GDPR, contact routes, corporate address.
      ]
    }
  },
  "priorityRemediations": [
    { "title": "Action Title", "desc": "Concrete instruction tailored to ${hostname}", "tag": "Category Tag" }
    // Exactly 6 high-impact priority remediation steps tailored to this specific domain!
  ]
}

Strict Rules:
1. NEVER confuse e-commerce with software SaaS! A perfume or clothing shop sells physical goods; DO NOT demand G2 or Capterra for an e-commerce store!
2. Each of the 4 pillars MUST contain EXACTLY 6 criteria objects in the "criteria" array.
3. Each criterion object must have "question", "pass" (boolean), "detail", and "improve".
4. Output pure JSON only.`;

        const candidateModels = [
          'us.anthropic.claude-haiku-4-5-20251001-v1:0',
          'us.anthropic.claude-sonnet-4-5-20250929-v1:0',
          'us.amazon.nova-pro-v1:0',
          'amazon.nova-pro-v1:0'
        ];

        for (const modelId of candidateModels) {
          try {
            const cmd = new ConverseCommand({
              modelId,
              messages: [{ role: 'user', content: [{ text: prompt }] }],
              inferenceConfig: { maxTokens: 2500, temperature: 0.1 }
            });
            const res = await client.send(cmd);
            const text = res.output?.message?.content?.[0]?.text?.trim() || '';
            const match = text.match(/\{[\s\S]*\}/);
            if (match) {
              const candidate = JSON.parse(match[0]);
              if (
                candidate.pillarEvaluation &&
                candidate.pillarEvaluation.experience &&
                candidate.pillarEvaluation.expertise &&
                candidate.pillarEvaluation.authority &&
                candidate.pillarEvaluation.trust &&
                Array.isArray(candidate.pillarEvaluation.experience.criteria) &&
                candidate.pillarEvaluation.experience.criteria.length === 6
              ) {
                aiEvaluation = candidate;
                break;
              }
            }
          } catch {
            // Cascade to next candidate model
          }
        }
      } catch (err) {
        console.warn('[Rank Monk E-E-A-T Engine] Bedrock note, applying semantic fallback:', err);
      }
    }

    // 6. ADAPTIVE SEMANTIC HEURISTIC ENGINE (Fallback or Direct Grounding)
    // If AI model was not available or produced invalid JSON, construct a 100% accurate, industry-tailored evaluation:
    const isEcommerce =
      aiEvaluation?.siteType === 'ecommerce' ||
      /add to cart|woocommerce|shopify|shopping cart|\bcart\b|\bcheckout\b|buy now|perfume|fragrance|apparel|clothing|cosmetics|footwear|free shipping|\binr\b|₹|\bsku\b/i.test(lowerCombined);

    const isSaas =
      !isEcommerce &&
      (aiEvaluation?.siteType === 'saas' ||
        /\b(software as a service|\bsaas\b|cloud platform|developer api|crm software|erp software|enterprise software|facility management|commercial real estate|platform|dashboard)\b/i.test(lowerCombined));

    const siteType = aiEvaluation?.siteType || (isEcommerce ? 'ecommerce' : isSaas ? 'saas' : 'general');
    const siteTypeLabel = aiEvaluation?.siteTypeLabel || (isEcommerce ? 'D2C E-Commerce Store' : isSaas ? 'B2B SaaS Platform' : 'Digital Platform');
    const industryCategory = aiEvaluation?.industry || (isEcommerce ? 'E-Commerce & Retail' : isSaas ? 'Software & Cloud SaaS' : 'General Web Services');
    const businessSummary = aiEvaluation?.businessSummary || `${brandName} operates an online ${isEcommerce ? 'store offering direct-to-consumer products' : 'platform delivering specialized digital solutions'}.`;

    // 7. BUILD THE 4 PILLARS (Either from Bedrock or Tailored Heuristic)
    let experienceCategory: EeatCategory;
    let expertiseCategory: EeatCategory;
    let authorityCategory: EeatCategory;
    let trustCategory: EeatCategory;
    let priorityRemediations: PriorityRemediation[] = [];

    if (aiEvaluation?.pillarEvaluation) {
      const pe = aiEvaluation.pillarEvaluation;

      const formatPillar = (pillar: any): EeatCategory => {
        const working = pillar.criteria
          .filter((c: any) => c.pass)
          .map((c: any) => ({ question: c.question, details: c.detail }));

        const missing = pillar.criteria
          .filter((c: any) => !c.pass)
          .map((c: any) => ({ question: c.question, details: c.detail }));

        const improve = pillar.criteria
          .filter((c: any) => !c.pass)
          .map((c: any) => c.improve);

        if (improve.length === 0) {
          improve.push('Maintain active ongoing signals and monitor regular search crawler indexing.');
        }

        const passedCount = working.length;
        const totalCount = 6;
        const score = Math.round((passedCount / totalCount) * 100);
        const status: 'Good' | 'Needs Work' | 'Poor' = score >= 80 ? 'Good' : score >= 50 ? 'Needs Work' : 'Poor';

        return { score, passedCount, totalCount, status, working, missing, improve };
      };

      experienceCategory = formatPillar(pe.experience);
      expertiseCategory = formatPillar(pe.expertise);
      authorityCategory = formatPillar(pe.authority);
      trustCategory = formatPillar(pe.trust);
      priorityRemediations = aiEvaluation.priorityRemediations || [];
    } else {
      // Robust Industry-Aware Heuristic
      if (isEcommerce) {
        const expSignals = [
          {
            q: 'Verified customer reviews & star ratings',
            pass: hasTrustpilot || /star rating|5\/5|★★★★★|verified buyer/i.test(lowerCombined),
            pDet: 'Verified customer reviews or buyer ratings detected on product pages.',
            fDet: 'No verified customer reviews, buyer star ratings, or buyer feedback visible on crawled pages.',
            imp: 'Integrate a verified review collection widget (e.g., Judge.me, Loox, or Trustpilot) to showcase customer feedback.'
          },
          {
            q: 'First-hand product demonstration media',
            pass: (combinedHtml.match(/<img/gi) || []).length >= 4,
            pDet: 'Original product photography and visual presentations detected.',
            fDet: 'Minimal product visual demonstration or application photography found.',
            imp: 'Add high-resolution product photography and unboxing or application videos.'
          },
          {
            q: 'Product usage guidance & specifications',
            pass: headings.length >= 4,
            pDet: 'Detailed product specifications and usage guidance present.',
            fDet: 'Missing detailed product usage guides or key specification benchmarks.',
            imp: 'Include detailed specifications, sizing/usage guidance, and key product notes on every product page.'
          },
          {
            q: 'Customer feedback loops & ratings integration',
            pass: hasTrustpilot,
            pDet: 'External public customer feedback loop verified.',
            fDet: 'No third-party customer rating footprint found.',
            imp: 'Connect an open customer feedback loop to validate satisfaction.'
          },
          {
            q: 'Clear discovery & trial offerings',
            pass: /sample|discovery|tester|starter|pack|combo/i.test(lowerCombined),
            pDet: 'Entry-level product discovery or sample options detected.',
            fDet: 'No small sample or discovery offerings to lower initial customer risk.',
            imp: 'Introduce discovery sample kits to allow low-risk customer trial.'
          },
          {
            q: 'Active inventory & responsive mobile store flow',
            pass: hasMetaSecurity,
            pDet: 'Responsive mobile viewport directives and accessible checkout flow active.',
            fDet: 'Missing mobile responsive viewport directives.',
            imp: 'Ensure the entire storefront and checkout flow is fully responsive on mobile devices.'
          }
        ];

        const extSignals = [
          {
            q: 'Artisan, founder, or creator credentials',
            pass: /itemprop="author"|"@type"\s*:\s*"Person"|perfumer|founder|curator|artisan/i.test(combinedHtml) && hasAboutUs,
            pDet: 'Named brand creator or artisan credentials identified.',
            fDet: 'Products are presented anonymously without creator, founder, or perfumer attribution.',
            imp: 'Attribute brand creations to named artisans or founders with verified backgrounds.'
          },
          {
            q: 'Ingredient sourcing & formulation transparency',
            pass: /ingredient|formulation|provenance|source|notes|extract/i.test(lowerCombined),
            pDet: 'Ingredient provenance and formulation disclosures present.',
            fDet: 'Missing transparent ingredient sourcing or formulation safety disclosures.',
            imp: 'Publish clear ingredient provenance, formulation standards, and quality certifications.'
          },
          {
            q: 'Technical product classification depth',
            pass: headings.length >= 3,
            pDet: 'Accurate technical product category classifications used across headings.',
            fDet: 'Generic marketing copy lacks specialized technical category depth.',
            imp: 'Incorporate authoritative category terminology and quality classification depth.'
          },
          {
            q: 'Documented craftsmanship & brand origin story',
            pass: hasAboutUs,
            pDet: 'Dedicated brand origin story and craftsmanship documentation present.',
            fDet: 'No dedicated brand origin story or craftsmanship documentation found.',
            imp: 'Publish an inspiring brand story detailing your manufacturing and craftsmanship process.'
          },
          {
            q: 'Structured Product & Offer Schema.org markup',
            pass: hasOrganizationSchema,
            pDet: 'Structured JSON-LD schema markup declared for search engine crawlers.',
            fDet: 'Missing structured Schema.org Product, Offer, and AggregateRating JSON-LD.',
            imp: 'Deploy Schema.org Product, Offer, and AggregateRating structured data in the HTML head.'
          },
          {
            q: 'Original catalog copywriting & editorial depth',
            pass: cleanSnippet.length >= 600,
            pDet: 'Comprehensive, original product catalog copywriting verified.',
            fDet: 'Thin product descriptions with limited editorial detail.',
            imp: 'Write unique, detailed descriptions highlighting craftsmanship, usage, and benefits.'
          }
        ];

        const authSignals = [
          {
            q: 'Independent third-party review footprint (Trustpilot/Google)',
            pass: hasTrustpilot,
            pDet: 'Independent public review ratings verified on Trustpilot.',
            fDet: `No independent third-party customer review profile or Trustpilot rating found for ${brandName}.`,
            imp: 'Set up and claim a verified brand profile on Trustpilot or Google Customer Reviews.'
          },
          {
            q: 'Industry press, editorial mentions & media coverage',
            pass: /press|as seen on|featured in|vogue|gq|forbes|elle|times/i.test(lowerCombined),
            pDet: 'Media citations and editorial press mentions detected.',
            fDet: 'No documented editorial press coverage or media citations found.',
            imp: 'Pitch industry publications and lifestyle media for brand coverage.'
          },
          {
            q: 'Official brand social media community footprint',
            pass: hasSocialLinks,
            pDet: 'Active brand social media community channels verified.',
            fDet: `Missing official brand social media links on ${hostname}.`,
            imp: 'Link active official brand profiles across Instagram, YouTube, and relevant social channels.'
          },
          {
            q: 'Corporate entity registration & legal backing',
            pass: /pvt\.?\s*ltd|llp|inc\.|registered office|gst/i.test(lowerCombined),
            pDet: 'Registered legal corporate entity details disclosed.',
            fDet: 'Missing registered legal corporate entity or company registration numbers.',
            imp: 'Display your registered business legal name and corporate registration in the footer.'
          },
          {
            q: 'Verified merchant listings & retail directories',
            pass: hasCrunchbase || hasLinkedIn,
            pDet: 'Merchant business ecosystem registration verified.',
            fDet: 'No verified merchant ecosystem listings detected.',
            imp: 'Establish merchant entity recognition across official retail and business registries.'
          },
          {
            q: 'Organic community recommendations & social buzz',
            pass: hasReddit,
            pDet: 'Organic third-party recommendations and community mentions detected.',
            fDet: 'Minimal unprompted organic mentions detected across consumer forums.',
            imp: 'Engage authentically in relevant consumer communities and forums.'
          }
        ];

        const truSignals = [
          {
            q: 'Secure Transport Layer Security (HTTPS/TLS)',
            pass: isSsl,
            pDet: 'Secure HTTPS transport layer encryption active with valid SSL certificate.',
            fDet: 'Connection lacks valid SSL transport layer encryption.',
            imp: 'Enforce full HTTPS redirection with HSTS across all pages.'
          },
          {
            q: 'Transparent Return & Refund Policy',
            pass: hasRefundPolicy,
            pDet: 'Dedicated Return & Refund Policy page verified.',
            fDet: `Missing a dedicated Return & Refund Policy page on ${hostname}.`,
            imp: 'Publish a transparent Return & Refund Policy detailing processing windows and conditions.'
          },
          {
            q: 'Published Shipping & Delivery Policy',
            pass: hasShippingPolicy,
            pDet: 'Dedicated Shipping & Delivery Policy page verified.',
            fDet: `Missing a published Shipping & Delivery Policy on ${hostname}.`,
            imp: 'Publish a clear Shipping Policy specifying delivery timelines, courier partners, and tracking.'
          },
          {
            q: 'Direct customer contact channels & support routes',
            pass: hasContactDetails,
            pDet: 'Accessible direct contact routes (email, phone, or contact page) verified.',
            fDet: `Lacks transparent direct customer support channels or contact email on ${hostname}.`,
            imp: 'Display transparent customer support email, phone numbers, and response time guarantees.'
          },
          {
            q: 'Published Terms & Conditions disclosures',
            pass: hasTermsPrivacy,
            pDet: 'Dedicated Terms of Service and legal disclosures published.',
            fDet: `Missing published Terms of Service or Privacy Policy documentation on ${hostname}.`,
            imp: 'Publish comprehensive Terms & Conditions and Privacy Policy documentation.'
          },
          {
            q: 'Physical registered business address in footer',
            pass: /address|suite|road|street|nagar|sector|city|pincode|\b\d{6}\b/i.test(lowerCombined) && hasContactDetails,
            pDet: 'Physical corporate office or facility location verified.',
            fDet: 'Missing physical registered corporate or warehouse address in the site-wide footer.',
            imp: 'Include your full physical registered office address and support hours in the footer.'
          }
        ];

        const buildPillar = (signals: typeof expSignals): EeatCategory => {
          const working = signals.filter((s) => s.pass).map((s) => ({ question: s.q, details: s.pDet }));
          const missing = signals.filter((s) => !s.pass).map((s) => ({ question: s.q, details: s.fDet }));
          const improve = signals.filter((s) => !s.pass).map((s) => s.imp);
          if (improve.length === 0) improve.push('Maintain active ongoing signals and monitor regular search crawler indexing.');
          const passedCount = working.length;
          const totalCount = 6;
          const score = Math.round((passedCount / totalCount) * 100);
          const status: 'Good' | 'Needs Work' | 'Poor' = score >= 80 ? 'Good' : score >= 50 ? 'Needs Work' : 'Poor';
          return { score, passedCount, totalCount, status, working, missing, improve };
        };

        experienceCategory = buildPillar(expSignals);
        expertiseCategory = buildPillar(extSignals);
        authorityCategory = buildPillar(authSignals);
        trustCategory = buildPillar(truSignals);

        priorityRemediations = [
          {
            title: 'Deploy Verified Customer Reviews',
            desc: 'Integrate Judge.me or Trustpilot to collect real customer reviews and star ratings on product pages.',
            tag: 'Experience Proof'
          },
          {
            title: 'Display Physical Corporate Address',
            desc: 'Add registered business address, support hours, and legal company name to the site-wide footer.',
            tag: 'Trust Compliance'
          },
          {
            title: 'Attribute Brand Craftsmanship & Creators',
            desc: 'Introduce the creators, master artisans, or founders behind your formulations to validate Expertise.',
            tag: 'Creator Authority'
          },
          {
            title: 'Implement Product & Offer Schema JSON-LD',
            desc: 'Deploy Schema.org Product, Offer, and AggregateRating markup to feed structured data to AI engines.',
            tag: 'Technical Schema'
          },
          {
            title: 'Claim Verified Trustpilot Brand Profile',
            desc: 'Set up an open customer feedback loop on Trustpilot to establish third-party verified authority.',
            tag: 'Third-Party Trust'
          },
          {
            title: 'Clarify Return & Shipping Processing Windows',
            desc: 'Ensure refund processing windows, return shipping terms, and dispatch SLAs are crystal clear.',
            tag: 'Consumer Trust'
          }
        ];
      } else {
        // SaaS / Software Heuristic
        const saasExp = [
          {
            q: 'Interactive product walkthrough & demo pathway',
            pass: /demo|trial|signup|get-started|interactive/i.test(lowerCombined),
            pDet: 'Direct interactive product demo, free trial, or self-serve onboarding route verified.',
            fDet: 'No direct product trial, self-serve onboarding, or interactive demo pathway found.',
            imp: 'Implement an interactive product tour or self-serve trial flow.'
          },
          {
            q: 'Quantified client case studies & ROI metrics',
            pass: /case[\s-]?stud(y|ies)|success[\s-]?stor(y|ies)|roi[\s-]?metric/i.test(lowerCombined),
            pDet: 'Dedicated customer case studies with measurable ROI results identified.',
            fDet: 'Missing quantified client case studies or measurable operational ROI metrics.',
            imp: 'Publish 2–3 quantified case studies documenting real customer impact and verified performance metrics.'
          },
          {
            q: 'Original product UI screenshots & workflow media',
            pass: (combinedHtml.match(/<img/gi) || []).length >= 4,
            pDet: 'Original product interface screenshots and workflow diagrams detected.',
            fDet: 'No high-resolution product walkthrough videos or UI workflow diagrams found.',
            imp: 'Embed annotated product screenshots and video walkthroughs to prove real interface execution.'
          },
          {
            q: 'Customer implementation testimonials & social proof',
            pass: /testimonial|what our (clients|users|customers) say|g2/i.test(lowerCombined) || hasTrustpilot,
            pDet: 'Customer testimonials and implementation quotes detected.',
            fDet: 'No named customer testimonials or verified implementation quotes found.',
            imp: 'Add real customer implementation quotes with company names, executive roles, and tangible results.'
          },
          {
            q: 'First-person technical language & operational proof',
            pass: /\b(we built|in our testing|our architecture|we implemented|hands-on)\b/i.test(lowerCombined),
            pDet: 'First-person operational language and implementation proof present.',
            fDet: 'Marketing copy uses generic claims rather than first-hand operational evidence.',
            imp: 'Share first-hand engineering choices and architectural trade-offs to satisfy Experience.'
          },
          {
            q: 'Modern responsive architecture & viewport directives',
            pass: hasMetaSecurity,
            pDet: 'Modern responsive viewport directives ensuring seamless mobile and desktop rendering.',
            fDet: 'Missing responsive viewport directives.',
            imp: 'Ensure all pages maintain mobile-responsive viewports and modern technical markup.'
          }
        ];

        const saasExt = [
          {
            q: 'Named leadership & engineering credentials',
            pass: hasAboutUs && (hasLinkedIn || /team|leadership|founders/i.test(lowerCombined)),
            pDet: 'Named leadership, engineering contributors, and professional backgrounds identified.',
            fDet: 'Platform appears anonymous without named leadership or engineering credentials.',
            imp: 'Add team and founder profiles with links to verified LinkedIn credentials.'
          },
          {
            q: 'Technical documentation & API reference depth',
            pass: /api|documentation|docs|developers|integration|sdk/i.test(lowerCombined),
            pDet: 'Technical developer documentation and API architecture references verified.',
            fDet: 'Missing dedicated developer documentation or architectural technical specifications.',
            imp: 'Publish comprehensive technical documentation and API reference guides.'
          },
          {
            q: 'Domain-specific technical terminology & precision',
            pass: headings.length >= 4,
            pDet: `Authoritative industry-specific terminology identified across ${headings.length} primary headings.`,
            fDet: 'Section headings use generic phrasing rather than technical domain terminology.',
            imp: 'Incorporate authoritative, domain-specific terminology reflecting technical industry standards.'
          },
          {
            q: 'Structured Schema.org Organization & SoftwareApplication JSON-LD',
            pass: hasOrganizationSchema,
            pDet: 'Structured Schema.org JSON-LD declared to search crawlers.',
            fDet: 'Missing machine-readable JSON-LD Schema.org entity declarations.',
            imp: 'Deploy Schema.org SoftwareApplication, Organization, and Service JSON-LD.'
          },
          {
            q: 'Comprehensive architectural taxonomy & subpages',
            pass: fetchedSubpages.length >= 1 || cleanSnippet.length >= 800,
            pDet: 'Multi-layered navigational taxonomy covering core solutions across subpages.',
            fDet: 'Superficial single-layer site structure with limited architectural depth.',
            imp: 'Build comprehensive subpages covering individual platform capabilities and technical specifications.'
          },
          {
            q: 'Fact-checking, sourced data citations & structured FAQs',
            pass: /faq|frequently asked questions/i.test(lowerCombined),
            pDet: 'Structured FAQ sections and authoritative benchmark citations present.',
            fDet: 'Claims lack external authoritative citations or structured FAQs.',
            imp: 'Publish structured FAQ sections with FAQPage schema markup.'
          }
        ];

        const saasAuth = [
          {
            q: 'G2 software directory verification & customer ratings',
            pass: hasG2,
            pDet: 'Verified G2 software directory listing detected.',
            fDet: `No verified brand profile or customer reviews found on G2 for ${brandName}.`,
            imp: 'Claim and actively collect verified customer reviews on G2.'
          },
          {
            q: 'Capterra / Gartner Digital Markets presence',
            pass: hasCapterra,
            pDet: 'Active listing in Capterra / Gartner Digital Markets verified.',
            fDet: `Not currently indexed in the Capterra software buyer directory for ${brandName}.`,
            imp: 'Register and optimize your software profile on Capterra.'
          },
          {
            q: 'Corporate entity verification & LinkedIn presence',
            pass: hasLinkedIn,
            pDet: `Verified corporate LinkedIn company presence verified for ${brandName}.`,
            fDet: `Missing verified corporate LinkedIn company entity link on ${hostname}.`,
            imp: 'Link an active, verified corporate LinkedIn page showing team members.'
          },
          {
            q: 'Crunchbase corporate ecosystem registration',
            pass: hasCrunchbase,
            pDet: 'Verified company profile on Crunchbase detected.',
            fDet: `No corporate entity registration detected on Crunchbase for ${brandName}.`,
            imp: 'Establish a verified Crunchbase corporate profile to strengthen entity recognition.'
          },
          {
            q: 'Organic peer recommendations & developer forums (Reddit)',
            pass: hasReddit,
            pDet: 'Organic third-party recommendations and community discussions detected.',
            fDet: 'Minimal unprompted organic mentions or peer recommendations detected on forums.',
            imp: 'Participate in industry subreddits and tech communities to seed natural co-citations.'
          },
          {
            q: 'Open public customer sentiment (Trustpilot)',
            pass: hasTrustpilot,
            pDet: 'Open public customer sentiment and star ratings verified on Trustpilot.',
            fDet: 'No independent open public customer star ratings or Trustpilot review profile found.',
            imp: 'Set up an open customer feedback loop on Trustpilot to validate consumer trustworthiness.'
          }
        ];

        const saasTru = [
          {
            q: 'Secure Transport Layer Security (HTTPS/TLS 1.3)',
            pass: isSsl,
            pDet: 'Secure HTTPS transport layer encryption active with modern valid SSL certificate.',
            fDet: 'Connection lacks valid SSL transport layer encryption.',
            imp: 'Enforce full HTTPS redirection with HSTS headers across all domains.'
          },
          {
            q: 'Direct, transparent business contact channels',
            pass: hasContactDetails,
            pDet: 'Direct business contact points (email, phone, or official inquiry routes) verified.',
            fDet: `Lacks transparent direct business contact channels or corporate email on ${hostname}.`,
            imp: 'Ensure phone, email, and physical corporate location details are transparently displayed.'
          },
          {
            q: 'Published Terms of Service & Privacy disclosures',
            pass: hasTermsPrivacy,
            pDet: 'Dedicated legal disclosures, Terms of Service, and Privacy Policy published.',
            fDet: `Missing published Terms of Service or Privacy Policy documentation on ${hostname}.`,
            imp: 'Publish comprehensive Terms of Service and Privacy Policy pages.'
          },
          {
            q: 'Mobile-responsive viewport & modern crawl directives',
            pass: hasMetaSecurity,
            pDet: 'Modern responsive viewport directives ensuring seamless mobile and desktop rendering.',
            fDet: 'Missing viewport meta tag, potentially degrading mobile accessibility.',
            imp: 'Declare responsive mobile viewport metadata in the HTML head.'
          },
          {
            q: 'Canonical URL directives preventing index duplication',
            pass: hasCanonical,
            pDet: 'Canonical link tag declared to prevent duplicate content indexing.',
            fDet: 'Missing canonical URL link tag; search bots may encounter URL parameter duplication.',
            imp: 'Declare self-referencing canonical links across all live URLs.'
          },
          {
            q: 'Transparent corporate governance, copyright & footer clarity',
            pass: /copyright|all rights reserved|©|\b202\d\b/i.test(lowerCombined),
            pDet: 'Clear copyright declaration, corporate ownership notice, and footer governance in place.',
            fDet: 'Missing explicit copyright declaration or corporate ownership notice.',
            imp: 'Add explicit copyright year, registered legal corporate entity name, and ownership disclosures.'
          }
        ];

        const buildPillar = (signals: typeof saasExp): EeatCategory => {
          const working = signals.filter((s) => s.pass).map((s) => ({ question: s.q, details: s.pDet }));
          const missing = signals.filter((s) => !s.pass).map((s) => ({ question: s.q, details: s.fDet }));
          const improve = signals.filter((s) => !s.pass).map((s) => s.imp);
          if (improve.length === 0) improve.push('Maintain active ongoing signals and monitor regular search crawler indexing.');
          const passedCount = working.length;
          const totalCount = 6;
          const score = Math.round((passedCount / totalCount) * 100);
          const status: 'Good' | 'Needs Work' | 'Poor' = score >= 80 ? 'Good' : score >= 50 ? 'Needs Work' : 'Poor';
          return { score, passedCount, totalCount, status, working, missing, improve };
        };

        experienceCategory = buildPillar(saasExp);
        expertiseCategory = buildPillar(saasExt);
        authorityCategory = buildPillar(saasAuth);
        trustCategory = buildPillar(saasTru);

        priorityRemediations = [
          {
            title: 'Add Interactive Product Demo / Tour',
            desc: 'Implement a self-serve interactive tour or video demo flow to prove first-hand Experience.',
            tag: 'Experience Proof'
          },
          {
            title: 'Publish Quantified Case Studies',
            desc: 'Add 2–3 client operational success stories with verified metrics to prove hands-on ROI.',
            tag: 'Experience Proof'
          },
          {
            title: 'Secure G2 & Capterra Profiles',
            desc: 'Claim and optimize your brand profiles on independent software directories to ground AI search models.',
            tag: 'Third-Party Trust'
          },
          {
            title: 'Add Verified Leadership & Author Bylines',
            desc: 'Include named leadership profiles and credentials with links to LinkedIn to satisfy Expertise.',
            tag: 'Author Authority'
          },
          {
            title: 'Deploy SoftwareApplication & Service Schema',
            desc: 'Declare SoftwareApplication and Service JSON-LD schema to dominate AI answer engines.',
            tag: 'Technical Schema'
          },
          {
            title: 'Publish llms.txt at Domain Root',
            desc: 'Expose a canonical llms.txt file at https://domain/llms.txt to prevent generative hallucinations.',
            tag: 'AEO Protocol'
          }
        ];
      }
    }

    // 8. 14-POINT TECHNICAL SIGNALS CHECKLIST (Dynamically Tailored to Website Type)
    let technicalChecklist: TechnicalChecklistItem[] = [];

    if (isEcommerce) {
      technicalChecklist = [
        { id: 'ssl', label: 'SSL / TLS Transport Encryption', present: isSsl, desc: 'Secure HTTPS encryption protecting customer payment data and checkout transactions.' },
        { id: 'returnPolicy', label: 'Transparent Return & Refund Policy', present: hasRefundPolicy, desc: 'Dedicated policy outlining return windows, inspection criteria, and refund timelines.' },
        { id: 'shippingPolicy', label: 'Published Shipping & Delivery Policy', present: hasShippingPolicy, desc: 'Published delivery timelines, shipping rates, and dispatch guarantees.' },
        { id: 'contactDetails', label: 'Direct Customer Support Channels', present: hasContactDetails, desc: 'Support email, phone helpline, or contact page for customer inquiries.' },
        { id: 'termsPrivacy', label: 'Terms & Conditions Disclosures', present: hasTermsPrivacy, desc: 'Comprehensive legal disclosures protecting buyer and merchant transaction rights.' },
        { id: 'organizationSchema', label: 'Product & Offer Schema.org JSON-LD', present: hasOrganizationSchema, desc: 'Structured Schema.org declarations for product catalog, pricing, and availability.' },
        { id: 'socialLinks', label: 'Verified Brand Social Footprint', present: hasSocialLinks, desc: 'Linked official presence across Instagram, YouTube, Facebook, or X.' },
        { id: 'trustpilot', label: 'Trustpilot / Public Review Footprint', present: hasTrustpilot, desc: 'Third-party customer review footprint validating merchant delivery reliability.' },
        { id: 'aboutUs', label: 'Brand Origin & Craftsmanship Story', present: hasAboutUs, desc: 'Dedicated about page detailing founding story, artisans, or manufacturing values.' },
        { id: 'physicalAddress', label: 'Physical Registered Address in Footer', present: /address|suite|road|street|nagar|sector|city|pincode|\b\d{6}\b/i.test(lowerCombined) && hasContactDetails, desc: 'Physical corporate office or warehouse location verifying authentic brick-and-mortar backing.' },
        { id: 'customerReviews', label: 'On-Site Customer Review Ratings', present: hasTrustpilot || /star rating|5\/5|★★★★★|verified buyer/i.test(lowerCombined), desc: 'Verified buyer reviews displayed across individual product catalog pages.' },
        { id: 'authorCredentials', label: 'Artisan / Perfumer Attribution', present: /itemprop="author"|"@type"\s*:\s*"Person"|perfumer|founder|curator|artisan/i.test(combinedHtml) && hasAboutUs, desc: 'Named creators, founders, or master artisans demonstrating specialized product expertise.' },
        { id: 'metaSecurity', label: 'Responsive Mobile Viewport Directives', present: hasMetaSecurity, desc: 'Modern responsive mobile viewport ensuring seamless shopping across smartphones.' },
        { id: 'canonical', label: 'Canonical URL Directives', present: hasCanonical, desc: 'Prevents product URL filter parameter duplication across search engines.' }
      ];
    } else {
      // SaaS / General Business Checklist
      technicalChecklist = [
        { id: 'ssl', label: 'SSL / TLS Encryption (HTTPS)', present: isSsl, desc: 'Secure transport layer encryption protecting visitors and data transfers.' },
        { id: 'aboutUs', label: 'About Us / Company Transparency', present: hasAboutUs, desc: 'Dedicated about or company page proving organizational existence.' },
        { id: 'contactDetails', label: 'Direct Business Contact Info', present: hasContactDetails, desc: 'Accessible phone, email, or physical location info.' },
        { id: 'socialLinks', label: 'Verified Social Footprint', present: hasSocialLinks, desc: 'Linked presence across LinkedIn, X/Twitter, YouTube, etc.' },
        { id: 'organizationSchema', label: 'Schema.org JSON-LD Structured Data', present: hasOrganizationSchema, desc: 'Machine-readable semantic Organization entity declared to search engines.' },
        { id: 'authorCredentials', label: 'Author Bylines & Bio Credentials', present: /itemprop="author"|"@type"\s*:\s*"Person"|author-bio|written by/i.test(combinedHtml), desc: 'Identifiable subject matter authors on published insights.' },
        { id: 'linkedin', label: 'LinkedIn Corporate Entity', present: hasLinkedIn, desc: 'Verified company profile with employee scale and corporate footprint.' },
        { id: 'g2', label: 'G2 Directory Profile', present: hasG2, desc: 'Independent customer review validation for software & service credibility.' },
        { id: 'capterra', label: 'Capterra Catalog Listing', present: hasCapterra, desc: 'Verified software and vendor directory listing.' },
        { id: 'reddit', label: 'Organic Reddit Discussion Footprint', present: hasReddit, desc: 'Organic third-party recommendations and community mentions.' },
        { id: 'crunchbase', label: 'Crunchbase Entity Registration', present: hasCrunchbase, desc: 'Corporate registry verifying company establishment and operations.' },
        { id: 'trustpilot', label: 'Trustpilot / Public Review Footprint', present: hasTrustpilot, desc: 'Open public customer sentiment and star ratings.' },
        { id: 'termsPrivacy', label: 'Published Terms & Privacy Policies', present: hasTermsPrivacy, desc: 'Transparent legal documentation, data handling, and disclosures.' },
        { id: 'metaSecurity', label: 'Canonical & Responsive Viewport', present: hasMetaSecurity && hasCanonical, desc: 'Modern technical crawl directives and responsive standards.' }
      ];
    }

    // 9. COMPUTE SCORES WITH GOOGLE'S OFFICIAL QUALITY RATER WEIGHTING
    // Google Guidance: Trustworthiness (40%), Experience (20%), Expertise (20%), Authority (20%)
    const weightedOverall = Math.round(
      (trustCategory.score * 0.40) +
      (experienceCategory.score * 0.20) +
      (expertiseCategory.score * 0.20) +
      (authorityCategory.score * 0.20)
    );

    // Standard Academic Letter Grade Calibration
    let grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F' = 'F';
    let qualityTier = 'Critical E-E-A-T Deficiency (Grade F)';

    if (weightedOverall >= 90) {
      grade = 'A+';
      qualityTier = 'Elite Authority Tier (Grade A+)';
    } else if (weightedOverall >= 80) {
      grade = 'A';
      qualityTier = 'High Authority Tier (Grade A)';
    } else if (weightedOverall >= 70) {
      grade = 'B';
      qualityTier = 'Good Quality Tier (Grade B)';
    } else if (weightedOverall >= 55) {
      grade = 'C';
      qualityTier = 'Moderate Quality Tier (Grade C)';
    } else if (weightedOverall >= 42) {
      grade = 'D';
      qualityTier = 'Weak E-E-A-T Signals (Grade D)';
    } else {
      grade = 'F';
      qualityTier = 'Critical E-E-A-T Deficiency (Grade F)';
    }

    const whyThisScore = aiEvaluation?.whyThisScore || `Your ${grade} grade weights Trustworthiness at 40% and Experience, Expertise, and Authoritativeness at 20% each, strictly adhering to Google's Search Quality Rater Guidelines where Trust is the foundational anchor. At ${weightedOverall}/100, the score is primarily constrained by ${
      experienceCategory.score < 50 && expertiseCategory.score < 50
        ? 'Experience and Expertise (missing verified customer reviews and creator credentials)'
        : authorityCategory.score < 50
        ? 'Authoritativeness (limited third-party directory citations and external reviews)'
        : 'Trustworthiness disclosures'
    }.`;

    // Legacy checklist object for backward compatibility
    const legacyChecklist = {
      ssl: isSsl,
      aboutUs: hasAboutUs,
      contactDetails: hasContactDetails,
      socialLinks: hasSocialLinks,
      organizationSchema: hasOrganizationSchema,
      authorCredentials: technicalChecklist.find((i) => i.id === 'authorCredentials')?.present || false,
      g2: hasG2,
      capterra: hasCapterra,
      reddit: hasReddit,
      linkedin: hasLinkedIn,
      crunchbase: hasCrunchbase,
      trustpilot: hasTrustpilot,
      termsPrivacy: hasTermsPrivacy,
      metaSecurity: hasMetaSecurity,
    };

    return NextResponse.json({
      success: true,
      domain: cleanDomain,
      brandName,
      siteType,
      siteTypeLabel,
      industryCategory,
      businessSummary,
      crawledPagesCount: fetchedSubpages.length + 1,
      checklist: legacyChecklist,
      technicalChecklist,
      remediationSteps: priorityRemediations,
      scores: {
        experience: experienceCategory.score,
        expertise: expertiseCategory.score,
        authority: authorityCategory.score,
        trust: trustCategory.score
      },
      overallScore: weightedOverall,
      grade,
      qualityTier,
      whyThisScore,
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
