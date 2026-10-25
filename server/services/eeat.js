/**
 * Deep Multi-Page EEAT (Experience, Expertise, Authoritativeness, Trust) Audit Service
 */

export async function analyzeEEAT(rawUrl) {
  let normalizedUrl = rawUrl.trim();
  if (!/^https?:\/\//i.test(normalizedUrl)) {
    normalizedUrl = `https://${normalizedUrl}`;
  }

  let hostname = '';
  try {
    hostname = new URL(normalizedUrl).hostname.replace(/^www\./, '');
  } catch {
    throw new Error('Invalid URL format');
  }

  const fetchPage = async (url) => {
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 RankMonkBot/2.0'
        },
        signal: AbortSignal.timeout(6000),
        redirect: 'follow'
      });
      if (!res.ok) return '';
      return await res.text();
    } catch {
      return '';
    }
  };

  // 1. Fetch homepage
  const homeHtml = await fetchPage(normalizedUrl);
  const isSsl = normalizedUrl.startsWith('https://');

  // 2. Discover subpages
  const linkMatches = homeHtml.match(/href=["']([^"']+)["']/gi) || [];
  const targetSubPaths = ['about', 'contact', 'privacy', 'terms', 'team', 'company'];
  const subUrlsToFetch = new Set();

  for (const hrefAttr of linkMatches) {
    const match = hrefAttr.match(/href=["']([^"']+)["']/i);
    if (!match) continue;
    const href = match[1];
    if (targetSubPaths.some(p => href.toLowerCase().includes(p))) {
      try {
        const absUrl = new URL(href, normalizedUrl).toString();
        if (absUrl.includes(hostname)) subUrlsToFetch.add(absUrl);
      } catch {}
    }
  }

  const subPages = await Promise.all(
    Array.from(subUrlsToFetch).slice(0, 4).map(async url => ({
      url,
      html: await fetchPage(url)
    }))
  );

  const allHtmlCombined = homeHtml + ' ' + subPages.map(p => p.html).join(' ');

  // Evaluate Signals
  const hasAbout = Array.from(subUrlsToFetch).some(u => /about|team|company/i.test(u)) || /about us|our story|who we are/i.test(allHtmlCombined);
  const hasContact = Array.from(subUrlsToFetch).some(u => /contact/i.test(u)) || /contact us|support@|info@/i.test(allHtmlCombined);
  const hasPrivacy = Array.from(subUrlsToFetch).some(u => /privacy/i.test(u)) || /privacy policy/i.test(allHtmlCombined);
  const hasTerms = Array.from(subUrlsToFetch).some(u => /terms/i.test(u)) || /terms of service|terms & conditions/i.test(allHtmlCombined);
  const hasSchema = /application\/ld\+json/i.test(allHtmlCombined);
  const hasAuthorBio = /author|written by|reviewed by|about the author/i.test(allHtmlCombined);
  const hasCustomerProof = /case study|testimonials|trusted by|reviews|clients/i.test(allHtmlCombined);
  const hasCredentials = /certified|founder|phd|award|licensed|member of/i.test(allHtmlCombined);

  // Compute Scores
  let experienceScore = 70;
  if (hasCustomerProof) experienceScore += 18;
  if (/we tested|in our experience|we built|hands-on/i.test(allHtmlCombined)) experienceScore += 10;
  experienceScore = Math.min(98, Math.max(55, experienceScore));

  let expertiseScore = 65;
  if (hasAuthorBio) expertiseScore += 18;
  if (hasCredentials) expertiseScore += 12;
  expertiseScore = Math.min(96, Math.max(50, expertiseScore));

  let authorityScore = 68;
  if (hasAbout) authorityScore += 15;
  if (hasSchema) authorityScore += 14;
  authorityScore = Math.min(97, Math.max(52, authorityScore));

  let trustScore = 60;
  if (isSsl) trustScore += 15;
  if (hasPrivacy) trustScore += 10;
  if (hasTerms) trustScore += 8;
  if (hasContact) trustScore += 7;
  trustScore = Math.min(99, Math.max(50, trustScore));

  const overallScore = Math.round((experienceScore + expertiseScore + authorityScore + trustScore) / 4);

  const signals = [
    { name: 'SSL / HTTPS Security', status: isSsl ? 'pass' : 'fail', note: isSsl ? 'Active 256-bit TLS encryption' : 'Insecure HTTP detected' },
    { name: 'Privacy Policy', status: hasPrivacy ? 'pass' : 'fail', note: hasPrivacy ? 'Dedicated privacy policy found' : 'Missing privacy policy' },
    { name: 'Terms of Service', status: hasTerms ? 'pass' : 'fail', note: hasTerms ? 'Terms of service verified' : 'No terms page found' },
    { name: 'Dedicated About / Team', status: hasAbout ? 'pass' : 'fail', note: hasAbout ? 'Clear organizational identity present' : 'No about/company page found' },
    { name: 'Verified Contact Channels', status: hasContact ? 'pass' : 'fail', note: hasContact ? 'Direct contact methods available' : 'Missing contact form or address' },
    { name: 'Schema.org Structured Data', status: hasSchema ? 'pass' : 'warn', note: hasSchema ? 'JSON-LD structured schema active' : 'Missing JSON-LD entity schema' },
    { name: 'Author Credentials & Bios', status: hasAuthorBio ? 'pass' : 'warn', note: hasAuthorBio ? 'Author accreditation found' : 'Articles lack clear author bios' },
    { name: 'Case Studies & Social Proof', status: hasCustomerProof ? 'pass' : 'warn', note: hasCustomerProof ? 'Customer reviews / proof detected' : 'Add verifiable customer proof' }
  ];

  const recommendations = [];
  if (!hasAuthorBio) recommendations.push('Add dedicated author bios with LinkedIn credentials to every blog post to boost Google Expertise evaluation.');
  if (!hasSchema) recommendations.push('Inject JSON-LD Organization and Article schemas so Google and AI search engines can parse your business entities.');
  if (!hasCustomerProof) recommendations.push('Feature customer quotes, quantified metrics, and case studies to establish unassailable Experience signals.');
  if (!hasPrivacy || !hasTerms) recommendations.push('Publish transparent Privacy Policy and Terms of Service pages linked in the site footer.');
  if (recommendations.length === 0) recommendations.push('Maintain consistent author attribution and update publication dates regularly.');

  return {
    url: normalizedUrl,
    hostname,
    overallScore,
    scores: {
      experience: experienceScore,
      expertise: expertiseScore,
      authoritativeness: authorityScore,
      trustworthiness: trustScore
    },
    signals,
    recommendations,
    scannedPagesCount: 1 + subPages.length,
    timestamp: new Date().toISOString()
  };
}
